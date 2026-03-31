# Knowledge App

An offline-first iOS/iPadOS knowledge storage system built with [Expo](https://expo.dev) and React Native. Store topics, generate structured memos, and test yourself with auto-generated quizzes — all on-device.

## Features

- **Topic Import** — Create topics by name, pasting text, or importing a URL (fetches a readable snapshot)
- **Double Diamond Memos** — Generate structured study memos following the Discover → Define → Develop → Deliver framework
- **Quiz Generation** — Auto-generate MCQ, cloze, and true/false questions from your topic content
- **Swipe to Delete** — Remove topics from the library with a swipe gesture
- **Dark Mode** — Full light/dark theme support
- **iPad Support** — Responsive layout for both iPhone and iPad
- **Offline Storage** — All data stored locally in SQLite

## Generation Approach

### iOS/iPadOS 18+ — Deterministic Heuristic Engine

On iOS 18 and later, memo and quiz generation runs entirely in JavaScript with no AI model dependency:

- **Quiz generation**: Sentence extraction, key-term frequency analysis, cloze (fill-in-the-blank) construction, true/false variants with term-swapping distractors, and multiple-choice questions built from contextual term matching
- **Memo generation**: Automated Double Diamond structuring — key concept extraction (Discover), definition sentence selection (Define), supporting point enumeration (Develop), and term-contextualized takeaways (Deliver)
- **Change detection**: Content hashing tracks source changes so you can regenerate after edits without losing the original

This deterministic approach works offline, produces consistent results, and requires no network or model downloads.

### iOS/iPadOS 26+ — Apple Foundation Models (Future Enhancement)

On iOS 26 and later (with Apple Intelligence enabled), the app can optionally use Apple's on-device Foundation Models for higher-quality generation:

- **Richer memos**: Natural language summaries, better paragraph flow, contextual cross-referencing
- **Smarter quizzes**: Conceptual questions beyond keyword extraction, better distractor quality
- **Runtime gated**: The app checks for Apple Intelligence availability at runtime — if unavailable, it falls back to the deterministic engine seamlessly
- **No cloud dependency**: Apple Foundation Models run on-device via the Neural Engine

This enhancement is non-blocking — the app ships fully functional on iOS 18+ using the deterministic engine alone.

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app in Expo Go

   ```bash
   npx expo start
   ```

3. Run unit tests

   ```bash
   npm test
   ```

## Build for Device

The project uses an unsigned IPA workflow for sideloading via AltStore:

```bash
# Triggered via GitHub Actions (.github/workflows/build-ipa.yml)
# Produces an unsigned .ipa artifact for AltStore sideloading
```

EAS CLI (optional for future cloud builds):

```
npm install -g eas-cli
```

## Project Structure

```
app/
  (tabs)/          — Tab navigation (Library, Create, Settings)
  topic/[id].tsx   — Topic detail + generation triggers
  quiz/[topicId].tsx — Interactive quiz with scoring
  memo/[topicId].tsx — Memo viewer with edit support
  db/              — SQLite schema + repository layer
  lib/             — Text processing, quiz & memo generators
__tests__/         — Unit tests for generators and utilities
maestro/           — E2E test scenarios (7 flows)
docs/              — Server-side AI roadmap
```

## Server-Side AI Roadmap

See [docs/server-ai-roadmap.md](docs/server-ai-roadmap.md) for the future backend architecture: Node.js + Mac mini inference host + Cloudflare edge entry.

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Apple Foundation Models](https://developer.apple.com/documentation/foundationmodels)
