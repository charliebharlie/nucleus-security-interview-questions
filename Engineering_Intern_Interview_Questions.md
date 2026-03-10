# Engineering Intern Interview Questions

## Introduction

Thank you for your interest in the Nucleus Security Engineering
internship program! This document contains 2 primary interview
challenges for you. The first is a code review question, and the second
is a coding challenge.

For both, we absolutely encourage the use of AI. If you do use AI, we
would like for you to share your prompts and then answer the follow-up
questions about how you thought through your prompts.

We know this time of the year is crazy for college students and that
your time is very valuable. Please try not to spend more than about 1
total hour collectively on this.

------------------------------------------------------------------------

## Contents

-   Introduction
-   Code Review (10 minutes)
    -   Task
    -   PHP
    -   Python
    -   Code comments
    -   Follow-up Questions
-   Coding Challenge (\~50 minutes)
    -   Exercise
    -   Follow-up questions
-   Delivery

------------------------------------------------------------------------

# Code Review (10 minutes)

You are welcome and encouraged to use AI for this section. If you do,
please provide your prompts and answer the questions in the follow-up
section.

## Task

Your colleague or team member was given the following task:

1.  Add a `/webhook` endpoint to receive vendor events about users who
    are vendors.

2.  Input data will look like:

    ``` json
    {"email":"a@b.com","role":"admin","metadata":{"source":"vendor"}}
    ```

3.  Verify signature header `X-Signature`.

4.  Parse JSON and upsert the user data.

5.  Store the raw payload for audit/debug.

They have opened a PR with the code below. Review the code and comment
on any issues you find.

**Note:** Both the PHP and Python do the same thing. You can choose to
review whichever one you want. It is not intended for you to review
both.

------------------------------------------------------------------------

## PHP

``` php
<?php
// webhook.php
require_once "db.php"; // provides $pdo (PDO instance)

// Config (dev defaults)
$WEBHOOK_SECRET = getenv("WEBHOOK_SECRET") ?: "dev-secret";
$DB_AUDIT_ENABLED = getenv("AUDIT_ENABLED") ?: "true";

function verify_signature($sig, $body, $secret) {
    // Vendor docs: SHA256(secret + body)
    $expected = hash("sha256", $secret . $body);
    return $expected == $sig; // simple compare
}

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// Basic routing
if ($method !== "POST" || $path !== "/webhook") {
    http_response_code(404);
    echo "not found";
    exit;
}

$raw = file_get_contents("php://input"); // raw body string
$sig = $_SERVER["HTTP_X_SIGNATURE"] ?? "";

if (!verify_signature($sig, $raw, $WEBHOOK_SECRET)) {
    http_response_code(401);
    echo "bad sig";
    exit;
}

// Decode JSON
$payload = json_decode($raw, true);
$email = $payload["email"] ?? "";
$role = $payload["role"] ?? "user";

// Store raw payload for auditing / debugging
if ($DB_AUDIT_ENABLED) {
    $pdo->exec("INSERT INTO webhook_audit(email, raw_json) VALUES ('$email', '$raw')");
}

// Upsert user (simple)
$pdo->exec("INSERT INTO users(email, role) VALUES('$email', '$role')");

echo "ok";
```

------------------------------------------------------------------------

## Python

``` python
# app.py
import os
import json
import sqlite3
import hashlib
from flask import Flask, request

app = Flask(__name__)
DB_PATH = os.getenv("DB_PATH", "/tmp/app.db")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "dev-secret")  # default for dev

def get_db():
    return sqlite3.connect(DB_PATH)

def verify(sig, body: bytes) -> bool:
    # Vendor docs: SHA256(secret + body)
    expected = hashlib.sha256(
        (WEBHOOK_SECRET + body.decode("utf-8")).encode("utf-8")
    ).hexdigest()
    return expected == sig  # simple compare

@app.post("/webhook")
def webhook():
    raw = request.data  # bytes
    sig = request.headers.get("X-Signature", "")

    if not verify(sig, raw):
        return ("bad sig", 401)

    payload = json.loads(raw.decode("utf-8"))

    # Example payload:
    # {"email":"a@b.com","role":"admin","metadata":{"source":"vendor"}}
    email = payload.get("email", "")
    role = payload.get("role", "user")

    db = get_db()
    cur = db.cursor()

    # Store raw payload for auditing / debugging
    cur.execute(
        f"INSERT INTO webhook_audit(email, raw_json) VALUES ('{email}', '{raw.decode('utf-8')}')"
    )

    # Upsert user
    cur.execute(
        f"INSERT INTO users(email, role) VALUES('{email}', '{role}')"
    )

    db.commit()

    return ("ok", 200)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
```

------------------------------------------------------------------------

## Code comments

