import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging to print to the console
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.before_request
def log_request_info():
    # Log incoming request details
    # We use .get_json(silent=True) to avoid crashing on empty bodies (like OPTIONS)
    data = request.get_json(silent=True)
    app.logger.info(
        f"Incoming {request.method} request to {request.path} | Data: {data}"
    )


@app.after_request
def log_response_info(response):
    # Log the status code of the response sent back to the user
    app.logger.info(f"Response Status: {response.status}")
    return response


@app.route("/calculate", methods=["POST", "OPTIONS"])
def calculate():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json(force=True)

    try:
        n1 = float(data.get("num1"))
        n2 = float(data.get("num2"))
        op = data.get("operator")

        match op:
            case "+":
                res = n1 + n2
            case "-":
                res = n1 - n2
            case "*":
                res = n1 * n2
            case "/":
                if n2 == 0:
                    return jsonify({"error": "Division by zero"}), 400
                res = n1 / n2
            case _:
                return jsonify({"error": "Invalid operator"}), 400

        return jsonify({"result": res}), 200
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numeric input"}), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
