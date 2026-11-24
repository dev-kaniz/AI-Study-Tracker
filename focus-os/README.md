# FOCUS_OS — AI Study Focus Terminal

A full-screen terminal-style study workspace built with HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons and Vanilla JavaScript, backed by Java 17 + Spring Boot.

## Project layout
- `index.html`, `style.css`, `app.js`: static frontend
- `backend/`: Spring Boot Maven API
- `backend/src/main/java/com/focusos/`: application, REST controller and AI service

## Run locally
1. Install Java 17+ and Maven 3.9+.
2. Configure an OpenAI-compatible Chat Completions endpoint and key:
   - macOS/Linux: `export AI_API_KEY="your-key"`
   - PowerShell: `$env:AI_API_KEY="your-key"`
   - Optional: `AI_API_URL` (default `https://api.openai.com/v1/chat/completions`) and `AI_MODEL` (default `gpt-4o-mini`).
3. Start the API:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. Serve the frontend from the repository's `focus-os` directory (do not open it as a `file://` URL):
   ```bash
   python -m http.server 5500
   ```
5. Open `http://localhost:5500`. The frontend expects the API at `/api/study/ai`; for local development, use a same-origin reverse proxy or serve the frontend through the Spring Boot app. The simplest alternative is to run the static server on port 5500 and configure a dev proxy for `/api` to `http://localhost:8080`.

## Commands
`help`, `focus 25`, `break 5`, `pause`, `resume`, `stop`, `sound brown|rain|gamma|off`, `vol 0-100`, `theme matrix|cyberpunk|amber|obsidian`, `add <task>`, `tasks`, `done <id>`, `rm <id>`, `note <text>`, `notes`, `export`, `ask <question>`, `explain <topic>`, `quiz <topic>`, `summarize <text>`.

## Notes
- Tasks, notes, XP and theme are stored in browser `localStorage`.
- Audio is synthesized locally with the Web Audio API; browsers may require a user gesture before playback.
- AI keys are read only by the Java backend. Never place secrets in frontend JavaScript or commit a real key.
- The AI service currently targets the OpenAI-compatible Chat Completions REST format. Set `AI_API_URL` and `AI_MODEL` to a compatible provider endpoint/model. A native Gemini-specific REST adapter is not included.
- Quiz grading requires valid structured quiz JSON. The terminal quiz parser can be expanded in a follow-up; the AI response currently renders as a formatted answer until that parser is enabled.
