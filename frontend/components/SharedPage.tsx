"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
  controlManagerABI,
  RECORD_REGISTORY_ADDR,
} from "@/app/context/ContractData";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { DashboardLayout } from "./layout/DashboardLayout";
import Axios from "axios";

interface RecordMetaData {
  cid: string;
  fileName: string;
  fileType: string;
  dateUploaded: string;
}

// Props:
// - patientAddress: the address of the patient whose record is being viewed
// - cid: the CID of the file
const SharedPage = ({
  patientAddress,
  cid,
}: {
  patientAddress: string;
  cid: string;
}) => {
  const { address: providerAddress } = useAccount();
  const [metaData, setMetaData] = useState<RecordMetaData | null>();

  useEffect(() => {
    async function fetchMetaData() {
      try {
        const response = await Axios.get(
          `https://api.pinata.cloud/pinning/hashMetadata/${cid}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT!}`,
            },
          }
        );

        const fetchedMetaData = response.data.PinataMetaData;
        setMetaData({
          cid,
          fileName: fetchedMetaData.name || "Unamed File",
          fileType: fetchedMetaData.keyvalues?.fileType || "unamed FileType",
          dateUploaded:
            fetchedMetaData.data.date || new Date().toISOString().slice(0, 10),
        });
      } catch (error) {
        console.error(error);
      }
    }

    fetchMetaData();
  }, [cid]);

  // 🚦 Check current access
  const { data: hasAccess, refetch } = useReadContract({
    address: RECORD_REGISTORY_ADDR,
    abi: controlManagerABI,
    functionName: "hasAccess",
    args: [patientAddress, providerAddress as string],
    query: { enabled: !!providerAddress && !!patientAddress },
  });

  // 🖊️ Grant and revoke access
  const { writeContractAsync: grantAccess } = useWriteContract();

  const { writeContractAsync: revokeAccess } = useWriteContract();

  // 🧠 Action handlers
  //   const handleGrant = async () => {
  //     await grantAccess({ args: [providerAddress] });
  //     refetch();
  //   };

  //   const handleRevoke = async () => {
  //     await revokeAccess({ args: [providerAddress] });
  //     refetch();
  //   };

  return (
    <DashboardLayout activeItem="shared-access">
      <div className="p-6 lg:p-8 space-y-8">
        {/* Record details once metadata is loaded */}
        {metaData ? (
          <div className="rounded-xl bg-white shadow p-6 flex items-start space-x-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{metaData.fileName}</h2>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div>
                  <strong>Type:</strong> {metaData.fileType}
                </div>
                <div>
                  <strong>Date:</strong> {metaData.dateUploaded}
                </div>
                <div>
                  <strong>CID:</strong> {cid}
                </div>
              </div>

              {/* Access status & action buttons */}
              {/* <div className="mt-4 space-y-1">
                <div>
                  {hasAccess ? (
                    <span className="text-green-600 font-medium">
                      🔓 Access Granted
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      🔒 No Access
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    onClick={handleGrant}
                    disabled={hasAccess || granting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {granting ? "Granting…" : "Share Access"}
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={!hasAccess || revoking}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50"
                  >
                    {revoking ? "Revoking…" : "Revoke Access"}
                  </button>
                  {hasAccess && (
                    <a
                      href={`https://ipfs.io/ipfs/${cid}`}
                      className="inline-flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      <DownloadIcon className="mr-2" />
                      Download
                    </a>
                  )}
                </div>
              </div> */}
            </div>
          </div>
        ) : (
          <p>Loading record details…</p>
        )}

        {/* Audit log */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Audit Log</h2>
          {/* You’ll want to fetch this dynamically from your contract or backend */}
          <p className="text-gray-500">
            Audit history will be displayed here...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SharedPage;
