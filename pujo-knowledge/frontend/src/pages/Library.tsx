import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentAPI } from "../services/api";
import { Upload, FileText, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Library() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: documentAPI.listDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: documentAPI.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentAPI.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleDelete = (
    event: React.MouseEvent,
    documentId: number,
    title: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(documentId);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Library
        </h1>
      </div>

      {/* Upload Area */}
      <div className="card border-2 border-dashed border-gray-300 dark:border-gray-600">
        <label className="flex flex-col items-center justify-center cursor-pointer py-8">
          <Upload className="h-16 w-16 text-gray-400 mb-4" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            {uploading ? "Uploading..." : "Upload PDF Document"}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to select a file or drag and drop
          </span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Documents Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Your Documents
        </h2>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : documentsData?.documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No documents yet. Upload your first document to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentsData?.documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/document/${doc.id}`}
                className="card hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <FileText className="h-12 w-12 text-blue-600" />
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={doc.status} />
                    <button
                      onClick={(e) => handleDelete(e, doc.id, doc.title)}
                      disabled={deleteMutation.isPending}
                      title="Delete document"
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">
                  {doc.title}
                </h3>

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Field: {doc.field}</p>
                  <p>Subject: {doc.subject_area}</p>
                  <p>Type: {doc.document_type}</p>
                  <p>Pages: {doc.total_pages}</p>
                  <p>
                    Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    UPLOADED: {
      label: "Uploaded",
      color: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      icon: <FileText className="h-4 w-4" />,
    },
    PARSING: {
      label: "Processing",
      color:
        "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: (
        <div className="animate-spin h-4 w-4 border-2 border-yellow-800 dark:border-yellow-300 border-t-transparent rounded-full" />
      ),
    },
    COMPLETED: {
      label: "Ready",
      color:
        "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    ERROR: {
      label: "Error",
      color: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const config = statusConfig[status] || statusConfig.UPLOADED;

  return (
    <span
      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
