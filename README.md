# Doubly Linked List Interactive Learning System
Subject: Data Structures and Algorithms using C.
Purpose: an interactive platform for understanding, visualizing, implementing and practicing Doubly Linked Lists.

## Features
Learn pages, C code with Copy button, interactive visualizer with step-by-step animation, 15-question quiz, 10-question mini exam, coding challenges, viva Q&A, progress tracker (localStorage), search, dark/light mode.

## Folder structure
```
DoublyLinkedList/
  app.py            Flask routes + JSON APIs
  requirements.txt
  templates/        base, index, learn, visualizer, quiz, practice
  static/css/style.css
  static/js/        main.js (theme, progress, search, code), visualizer.js, quiz.js
  data/questions.json
```

## Run in VS Code (Windows)
```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000 in your browser. (If PowerShell blocks activation: `Set-ExecutionPolicy -Scope Process Bypass`.)

## How the visualizer works
Each button builds a list of "steps" (message + list state + highlighted nodes). The player shows one step at a time: Previous, Next, Play, Reset.

## How the quiz works
`quiz.js` loads `/api/questions`, shuffles, shows feedback after each answer, then score and percentage.

## Note
C code is shown for learning; it is NOT compiled in the browser. Copy it to a C compiler (gcc) to run.

## Future enhancements
More quiz questions, a real online C compiler API, user accounts, tail-pointer visualizer mode.
