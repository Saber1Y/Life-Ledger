"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { Plus } from "lucide-react";
import {
  RECORD_REGISTORY_ADDR,
  recordRegistoryABI,
} from "@/app/context/ContractData";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface HealthRecord {
  id: number;
  cid: string;
  dateUploaded: string;
}

export const HealthRecordsTable = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [records, setRecords] = useState<HealthRecord[]>([]);

  const {
    data: onChainRecords,
    refetch,
    isLoading,
  } = useReadContract({
    address: RECORD_REGISTORY_ADDR,
    abi: recordRegistoryABI,
    functionName: "getRecords",
    args: [address ?? undefined],
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (!onChainRecords || !address) return;
    const mapped = (onChainRecords as string[]).map((cid, i) => ({
      id: i + 1,
      cid,
      dateUploaded: new Date().toISOString().slice(0, 10),
    }));
    setRecords(mapped);
  }, [onChainRecords, address]);

  if (!address) {
    return (
      <div className="p-6 text-center">
        <p>Please connect your wallet to view health records.</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold">My Health Records</h4>
        <button
          onClick={() => router.push("/upload")}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2" /> Upload New Record
        </button>
      </div>

      {isLoading ? (
        <p>Loading records…</p>
      ) : records.length === 0 ? (
        <p>No records found. Click "Upload New Record" to get started.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th>#</th>
              <th>CID</th>
              <th>Date</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {records.map(({ id, cid, dateUploaded }) => (
              <tr key={id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{id}</td>
                <td className="px-4 py-2 truncate max-w-xs">{cid}</td>
                <td className="px-4 py-2">{dateUploaded}</td>
                <td className="px-4 py-2">
                  <a
                    href={`https://ipfs.io/ipfs/${cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View File
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
