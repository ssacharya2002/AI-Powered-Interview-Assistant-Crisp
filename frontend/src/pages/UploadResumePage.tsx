import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loader2, UploadCloud } from "lucide-react";

import { createEmptyCandidate, extractTextFromDocx } from "@/lib/utils";
import { addCandidate } from "@/store/features/interviewSlice";
import { extractDetailsFromResumeText, extractTextFromPDF } from "@/lib/utils";

function UploadResumePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (!file) return;

      if (
        file.type !== "application/pdf" &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return toast.error("Only PDF and DOCX files are supported.");
      }

      if (file.size > 500 * 1024) {
        return toast.error("File too large (>500kb).");
      }

      try {
        setUploading(true);

        let text = "";
        if (file.type === "application/pdf") {
          text = await extractTextFromPDF(file);
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          text = await extractTextFromDocx(file);
        } else {
          return toast.error("Only PDF and DOCX files are supported.");
        }
        const parsed = await extractDetailsFromResumeText(text);

        const candidate = createEmptyCandidate({
          resumeText: text,
          name: parsed?.name || null,
          email: parsed?.email || null,
          phone: parsed?.phone || null,
          skills: parsed?.skills || [],
        });

        dispatch(addCandidate(candidate));
        navigate(`/interview/${candidate.id}`);
        toast.success("Resume uploaded successfully!");
      } catch (err) {
        toast.error(`Something went wrong: ${err}`);
      } finally {
        setUploading(false);
      }
    },
    onDropRejected: () => {
    toast.error("Only PDF and DOCX files are supported.");
  },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-90px)] bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        AI Interviewer for Fullstack Developers
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Upload your resume and let our AI-powered assistant conduct a simulated
        interview. The system will dynamically generate questions, evaluate your
        answers, and provide a final score and summary.
      </p>

      {/* Drag and Drop Upload Box */}
      <div
        {...getRootProps({
          className: `w-full max-w-md p-10 rounded-xl border-4 border-dashed 
          transition-colors duration-300 ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          } 
          flex flex-col items-center justify-center cursor-pointer shadow-lg`,
        })}
      >
        <input {...getInputProps()} disabled={uploading} />

        {uploading ? (
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        ) : (
          <>
            <UploadCloud className="h-12 w-12 text-blue-600 mb-4" />
            <p className="text-center text-gray-700 font-semibold mb-2">
              Drag & Drop your PDF here
            </p>
            <p className="text-center text-gray-500 text-sm">
              or click to select a file
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadResumePage;
