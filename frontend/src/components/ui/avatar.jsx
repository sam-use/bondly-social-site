// Avatar.jsx
import React from "react";
import "./Avatar.css"; // 👈 import the CSS file

export function Avatar({ className = "", children }) {
  return (
    <div className={`avatar-container ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = "avatar" }) {
  const fallbackUrl = "https://ui-avatars.com/api/?name=User&background=random";
  const isValidSrc = src && src.startsWith("http");

  return (
    <img
      src={isValidSrc ? src : fallbackUrl}
      alt={alt}
      className="avatar-image"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = fallbackUrl;
      }}
    />
  );
}

export function AvatarFallback({ children }) {
  return (
    <div className="avatar-fallback">
      {children}
    </div>
  );
}
