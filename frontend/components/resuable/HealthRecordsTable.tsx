"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
  fileName?: string;
  fileType?: string;
  notes?: string;
  dateUploaded: string;
}

export const HealthRecordsTable = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const {
    data: onChainRecords,
    isLoading,
    refetch,
  } = useReadContract({
    address: RECORD_REGISTORY_ADDR,
    abi: recordRegistoryABI,
    functionName: "getRecords",
    args: [address ?? undefined],
    query: { enabled: !!address },
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!onChainRecords || !address) return;

      const cids = onChainRecords as string[];
      const arr: HealthRecord[] = [];

      for (let i = 0; i < cids.length; i++) {
        const cid = cids[i];
        let fileName = "";
        let fileType = "";

        try {
          const res = await axios.get(
            `https://api.pinata.cloud/pinning/hashMetadata/${cid}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
              },
            }
          );

          const meta = res.data?.PinataMetadata;
          fileName = meta?.name ?? "";
          fileType = meta?.keyvalues?.fileType ?? "";
        } catch {
          console.warn(`No metadata for CID ${cid}`);
        }

        arr.push({
          id: i + 1,
          cid,
          fileName,
          fileType,
          dateUploaded: new Date().toISOString().slice(0, 10),
        });
      }

      console.log("✅ Final records array:", arr);
      setRecords(arr);
    };

    fetchMetadata();
  }, [onChainRecords, address, refetch]);

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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-spacing-4 border border-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr className="bg-blue-600 text-white">
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>CID</th>
                <th>View</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {records.map(({ id, cid, fileName, fileType, dateUploaded }) => (
                <tr key={id} className="border-b hover:bg-gray-100">
                  <td className="px-4">{id}</td>
                  <td className="px-4">{fileName || "-"}</td>
                  <td className="px-4">{fileType || "-"}</td>
                  <td className="px-4">{dateUploaded}</td>
                  <td className="px-4 truncate max-w-xs">{cid}</td>
                  <td className="px-4">
                    <a
                      href={`https://ipfs.io/ipfs/${cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </td>
                  <td
                    className="text-blue-600 hover:underline cursor-pointer"
                    key={id}
                    onClick={() => router.push(`shared/${cid}`)}
                  >
                    Grant Access
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
