"use client";

import React, { useState } from "react";
import TodoList from "../../src/app/components/TodoList";
import ChatBox from "../../src/app/components/ChatBot";

export default function Home() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">AI Powered TO DO</h1>
        <ChatBox onNewTask={() => setRefresh(!refresh)} />
        <TodoList key={refresh ? "refresh" : "normal"} />
      </div>
    </div>
  );
}
