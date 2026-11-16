# Roots Behind Routes

**Roots Behind Routes** is a web platform designed to curate local culture with respect, amplifying community voices through a unique, dual-rating system. 

Every travel app points toward the same restaurants and the same "local experiences," while the culture worth experiencing sits just outside the frame. By letting locals guide tourists, and share what they are proud of on their own terms, this project hands the narrative back to the people who actually live it.

## 🔗 Links
* **Live Deployed Site:** [https://rootsbehindroutes.web.app/](https://rootsbehindroutes.web.app/)
* **Backend API:** [[https://rootsbehindroutes.onrender.com](https://rootsbehindroutes.onrender.com)](https://rootsbehindroutes.onrender.com)

## ✨ Key Features
* **Dual-Rating System:** Locals endorse places on a 1-10 scale (reflecting local sentiment), while tourists rate the quality of their experience on a standard 5-star scale.
* **Interactive Map:** Explore endorsed places and activities across Johannesburg using the Google Maps API.
* **Social & Profiles:** Users can set up detailed profiles, bookmark experiences, and follow other users (note: Managers and Admins cannot be followed).
* **Content Moderation:** A robust Admin Dashboard for approving/rejecting new experiences and managing user bans/suspensions. 
* **Manager Dashboard:** Local business owners and managers can add, edit, hide, or delete their own places and activities.

## 🛠 Tech Stack
* **Frontend:** React, Vite, React Router, Firebase Auth/Storage
* **Backend:** Node.js, Express.js
* **Database:** Firebase Firestore
* **APIs:** Google Maps API, Firebase Admin SDK

---

## 💻 Run Locally

To run this project locally, you will need to set up both the frontend and the backend server.

### Prerequisites
* Node.js installed on your machine.
* A Firebase project (with Firestore, Authentication, and Storage enabled).
* A Google Maps API key.

### 1. Clone the repository
```bash
git clone https://github.com/AmberCooper23/RootsBehindRoutes.git
cd RootsBehindRoutes
```

### 2. Backend Setup

```bash
cd server
npm install
```

#### Create a .env file in the server/ directory and add the following variables:

```
FIREBASE_API_KEY=[key]
FIREBASE_AUTH_DOMAIN=rootsbehindroutes.firebaseapp.com
FIREBASE_PROJECT_ID=rootsbehindroutes
FIREBASE_STORAGE_BUCKET=rootsbehindroutes.appspot.com
FIREBASE_MESSAGING_SENDER_ID=[id]
FIREBASE_APP_ID=[id]
```
#### Start the backend server
```
npm run start
```
The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Create a .env file in the frontend/ directory and add the following variables:

```
VITE_FIREBASE_API_KEY=[key]
VITE_FIREBASE_AUTH_DOMAIN=rootsbehindroutes.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rootsbehindroutes
VITE_FIREBASE_STORAGE_BUCKET=rootsbehindroutes.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=[id]
VITE_FIREBASE_APP_ID=[id]
VITE_API_BASE_URL=https://rootsbehindroutes.onrender.com
VITE_GOOGLE_MAPS_API_KEY=[key]
VITE_FIREBASE_STORAGE_BUCKET=rootsbehindroutes.firebasestorage.app
```

### Create a .env.production file in the frontend/ directory with the same variables as above ^

#### Start the frontend server

```bash
npm run build
npm run dev
```

The app will be available http://localhost:5173

## Run Deployment
Use the same steps above first

### 1. Stop Open Ports
``` Ctrl + C ``` in both terminals

### 2. Deploy Server

Open Render. Login with credentials.

Manually Deploy -> Clear build cache and deploy

### 3. Deploy Frontend

Open terminal

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

The site will be deployed at [https://rootsbehindroutes.web.app/](https://rootsbehindroutes.web.app/)

