# Citizen-Led AI Audit Platform

This project is a web-based platform empowering citizens to report and audit opaque AI decisions in government services. It consists of a FastAPI backend and a Next.js frontend.

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm

## Getting Started

### 1. Backend Setup

The backend is built with FastAPI and SQLite.

1.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2.  (Optional) Create and activate a virtual environment:

    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4.  Start the server:
    ```bash
    python -m uvicorn src.api:app --reload
    ```
    The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).
    Interactive API docs can be accessed at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Frontend Setup

The frontend is built with Next.js, Tailwind CSS, and Shadcn UI.

1.  Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be running at [http://localhost:3000](http://localhost:3000).

## Default Accounts

Use the following credentials to log in:

| Role      | Username     | Password        |
| :-------- | :----------- | :-------------- |
| **Admin** | `admin`      | `adminpassword` |
| **User**  | `mobile number` | `first name char 4 + YYYY (8 character length)` |

## Project Structure

- `backend/`: FastAPI application, database logic, and API routers.
- `frontend/`: Next.js application, React components, and pages.
- `backend/src/add_users.py`: Script to seed initial user accounts.

## Troubleshooting

- **Dependency Errors**: If you encounter errors with `passlib`, ensure you are using `bcrypt==3.2.0` as specified in `requirements.txt`.
- **Database**: The SQLite database (`reports.db`) is automatically created in `backend/data/` if it doesn't exist.
