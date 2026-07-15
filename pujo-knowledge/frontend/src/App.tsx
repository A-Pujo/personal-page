import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import DocumentView from "./pages/DocumentView";
import AITutor from "./pages/AITutor";
import Exercises from "./pages/Exercises";
import Flashcards from "./pages/Flashcards";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/document/:id" element={<DocumentView />} />
            <Route path="/tutor" element={<AITutor />} />
            <Route path="/exercises/:documentId?" element={<Exercises />} />
            <Route path="/flashcards/:documentId?" element={<Flashcards />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
