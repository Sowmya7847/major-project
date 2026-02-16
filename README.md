# SecureCloud - Advanced Secure Data Outsourcing System

This project implements a secure cloud storage system with advanced encryption features, based on the research paper "A Low-latency Secure Data Outsourcing Scheme for Cloud-WSN".

## Features
- **Secure File Upload:** Encrypt files before upload using AES-256-GCM.
- **CP-ABE Simulation:** Attribute-Based Encryption for fine-grained access control (Research Feature).
- **Parallel Processing:** Split-then-Encrypt architecture for low latency upload/download.
- **Key Management:** Active key rotation and lifecycle management.
- **Monitoring:** Real-time audit logs and system metrics.

## Tech Stack
- **Frontend:** React, TailwindCSS, Lucide Icons
- **Backend:** Node.js, Express, MongoDB
- **Security:** AES-256-GCM, CP-ABE (Simulated), JWT Authentication

## Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or Atlas URI)
- Git (Optional for version control)

## Setup Instructions

### 1. Clone/Download Repository
```bash
git clone <repository-url>
cd SecureCloud
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Configure Environment Variables
# Create a .env file in the root directory with:
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/securecloud
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key

# Start the Backend Server
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start the Frontend Development Server
npm run dev
```

## Usage
1.  Open browser at `http://localhost:5173`
2.  Register/Login (Role: 'user' or 'admin')
3.  Go to **Dashboard** to upload files using AES or CP-ABE.
4.  Go to **Encryption Control** to manage keys.
5.  Go to **Monitoring** to view logs.

## Research Implementation (Phase 9)
To test the CP-ABE feature:
1.  On Dashboard, select "CP-ABE" encryption scheme.
2.  Enter an Access Policy (e.g., `Role:user`).
3.  Upload a file. The system will split the file and encrypt chunks in parallel.
4.  Download the file. The system will verify your attributes against the policy before decrypting.
