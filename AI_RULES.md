# AI Development Rules

This document outlines the technical stack and specific library usage rules for developing this application.

## Tech Stack Description

This application consists of a Node.js backend and is intended to be paired with a React frontend.

### Backend (Current Codebase)
*   **Node.js**: The JavaScript runtime environment for the backend server.
*   **Express.js**: A fast, unopinionated, minimalist web framework for Node.js, used for building RESTful APIs.
*   **Dotenv**: A module to load environment variables from a `.env` file.
*   **CORS**: Middleware for Express.js to enable Cross-Origin Resource Sharing.
*   **Mongoose**: An elegant MongoDB object modeling tool, designed to work in an asynchronous environment.
*   **JavaScript (ESM)**: The primary language for backend logic, using ES Modules for imports/exports.
*   **JSON**: Used for static data storage (e.g., `pokemons.json`).
*   **Static File Serving**: Express is configured to serve static assets from the `assets` directory.

### Frontend (Future Development)
*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A strongly typed superset of JavaScript that adds static types.
*   **React Router**: For declarative routing in the React application.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.

## Library Usage Rules

### Backend Rules
*   **Web Framework**: Always use **Express.js** for defining routes, middleware, and handling HTTP requests.
*   **Environment Variables**: Use **dotenv** for managing environment variables. Ensure sensitive information is stored in `.env` and not committed to version control.
*   **CORS**: The **cors** package should be used for handling Cross-Origin Resource Sharing policies.
*   **Database ODM**: Use **Mongoose** for interacting with MongoDB.
*   **Static Data**: For static data like the `pokemons.json` list, use JSON files.

### Frontend Rules
*   **Framework**: All UI development must be done using **React**.
*   **Language**: All frontend code must be written in **TypeScript**.
*   **Routing**: Use **React Router** for all client-side navigation. Routes should be defined in `src/App.tsx`.
*   **UI Components**: Prioritize using components from **shadcn/ui**. If a specific component is not available or needs significant customization, create a new component in `src/components/` following the existing styling conventions.
*   **Styling**: All styling must be implemented using **Tailwind CSS** classes. Avoid inline styles or separate CSS files unless absolutely necessary and explicitly approved.
*   **File Structure**:
    *   Source code should reside in the `src` directory.
    *   Pages should be placed in `src/pages/`.
    *   Reusable components should be placed in `src/components/`.
    *   New components should always be created in their own dedicated files.
*   **Responsiveness**: All new UI components and pages must be designed to be fully responsive across different screen sizes.
*   **Error Handling (Frontend)**: Use toast notifications (e.g., `react-hot-toast`) to inform users about important events, including errors.