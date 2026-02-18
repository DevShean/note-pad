import { users, User, saveStore } from "@/lib/users";

export async function POST(req: Request) {
  const body: User = await req.json();
  const { email, password } = body;

  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return Response.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  users.push({ email, password });
  
  saveStore();

  return Response.json({ message: "User registered successfully" });
}
