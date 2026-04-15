# iReporter – Fight Corruption with Citizen Reports

IReporter is a full‑stack web application that empowers Kenyan citizens to report corruption incidents or request government intervention (e.g., bad roads, collapsed bridges). Users can attach images/videos, add geolocation, and track the status of their reports. Administrators can update report statuses, triggering email and SMS notifications.

---
**Live Demo** 

- Frontend: [IReporter](https://ireporter-xi.vercel.app)

---

## Features

- **User authentication** – Sign up, login, JWT‑protected routes  
- **Report management** – Create, edit, delete red‑flag (corruption) and intervention reports  
- **Geolocation** – Pin incident locations on a Leaflet map (Kenya only)  
- **Media upload** – Attach images and videos to reports (Cloudinary)  
- **Admin dashboard** – Change report status (`pending` → `under investigation` → `resolved`/`rejected`)  
- **Email notifications** – Instant email to the reporter when status changes (Brevo)  
- **SMS notifications** – Optional SMS via Africa’s Talking (configurable)  
- **Password reset** – 3‑step code‑based flow via email  
- **User profile** – Update username, email, phone number, and profile picture  
- **Live map** – Browse all incidents on an interactive map, search by place or title  
- **Responsive UI** – Dark/light mode, mobile‑friendly design  
- **Pagination & filtering** – On both frontend and backend  
- **CI/CD** – GitHub Actions runs tests automatically on every push  

---

## 🚀 Getting Started


Follow these steps to set up the project locally.

### Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- PostgreSQL (local installation or Docker)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/IReporter.git
cd IReporter
```

---

## File Structure

```bash
├── client                  # React frontend (Vite + Tailwind)
│   ├── public
│   ├── src
│   │   ├── app
│   │   │   ├── components  # Shared components (Map, Layout)
│   │   │   ├── context     # RecordsContext (shared state)
│   │   │   ├── pages       # Login, SignUp, Home, Activity, Admin, Settings
│   │   │   └── utils       # API utility functions
│   │   ├── data            # Local JSON fallback data
│   │   ├── test            # Frontend tests (Vitest)
│   │   └── main.jsx
│   ├── .env                # Frontend environment variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server                  # Flask backend
│   ├── app.py
│   ├── config.py
│   ├── models
│   ├── routes
│   └── services
├── .env                    # Backend environment variables
├── requirements.txt
└── README.md
```

---

## Backend Setup

```bash
python -m venv .venv
source .venv/bin/activate       # Linux/macOS
# or
.venv\Scripts\activate          # Windows

pip install -r requirements.txt
```

### PostgreSQL Setup

**1. Install PostgreSQL** — [Ubuntu guide](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

**2. Start the service:**
```bash
sudo systemctl start postgresql   # Linux
brew services start postgresql    # macOS
```

**3. Create the database:**
```bash
sudo -u postgres psql -c "CREATE DATABASE ireporter_db;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

**4. Create `./.env`:**
```env
FLASK_APP=server.app
FLASK_RUN_PORT=5000
FLASK_DEBUG=True
FLASK_SQLALCHEMY_DATABASE_URI=postgresql://postgres:postgres@localhost:5432/ireporter_db
FLASK_SQLALCHEMY_TRACK_MODIFICATIONS=False
FLASK_SECRET_KEY=your-secret-key
FLASK_SESSION_PERMANENT=False
```

**5. Run migrations:**
```bash
flask db upgrade
```

---

## Frontend Setup

```bash
cd client
npm install
```

**Create `client/.env`:**
```env
VITE_API=http://localhost:5000/api/v1
```

### Frontend Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API` | Base URL for the Flask API | `http://localhost:5000/api/v1` |

---

## Running the App

**Backend:**
```bash
flask run
```

**Frontend:**
```bash
cd client
npm run dev
```

App runs at: `http://localhost:5173`

---

## Frontend Architecture

| Feature | Implementation |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| State | Context API (RecordsContext) |
| Maps | React Leaflet |
| Auth | JWT stored in localStorage |
| Dark Mode | Tailwind dark class + localStorage |

### Key Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/signup` | Sign Up (2-step) | Public |
| `/forgot-password` | Password Reset | Public |
| `/home` | Live Map | Protected |
| `/home/report` | File Report | Protected |
| `/home/activity` | Activity Feed | Protected |
| `/home/incident/:id` | Incident Detail | Protected |
| `/home/settings` | Settings | Protected |
| `/home/admin` | Admin Dashboard | Admin only |

### Running Frontend Tests

```bash
cd client
npm run test
```

Frontend Tests cover:
- Login form validation
- SignUp form validation  
- Settings page rendering
- Protected route auth logic

---

## Deployment

- **Backend** – Deployed on ![Render](https://render.com/). Environment variables must be set (database URL, secret keys, Brevo API key, etc.).

- **Frontend** – Deployed on ![Vercel](https://vercel.com/). The ``VITE_API_URL`` environment variable points to the production backend.

## API Documentation

Full API reference is available in the backend README (server/README.md).
All endpoints are prefixed with /api/v1 and require a Bearer token (except signup/login).

Example endpoints:

- ``POST /api/v1/auth/signup`` – Register

- ``POST /api/v1/auth/login`` – Login

- GET /api/v1/records – List reports (paginated)

- ``POST /api/v1/records/create`` – Create a report

- ``PATCH /api/v1/admin/records/<id>/status`` – Admin status update

## Team

- Jeff Muna – Backend & DevOps

- Ashlin – Backend & Database

- Kimberly – Frontend team

## License

**MIT** – feel free to use and modify.

*For questions or issues, please open a GitHub issue.*

## ERD

![ERD Diagram](./ireporter_dbdiagram.io.png)