Put your code comments here. For comments on specific lines, please
include the line number. Feel free to comment on the general task as
well.

- Line 10: Using the hardcoded value 'dev-secret' as the default when the env variable 'WEBHOOK_SECRET' isn't set is dangerous. The app would be vulnerable as an attacker can just sign their malicious JSON using 'dev-secret'
- Line 22: Using the simple compare '==' is dangerous because an attacker can brute force the expected hash by checking the time it takes to returns. The more characters they get correct, the longer it takes to return, and they can take advantage of that.
- Lines 45 and 49: Using f-strings for the SQL query leads to the classic SQL Injection vulnerability where an attacker can just run malicious SQL commands (such as DROP TABLE users)
- Line 49: The query doesn't run an upsert, but rather an insert which can cause duplicates. Use 'INSERT ... ON CONFLICT' for upsert


------------------------------------------------------------------------

## Follow-up Questions

1.  Share your prompts and the AI outputs.
Prompts: 
```
I'm reviewing this webhook imple and noticed some code smells. Its using the classic SQL injection with f strings and the env var fallback to a hardcoded value. Are there other security flaws that I should flag in my PR review?

How does the timing attack work for ==
```
2.  For each prompt:
    -   Tell us what you were hoping for the AI to accomplish.
        - I wanted to check beyond the basic bugs as I didn't want to waste the time spending on it. I rather would want it to find the niche bugs that I couldn't see at a first glance
    -   Tell us what it actually did.
        - It identified the timing attacks that came with the simple comparison: "==" and the upsert logic error. 
    -   Did you have to re-prompt it based on its output?
        - I re-prompt it to clarify the mechanics of the timing attack. I wasn't sure how an attacker could brute force the expected hash as I thought there was no way to reveal it.
    -   If you had to change your approach, why?
        - I changed my approach from asking "Is this code generally bad" to "How can attackers take advantage of the weak points of this code" because it helped identify specific lines of the code. 

------------------------------------------------------------------------

# Coding Challenge (\~50 minutes)

For the below coding exercise, there is no expectation that you will
have a fully working solution. For anything you feel you didn't
accomplish, please let us know in the follow-up section after the
exercise.

## Exercise

Build a calculator web application. It should include a frontend piece
and any backend logic needed to perform the calculations.

You can use any language of your choosing for both the frontend and
backend code.

------------------------------------------------------------------------

## Follow-up questions

1.  How far were you able to get with the exercise?
    - I completed a full stack application with React as the frontend and Flask as the backend. The calculator can handle basic arithmetic operations through a RESTful API (/calculate). I also added a logging middleware to help debug errors (such as divide by 0) and audit any security issues. Finally, I added a visible error on the frontend if it couldn't reach the backend or is under network failures.

2.  What challenges did you encounter in the process?
    - Managing the CORS handshake between the Vite dev server and the Flask API was a bit challenging as empty JSON requests (ex. OPTIONS) would crash the backend as .get_json would fail. 

3.  If you were given unlimited time, what additional functionality
    would you include?
    - I would store recent calculations in a database (ex. Redis) so users can see their previous calculations 
    - I would add more advanced math equations (square root, parenthesis)
    - Add unit tests with PyTest to verify the math logic and error handling

4.  If you used AI, please include all of your prompts and answer the
    following questions:
    - Prompts:
      ``` 
      Build a Flask backend and a React TS frontend for a calc app, validate the input and 

      Getting "OPTIONS /calculate HTTP/1.1" 415 -, OPTIONS request is an empty JSON, fix the calculate function in app.py

      The CSS is causing a white screen, separate the CSS into its own file and fix the centering
      ```
    -   What did the AI do well?
        - The AI did well at explaining the security issues from timing attacks that came from a simple comparison: '=='
        - It created the boilerplate for the frontend and backend extremely fast
    -   What did the AI do poorly?
        - The AI failed to account for the OPTIONS request which resulted in a 415 error. I showed the error and explained the issue to it.
        - It tried to shove all the CSS into App.tsx, which resulted in unreadable code and caused issue with Vite. I had to instruct it to separate it to App.css
    -   For the places it did poorly, how did you change your approach
        to your prompts to improve its output?
        - I provided the error log to it and pointed out where the issue was. It provided detailed reasoning to include 'force=True' in .get_json and check if the method was an OPTIONS request
        - I started to ask it to separate the code into chunks instead of one file. 

------------------------------------------------------------------------

# Delivery

Please reply to the email you received with:

1.  Answers to any follow-up above.
2.  Any questions or thoughts you had on the exercise.
3.  A link to a public GitHub repository including your answer to the
    coding challenge.
    -   If we can't get to the repository, we won't be able to consider
        your answer to the coding challenge.
