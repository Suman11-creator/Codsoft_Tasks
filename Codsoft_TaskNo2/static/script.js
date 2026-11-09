"use strict";


/* =========================================
   ELEMENTS
========================================= */

const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const buttons =
    document.querySelector(".buttons");

const angleModeButton =
    document.getElementById("angleMode");

const clearButton =
    document.getElementById("clear");

const deleteButton =
    document.getElementById("delete");

const equalsButton =
    document.getElementById("equals");

const historyContainer =
    document.getElementById("history");

const clearHistoryButton =
    document.getElementById("clearHistory");


/* =========================================
   VARIABLES
========================================= */

let expression = "";

let angleMode = "DEG";

let history = [];


/* =========================================
   DISPLAY
========================================= */

function updateDisplay() {

    expressionDisplay.textContent =
        expression || "0";

}


/* =========================================
   INSERT
========================================= */

function insertValue(value) {

    expression += value;

    updateDisplay();
}


/* =========================================
   BUTTONS
========================================= */

buttons.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button");

        if (!button) {
            return;
        }

        const value =
            button.dataset.value;

        if (value !== undefined) {

            insertValue(value);
        }

    }
);


/* =========================================
   CLEAR
========================================= */

clearButton.addEventListener(
    "click",
    function () {

        expression = "";

        resultDisplay.textContent = "0";

        updateDisplay();
    }
);


/* =========================================
   DELETE
========================================= */

deleteButton.addEventListener(
    "click",
    function () {

        expression =
            expression.slice(0, -1);

        updateDisplay();
    }
);


/* =========================================
   DEG / RAD
========================================= */

angleModeButton.addEventListener(
    "click",
    function () {

        if (angleMode === "DEG") {

            angleMode = "RAD";

        } else {

            angleMode = "DEG";
        }

        angleModeButton.textContent =
            angleMode;
    }
);


/* =========================================
   CALCULATE
========================================= */

equalsButton.addEventListener(
    "click",
    async function () {

        if (!expression.trim()) {
            return;
        }

        try {

            resultDisplay.textContent =
                "Calculating...";


            const response =
                await fetch("/calculate", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        expression:
                            expression,

                        angleMode:
                            angleMode
                    })
                });


            const data =
                await response.json();


            if (!response.ok ||
                !data.success) {

                throw new Error(
                    data.error ||
                    "Calculation failed."
                );
            }


            const result =
                formatResult(data.result);


            resultDisplay.textContent =
                result;


            addHistory(
                expression,
                result
            );


        } catch (error) {

            console.error(error);

            resultDisplay.textContent =
                "Error";

            alert(error.message);
        }
    }
);


/* =========================================
   FORMAT RESULT
========================================= */

function formatResult(value) {

    if (!Number.isFinite(value)) {

        return "Error";
    }


    if (Number.isInteger(value)) {

        return value.toLocaleString(
            "en-US"
        );
    }


    return Number(value)
        .toPrecision(12)
        .replace(/\.?0+$/, "");
}


/* =========================================
   HISTORY
========================================= */

function addHistory(
    expressionValue,
    resultValue
) {

    history.unshift({

        expression:
            expressionValue,

        result:
            resultValue
    });


    if (history.length > 20) {

        history.pop();
    }


    renderHistory();
}


function renderHistory() {

    historyContainer.innerHTML = "";


    if (history.length === 0) {

        const empty =
            document.createElement("p");

        empty.className =
            "empty-history";

        empty.textContent =
            "No calculations yet";

        historyContainer.appendChild(empty);

        return;
    }


    history.forEach(
        function (item) {

            const historyItem =
                document.createElement("div");

            historyItem.className =
                "history-item";


            const expressionElement =
                document.createElement("div");

            expressionElement.className =
                "history-expression";

            expressionElement.textContent =
                item.expression;


            const resultElement =
                document.createElement("div");

            resultElement.className =
                "history-result";

            resultElement.textContent =
                "= " + item.result;


            historyItem.appendChild(
                expressionElement
            );

            historyItem.appendChild(
                resultElement
            );


            historyItem.addEventListener(
                "click",
                function () {

                    expression =
                        item.expression;

                    resultDisplay.textContent =
                        item.result;

                    updateDisplay();
                }
            );


            historyContainer.appendChild(
                historyItem
            );
        }
    );
}


/* =========================================
   CLEAR HISTORY
========================================= */

clearHistoryButton.addEventListener(
    "click",
    function () {

        history = [];

        renderHistory();
    }
);


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const key = event.key;


        if (/^[0-9.]$/.test(key)) {

            insertValue(key);

            return;
        }


        if (
            ["+", "-", "*", "/", "^",
             "(", ")", "%", "!"].includes(key)
        ) {

            let value = key;


            if (key === "*") {
                value = "×";
            }


            if (key === "/") {
                value = "÷";
            }


            insertValue(value);

            return;
        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            equalsButton.click();

            return;
        }


        if (key === "Backspace") {

            deleteButton.click();

            return;
        }


        if (key === "Escape") {

            clearButton.click();
        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

updateDisplay();

renderHistory();