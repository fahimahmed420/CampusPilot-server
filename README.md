# CampusPilot Backend API

**CampusPilot** is a full-stack web application that helps students manage their academic life, finances, tasks, and study scores.  
This repository contains the **backend API**, built with **Node.js**, **Express**, and **MongoDB**, with authentication via **Firebase**.

---

## 📦 Features

- **User Management**
  - Create users (if they don’t already exist)
  - Retrieve users by UID or MongoDB `_id`
  - Get all users  

- **Transactions**
  - Add new income/expense transactions
  - Get all transactions for a specific user  

- **Classes**
  - Add new classes
  - Fetch classes by user UID  

- **Scores**
  - Save scores for subjects
  - Get all scores and average for a user  

- **Tasks**
  - CRUD operations for tasks  

- **Authentication**
  - Firebase token verification for secure access to all routes  

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** Firebase  
- **Environment Management:** dotenv  
- **CORS:** cors  

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/campuspilot-backend.git
   cd campuspilot-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** at the root with the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

   The server will run at **http://localhost:5000**.

---

## 🛣️ API Endpoints

### Users
| Method | Endpoint              | Description                 |
|--------|-----------------------|-----------------------------|
| POST   | `/api/users`          | Create a user               |
| GET    | `/api/users`          | Get all users               |
| GET    | `/api/users/id/:id`   | Get user by MongoDB `_id`   |
| GET    | `/api/users/uid/:uid` | Get user by Firebase UID    |

### Transactions
| Method | Endpoint                  | Description                      |
|--------|---------------------------|----------------------------------|
| POST   | `/api/transactions`       | Add a new transaction            |
| GET    | `/api/transactions/:uid`  | Get all transactions for a user  |

### Classes
| Method | Endpoint           | Description               |
|--------|--------------------|---------------------------|
| POST   | `/api/classes`     | Add a new class           |
| GET    | `/api/classes`     | Get classes by user UID   |

### Scores
| Method | Endpoint             | Description                 |
|--------|----------------------|-----------------------------|
| POST   | `/api/scores`        | Save a score                |
| GET    | `/api/scores/:uid`   | Get all scores for a user   |

### Tasks
| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | `/api/tasks`          | Get all tasks              |
| POST   | `/api/tasks`          | Add a new task             |
| PUT    | `/api/tasks/:id`      | Update a task by ID        |
| DELETE | `/api/tasks/:id`      | Delete a task by ID        |

---

## 🔒 Authentication

All routes are protected by **Firebase token verification** using `verifyFirebaseToken` middleware.  
Requests must include a valid Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer <firebase_token>
```

---

## 🌐 CORS Configuration

- **Local development:** `http://localhost:5173`  
- **Deployed frontend:** `https://campus-pilot-24c9b.web.app/`  

---

## 💡 Notes

- MongoDB connection is **lazy**, meaning it only connects when the first request is made.  
- All dates are stored in **ISO string format**.  
- Task and class objects return both `_id` and stringified `id` for easier frontend integration.  

---

## 📝 License
You are free to use, modify, and distribute it with attribution.  
