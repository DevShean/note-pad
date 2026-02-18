import { tasks, saveStore } from "@/lib/store";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { completed } = body;

  console.log("PUT - Looking for task ID:", id);
  console.log("PUT - Available tasks:", tasks.map(t => t.id));

  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    console.log("PUT - Task not found");
    return Response.json({ message: "Task not found" }, { status: 404 });
  }

  tasks[taskIndex].completed = completed;
  
  saveStore();

  return Response.json({ task: tasks[taskIndex] });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  console.log("DELETE - Looking for task ID:", id);
  console.log("DELETE - Available tasks:", tasks.map(t => t.id));

  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    console.log("DELETE - Task not found");
    return Response.json({ message: "Task not found" }, { status: 404 });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  console.log("DELETE - Task deleted successfully");
  
  saveStore();
  
  return Response.json({ message: "Task deleted", task: deletedTask }, { status: 200 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title } = body;

  console.log("PATCH - Looking for task ID:", id);
  console.log("PATCH - Available tasks:", tasks.map(t => t.id));

  if (!title || !title.trim()) {
    return Response.json({ message: "Title cannot be empty" }, { status: 400 });
  }

  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    console.log("PATCH - Task not found");
    return Response.json({ message: "Task not found" }, { status: 404 });
  }

  tasks[taskIndex].title = title.trim();
  
  saveStore();

  return Response.json({ task: tasks[taskIndex] });
}

