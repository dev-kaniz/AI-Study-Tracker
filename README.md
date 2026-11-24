# StudyFlow — AI Study Tracker

A responsive, browser-based study workspace built with HTML, CSS and vanilla JavaScript. No build step or package installation is required.

## Features
- Responsive dashboard and weekly focus-time chart
- Study planner with tasks, subjects, deadlines and estimated durations
- Subject progress tracking
- Focus room with 25-minute focus, 5-minute short break and 15-minute long break modes
- Flashcards with question/answer reveal and custom card creation
- Notes workspace
- Productivity insights
- Local study coach that organizes existing tasks around a goal and available time

## Run locally
Open `index.html` in a modern browser, or run a local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Enable GitHub Pages
1. Open repository **Settings → Pages**.
2. Select **Deploy from a branch**.
3. Choose **main** and **/(root)**, then Save.
4. Wait for the deployment and use the published URL shown on that page.

## AI integration status
The included study coach is a local, rule-based planner—not a connected generative AI model. To add a real AI tutor, connect the frontend to a secure backend endpoint. Keep provider API keys on the server; never place secret keys in this public repository or browser JavaScript.

## Data and privacy
Tasks, subjects, notes, flashcards and focus sessions are saved in browser `localStorage` on the current device. There is no account system, cloud synchronization or remote database in this starter version. Clearing browser site data can erase saved information.

## Suggested next steps
- Secure user accounts and cloud sync
- Protected AI tutor backend
- Calendar integration and reminders
- Data export and backup
- Spaced-repetition scheduling and richer analytics
