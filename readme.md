# 🪐 QueryEcho

**Natural Language to SQL AI Assistant**

QueryEcho is a secure, interactive full-stack web application that allows users to query complex relational databases using everyday natural language. Powered by blazing-fast Large Language Models (LLMs), QueryEcho seamlessly translates English inputs into optimized SQL queries while enforcing enterprise-grade security, data privacy, and strict Role-Based Access Control (RBAC).

---

## 🏗️ System Architecture & Workflow

The application follows a secure, decoupled Client-Server architecture with a strict Human-In-The-Loop execution flow.

1. **Authentication:** User logs in via React UI. The backend authenticates via MongoDB and issues a JWT reflecting their strict RBAC role (`SUPER_ADMIN`, `DBA`, `ANALYST`, `READ_ONLY`).
2. **Database Connection:** The user selects the target database engine (PostgreSQL, MySQL, Oracle) and provides connection credentials.
3. **Privacy-First Extraction:** The Node.js backend securely connects to the target DB, fetches the structural schema, and dynamically scrubs sensitive columns (e.g., passwords, SSNs). Actual row data is **never** extracted.
4. **AI Generation:** The user submits a natural language query. The Groq API processes the filtered schema + user input, returning formatted SQL and a plain-English explanation.
5. **Human-In-The-Loop (HITL):** The SQL is paused in the UI editor for manual human review and modification.
6. **Security Validation:** Upon approval, the backend intercepts the query and validates it against hardcoded regex blacklists. Destructive commands (`DROP`, `DELETE`, etc.) are forcefully blocked for non-admins.
7. **Execution:** The validated query executes on the target database, and results are returned to the client's data grid.

---

## 🛠️ Technology Stack

* **Frontend:** React.js (Vite), Custom CSS (Morpheus Den gradients & animated Uiverse UI), React Router DOM
* **Backend:** Node.js, Express.js (v5)
* **AI Integration:** Llama 3.1 / 3.3 Models via Groq API
* **Security & Auth:** MongoDB Atlas, JSON Web Tokens (JWT), bcrypt
* **Target Databases Supported:** `pg` (PostgreSQL), `mysql2` (MySQL), `oracledb` (Oracle)
* **Networking:** Custom Node.js DNS override script to bypass strict Windows/ISP firewalls for MongoDB SRV connections.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* A **MongoDB Atlas** Account (for the auth database)
* A free **Groq API Key** (for AI generation)

### 2. Installation

Clone the repository and install the dependencies for both the backend and frontend.

```bash
# Clone the repository
git clone [https://github.com/YOUR_USERNAME/QueryEcho.git](https://github.com/YOUR_USERNAME/QueryEcho.git)
cd QueryEcho

# Install backend dependencies
cd server
npm install

# Open a new terminal and install frontend dependencies
cd client
npm install

##############################################

#If You wanted to Work on this Project

##############################################

#For Creating .env file you need to add these things 

# Server Configuration
PORT=5000

# MongoDB Connection String
# Note: Ensure your IP is whitelisted (0.0.0.0/0) in MongoDB Atlas
MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster0.xxxxx.mongodb.net/queryecho_auth?retryWrites=true&w=majority

# Security
JWT_SECRET=your_super_secret_random_string_here

# AI Integration
GROQ_API_KEY=gsk_your_actual_groq_api_key_here



#------------------------------------------#
# Running The application

Terminal 1: Start the Backend Server

cd server
npm start


Terminal 2: Start the Frontend Client'
cd client
npm run dev