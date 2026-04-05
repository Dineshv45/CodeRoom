import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import codeEditorIcon from "../assets/code-editor-icon.png";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Account created! Please check your email to verify your account.");
      navigate("/login");
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex justify-center items-center px-4 text-white">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <img src={codeEditorIcon} className="w-10 h-10" />
          <h1 className="text-2xl font-semibold">
            Code<span className="text-blue-500">Room</span>
          </h1>
        </div>

        <h2 className="text-lg font-medium mb-4 text-center">Register</h2>

        <div className="space-y-4">
          <input
            className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition font-medium"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-neutral-700"></div>
            <span className="mx-4 text-sm text-neutral-500 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-neutral-700"></div>
          </div>

          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/api/users/auth/google`}
            className="flex items-center justify-center gap-3 w-full py-2.5 rounded-md bg-white text-black hover:bg-neutral-200 transition font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </a>
        </div>

        <p className="text-sm text-neutral-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
