import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
        
        // Store user data in Redux (auto-login)
        dispatch(setAuthUser(res.data));
        
        // Clear form
        setInput({
          username: "",
          email: "",
          password: ""
        });
        
        // Redirect to home page
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
      <form className="auth-card bondly-card" onSubmit={signupHandler}>
        <div className="text-center">
          <h1 className="auth-logo">Bondly</h1>
          <p className="auth-title">Create your account</p>
        </div>
        <div style={{ width: '100%' }}>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            placeholder="Enter your username"
            required
            className="auth-input"
          />
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Enter your email"
            required
            className="auth-input"
          />
          {emailError && <div className="bondly-error">{emailError}</div>}
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Enter a strong password"
            required
            className="auth-input"
          />
        </div>
        <Button type="submit" className="auth-btn" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Creating Account...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
