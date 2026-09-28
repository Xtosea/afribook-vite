import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CheckCircle,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

const ID_TYPES = [
  "National ID",
  "International Passport",
  "Driver's License",
  "Voter's Card",
];

export default function SellerKyc() {
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState(
    currentUser?.name || ""
  );
  const [idType, setIdType] = useState("");

  const [governmentIdFile, setGovernmentIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  const [governmentIdPreview, setGovernmentIdPreview] =
    useState("");
  const [selfiePreview, setSelfiePreview] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadKyc = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetchWithToken(
          "/api/kyc/me",
          token
        );

        if (!cancelled) {
          const record = response?.kyc || null;

          setKyc(record);

          if (record?.fullName) {
            setFullName(record.fullName);
          }

          if (record?.idType) {
            setIdType(record.idType);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Failed to load your KYC information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadKyc();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (governmentIdPreview) {
        URL.revokeObjectURL(governmentIdPreview);
      }

      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }
    };
  }, [governmentIdPreview, selfiePreview]);

  const handleGovernmentIdChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setGovernmentIdFile(file);
    setGovernmentIdPreview(
      URL.createObjectURL(file)
    );
    setError("");
  };

  const handleSelfieChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelfieFile(file);
    setSelfiePreview(
      URL.createObjectURL(file)
    );
    setError("");
  };

  const uploadToCloudinary = async (
    file,
    documentType
  ) => {
    const signatureResponse =
      await fetchWithToken(
        "/api/kyc/upload-signature",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            documentType,
          }),
        }
      );

    if (
      !signatureResponse?.cloudName ||
      !signatureResponse?.signature ||
      !signatureResponse?.publicId
    ) {
      throw new Error(
        "Secure upload information was not returned."
      );
    }

    const cloudinaryUrl =
      `https://api.cloudinary.com/v1_1/` +
      `${signatureResponse.cloudName}/image/upload`;

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "api_key",
      signatureResponse.apiKey
    );
    formData.append(
      "timestamp",
      String(signatureResponse.timestamp)
    );
    formData.append(
      "signature",
      signatureResponse.signature
    );
    formData.append(
      "folder",
      signatureResponse.folder
    );
    formData.append(
      "public_id",
      signatureResponse.publicId
    );
    formData.append(
      "type",
      signatureResponse.type
    );

    const response = await fetch(
      cloudinaryUrl,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          "Cloudinary upload failed."
      );
    }

    if (!data?.public_id) {
      throw new Error(
        "Cloudinary did not return the uploaded file ID."
      );
    }

    return data.public_id;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Please log in again.");
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!idType) {
      setError("Please select your ID type.");
      return;
    }

    if (!governmentIdFile) {
      setError(
        "Please upload a clear image of your government ID."
      );
      return;
    }

    if (!selfieFile) {
      setError(
        "Please take or upload a clear selfie."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const governmentIdPublicId =
        await uploadToCloudinary(
          governmentIdFile,
          "government-id"
        );

      const selfiePublicId =
        await uploadToCloudinary(
          selfieFile,
          "selfie"
        );

      const response = await fetchWithToken(
        "/api/kyc/submit",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            fullName: fullName.trim(),
            idType,
            governmentIdPublicId,
            selfiePublicId,
          }),
        }
      );

      setKyc(response?.kyc || null);

      setGovernmentIdFile(null);
      setSelfieFile(null);
      setGovernmentIdPreview("");
      setSelfiePreview("");

      alert(
        "Your KYC has been submitted successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to submit your KYC."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />
        </div>
      </div>
    );
  }

  const status =
    kyc?.status || "not_submitted";

  const isApproved = status === "approved";
  const isPending = status === "pending";
  const isRejected = status === "rejected";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
            <ShieldCheck
              size={30}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Seller KYC Verification
            </h1>

            <p className="text-gray-500 mt-1">
              Verify your identity to sell on AfricSocial Marketplace.
            </p>
          </div>
        </div>
      </div>

      {isApproved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle size={24} />

            <div>
              <h2 className="font-bold">
                KYC Approved
              </h2>

              <p className="text-sm mt-1">
                Your seller identity has been verified.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-yellow-700">
            <Loader2
              size={24}
              className="animate-spin"
            />

            <div>
              <h2 className="font-bold">
                KYC Under Review
              </h2>

              <p className="text-sm mt-1">
                Your documents have been submitted and are waiting for admin review.
              </p>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3 text-red-700">
            <XCircle
              size={24}
              className="shrink-0"
            />

            <div>
              <h2 className="font-bold">
                KYC Rejected
              </h2>

              <p className="text-sm mt-1">
                {kyc?.rejectionReason ||
                  "Your KYC submission was rejected. Please review your information and submit again."}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isApproved && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-6"
        >
          <div>
            <h2 className="text-xl font-bold">
              {isRejected
                ? "Resubmit Your KYC"
                : "Submit Your Identity Documents"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Upload a clear government ID and take a clear selfie.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">
              Full name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              disabled={submitting}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full legal name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Government ID type
            </label>

            <select
              value={idType}
              onChange={(event) =>
                setIdType(event.target.value)
              }
              disabled={submitting}
              className="w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select ID type
              </option>

              {ID_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Government ID
            </label>

            <label className="block border-2 border-dashed rounded-2xl p-6 cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleGovernmentIdChange}
                disabled={submitting}
                className="hidden"
              />

              <div className="flex flex-col items-center text-center">
                <FileText
                  size={32}
                  className="text-blue-600"
                />

                <span className="font-semibold mt-2">
                  {governmentIdFile
                    ? governmentIdFile.name
                    : "Upload or photograph your government ID"}
                </span>

                <span className="text-sm text-gray-500 mt-1">
                  Make sure the document is clear and all important details are visible.
                </span>
              </div>
            </label>

            {governmentIdPreview && (
              <img
                src={governmentIdPreview}
                alt="Government ID preview"
                className="mt-4 w-full max-h-80 object-contain rounded-xl border"
              />
            )}

            {kyc?.governmentIdUploaded &&
              !governmentIdFile && (
                <p className="text-sm text-green-600 mt-2">
                  Government ID already uploaded for this submission.
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Selfie
            </label>

            <label className="block border-2 border-dashed rounded-2xl p-6 cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleSelfieChange}
                disabled={submitting}
                className="hidden"
              />

              <div className="flex flex-col items-center text-center">
                <Camera
                  size={32}
                  className="text-blue-600"
                />

                <span className="font-semibold mt-2">
                  {selfieFile
                    ? selfieFile.name
                    : "Take or upload your selfie"}
                </span>

                <span className="text-sm text-gray-500 mt-1">
                  Use good lighting and keep your face clearly visible.
                </span>
              </div>
            </label>

            {selfiePreview && (
              <img
                src={selfiePreview}
                alt="Selfie preview"
                className="mt-4 w-full max-h-80 object-contain rounded-xl border"
              />
            )}

            {kyc?.selfieUploaded &&
              !selfieFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selfie already uploaded for this submission.
                </p>
              )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="flex gap-2">
              <ShieldCheck
                size={18}
                className="shrink-0 text-green-600"
              />

              <p>
                Your government ID and selfie are uploaded using secure authenticated Cloudinary storage and are intended for KYC review only.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Uploading and submitting...
              </>
            ) : (
              <>
                <Upload size={18} />
                Submit KYC for Review
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/marketplace")}
            disabled={submitting}
            className="w-full border rounded-xl py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Back to Marketplace
          </button>
        </form>
      )}
    </div>
  );
}
