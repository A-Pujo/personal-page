import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentAPI } from "../services/api";
import Markdown from "../components/Markdown";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ClipboardList,
  CreditCard,
  Trash2,
} from "lucide-react";

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const documentId = parseInt(id || "0");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: document } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => documentAPI.getDocument(documentId),
    enabled: !!documentId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => documentAPI.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/library");
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete "${document?.title || "this document"}"? This cannot be undone.`,
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const { data: sectionsData } = useQuery({
    queryKey: ["sections", documentId],
    queryFn: () => documentAPI.getSections(documentId),
    enabled: !!documentId,
  });

  const { data: summariesData } = useQuery({
    queryKey: ["summaries", documentId],
    queryFn: () => documentAPI.getSummaries(documentId, "quick"),
    enabled: !!documentId,
  });

  const { data: structuredSummaryData } = useQuery({
    queryKey: ["summaries", documentId, "structured"],
    queryFn: () => documentAPI.getSummaries(documentId, "structured"),
    enabled: !!documentId,
  });

  const structuredSummary = structuredSummaryData?.summaries[0];

  return (
    <div className="space-y-6">
      <Link
        to="/library"
        className="inline-flex items-center text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Library
      </Link>

      {/* Document Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {document?.title || "Loading..."}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <span>{document?.field}</span>
              <span>•</span>
              <span>{document?.subject_area}</span>
              <span>•</span>
              <span>{document?.document_type}</span>
              <span>•</span>
              <span>{document?.total_pages} pages</span>
              <span>•</span>
              <span>
                {new Date(document?.upload_date || "").toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ActionCard
          to={`/tutor?doc=${documentId}`}
          icon={<Brain className="h-6 w-6" />}
          label="Ask AI Tutor"
          color="blue"
        />
        <ActionCard
          to={`/exercises/${documentId}`}
          icon={<ClipboardList className="h-6 w-6" />}
          label="Practice Exercises"
          color="green"
        />
        <ActionCard
          to={`/flashcards/${documentId}`}
          icon={<CreditCard className="h-6 w-6" />}
          label="Flashcards"
          color="purple"
        />
        <ActionCard
          to={documentAPI.getFileUrl(documentId)}
          external
          icon={<BookOpen className="h-6 w-6" />}
          label="Read Document"
          color="orange"
        />
      </div>

      {/* Document Summary */}
      {structuredSummary && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Document Summary
          </h2>
          <Markdown className="text-gray-700 dark:text-gray-300">
            {structuredSummary.content}
          </Markdown>
        </div>
      )}

      {/* Sections */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Document Sections
        </h2>
        {sectionsData?.sections.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Processing sections...
          </p>
        ) : (
          <div className="space-y-3">
            {sectionsData?.sections.map((section) => (
              <div
                key={section.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Type: {section.section_type} • Page {section.page_start}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Summary */}
      {summariesData?.summaries.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Summary
          </h2>
          <div className="space-y-4">
            {summariesData.summaries.slice(0, 3).map((summary) => (
              <div key={summary.id} className="border-l-4 border-blue-500 pl-4">
                {summary.section_title && (
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {summary.section_title}
                  </h4>
                )}
                <Markdown className="text-gray-700 dark:text-gray-300">
                  {summary.content}
                </Markdown>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ to, icon, label, color, external }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
    green:
      "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
    purple:
      "bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300",
    orange:
      "bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300",
  };

  const className = `flex items-center space-x-3 p-4 rounded-lg transition-colors ${colorClasses[color]}`;

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {icon}
        <span className="font-medium">{label}</span>
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
