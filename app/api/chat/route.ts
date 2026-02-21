const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { message: "Missing GEMINI_API_KEY in environment variables." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const messages = body?.messages as ChatMessage[] | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { message: "At least one message is required." },
        { status: 400 }
      );
    }

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const response = await fetch(`${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You are a concise and helpful productivity assistant inside a task dashboard.",
            },
          ],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return Response.json(
        {
          message:
            errorData?.error?.message || "Failed to get a response from AI service.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();

    if (!reply) {
      return Response.json(
        { message: "AI response was empty." },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { message: "Unexpected server error while generating AI response." },
      { status: 500 }
    );
  }
}