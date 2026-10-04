"""Flask backend for the Doubly Linked List learning system.
Serves the pages and two small JSON APIs (questions, progress)."""
import json, os
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)
BASE = os.path.dirname(os.path.abspath(__file__))
QUESTIONS = os.path.join(BASE, "data", "questions.json")
PROGRESS = os.path.join(BASE, "data", "progress.json")

@app.route("/")
def index(): return render_template("index.html")

@app.route("/learn")
def learn(): return render_template("learn.html")

@app.route("/visualizer")
def visualizer(): return render_template("visualizer.html")

@app.route("/quiz")
def quiz(): return render_template("quiz.html")

@app.route("/practice")
def practice(): return render_template("practice.html")

@app.route("/api/questions")
def api_questions():
    with open(QUESTIONS, encoding="utf-8") as f:
        return jsonify(json.load(f))

@app.route("/api/progress", methods=["GET", "POST"])
def api_progress():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        done = [s for s in data.get("done", []) if isinstance(s, str)]
        with open(PROGRESS, "w", encoding="utf-8") as f:
            json.dump({"done": done}, f)
        return jsonify(ok=True)
    try:
        with open(PROGRESS, encoding="utf-8") as f:
            return jsonify(json.load(f))
    except (OSError, ValueError):
        return jsonify(done=[])

if __name__ == "__main__":
    app.run(debug=True)
