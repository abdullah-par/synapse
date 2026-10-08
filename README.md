The problem

Students learn from long videos, but videos can't be skimmed or searched, and raw transcripts are walls of text. Generic AI summaries tend to drop the examples, code and definitions that make notes worth keeping.

The solution

Synapse fetches the video transcript and uses an LLM to rewrite it as detailed, structured study notes. The notes are returned as typed blocks, so they render cleanly in the UI and can be copied as Markdown or sent to Notion.

Features
Three-tier transcript pipeline. Tries YouTube captions first, then yt-dlp subtitle extraction, then AssemblyAI speech-to-text for videos with no captions.
Structured notes. Overview, headings, paragraphs, bullet lists, code blocks, timestamps, definitions, key takeaways and 5 review questions.
Long-video support. Transcripts over 35,000 characters are split into overlapping chunks, summarized one by one, then merged and deduplicated in a final pass.
Multilingual output. Generate notes in a language of your choice while code stays in its original language.
Markdown export. One-click copy for pasting into Notion, Obsidian or any Markdown editor.
Notion API endpoint. The backend can create a page in a Notion workspace from generated notes.
Feedback board. Visitors can leave feedback, stored in Postgres with a JSON-file fallback for local development.
Responsive, themed UI. Light and dark mode, animated landing page, and "How it works" and "Philosophy" pages.
