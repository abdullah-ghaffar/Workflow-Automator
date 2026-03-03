# 🚀 Workflow Automator (Distributed System)

> A scalable, event-driven workflow automation engine architected with **Node.js**, **Redis**, and **React Flow**.

![Status](https://img.shields.io/badge/Status-MVP_Complete-success)
![Tech](https://img.shields.io/badge/Stack-TypeScript_|_Node.js_|_React-blue)
![Architecture](https://img.shields.io/badge/Architecture-Producer--Consumer-orange)

## 📖 Overview

Workflow Automator is a low-code platform that allows users to visually design automation flows using a drag-and-drop interface. Under the hood, it operates as a **Distributed System** utilizing a **Queue-based architecture** to handle high-throughput webhook events asynchronously.

Instead of processing tasks synchronously (which blocks the server), this system decouples the **Ingestion Layer (API)** from the **Execution Layer (Worker)** using **Redis**, ensuring reliability and scalability.

---

## 🏗️ System Architecture

The system follows the **Producer-Consumer** design pattern:

1.  **Frontend (The Designer):**
    *   Built with **React + React Flow**.
    *   Allows users to model logic as a **Directed Acyclic Graph (DAG)**.
    *   Serializes the visual graph into JSON nodes/edges and sends it to the backend.

2.  **API Server (The Producer):**
    *   **Node.js/Express** server that acts as the entry point.
    *   Listens for incoming Webhooks.
    *   Validates the request and **pushes a job** into the Redis Queue.
    *   *Latency:* <10ms (Fire-and-forget mechanism).

3.  **Message Broker (The Queue):**
    *   **Redis** (powered by **BullMQ**).
    *   Acts as a buffer between the API and Workers to handle load spikes.

4.  **Worker Node (The Consumer):**
    *   A separate Node.js process that listens to the Queue.
    *   Fetches jobs, traverses the workflow graph, and executes steps (e.g., Sending Emails, Generating Bills) sequentially.

---

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, React Flow, Vite.
*   **Backend:** Node.js, Express, TypeScript.
*   **Queue/Messaging:** Redis, BullMQ.
*   **DevOps:** Local Environment (Windows/Linux compatible).

---

## 🚀 Getting Started

Follow these steps to set up the distributed environment locally.

### Prerequisites
*   Node.js (v18+)
*   Redis (Must be running on port `6379`)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/abdullah-ghaffar/Workflow-Automator.git
cd Projects/Workflow-Automator

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
2. Running the System
You need to run 3 separate terminals to simulate the distributed environment:
Terminal 1: The API Server
code
Bash
cd backend
npm run dev
# Server starts at http://localhost:3000
Terminal 2: The Worker Process
code
Bash
cd backend
npx tsx src/workers/workflow.worker.ts
# Worker starts listening to Redis queue
Terminal 3: The Frontend UI
code
Bash
cd frontend
npm run dev
# UI opens at http://localhost:5173
🧪 Testing the Workflow
Open the Frontend (http://localhost:5173).
Drag and drop nodes (Webhook -> Email -> Bill).
Connect them using edges.
Click "Save Workflow".
Trigger the webhook using curl:
code
Bash
curl -X POST http://localhost:3000/hooks/catch/webhook_123
Result:
The API accepts the request immediately.
The Worker picks up the job and executes the logic (logs visible in Terminal 2).
🔮 Future Roadmap

Persistence: Integrate PostgreSQL/MongoDB to store workflow configurations permanently.

Authentication: Add JWT-based user authentication.

Real Integrations: Replace mock console.log with actual SendGrid/Stripe APIs.

Dockerization: Containerize the API, Worker, and Redis for cloud deployment (AWS/DigitalOcean).
👨‍💻 Author
Abdulalh Ghaffar
