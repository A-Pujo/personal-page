# Local AI Study Platform

## Technical Workflow

Author: Aln Pujo

---

# Goal

Build an offline AI-powered study platform capable of

- Reading books
- Reading journal articles
- Reading lecture notes
- Creating a searchable knowledge base
- Automatically organizing materials
- Generating summaries
- Creating exercises
- Solving exercises
- Answering questions
- Building relationships between concepts

Everything runs locally.

---

# Overall Architecture

                    React
                      │
                      │
              REST API / WebSocket
                      │
                Node.js + Express
                      │
      ┌───────────────┴────────────────┐
      │                                │

Python AI Engine PostgreSQL
│ │
│ │
Document Processing pgvector
│ │
└───────────────┬────────────────┘
│
LM Studio
Local LLM Server

---

# Folder Structure

project/

    frontend/

    backend/

    python/

        parser/

        extractor/

        embedding/

        llm/

        exercise/

        summary/

        graph/

        scheduler/

    database/

    docs/

    storage/

        pdf/

        images/

        thumbnails/

        embeddings/
