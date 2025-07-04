// App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from "./components/ui/Home";
import Login from "@/components/ui/Login";
import Signup from "@/components/ui/Signup";
import Profile from "@/components/ui/Profile";
import PostPage from "@/components/ui/PostPage";
import ChatPage from "@/components/ui/ChatPage";
import Explore from "./components/ui/Explore";
import { io } from "socket.io-client";

import './App.css';
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/socketslice";
import { setSocketInstance } from "./lib/socketInstance";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
