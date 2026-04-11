"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SmartCTAProps {
  variant?: "hero" | "nav" | "footer";
}

export default function SmartCTA({ variant = "hero" }: SmartCTAProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("mm_user_name");
    setIsLoggedIn(!!token);
    setUserName(name || "");
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  };

  if (!mounted) {
    // Prevent hydration mismatch — show neutral state until client loads
    if (variant === "nav") {
      return (
        <a href="/signup" style={navStyle}>
          Start for free →
        </a>
      );
    }
    if (variant === "footer") {
      return (
        <button onClick={() => router.push("/signup")} style={footerStyle}>
          Start for free — no card needed →
        </button>
      );
    }
    return (
      <button onClick={() => router.push("/signup")} style={heroStyle}>
        Start Your Journey →
      </button>
    );
  }

  if (variant === "nav") {
    return (
      <button onClick={handleClick} style={navStyle}>
        {isLoggedIn ? `Go to dashboard →` : "Start for free →"}
      </button>
    );
  }

  if (variant === "footer") {
    return (
      <button onClick={handleClick} style={footerStyle}>
        {isLoggedIn
          ? `Continue your journey, ${userName.split(" ")[0]} →`
          : "Start for free — no card needed →"}
      </button>
    );
  }

  // Hero variant
  return (
    <button onClick={handleClick} style={heroStyle}>
      {isLoggedIn ? `Continue your journey →` : "Start Your Journey →"}
    </button>
  );
}

const heroStyle: React.CSSProperties = {
  background: "var(--forest, #1E3A2F)",
  color: "var(--cream, #F5F0E8)",
  border: "none",
  borderRadius: "100px",
  padding: "16px 32px",
  fontSize: "16px",
  fontFamily: "DM Sans, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
  letterSpacing: "0.02em",
  transition: "all 0.2s ease",
};

const navStyle: React.CSSProperties = {
  background: "var(--forest, #1E3A2F)",
  color: "var(--cream, #F5F0E8)",
  border: "none",
  borderRadius: "100px",
  padding: "10px 22px",
  fontSize: "14px",
  fontFamily: "DM Sans, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
  transition: "all 0.2s ease",
};

const footerStyle: React.CSSProperties = {
  background: "var(--cream, #F5F0E8)",
  color: "var(--forest, #1E3A2F)",
  border: "none",
  borderRadius: "100px",
  padding: "18px 40px",
  fontSize: "16px",
  fontFamily: "DM Sans, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
  letterSpacing: "0.02em",
  transition: "all 0.2s ease",
};
