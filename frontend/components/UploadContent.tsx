"use client";
import Image from "next/image";

import { useState, useRef } from "react";

//contract related imports
import { uploadToPinata } from "@/lib/pinataUpload";
import {
  recordRegistoryABI,
  RECORD_REGISTORY_ADDR,
} from "@/app/context/ContractData";
import { useAccount, useWriteContract } from "wagmi";
import { useCid } from "@/app/context/CidContext";

export const UploadContent = () => {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  //   const [records, setRecords] = useState()
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { address } = useAccount();
  const { setCid } = useCid();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setDragActive(false);
  //   const file = e.dataTransfer.files?.[0];
  //   if (file) handleFileChange(file);
  // };

  // const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) handleFileChange(file);
  // };

  const { writeContractAsync } = useWriteContract();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !address) return;
    setError(true);
    setSuccess(false);

    console.log("Uploading file with metadata:", { fileName, fileType });

    try {
      const cid = await uploadToPinata(file, {
        fileName,
        fileType,
      });
      console.log("Uploaded CID:", cid);
      await writeContractAsync({
        address: RECORD_REGISTORY_ADDR,
        abi: recordRegistoryABI,
        functionName: "storeRecord",
        args: [address, cid],
      });

      setCid(cid);
      setSuccess(true);
      setLoading(true);
      setError(false);
    } catch (err) {
      console.log("Upload error", err);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Upload Medical Record
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-2">
        {/* Left Section - Upload Area and Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-[8px] p-4 lg:max-w-[398px] xl:max-w-[398px] sm:p-12 text-center transition-all duration-200 bg-[#F5F5F5] ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            // onDrop={handleDrop}
          >
            {/* Upload Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto  flex items-center justify-center">
                <Image
                  src="/images/Folder.png"
                  alt="Upload Icon"
                  width={99.39}
                  height={71}
                />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Documents Upload
            </h3>
            <p className="text-gray-600 mb-8">Drag and drop or select a file</p>

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="bg-[#2596BE] hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                >
                  {success ? "Uploading…" : "Upload"}
                </button>
              </label>

              <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <span className="mr-2">Import from</span>
                <div className="flex items-center space-x-1">
                  <Image
                    src="/images/Google drive icon.png"
                    alt="Google drive Icon"
                    width={20}
                    height={20}
                  />
                  <Image
                    src="/images/Folder.png"
                    alt="Upload Icon"
                    width={20}
                    height={20}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* File Name */}
            <div>
              <label
                htmlFor="fileName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                File Name
              </label>
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full lg:max-w-[373px] xl:max-w-[373px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter file name"
              />
            </div>

            {/* File Type */}
            <div>
              <label
                htmlFor="fileType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                File Type
              </label>
              <input
                type="text"
                id="fileType"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full lg:max-w-[373px] xl:max-w-[373px] px-4 py-3 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter file type"
              />
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full lg:max-w-[373px] xl:max-w-[373px] px-4 py-3 border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none"
                />
                {/* <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
