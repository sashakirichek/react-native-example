# Server-Side AI Roadmap

This document describes the future backend architecture for enhanced AI-powered memo and quiz generation. This is **not required for v1** — the current app runs fully offline with JS-only heuristic generation.

## Architecture Overview

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  iOS App     │────▶│  Cloudflare Edge   │────▶│  Mac mini Host   │
│  (Expo)      │◀────│  (Workers/Tunnel)  │◀────│  (Node.js + LLM) │
└──────────────┘     └───────────────────┘     └──────────────────┘
```

## Components

### 1. Mac mini Inference Host
- **Hardware**: Mac mini M2/M4 with 16GB+ RAM
- **Runtime**: Node.js API server (Express or Fastify)
- **Model**: Llama 3.2 1B Instruct or Qwen2.5 1.5B Instruct via `llama.cpp` or `mlx`
- **Purpose**: Generate higher-quality memos and quiz questions from topic content
- **Concurrency**: Single-queue model inference with request prioritization

### 2. Cloudflare Edge Entry
- **Service**: Cloudflare Workers + Cloudflare Tunnel
- **Purpose**: Public HTTPS endpoint without port forwarding; rate limiting; request validation
- **Auth**: API key or device token for access control
- **Caching**: Cache generated content at the edge to reduce inference load

### 3. Node.js API Server
- **Endpoints**:
  - `POST /api/generate/memo` — Generate a structured memo from topic content
  - `POST /api/generate/quiz` — Generate quiz questions from topic content
  - `GET /api/health` — Health check for monitoring
- **Request schema**: `{ topicName, content, references[], maxQuestions? }`
- **Response schema**: `{ memo?, questions?, sourceHash, generatedAt }`

### 4. Health-Checked Failover
- Cloudflare Worker pings `/api/health` every 60s
- If the Mac mini is down, the Worker returns a `503` with `Retry-After`
- The iOS app falls back to local JS-only generation when the server is unavailable

### 5. Request Queueing
- In-memory queue on the Node.js server (or Redis if persistence is needed)
- Max queue depth: 50 requests
- Timeout: 30s per generation request
- Priority: quiz generation > memo generation (quizzes are shorter)

### 6. Observability
- Structured JSON logging on the Node.js server
- Cloudflare Workers analytics for request volume and latency
- Simple dashboard: request count, average latency, error rate, queue depth

### 7. Cloud Burst Capacity
- When local compute is saturated (queue > 80%), overflow to a cloud inference API
- Options: Together.ai, Groq, or Fireworks AI (Llama 3 compatible)
- Budget cap: stop cloud burst after N requests per day to control costs

## Recommended Models

| Model | Parameters | RAM | Quality | Speed |
|-------|-----------|-----|---------|-------|
| Llama 3.2 1B Instruct | 1B | ~2GB | Good for structured output | Fast |
| Qwen2.5 1.5B Instruct | 1.5B | ~3GB | Better reasoning | Medium |
| Llama 3.2 3B Instruct | 3B | ~6GB | Higher quality | Slower |

For v1 backend, start with **Llama 3.2 1B Instruct** for the best speed/quality tradeoff on Mac mini.

## iOS App Integration

When a backend is available:
1. App checks `GET /api/health` on topic open
2. If healthy, shows "AI Generate" button alongside "Generate" (local)
3. AI generation sends content to the server, receives structured memo/quiz
4. Results are saved to local SQLite identically to JS-generated content
5. If server is unavailable, the button is hidden — local generation remains the default

## Security Considerations

- All traffic over HTTPS via Cloudflare Tunnel
- API key stored securely on device (Expo SecureStore)
- No user data retained on server after response is sent
- Rate limiting: 10 requests/minute per device
- Input validation: max 50KB content per request

## Timeline

This roadmap is for **after v1 ships**. Implementation order:
1. Set up Mac mini with Node.js + llama.cpp
2. Create Cloudflare Tunnel + Worker
3. Build and test the 2 generation endpoints
4. Add health check and failover logic
5. Integrate into the iOS app as an optional enhancement
6. Add cloud burst capacity if needed
