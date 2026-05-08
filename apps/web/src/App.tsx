import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-900">
      <div className="max-w-lg w-full p-8 bg-white rounded-2xl border border-neutral-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
            CQ
          </div>
          <h1 className="text-xl font-semibold">CodeQuest</h1>
        </div>
        <p className="text-neutral-600 mb-6">
          Welcome to CodeQuest. Learn algorithms through games.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 font-medium"
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}