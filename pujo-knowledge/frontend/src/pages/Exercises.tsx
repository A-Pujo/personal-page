import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { documentAPI, questionsAPI } from "../services/api";
import { CheckCircle, XCircle } from "lucide-react";
import Markdown from "../components/Markdown";

export default function Exercises() {
  const { documentId } = useParams<{ documentId: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { data: questionsData } = useQuery({
    queryKey: ["questions", documentId],
    queryFn: () => documentAPI.getQuestions(parseInt(documentId || "0")),
    enabled: !!documentId,
  });

  const submitMutation = useMutation({
    mutationFn: ({ questionId, answer }: any) =>
      questionsAPI.submitAnswer(questionId, answer),
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
    },
  });

  const questions = questionsData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    submitMutation.mutate({
      questionId: currentQuestion.id,
      answer: userAnswer,
    });
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setUserAnswer("");
    setSubmitted(false);
    setResult(null);
  };

  if (!documentId) {
    return (
      <div className="card text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Select a document to view exercises
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No exercises available yet. They will be generated when the document
          is processed.
        </p>
      </div>
    );
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="card text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Exercises Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You've completed all {questions.length} questions
        </p>
        <button
          onClick={() => setCurrentQuestionIndex(0)}
          className="btn btn-primary"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Practice Exercises
          </h1>
          <span className="text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {currentQuestion.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {currentQuestion.question_type}
            </span>
          </div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            <Markdown inline>{currentQuestion.question_text}</Markdown>
          </h2>

          {/* Answer Input */}
          {currentQuestion.question_type === "mcq" &&
          currentQuestion.options ? (
            <div className="space-y-2">
              {(typeof currentQuestion.options === "string"
                ? JSON.parse(currentQuestion.options)
                : currentQuestion.options
              ).map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => !submitted && setUserAnswer(option)}
                  disabled={submitted}
                  className={`w-full text-left p-4 rounded-lg border-2 text-gray-900 dark:text-white transition-colors ${
                    userAnswer === option
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  } ${submitted ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Markdown inline>{option}</Markdown>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer here..."
              className="input min-h-[120px] text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 w-full rounded-lg p-4 resize-none"
            />
          )}
        </div>

        {/* Result */}
        {submitted && result && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              result.is_correct
                ? "bg-green-100 dark:bg-green-900/20 border-2 border-green-500"
                : "bg-red-100 dark:bg-red-900/20 border-2 border-red-500"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              {result.is_correct ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-300">
                    Correct!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-300">
                    Incorrect
                  </span>
                </>
              )}
            </div>
            {!result.is_correct && result.correct_answer && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Correct answer:{" "}
                <Markdown inline>{result.correct_answer}</Markdown>
              </p>
            )}
            {currentQuestion.explanation && (
              <Markdown className="text-sm text-gray-700 dark:text-gray-300">
                {currentQuestion.explanation}
              </Markdown>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim() || submitMutation.isPending}
              className="btn btn-primary"
            >
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn btn-primary">
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "Finish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
