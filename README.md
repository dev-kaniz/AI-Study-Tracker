# StudyFlow — AI Study Tracker

A responsive, browser-based study workspace built with HTML, CSS and vanilla JavaScript. No build step or package installation is required.

## Core workspace
- Responsive dashboard, weekly focus chart and subject progress
- Task planner with deadlines, subjects, completion status and estimated durations
- Focus room with 25-minute focus, 5-minute short break and 15-minute long break
- Flashcard library with question/answer reveal and custom cards
- Notes workspace and productivity insights
- Local study coach that turns current tasks into a time-boxed plan

## Study toolbox
- Exam countdown for a saved exam date
- Weighted grade calculator and required-final-score estimator
- Quick recall quiz generated from your own flashcards
- Seven-day study outline based on unfinished tasks
- Consecutive-day study streak counter
- Task search by title or subject
- JSON backup export and restore
- Browser-local data persistence

## Run locally
Open `index.html` in a modern browser, or run:

```bash
python -m http.server 8000
```

Visit http://localhost:8000.

## Enable GitHub Pages
1. Open repository **Settings → Pages**.
2. Select **Deploy from a branch**.
3. Choose **main** and **/(root)**, then Save.
4. Wait for deployment and use the published URL shown there.

## AI integration status
The study coach is a local, rule-based planner, not a connected generative AI model. Quiz prompts are created from the user's own flashcards. To add a real AI tutor, connect the frontend to a secure backend endpoint. Keep provider API keys on the server; never put secret keys in this public repository or browser JavaScript.

## Data and privacy
Tasks, subjects, notes, flashcards, exam date and focus sessions are stored in browser `localStorage` on the current device. Backup/restore uses a downloadable JSON file. There is no account system, cloud synchronization or remote database in this version. Clearing browser site data can erase local data, so export backups periodically.

## Future expansion
Secure accounts and cloud sync, protected AI tutoring, calendar integrations, reminders, spaced-repetition scheduling, collaborative study rooms and richer analytics.
