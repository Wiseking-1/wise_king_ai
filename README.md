# Wise King AI

A ChatGPT-style AI assistant project with a polished single-page frontend and a working backend API.

## Features

- Chat endpoint powered by OpenAI when an API key is configured
- Fallback demo responses when no API key is available
- User sign up / sign in API with JWT
- File upload support for images and documents
- Static serving for the main `index.html` interface

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your real values.

4. Start the app:

```bash
npm run dev
```

Then open:

```text
http://localhost:5000
```

## API routes

```text
GET /health
POST /api/chat
POST /api/auth/signup
POST /api/auth/login
POST /api/files/upload
```

## Notes

- The frontend is still the existing `index.html` file.
- The backend is intentionally separate so the app can grow without cluttering the UI.
- If you do not add `OPENAI_API_KEY`, the chat route still works in demo mode.
