import { MongoClient, ObjectId, Collection } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
}

export const db = client.db("todoDB");

export const todosCollection: Collection<Todo> = db.collection<Todo>("todos");

export interface Todo {
  _id?: ObjectId;
  text: string;
  completed: boolean;
  createdAt: Date;
  subtasks?: Subtask[];
}

export interface Subtask {
  text: string;
  completed: boolean;
}

export async function ensureDBConnection() {
  await connectDB();
}
