import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface Document {
  id: number;
  title: string;
  filename: string;
  upload_date: string;
  status: string;
  field: string;
  subject_area: string;
  document_type: string;
  total_pages: number;
}

export interface Section {
  id: number;
  section_type: string;
  title: string;
  page_start: number;
  order_index: number;
}

export interface Summary {
  id: number;
  summary_type: string;
  content: string;
  section_title?: string;
}

export interface Concept {
  id: number;
  name: string;
  definition: string;
  concept_type: string;
}

export interface Question {
  id: number;
  question_type: string;
  difficulty: string;
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty?: string;
}

export interface SearchResult {
  id: number;
  content: string;
  document_id: number;
  document_title: string;
  page_number: number;
  distance: number;
}

// Document API
export const documentAPI = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  listDocuments: async (): Promise<{ documents: Document[] }> => {
    const response = await api.get("/documents");
    return response.data;
  },

  getDocument: async (id: number): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  getSections: async (id: number): Promise<{ sections: Section[] }> => {
    const response = await api.get(`/documents/${id}/sections`);
    return response.data;
  },

  getSummaries: async (
    id: number,
    type?: string,
  ): Promise<{ summaries: Summary[] }> => {
    const params = type ? { summary_type: type } : {};
    const response = await api.get(`/documents/${id}/summaries`, { params });
    return response.data;
  },

  getQuestions: async (
    id: number,
    difficulty?: string,
  ): Promise<{ questions: Question[] }> => {
    const params = difficulty ? { difficulty } : {};
    const response = await api.get(`/documents/${id}/questions`, { params });
    return response.data;
  },

  getFlashcards: async (id: number): Promise<{ flashcards: Flashcard[] }> => {
    const response = await api.get(`/documents/${id}/flashcards`);
    return response.data;
  },

  deleteDocument: async (id: number) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  getFileUrl: (id: number): string => `${API_BASE_URL}/documents/${id}/file`,
};

// Search API
export const searchAPI = {
  semanticSearch: async (
    query: string,
    documentId?: number,
    limit = 10,
  ): Promise<{ results: SearchResult[] }> => {
    const response = await api.post("/search", {
      query,
      document_id: documentId,
      limit,
    });
    return response.data;
  },
};

// Concepts API
export const conceptsAPI = {
  listConcepts: async (
    documentId?: number,
  ): Promise<{ concepts: Concept[] }> => {
    const params = documentId ? { document_id: documentId } : {};
    const response = await api.get("/concepts", { params });
    return response.data;
  },

  getConcept: async (id: number) => {
    const response = await api.get(`/concepts/${id}`);
    return response.data;
  },
};

// Questions API
export const questionsAPI = {
  submitAnswer: async (questionId: number, answer: string) => {
    const response = await api.post(`/questions/${questionId}/answer`, {
      answer,
    });
    return response.data;
  },
};

// Tutor API
export const tutorAPI = {
  askQuestion: async (
    question: string,
    documentId?: number,
    chatHistory?: Array<{ role: string; content: string }>,
  ) => {
    const response = await api.post("/tutor/ask", {
      question,
      document_id: documentId,
      chat_history: chatHistory,
    });
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getOverview: async () => {
    const response = await api.get("/stats/overview");
    return response.data;
  },
};

export default api;
