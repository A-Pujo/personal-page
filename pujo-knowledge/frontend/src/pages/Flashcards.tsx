import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { documentAPI } from "../services/api";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import Markdown from "../components/Markdown";

export default function Flashcards() {
  const { documentId } = useParams<{ documentId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const { data: flashcardsData } = useQuery({
    queryKey: ["flashcards", documentId],
    queryFn: () => documentAPI.getFlashcards(parseInt(documentId || "0")),
    enabled: !!documentId,
  });

  const flashcards = flashcardsData?.flashcards || [];
  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length,
    );
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (!documentId) {
    return (
      <div className="card text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Select a document to view flashcards
        </p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No flashcards available yet. They will be generated when the document
          is processed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Flashcards
          </h1>
          <span className="text-gray-600 dark:text-gray-400">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>

        {/* Flashcard */}
        <div
          onClick={handleFlip}
          className="relative cursor-pointer mb-6"
          style={{ perspective: "1000px" }}
        >
          <div
            className={`relative w-full h-96 transition-transform duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-blue-600 
                         rounded-lg shadow-xl flex items-center justify-center p-8"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <div className="text-white text-sm font-medium mb-4 opacity-75">
                  QUESTION
                </div>
                <Markdown inline className="text-white text-2xl font-medium">
                  {currentCard.front}
                </Markdown>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-green-600 
                         rounded-lg shadow-xl flex items-center justify-center p-8"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center">
                <div className="text-white text-sm font-medium mb-4 opacity-75">
                  ANSWER
                </div>
                <Markdown inline className="text-white text-2xl font-medium">
                  {currentCard.back}
                </Markdown>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <button
            onClick={handleFlip}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <RotateCw className="h-4 w-4" />
            <span>Click card to flip</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {flashcards.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
            {flashcards.length > 5 && (
              <span className="text-gray-400">...</span>
            )}
          </div>

          <button
            onClick={handleNext}
            className="btn btn-primary flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          Study Progress
        </h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {currentIndex + 1} of {flashcards.length} cards reviewed
        </p>
      </div>
    </div>
  );
}
