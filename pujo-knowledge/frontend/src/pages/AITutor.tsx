import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { tutorAPI } from "../services/api";
import { Send, Bot, User } from "lucide-react";
import Markdown from "../components/Markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ document_title: string; page: number }>;
}

export default function AITutor() {
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get("doc")
    ? parseInt(searchParams.get("doc")!)
    : undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const askMutation = useMutation({
    mutationFn: ({ question, chatHistory }: any) =>
      tutorAPI.askQuestion(question, documentId, chatHistory),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const chatHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    askMutation.mutate({
      question: input,
      chatHistory,
    });

    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Tutor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ask questions about your study materials and get instant answers
        </p>
      </div>

      {/* Chat Messages */}
      <div className="card min-h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Ask me anything about your study materials!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                    ) : (
                      <User className="h-5 w-5 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <Markdown>{message.content}</Markdown>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                          <p className="text-sm font-medium mb-1">Sources:</p>
                          <ul className="text-sm space-y-1">
                            {message.sources.map((source, idx) => (
                              <li key={idx}>
                                {source.document_title} (Page {source.page})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="input flex-1"
            disabled={askMutation.isPending}
          />
          <button
            type="submit"
            disabled={askMutation.isPending || !input.trim()}
            className="btn btn-primary"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
