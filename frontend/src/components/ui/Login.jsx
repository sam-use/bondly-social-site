import React, { useState } from "react";
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
  const dispatch = useDispatch();
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
      const res = await axios.post("/user/login", input);

      if (res.data.success) {
        toast.success(res.data.message || "Login successful");
        dispatch(setAuthUser(res.data));
        setInput({ email: "", password: "" });
        navigate("/");
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
      <form className="auth-card" onSubmit={loginHandler}>
        <h1 className="auth-logo">Bondly</h1>
        <p className="auth-title">Log in to your account</p>
        
        <div className="auth-form-body">
          {emailError && <div className="bondly-error">{emailError}</div>}
          <input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Email"
            required
            className="auth-input"
          />
          <input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Password"
            required
            className="auth-input"
          />
          <Button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </div>
      </form>
      
      <div className="auth-footer-card">
        Don't have an account?{' '}
        <Link to="/signup" className="auth-link">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
