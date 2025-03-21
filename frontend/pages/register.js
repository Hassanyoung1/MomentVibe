// import Logo from "../components/Logo";
import Link from 'next/link';
import AuthSwitch from "../components/AuthSwitch";
import InputField from "../components/InputField";
import SocialAuth from "../components/SocialAuth";
import { useState } from "react";
import { useRouter } from "next/router";

function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          router.push("/login");
        } else {
          setError(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
        {/* <Logo /> */}
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome To Moment Vibe
        </h1>
        <p className="text-sm mb-4">Please sign up to continue</p>
        <AuthSwitch currentPage="register" />
        <form className="w-11/12 md:w-3/4" onSubmit={handleSubmit}>
          <InputField
            label="Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            id="name"
          />
          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            id="email"
          />
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            id="password"
          />
          <InputField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            id="confirm-password"
          />

          <Link href="/forgot-password"  className="text-blue-500 text-sm">
           Forgot Password? 
         </Link>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full"
            disabled={loading}
          >
            Sign up
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <SocialAuth />
        </form>
      </div>
      <div className="hidden md:block md:w-1/2">
        <img
          src="/register-image.jpg"
          className="object-cover h-full w-full"
          alt="Registration background"
        />
      </div>
    </div>
  );
}

export default Register;