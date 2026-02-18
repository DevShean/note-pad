import { tasks, Task, saveStore } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return Response.json({ message: "Email required" }, { status: 400 });
  }

  const userTasks = tasks.filter(task => task.userEmail === email);

  return Response.json({ tasks: userTasks });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userEmail, title } = body;

  if (!userEmail || !title) {
    return Response.json(
      { message: "Email and title required" },
      { status: 400 }
    );
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    userEmail,
    title,
    completed: false,
  };

  console.log("POST - Creating task with ID:", newTask.id);

  tasks.push(newTask);
  
  saveStore();

  console.log("POST - Tasks array now has:", tasks.length, "tasks");
  console.log("POST - Task IDs:", tasks.map(t => t.id));

  return Response.json({ task: newTask });
}
