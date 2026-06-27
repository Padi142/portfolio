---
name: Study Buddy
description: Agentic pipeline for processing lecture recordings into searchable study materials
type: Web app
technologies:
  - NextJS
  - TypeScript
  - ElysiaJS
  - AI-SDK
  - PostgreSQL

order: 5
---

## TLDR

Web app for watching lecture recordings in a more useful way than downloading a huge MP4 file and hoping for the best. The app takes a recorded lecture, converts it into a streamable format, creates a transcript with timestamps and then uses AI to generate chapters, summaries, quizzes and flashcards. The result is a player where you can quickly jump to the part you need, search through the lecture content and continue watching from where you left off.

![Screenshot of the lecture player with generated chapters](/projects/study-buddy/screen1.png)

The fun part was the agent side of it. Transcripts are indexed into a vector database, so the app can answer questions about the actual lecture content instead of just guessing from general knowledge. I also experimented with study plans, where you can ask for a topic like **"Runge-Kutta methods"** and the agent finds the relevant parts across lectures, orders them and links each step to a specific timestamp. The project was built as my bachelor thesis and tested with classmates during the exam period, which was a nice way to find out which AI study features are actually useful and which ones only sound cool in a thesis proposal.
