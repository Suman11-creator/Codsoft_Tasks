
const choiceButtons = document.querySelectorAll(".choice");
const userScore = document.getElementById("user-score");
const computerScore = document.getElementById("computer-score");
const ties = document.getElementById("ties");
const statusText = document.getElementById("status");
const movesText = document.getElementById("moves");
const resultText = document.getElementById("result");
const errorText = document.getElementById("error");
const resetButton = document.getElementById("reset-button");

function updateScores(scores) {
    userScore.textContent = scores.user;
    computerScore.textContent = scores.computer;
    ties.textContent = scores.ties;
}

function setButtonsDisabled(disabled) {
    choiceButtons.forEach(button => {
        button.disabled = disabled;
    });

    resetButton.disabled = disabled;
}

async function play(choice) {
    errorText.textContent = "";
    statusText.textContent = "Computer is choosing...";
    setButtonsDisabled(true);

    try {
        const response = await fetch("/play", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ choice: choice })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Unable to play.");
        }

        movesText.textContent =
            `You: ${data.user_choice} | Computer: ${data.computer_choice}`;

        resultText.textContent = data.result;
        statusText.textContent = "Round complete!";
        updateScores(data.scores);

    } catch (error) {
        errorText.textContent = error.message;
        statusText.textContent = "Please try again.";
    } finally {
        setButtonsDisabled(false);
    }
}

choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
        play(button.dataset.choice);
    });
});

resetButton.addEventListener("click", async () => {
    errorText.textContent = "";
    setButtonsDisabled(true);

    try {
        const response = await fetch("/reset", {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error("Could not reset the game.");
        }

        updateScores(data.scores);
        statusText.textContent = "Score reset!";
        movesText.textContent = "You: — | Computer: —";
        resultText.textContent = "Let's play again!";

    } catch (error) {
        errorText.textContent = error.message;
    } finally {
        setButtonsDisabled(false);
    }
});
