from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)


# -----------------------------
# Home Page
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# Calculator API
# -----------------------------
@app.route("/calculate", methods=["POST"])
def calculate():

    try:
        data = request.get_json()

        expression = data.get("expression", "").strip()
        angle_mode = data.get("angleMode", "DEG")

        if not expression:
            return jsonify({
                "success": False,
                "error": "Please enter an expression."
            }), 400

        result = calculate_expression(expression, angle_mode)

        return jsonify({
            "success": True,
            "result": result
        })

    except ZeroDivisionError:
        return jsonify({
            "success": False,
            "error": "Cannot divide by zero."
        }), 400

    except ValueError as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "error": "Invalid expression."
        }), 400


# -----------------------------
# Scientific Calculator
# -----------------------------
def calculate_expression(expression, angle_mode):

    expression = expression.replace("×", "*")
    expression = expression.replace("÷", "/")
    expression = expression.replace("^", "**")

    expression = expression.replace("π", "pi")

    # Replace √ with sqrt
    expression = expression.replace("√", "sqrt")

    # Allowed mathematical functions
    allowed_functions = {
        "sin": lambda x: math.sin(
            math.radians(x) if angle_mode == "DEG" else x
        ),

        "cos": lambda x: math.cos(
            math.radians(x) if angle_mode == "DEG" else x
        ),

        "tan": lambda x: math.tan(
            math.radians(x) if angle_mode == "DEG" else x
        ),

        "asin": lambda x: (
            math.degrees(math.asin(x))
            if angle_mode == "DEG"
            else math.asin(x)
        ),

        "acos": lambda x: (
            math.degrees(math.acos(x))
            if angle_mode == "DEG"
            else math.acos(x)
        ),

        "atan": lambda x: (
            math.degrees(math.atan(x))
            if angle_mode == "DEG"
            else math.atan(x)
        ),

        "sqrt": math.sqrt,
        "log": math.log10,
        "ln": math.log,
        "abs": abs,
        "exp": math.exp
    }

    allowed_names = {
        "pi": math.pi,
        "e": math.e
    }

    # Add factorial support
    if "!" in expression:

        expression = expression.replace("!", "_factorial")

        allowed_functions["_factorial"] = math.factorial

    # Safe mathematical evaluation
    import ast

    tree = ast.parse(expression, mode="eval")

    def evaluate(node):

        # Numbers
        if isinstance(node, ast.Constant):

            if isinstance(node.value, (int, float)):

                return node.value

            raise ValueError("Invalid number.")

        # Constants
        if isinstance(node, ast.Name):

            if node.id in allowed_names:
                return allowed_names[node.id]

            raise ValueError(
                f"Unknown value: {node.id}"
            )

        # Binary operations
        if isinstance(node, ast.BinOp):

            left = evaluate(node.left)
            right = evaluate(node.right)

            if isinstance(node.op, ast.Add):
                return left + right

            if isinstance(node.op, ast.Sub):
                return left - right

            if isinstance(node.op, ast.Mult):
                return left * right

            if isinstance(node.op, ast.Div):

                if right == 0:
                    raise ZeroDivisionError()

                return left / right

            if isinstance(node.op, ast.Pow):
                return left ** right

            raise ValueError("Invalid operator.")

        # Negative / positive
        if isinstance(node, ast.UnaryOp):

            value = evaluate(node.operand)

            if isinstance(node.op, ast.USub):
                return -value

            if isinstance(node.op, ast.UAdd):
                return value

            raise ValueError("Invalid operation.")

        # Functions
        if isinstance(node, ast.Call):

            if not isinstance(node.func, ast.Name):
                raise ValueError("Invalid function.")

            function_name = node.func.id

            if function_name not in allowed_functions:
                raise ValueError(
                    f"Function '{function_name}' is not allowed."
                )

            if len(node.args) != 1:
                raise ValueError(
                    "Function requires one value."
                )

            argument = evaluate(node.args[0])

            return allowed_functions[function_name](argument)

        raise ValueError("Invalid expression.")

    result = evaluate(tree.body)

    if not math.isfinite(result):

        raise ValueError(
            "Result is not a finite number."
        )

    return result


# -----------------------------
# Run Flask
# -----------------------------
if __name__ == "__main__":
    print("Starting Flask application...")
    print("App object:", app)
    app.run(debug=True)