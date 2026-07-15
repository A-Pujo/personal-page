import { Link } from "react-router-dom";
import {
  BookOpen,
  Home,
  MessageSquare,
  ClipboardList,
  CreditCard,
} from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AI Study Platform
            </span>
          </Link>

          <div className="flex space-x-4">
            <NavLink
              to="/"
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
            />
            <NavLink
              to="/library"
              icon={<BookOpen className="h-5 w-5" />}
              label="Library"
            />
            <NavLink
              to="/tutor"
              icon={<MessageSquare className="h-5 w-5" />}
              label="AI Tutor"
            />
            <NavLink
              to="/exercises"
              icon={<ClipboardList className="h-5 w-5" />}
              label="Exercises"
            />
            <NavLink
              to="/flashcards"
              icon={<CreditCard className="h-5 w-5" />}
              label="Flashcards"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavLink({ to, icon, label }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
