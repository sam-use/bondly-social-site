// App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from "./components/ui/Home";
import Login from "./components/ui/Login";
import Signup from "./components/ui/Signup";
import Profile from "./components/ui/Profile";
import PostPage from "./components/ui/PostPage";
import ChatPage from "./components/ui/ChatPage";
import Explore from "./components/ui/Explore";
import { io } from "socket.io-client";

import './App.css';
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/socketslice";
import { setSocketInstance } from "./lib/socketInstance";

// Error Boundary Component
const ErrorBoundary = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ color: '#0095f6', textDecoration: 'none' }}>
        Go to Home
      </a>
    </div>
  );
};

// Simple test components
const SimpleLogin = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Login Page</h1>
    <p>This is a simple login page for testing.</p>
  </div>
);

const SimpleSignup = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Signup Page</h1>
    <p>This is a simple signup page for testing.</p>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/user/:id/profile", element: <Profile /> },
      { path: "/post/:id", element: <PostPage /> },
      { path: "/chat", element: <ChatPage /> },
      { path: "/explore", element: <Explore /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/test", element: <div>Test page works!</div> },
  { path: "*", element: <ErrorBoundary /> },
]);

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    let socket;

    if (user) {
      socket = io("https://instagram-clone-backend-nqcw.onrender.com", {
        query: { userId: user._id },
        withCredentials: true,
      });

      setSocketInstance(socket);

      socket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocketInstance(null);
      }
    };
  }, [user, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
