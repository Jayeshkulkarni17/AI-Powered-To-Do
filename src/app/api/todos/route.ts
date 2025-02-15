import { NextResponse } from "next/server";
import { todosCollection, ensureDBConnection } from "../../utils/db";
import { ObjectId } from "mongodb";

// ✅ GET: Retrieve all tasks (including subtasks)
export async function GET() {
  await ensureDBConnection();
  const todos = await todosCollection.find().toArray();
  return NextResponse.json(todos);
}

// ✅ POST: Add a new task with optional subtasks
export async function POST(req: Request) {
  await ensureDBConnection();
  const { text, subtasks = [] } = await req.json();

  // Structure new task with subtasks
  const newTodo = {
    text,
    completed: false,
    createdAt: new Date(),
    subtasks: subtasks.map((subtask: string) => ({
      text: subtask,
      completed: false,
    })),
  };

  const result = await todosCollection.insertOne(newTodo);
  return NextResponse.json({ ...newTodo, _id: result.insertedId });
}

// ✅ PATCH: Update a task (Mark task/subtasks as completed or rename it)
export async function PATCH(req: Request) {
  await ensureDBConnection();
  const { text, completed, subtasks } = await req.json();

  const updateFields: any = {};
  if (completed !== undefined) updateFields.completed = completed;
  if (subtasks) {
    updateFields.subtasks = subtasks.map(
      (subtask: { text: string; completed: boolean }) => ({
        text: subtask.text,
        completed: subtask.completed,
      })
    );
  }

  const result = await todosCollection.updateOne(
    { text },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ message: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Updated successfully" });
}

export async function DELETE(req: Request) {
  await ensureDBConnection();
  const { text, subtask } = await req.json();

  if (subtask) {
    // ✅ Properly remove a specific subtask by matching its text
    const result = await todosCollection.updateOne(
      { text },
      { $pull: { subtasks: { text: { $eq: subtask } } } } // Ensure correct MongoDB syntax
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Subtask not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Subtask "${subtask}" deleted successfully`,
    });
  } else {
    // ✅ Delete the entire task
    const result = await todosCollection.deleteOne({ text });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  }
}
