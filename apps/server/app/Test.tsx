"use client";
import React, { useState } from "react";
export default function Test() {
  const [loading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      credentials: "include",
    });
    const response = await res.json();
    console.log(response);
  };

  return (
    <div>
      <button className="" onClick={handleSubmit}>
        {loading ? "loading" : "Login"}
      </button>
    </div>
  );
}
