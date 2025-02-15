"use client";
import { useEffect, useState } from "react";

export default function TodoList() {
  interface Subtask {
    text: string;
    completed: boolean;
  }

  interface Todo {
    _id: string;
    text: string;
    completed: boolean;
    subtasks?: Subtask[];
  }

  const [todos, setTodos] = useState<Todo[]>([]);

  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const toggleTodo = async (id: string, completed: boolean) => {
    await fetch("/api/todos", {
      method: "PATCH",
      body: JSON.stringify({ id, completed: !completed }),
      headers: { "Content-Type": "application/json" },
    });
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await fetch("/api/todos", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    fetchTodos();
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-400 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">To-Do List</h2>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="flex flex-col mb-2 p-2 bg-white shadow-md rounded-lg hover:bg-gray-100 transition duration-300"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-black flex-1 cursor-pointer ${
                  todo.completed ? "line-through text-gray-500" : ""
                }`}
                onClick={() => toggleTodo(todo._id, todo.completed)}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo._id)}
                className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>

            {/* ✅ Fix: Render Subtasks Properly */}
            {todo.subtasks && todo.subtasks.length > 0 && (
              <ol className="list-decimal ml-6 mt-2 text-gray-600">
                {todo.subtasks.map((subtask, index) => (
                  <li key={index} className="flex items-center">
                    <span
                      className={`flex-1 ${
                        subtask.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {subtask.text}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
