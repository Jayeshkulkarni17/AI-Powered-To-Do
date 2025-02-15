"use client";
import { useState } from "react";

export default function ChatBox({ onNewTask }: { onNewTask: () => void }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setReply(data.reply);
    onNewTask(); // Refresh the task list after adding a new task
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-400 shadow-lg rounded-lg mt-4">
      <textarea
        className="w-full p-2 border rounded text-black"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask AI to manage tasks..."
      />
      <button
        onClick={sendMessage}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
      <p className="mt-2 text-gray-700">AI: {reply}</p>
    </div>
  );
}
