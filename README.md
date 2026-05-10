## 🤖 AI Mentor

Powered by OpenRouter. Never gives the full answer — only Socratic nudges. Ramps up hint specificity across up to 5 hints per session. On session completion, automatically generates a factual 100-word summary of the student's struggle and success for the teacher.

## 👨‍🏫 Teacher Flow

Teachers sign up and receive a unique Teacher ID. They create games with custom JSON content, assign them to students, and monitor a real-time dashboard showing scores, session history, and AI-generated summaries per student.

## 👨‍🎓 Student Flow

Students sign up using their Teacher ID to link automatically. They browse a Netflix-style game library, play assigned games with AI mentor support, and build a score history visible on their profile.

## ☁️ Cloud Architecture & Deployment

The project uses a **Serverless Container** approach:
1. **Serverless Execution:** API and Frontend run on **Google Cloud Run**, scaling automatically and keeping baseline costs low.
2. **Global Distribution:** **Firebase Hosting** serves the frontend assets, providing low-latency access and automatic SSL (`HTTPS`), routing API calls seamlessly.
3. **Automated Pipeline:** Deployment is handled via Google Cloud Build using custom `api-build.yaml` and `web-build.yaml` recipes.

### Cloud Deployment Commands:
```bash
# 1. Build images on Cloud Build
gcloud builds submit --config api-build.yaml
gcloud builds submit --config web-build.yaml

# 2. Deploy to Cloud Run
gcloud run deploy zcode-api --image gcr.io/[PROJECT-ID]/zcode-api --region me-west1
gcloud run deploy zcode-web --image gcr.io/[PROJECT-ID]/zcode-web --region me-west1

# 3. Update Firebase Hosting Proxy
firebase deploy --only hosting
```

### 🐳 Running Locally with Docker
git clone [https://github.com/simaon78i/Zcode.git](https://github.com/simaon78i/Zcode.git)
cd Zcode
cp apps/api/.env.example apps/api/.env
# Fill in DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY
docker-compose up --build

### 🛠️ Running Locally (Without Docker)
pnpm install
pnpm dev

### ⚙️ Environment Variables
DATABASE_URL=postgresql://...@...neon.tech/zcode?sslmode=require
JWT_SECRET=your-long-random-secret
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/auto
PORT=8080 # For Cloud Run (3001 for local)
VITE_API_URL=[https://your-api-cloud-run-url.run.app](https://your-api-cloud-run-url.run.app) # For Cloud Web Build

### 🏆 Built At
Hack The Gap Hackathon 2026 — ZCode was designed, built, and shipped in a single hackathon sprint. The goal: build something that actually helps real teachers in real classrooms, not just a demo.

### 📄 License
MIT
