"use client";

import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
  RECORD_REGISTORY_ADDR,
  controlManagerABI,
} from "@/app/context/ContractData";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import axios from "axios";
import { useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";

interface Meta {
  fileName: string;
  fileType: string;
  dateUploaded: string;
}

export default function SharedRecordPage() {
  /* ---------- URL params ---------- */
  const { patient, cid } = useParams<{
    patient: string;
    cid: string;
  }>();
  const router = useRouter();

  /* ---------- Wallet ---------- */
  const { address: provider } = useAccount();

  /* ---------- Contract: read access ---------- */
  const { data: hasAccess, refetch } = useReadContract({
    address: RECORD_REGISTORY_ADDR,
    abi: controlManagerABI,
    functionName: "hasAccess",
    args: [patient, provider ?? "0x"],
    // only query once provider connected
    query: { enabled: !!provider },
  });

  /* ---------- Contract: grant / revoke ---------- */
  const { writeContractAsync: grant } = useWriteContract();
  const { writeContractAsync: revoke } = useWriteContract();

  const handleGrant = async () => {
    await grant({
      address: RECORD_REGISTORY_ADDR,
      abi: controlManagerABI,
      functionName: "grantAccess",
      args: [provider!],
    });
    refetch();
  };

  const handleRevoke = async () => {
    await revoke({
      address: RECORD_REGISTORY_ADDR,
      abi: controlManagerABI,
      functionName: "revokeAccess",
      args: [provider!],
    });
    refetch();
  };

  /* ---------- Pinata metadata ---------- */
  const [meta, setMeta] = useState<Meta | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await axios.get(
          `https://api.pinata.cloud/pinning/hashMetadata/${cid}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
            },
          }
        );
        const m = res.data.PinataMetadata; // Pinata returns this field
        setMeta({
          fileName: m.name ?? "Unnamed",
          fileType: m.keyvalues?.fileType ?? "Unknown",
          dateUploaded:
            m.keyvalues?.date ?? new Date().toISOString().slice(0, 10),
        });
      } catch (err) {
        console.warn("No Pinata metadata:", err); // happens if upload lacked metadata
      }
    }
    loadMeta();
  }, [cid]);

  /* ---------- UI ---------- */
  return (
    <DashboardLayout activeItem="shared-access">
      <button className="mb-4 text-blue-600" onClick={() => router.back()}>
        ← Back
      </button>

      {!meta ? (
        <p>Loading record details…</p>
      ) : (
        <div className="rounded-xl bg-white shadow p-6 space-y-4">
          <h1 className="text-xl font-semibold">{meta.fileName}</h1>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Type:</strong> {meta.fileType}
            </p>
            <p>
              <strong>Date:</strong> {meta.dateUploaded}
            </p>
            <p>
              <strong>CID:</strong> {cid}
            </p>
          </div>

          <p className="mt-2">
            {hasAccess ? (
              <span className="text-green-600">🔓 Access granted</span>
            ) : (
              <span className="text-red-600">🔒 No access</span>
            )}
          </p>

          <div className="flex gap-3 flex-wrap">
            {hasAccess ? (
              <>
                <button
                  onClick={handleRevoke}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Revoke Access
                </button>
                <a
                  href={`https://ipfs.io/ipfs/${cid}`}
                  target="_blank"
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download
                </a>
              </>
            ) : (
              <button
                onClick={handleGrant}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Share Access
              </button>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
