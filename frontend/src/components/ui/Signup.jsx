import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "@/lib/axiosInstance";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import "./Auth.css";

const Signup = () => {
  const [input, setInput] = React.useState({
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailError, setEmailError] = useState("");

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    if (!validateEmail(input.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }
    setLoading(true);

    try {
      const res = await axios.post("/user/register", input);

      if (res.data.success) {
        toast.success(res.data.message || "Account created successfully!");
        dispatch(setAuthUser(res.data));
        setInput({ username: "", email: "", password: "" });
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={signupHandler}>
        <h1 className="auth-logo">Bondly</h1>
        <p className="auth-title">Sign up to see photos and videos from your friends.</p>
        
        <div className="auth-form-body">
          {emailError && <div className="bondly-error">{emailError}</div>}
          <input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            placeholder="Username"
            required
            className="auth-input"
          />
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
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </div>
      </form>
      
      <div className="auth-footer-card">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Log in</Link>
      </div>
    </div>
  );
};

export default Signup;
