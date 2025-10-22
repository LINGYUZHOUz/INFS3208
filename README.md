# News Management System – REST API with Frontend

This project is developed for the INFS3208 Cloud Computing assignment.  
It demonstrates a **full-stack web application** with authentication, role-based authorization, CRUD operations, external API integration, CPU-intensive tasks, load testing, and Docker-based deployment.


## 👤 Author
Student Name: Lingyu Zhou

Student Number: 48167370

Class: INfS3208 – Cloud Computing

---

## 🧰 Tech Stack
 - React.js + Node.js + Express.js + MongoDB 
 - Docker & Docker Compose + nginx
 - Postman + Autocannon

---

## 📌 Features
- **User Authentication & Roles**  
  - Admin: create, update, delete news and categories  
  - User: view news only  

- **News Management System**  
  - Create, read, update, delete news articles  
  - Categorization with colors and names  
  - Pagination and sorting  

- **External API Integration**  
  - Example: Weather API  

- **CPU-Intensive Endpoint**  
  - Runs PBKDF2 with configurable iterations  
  - Returns elapsed time without blocking the main thread  

- **Load Testing**  
  - Stress test using [autocannon]
  - Results included in documentation  

- **Dockerized Deployment**  
  - Multi-container setup with backend, frontend, and pull from ECR repository
  - One-command start using `docker compose`  

---

## 🛠️ Installation (Local Development)

1. Extract the provided `.zip` file.

2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Setup environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```

4. Start development servers:
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

---

## 🐳 Deployment with Docker

1. Build and run with Docker Compose:
   ```bash
   docker compose up --build
   ```

2. Services:
   - Backend → http://localhost:3000  
   - Frontend → http://localhost:5001  

---

## 📖 API Overview

### Authentication
- `POST /api/auth/login` – Login with username/password  
- `POST /api/auth/register` – Create a new account  

### News
- `GET /api/news?limit=10&page=1` – List news with pagination  
- `POST /api/news` – Create news (Admin only)  
- `PUT /api/news/:id` – Update news (Admin only)  
- `DELETE /api/news/:id` – Delete news (Admin only)  

### Categories
- `GET /api/categories` – List categories  
- `POST /api/categories` – Create category (Admin only)  

### CPU Task
- `GET /api/cpu?iter=50000`  
  Response example:
 ![Postman Request](doc/cpuLoadTest/post.png)
During execution, the server process (`node server.js`) reached close to 100% CPU:

---


## 📦 Submission Package
- Source code (frontend + backend)  
- `.env.example` file  
- `docker-compose.yml`  
- `README.md` (this file)  
- `commands.txt` (all commands used for build, run, test, deploy)  
<!-- - Postman/Insomnia collection or curl script   -->
- Screenshots:  
  - Successful API calls  
  <!-- - Authentication errors   -->
  - CPU endpoint results  
  - Load test results  
  - Docker containers running  

---
