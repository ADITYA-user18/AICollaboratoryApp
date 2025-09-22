# 🚀 Chat@AI: A Real-Time Collaborative Coding Environment



---

## 🌟 About The Project

The AI Collaboratory is a full-stack MERN application that redefines team collaboration by seamlessly integrating a powerful generative AI into a real-time coding and chat environment. It's a single, persistent workspace where developers can brainstorm ideas in a live chat, prompt an AI co-pilot to generate or refactor code, and instantly test it with a built-in multi-language compiler.

This project was built to solve a common developer pain point: the constant context-switching between chat applications, IDEs, and testing environments. The AI Collaboratory unifies this workflow, turning conversation directly into creation.

### Built With

This project leverages a modern, robust, and scalable technology stack:

*   **Frontend:**
    *   ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
    *   ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
    *   ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
    *   ![Framer Motion](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)
*   **Backend:**
    *   ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
    *   ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)
*   **Database & Real-time:**
    *   ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
    *   ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
*   **AI & Deployment:**
    *   **Google Gemini Pro API** (for generative content)
    *   **Judge0 API** (for code compilation)
    *   ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🔥 Core Features

-   **🤖 AI Co-Pilot:** Trigger the AI with an `@` mention in the chat. Ask it to generate new files, modify existing code, or explain concepts. The AI is context-aware of your existing file structure.

-   **🤝 Real-Time Collaboration:** All messages and file changes (creations, edits, deletions) are broadcast instantly to all project partners via WebSockets, ensuring everyone is always in sync.

-   **💾 Persistent State:** Your project's entire state—including the full chat history and the complete file explorer tree—is saved to MongoDB. You can leave and come back, and your work will be exactly as you left it.

-   **📝 Live Multi-File Editor:** A VS Code-style editor with syntax highlighting that allows users to open multiple files in tabs, edit them, and see changes from collaborators in real-time.

-   **⚙️ Integrated Multi-Language Compiler:** A slide-up compiler panel allows you to execute code snippets in Python, C++, Java, and JavaScript directly within the application, powered by the Judge0 API.

-   **👥 User & Partner Management:** Secure user authentication (Register/Login) with JWTs and a clean UI for inviting and managing partners in a project.

---



## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need `npm` (or `yarn`) and a MongoDB database instance (local or from a service like MongoDB Atlas).

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/your_repository_name.git
    cd your_repository_name
    ```

2.  **Setup Backend**
    ```sh
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory and add the following variables:
    ```env
    PORT=3001
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    JWT_EXPIRES=7d
    GEMINI_API_KEY=your_gemini_api_key
    ```

3.  **Setup Frontend**
    ```sh
    cd ../frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:3001/api
    ```

### Running the Application

1.  **Run the Backend Server** (from the `/backend` directory)
    ```sh
    npm start
    ```
2.  **Run the Frontend Development Server** (from the `/frontend` directory, in a separate terminal)
    ```sh
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

---

## Contact

 Name - [https://www.linkedin.com/in/aditya-g-wandakar-875007343/] - adityagw20@gmail.com

