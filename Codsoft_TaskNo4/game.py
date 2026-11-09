
from flask import Flask, render_template, request, jsonify, session
import random

app = Flask(__name__)
app.secret_key = "change-this-to-a-random-secret-key"

CHOICES = ["rock", "paper", "scissors"]


@app.route("/")
def home():
    session.setdefault("user_score", 0)
    session.setdefault("computer_score", 0)
    session.setdefault("ties", 0)

    return render_template("index.html")


@app.route("/play", methods=["POST"])
def play():
    data = request.get_json(silent=True) or {}
    user_choice = data.get("choice", "").lower()

    if user_choice not in CHOICES:
        return jsonify({
            "success": False,
            "error": "Please choose rock, paper, or scissors."
        }), 400

    computer_choice = random.choice(CHOICES)

    if user_choice == computer_choice:
        result = "It's a tie!"
        session["ties"] += 1

    elif (
        (user_choice == "rock" and computer_choice == "scissors")
        or (user_choice == "paper" and computer_choice == "rock")
        or (user_choice == "scissors" and computer_choice == "paper")
    ):
        result = "You win!"
        session["user_score"] += 1

    else:
        result = "Computer wins!"
        session["computer_score"] += 1

    return jsonify({
        "success": True,
        "user_choice": user_choice,
        "computer_choice": computer_choice,
        "result": result,
        "scores": {
            "user": session["user_score"],
            "computer": session["computer_score"],
            "ties": session["ties"]
        }
    })


@app.route("/reset", methods=["POST"])
def reset():
    session["user_score"] = 0
    session["computer_score"] = 0
    session["ties"] = 0

    return jsonify({
        "success": True,
        "scores": {
            "user": 0,
            "computer": 0,
            "ties": 0
        }
    })


if __name__ == "__main__":
    app.run(debug=True)
