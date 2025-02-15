import OpenAI from "openai";
import { NextResponse } from "next/server";
import { todosCollection, ensureDBConnection } from "../../utils/db";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { message } = await req.json();

  await ensureDBConnection();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant for a to-do list app. You can handle the following actions:
        - Add task: { "action": "add", "task": "task description", "subtasks": ["subtask1", "subtask2"] }
        - Update task: { "action": "update", "task": "new task description", "text": "existing task text" }
        - Delete task: { "action": "delete", "text": "task text" }
        - Complete task: { "action": "complete", "text": "task text" }
       - Complete subtask: { "action": "complete", "text": "subtask text" }

        
        If no valid action is found, respond with: { "action": null }.

        If the user greets you (e.g., "hi", "hello"), respond with a friendly message, NOT in JSON.`,
      },
      { role: "user", content: message },
    ],
  });

  try {
    const aiResponse = response.choices[0].message?.content?.trim() || "";

    // ✅ Check if response is valid JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (error) {
      return NextResponse.json({ reply: aiResponse }); // Handle non-JSON responses (e.g., greetings)
    }

    const { action, task, text, subtasks } = parsedResponse;

    if (action === "add" && task) {
      const newTodo = {
        text: task,
        completed: false,
        createdAt: new Date(),
        subtasks:
          subtasks?.map((subtask: string) => ({
            text: subtask,
            completed: false,
          })) || [],
      };

      const result = await todosCollection.insertOne(newTodo);
      return NextResponse.json({
        reply: `Task added: "${task}"`,
        task: { ...newTodo, _id: result.insertedId },
      });
    }

    if (action === "complete" && text) {
      const result = await todosCollection.updateOne(
        { "subtasks.text": text }, // Find the subtask by its text
        { $set: { "subtasks.$.completed": true } } // Mark it as completed
      );

      if (result.matchedCount > 0) {
        return NextResponse.json({
          reply: `Subtask "${text}" marked as completed.`,
        });
      } else {
        return NextResponse.json({ reply: "Subtask not found." });
      }
    }

    if (action === "delete" && text) {
      const result = await todosCollection.deleteOne({ text });

      if (result.deletedCount > 0) {
        return NextResponse.json({ reply: `Task "${text}" deleted.` });
      } else {
        return NextResponse.json({ reply: "Task not found." });
      }
    }

    return NextResponse.json({ reply: "No valid action found." });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ reply: "Failed to process the request." });
  }
}
