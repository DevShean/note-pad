import { users } from "@/lib/users";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const body: LoginBody = await req.json();
  const { email, password } = body;

  const user = users.find(
    user => user.email === email && user.password === password
  );

  if (!user) {
    return Response.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  return Response.json({ message: "Login successful" });
}
