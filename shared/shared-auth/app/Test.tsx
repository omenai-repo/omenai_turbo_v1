import React from "react";

export default function Test({ handleClick }: { handleClick: () => void }) {
  return (
    <div>
      <button className="" onClick={handleClick}>
        Login
      </button>
    </div>
  );
}
