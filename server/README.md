# IReporter Backend – API Documentation & Setup

##  Table of Contents

- [IReporter Backend – API Documentation \& Setup](#ireporter-backend--api-documentation--setup)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Migrations](#database-migrations)
  - [Running Server](#running-server)
      - [Development](#development)
      - [Production](#production)
  - [API Documentation](#api-documentation)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Profile Picture](#profile-picture)
    - [Users (Admin only)](#users-admin-only)
    - [Records](#records)
  - [Admin Actions](#admin-actions)
    - [Images\&Videos](#imagesvideos)
    - [Password Reset](#password-reset)
  - [Testing](#testing)
  - [Deployment](#deployment)
    - [Backend (Render)](#backend-render)
    - [Frontend (Vercel / Netlify)](#frontend-vercel--netlify)
  - [CI/CD Pipeline](#cicd-pipeline)
  - [Postman Collection](#postman-collection)
  - [Troubleshooting](#troubleshooting)
  - [Contributors](#contributors)

---


## Tech Stack

| Category       | Technology                          |
|----------------|-------------------------------------|
| Language       | Python 3.9                          |
| Framework      | Flask 3.1                           |
| Database       | PostgreSQL (production), SQLite (test) |
| ORM            | SQLAlchemy 2.0, Flask-SQLAlchemy    |
| Migrations     | Flask-Migrate (Alembic)             |
| Authentication | JWT (PyJWT)                         |
| Password Hashing| Flask-Bcrypt                        |
| Email Service  | Brevo (Sendinblue)                  |
| File Uploads   | Cloudinary                          |
| Testing        | Pytest, Faker                       |
| CI/CD          | GitHub Actions                      |
| Deployment     | Render                              |

## Features

- User signup & login (JWT authentication)
- Create, read, update, delete red‑flag or intervention records
- Only the record owner can edit/delete when status is *pending*
- Admin can change record status to *under investigation*, *rejected*, or *resolved*
- Email notification to record owner when status changes (via Brevo)
- Geolocation (latitude / longitude) can be added/updated while record is pending
- Image & video upload (Cloudinary integration)
- Profile management (update username, email, phone number, profile picture)
- Password reset via email‑sent 6‑digit code (three‑step flow)
- Pagination for listing endpoints (`/records`, `/users`)
- CORS enabled for frontend domains

## Prerequisites

- Python 3.9+
- PostgreSQL (local or remote)
- pip and virtualenv (recommended)

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable                    | Description                                   | Example                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `SECRET_KEY`                | Flask secret key (used for JWT)              | `your-very-long-secret-key-32chars+`                       |
| `FLASK_APP`                 | Entry point for Flask                        | `server.app`                                               |
| `FLASK_ENV`                 | Environment (development/production)         | `development`                                              |
| `DATABASE_URL`              | PostgreSQL connection string                 | `postgresql://user:pass@localhost:5432/ireporter_db`       |
| `FRONTEND_URL`              | URL of the frontend (for password reset links) | `http://localhost:5173`                                   |
| `BREVO_API_KEY`             | Brevo API key for email                      | `xkeysib-...`                                              |
| `MAIL_DEFAULT_SENDER`       | Verified sender email address                | `noreply@ireporter.com`                                    |
| `CLOUDINARY_CLOUD_NAME`     | Cloudinary cloud name                        | `your_cloud_name`                                          |
| `CLOUDINARY_API_KEY`        | Cloudinary API key                           | `123456789`                                                |
| `CLOUDINARY_API_SECRET`     | Cloudinary API secret                        | `abcdefg`                                                  |

> For production, set these as environment variables on Render / your hosting platform.

## Database Migrations

Migrations are already initialized. Run the following command to apply them:

```bash
flask db upgrade head
```

## Running Server

#### Development

```bash 
flask run
```

#### Production

```bash
gunicorn 'server.app:create_app()'
```

---

## API Documentation

Interactive Swagger documentation is available at:

- **Local**: `http://localhost:5020/api/docs/`
- **Production**: `https://your-backend.onrender.com/api/docs/`

## API Endpoints

- All endpoints are prefixed with /api/v1.
- All protected endpoints require a Bearer token in the Authorization header:

```text
Authorization: Bearer <your_jwt_token>
```

---

### Authentication

| Method                    | Endpoint                                   | Description                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `POST`                | ``/auth/signup``              | Register a new user. Body: ``username``, ``email``, ``password``                       |
| `POST`                 | `/auth/login`                        | Log in. Body: `email`, `password`. Returns `token` and `user`                                               |
| `POST`                 | `/auth/logout`         | Client-side only – discards token. Returns `200`                                              |
| `GET`              | `/auth/me`                 | Get current user info (requires token)       |
| `PATCH`              | `/auth/me` | Update current user’s profile (`username`, `email`, `phone_number`)                                   |

---

### Profile Picture

| Method                    | Endpoint                                   | Description                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `POST`                | ``/users/me/profile-pic``              | Upload a profile picture (multipart/form-data, field `profile_pic`)                       |

---

### Users (Admin only)

 Method                    | Endpoint                                   | Description                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `GET`                | `/users`              | List all users (paginated)                       |
| `GET`                 | `/users/<id>`                        | Get a single user                                               |
| `PATCH`                 | `/users/<id>`         | Update a user                                              |
| `GET`              | `/auth/me`                 | Get current user info (requires token)       |
| `DELETE`              | `/users/<id>` | Delete a user                                   |

---

### Records

 Method                    | Endpoint                                   | Description                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `GET`                | `/records`              | List all records (paginated). Returns `data` and `total`                       |
| `GET`                 | `/records/<id>`                        | Get a single record by ID                                               |
| `PATCH`                 | `/records/me/<id>`         | Update your own record (only if status == `pending`). Cannot update `status`                                             |
| `POST`              | `/records/create`                 | Create a new record. Body: `title`, `description`, `type` (`red flag` or `intervention`), optional `latitude`, `longitude`. `user_id` taken from token       |
| `DELETE`              | `/records/me/<id>` | Delete your own record (only if status == `pending`)                                   |

**NOTE:** The generic ``/records`` **POST** is intentionally replaced by ``/records/create`` to automatically attach user_id from the token

---

## Admin Actions

1. **PACTH**

 Method                    | Endpoint                                   | Description                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `PATCH`                | `/admin/records/<id>/status`              | Change record status. Sends email to record owner                      |

---

### Images&Videos

Method                    | Endpoint                                   | Description                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `GET`                | `/images`              | List all images (admin only)                       |
| `GET`                 | `/videos`                        | List all videos (admin only)                                               |
| `PATCH`                 | `/records/me/<id>`         | Update your own record (only if status == `pending`). Cannot update `status`                                             |
| `POST`              | `/images/upload`                 | CUpload an image (multipart/form-data, fields: `record_id`, `image`)       |
| `POST`              | `/videos/upload` | Upload a video (multipart/form-data: `record_id`, `video`)                                   |
| `DELETE`              | `/images/<id>` | Delete an image                                   |
| `DELETE`              | `/videos/<id>` | Delete an video                                   |

---

### Password Reset

Method                    | Endpoint                                   | Description                                                    |
|-----------------------------|-----------------------------------------------|------------------------------------------------------------|
| `POST`                | `/auth/forgot-password`              | Request a reset code. Body: `{"email": "user@example.com"}`. Sends 6‑digit code to email                       |
| `POST`                 | `/auth/verify-reset-code`                        | Verify the code. Body: `{"email": "...", "code": "123456"}`. Returns a short‑lived `reset_token`                                               |
| `POST`                 | `/auth/reset-password`         | Set new password. Body: `{"email": "...", "reset_token": "...", "password": "newpass"}`                                              |

---

## Testing

- Run all tests with:

```bash
pytest -v
```

- Run a specific test file:

```bash
pytest server/test/test_user_specific_routes.py -v
```

- Run with coverage:

```bash
pytest --cov=server
```

---

## Deployment

### Backend (Render)

1. Push your code to GitHub
2. On Render, create a New Web Service → connect your repo
3. Set:
   - Build Command: ``pip install -r requirements.txt``
   - Start Command: ``gunicorn 'server.app:create_app()'``
4. Add all environment variables (see above).
5. Render will automatically deploy on each push to ``main`` (if automatic deploys are enabled)

---

### Frontend (Vercel / Netlify)

- Set the environment variable ``VITE_API=https://your-backend.onrender.com/api/v1``
- Build and deploy

---

## CI/CD Pipeline

- GitHub Actions runs the test suite on every push and pull request (see ``.github/workflows/backend_ci.yml``)
- A deployment job (commented out) can be enabled to trigger a redeploy on Render via a deploy hook.

---

## Postman Collection

You can import the following file ``postman.json`` collection to test the API

---

## Troubleshooting

 Problem                    | Solution                                   | 
|-----------------------------|-----------------------------------------------|
| **CORS error**                | Make sure `CORS(app, origins=[...])` includes your frontend URL.              |
| **500 on login**                 | Check that `SECRET_KEY` is set and `bcrypt` is installed.                       |
| **Email not sent**                 | Verify `BREVO_API_KEY` and `MAIL_DEFAULT_SENDER` are correct and the sender is verified in Brevo.         | 
| `user_id` null in records             |Use `/records/create` instead of the generic `/records` `POST`                | 

---

## Contributors

- Backend team: Jeff & Ashlin


>For any issues, please open an issue on GitHub.