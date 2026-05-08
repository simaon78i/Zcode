import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TeacherDashboard from "./pages/teacherdashboard";
import { CreateGame } from "./pages/creategame";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import FixTheLoopGame from "./games/FixTheLoopGame";
import StudentSessionsPage from "./pages/StudentSessionsPage";
import CodeBreakerPage from "./pages/CodeBreakerPage";
import CodeRunnerPage from "./pages/CodeRunnerPage";
import { LoginForm, SignupForm, AuthProvider, RequireAuth } from "./auth";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found in index.html");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          <Route
            path="/play/fix-the-loop"
            element={
              <RequireAuth>
                <FixTheLoopGame />
              </RequireAuth>
            }
          />
          <Route
            path="/play/codebreaker"
            element={
              <RequireAuth>
                <CodeBreakerPage />
              </RequireAuth>
            }
          />
          <Route
            path="/play/coderunner"
            element={
              <RequireAuth>
                <CodeRunnerPage />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <RequireAuth roles={["teacher"]}>
                <TeacherDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/students/:studentId/sessions"
            element={
              <RequireAuth roles={["teacher"]}>
                <StudentSessionsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/create-game"
            element={
              <RequireAuth roles={["teacher"]}>
                <CreateGame />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth roles={["teacher"]}>
                <AdminPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);