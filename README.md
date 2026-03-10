# Nucleus Security Engineering Internship - Technical Assessment

This repository contains the completed technical assessment for the Nucleus Security Engineering Internship. It includes a security-focused code review and a full-stack calculator application.

## Project Structure
- **/backend**: Python Flask API handling arithmetic logic.
- **/frontend**: React + TypeScript frontend built with Vite.
- **Engineering_Intern_Interivew_Questions.md**: Answers for the provided webhook implementation, Coding Challenge questions, and AI usage.

## Setup Instructions

### Backend (Flask)
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `python app.py` (Server starts on `http://localhost:8080`)

### Frontend (React + TypeScript)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev` (Typically starts on `http://localhost:5173`)

## Features & Implementation Details
- **Type Safety**: Utilized TypeScript interfaces for API requests/responses.
- **Security Awareness**: Implemented input validation on the backend to prevent malicious payloads.
- **UX Handling**: Visible error messaging for division by zero, invalid inputs, and network failures.
- **Modern UI**: CSS Grid-based calculator layout centered for cross-browser consistency.

## AI Reflection
A detailed log of AI prompts, specific goals for each interaction, and how the AI was used to identify niche security vulnerabilities (like timing attacks) can be found in `Engineering_Intern_Interivew_Questions.md`.
