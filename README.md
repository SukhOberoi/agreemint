# Agreemint

Agreemint is a modern, AI-powered contract management platform designed to simplify the creation, collaboration, and execution of legal documents.

## 🚀 Features

- **AI Contract Generation**: Generate structured legal documents using Google's Gemini AI. The system adapts templates to your specific needs through natural language interaction.
- **Collaborative Markdown Editor**: Edit and refine contract clauses using a familiar Markdown interface with real-time feedback.
- **Digital Signatures**: Built-in workflow for signing documents and tracking approval status.
- **Template Management**: Access a library of industry-standard templates (NDA, Freelance, Employment, etc.) or create your own.
- **Secure Storage**: Documents and user data are securely managed using Firebase Firestore and Firebase Admin SDK.
- **User Onboarding**: Personalized onboarding flow to tailor the experience to individual or business needs.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/)
- **Database/Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth via NextAuth.js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Editor**: Markdown-based editor with `@uiw/react-md-editor`

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or later
- A Firebase Project
- A Google AI (Gemini) API Key

### Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Firebase Admin (Service Account)
AUTH_FIREBASE_PROJECT_ID=your_project_id
AUTH_FIREBASE_CLIENT_EMAIL=your_client_email
AUTH_FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_DATABASE_URL=your_database_url

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/agreemint.git
    cd agreemint
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Google AI Studio](https://aistudio.google.com/) - explore Gemini API capabilities.
- [Firebase Documentation](https://firebase.google.com/docs) - learn about Firestore and Admin SDK.
