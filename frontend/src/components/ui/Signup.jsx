import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Auth.css";

const Signup = () => {
  const [input, setInput] = React.useState({
    username: "",
    email: "",
    password: ""
  });

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value
    });
  };

  const signupHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setInput({
           username: "",
    email: "",
    password: ""
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={signupHandler}>
        <div className="text-center">
          <h1 className="auth-logo">Instagram</h1>
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
        <Button type="submit" className="auth-btn">
          Sign Up
        </Button>
        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/login" className="auth-link">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
