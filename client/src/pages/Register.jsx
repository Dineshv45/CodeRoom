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

      toast.success("Registration successful");
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
            className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
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
