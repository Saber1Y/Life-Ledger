import axios from "axios";

interface Meta {
  fileName: string;
  fileType: string;
  notes?: string;
}

export const uploadToPinata = async (
  file: File,
  metadata: Meta
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: metadata.fileName,
      keyvalues: {
        fileType: metadata.fileType,
        notes: metadata.notes,
      },
    })
  );

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
      },
    }
  );

  return res.data.IpfsHash;
};
