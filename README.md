# Airline Resolution Agent

An intelligent customer service interface designed to handle airline disruptions, delays, and cancellations. This project simulates an AI agent that strictly adheres to predefined airline policies to resolve customer issues effectively.

## Features

* **Policy Enforcement**: The agent is hardcoded to strictly follow predefined airline service rules (e.g., cancellation rebooking, delay compensation, refund processing, and escalation protocols).
* **Interactive Scenarios**: Includes three built-in test scenarios representing different customer loyalty tiers and disruption cases:
  * *Priya Nair (Gold)* - Cancelled flight, requesting full refund and an out-of-policy business class upgrade.
  * *Arvind Kulkarni (Silver)* - 4-hour delay, requesting out-of-policy hotel accommodation.
  * *Meher Kaur (Platinum)* - 6-hour delay, requesting a full night's hotel stay and waived fare differences.
* **Streaming Responses**: Simulates a real-time "typewriter" streaming effect of agent responses for a natural chat experience, utilizing HTTP chunked transfer encoding.
* **Markdown UI**: Agent responses are rendered with clean markdown formatting (bolding, lists, paragraphs) for optimal readability.
* **Full-Stack Architecture**: Built with a React frontend and an Express.js backend server.

## Tech Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide React (Icons), React Markdown.
* **Backend**: Node.js, Express.

## How to Run Locally

To open and run this project on your local machine or in a new environment, follow these steps:

### Prerequisites

* Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).
* Ensure you have `npm` (Node Package Manager) installed.

### 1. Installation

Open a terminal, navigate to the project directory, and install the required dependencies:

```bash
npm install
```

### 2. Running the Development Server

To start the local development server (which uses `tsx` to run the TypeScript backend and Vite middleware for the frontend):

```bash
npm run dev
```

Once the server starts, open your web browser and navigate to `http://localhost:3000`.

### 3. Building for Production

If you want to deploy the application or run the highly-optimized production build:

```bash
npm run build
```

This compiles the frontend assets and bundles the backend server into the `dist/` directory.

### 4. Starting the Production Server

After building, you can start the production server:

```bash
npm run start
```
