import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "@/lib/axiosInstance";
import "./Auth.css";

import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const [input, setInput] = React.useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ dispatch to update Redux
  const [emailError, setEmailError] = useState("");

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    if (!validateEmail(input.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }
    setLoading(true);

    try {
      const res = await axios.post("/user/login", input); // ✅ centralized axios

      if (res.data.success) {
        toast.success(res.data.message || "Login successful");

        dispatch(setAuthUser(res.data)); // ✅ store { user, token } in Redux

        setInput({ email: "", password: "" });
        navigate("/"); // ✅ redirect after login
      } else {
        toast.error("Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <form className="auth-card bondly-card" onSubmit={loginHandler}>
        <div className="text-center">
          <h1 className="auth-logo">Bondly</h1>
          <p className="auth-title">Login to your account</p>
        </div>
        <div style={{ width: '100%' }}>
          <Label htmlFor="email">Email</Label>
          {emailError && <div className="bondly-error">{emailError}</div>}
          <Input
            id="email"
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Enter your email"
            required
            className="auth-input bondly-input"
          />
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Enter your password"
            required
            className="auth-input"
          />
        </div>
        <Button type="submit" className="auth-btn" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </Button>
        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
