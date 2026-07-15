import { useQuery } from "@tanstack/react-query";
import { statsAPI, documentAPI } from "../services/api";
import {
  BookOpen,
  Brain,
  ClipboardList,
  CreditCard,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: statsAPI.getOverview,
  });

  const { data: documentsData } = useQuery({
    queryKey: ["documents"],
    queryFn: documentAPI.listDocuments,
  });

  const recentDocuments = documentsData?.documents.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <Link
          to="/library"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="h-8 w-8" />}
          label="Documents"
          value={stats?.total_documents || 0}
          color="blue"
        />
        <StatCard
          icon={<Brain className="h-8 w-8" />}
          label="Concepts"
          value={stats?.total_concepts || 0}
          color="green"
        />
        <StatCard
          icon={<ClipboardList className="h-8 w-8" />}
          label="Questions"
          value={stats?.total_questions || 0}
          color="purple"
        />
        <StatCard
          icon={<CreditCard className="h-8 w-8" />}
          label="Flashcards"
          value={stats?.total_flashcards || 0}
          color="orange"
        />
      </div>

      {/* Recent Documents */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Documents
        </h2>
        {recentDocuments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No documents yet. Upload your first document to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <Link
                key={doc.id}
                to={`/document/${doc.id}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 
                           hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doc.field} • {doc.subject_area} • {doc.total_pages} pages
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(doc.status)}`}
                  >
                    {doc.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          to="/tutor"
          icon={<MessageSquare className="h-12 w-12" />}
          title="AI Tutor"
          description="Ask questions about your study materials"
        />
        <QuickAction
          to="/exercises"
          icon={<ClipboardList className="h-12 w-12" />}
          title="Practice Exercises"
          description="Test your knowledge with generated questions"
        />
        <QuickAction
          to="/flashcards"
          icon={<CreditCard className="h-12 w-12" />}
          title="Flashcards"
          description="Review key concepts with flashcards"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
  };

  return (
    <div className="card">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon, title, description }: any) {
  return (
    <Link
      to={to}
      className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
    >
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    UPLOADED: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    PARSING:
      "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    EMBEDDING: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    COMPLETED:
      "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300",
  };
  return colors[status] || colors.UPLOADED;
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  );
}
