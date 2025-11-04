# Sehat Sathi: Your Health Assistant

<p align="center">
  <img src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image-300x225.png" alt="Sehat Sathi App Screenshot" width="700">
</p>

<p align="center">
  <strong>Your Health Assistant, Anytime, Anywhere.</strong><br/>
  Providing rural India with instant, reliable healthcare guidance and access to government initiatives.
</p>

---

## 🎯 The Problem It Solves

Millions of people in rural communities lack access to timely and reliable medical advice. This critical gap—caused by barriers like distance, cost, and a lack of information—often leads to preventable health complications and perpetuates health inequality.

## ✨ Our Solution

**Sehat Sathi** is a mobile-friendly web platform designed to break down these barriers. It provides instant, accessible, and easy-to-understand health guidance through a suite of powerful, user-friendly tools. By leveraging AI and supporting local languages, we put a virtual health assistant in everyone's pocket.

Our mission is to empower individuals in rural communities with the knowledge and tools to make informed decisions about their health, ensuring no one is left behind.

## 🚀 Key Features

Sehat Sathi is packed with features designed to provide comprehensive healthcare support:

*   **🤖 AI Health Chatbot:** Get instant, 24/7 answers to your health queries in your local language (supports English, Hindi, and Marathi).
*   **📹 Live Video Consultation:(In progress...)**
    *   Connect with healthcare professionals through secure, peer-to-peer WebRTC video calls.
    *   Supports both **immediate calls** for urgent queries and **scheduled calls** for planned consultations.
    *   Full in-call controls for muting audio and toggling video.
    *   Real-time connection status, error handling, and browser notifications for call reminders.
    *   Fully responsive design for a seamless experience on both mobile and desktop.
*   **🗺️ Hospital & Services Locator:** An interactive map to find nearby hospitals, clinics, and government health centers.
*   **📄 Insurance Document Management:** A secure, personal portal for users to upload, manage, and access their health insurance policies and documents.
*   **🇮🇳 Government Scheme Information:** Provides easy-to-understand information about relevant government healthcare initiatives and programs.
*   **🔐 Secure & Easy Authentication:** Simple and secure user authentication using a email, powered by Firebase(Future we will integrate simple opt login).
*   **🌐 Multilingual Interface:** The entire platform is available in English, Hindi, and Marathi to ensure maximum accessibility(Will Support more language in future).

## 🛠️ Tech Stack & Architecture

This project is built with a modern, robust, and scalable technology stack:

*   **Framework:** [**Next.js**](https://nextjs.org/) (React)
*   **Backend & Database:** [**Firebase**](https://firebase.google.com/) (Firestore, Firebase Authentication, Cloud Storage)
*   **Real-time Communication:** [**WebRTC**](https://webrtc.org/) for peer-to-peer video/audio and **Firebase** for signaling.
*   **Styling:** [**Tailwind CSS**](https://tailwindcss.com/) with [**shadcn/ui**](https://ui.shadcn.com/) for beautiful, accessible components.
*   **State Management:** React Hooks & Context API.
*   **Form Handling:** React Hook Form with Zod for validation.

## ⚙️ Getting Started: Local Setup

Follow these instructions to get the project up and running on your local machine for development and testing.

### Prerequisites

*   [**Node.js**](https://nodejs.org/en/) (v18.x or newer recommended)
*   **npm**, **yarn**, or **pnpm** package manager
*   A **Firebase account** (you can create one for free)

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/sehat-sathi.git
    cd sehat-sathi
    ```

2.  **Install Project Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set Up Your Firebase Project**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click on **"Add project"** and follow the steps to create a new Firebase project.
    *   Once your project is created, navigate to **Project settings** (click the gear icon ⚙️).
    *   In the "General" tab, under "Your apps", click the web icon (`</>`) to create a new web app configuration.
    *   Give your app a nickname (e.g., "Sehat Sathi Web") and click **"Register app"**.
    *   Firebase will provide you with a `firebaseConfig` object. **Copy these keys.**

4.  **Create Your Environment File**
    *   In the root directory of your cloned project, create a new file named `.env.local`.
    *   Paste your `firebaseConfig` keys into this file, formatted as follows:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
    NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcde12345
    ```

5.  **Enable Firebase Services**
    In the Firebase Console for your project:
    *   Go to **Authentication** -> **Sign-in method** tab -> Enable the **Phone** provider.
    *   Go to **Firestore Database** -> Click **"Create database"** -> Start in **test mode** for easy setup.
    *   Go to **Storage** -> Click **"Get started"** -> Start in **test mode**.

6.  **Run the Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser. You should now see the Sehat Sathi application running locally!

---

### 📜 Disclaimer

This application is intended to provide general health guidance and information. It is not a substitute for professional medical advice, diagnosis, or treatment. For emergencies, please visit a certified doctor or the nearest hospital immediately.
