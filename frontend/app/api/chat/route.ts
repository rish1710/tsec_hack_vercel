import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.GROK_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.GROK_MODEL || "grok-2-latest",
          messages: [
            {
              role: "system",
              content:
                "You are Murph, a calm, helpful, and encouraging learning guide. You specialize in explaining complex topics in simple, engaging ways. You provide clear explanations, ask clarifying questions when needed, and adapt your teaching style to the student's level. Be supportive and motivating.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.6,
          max_tokens: 1500,
        }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      console.error("Grok API error:", error);
      return NextResponse.json(
        { error: "Failed to get response from Grok AI" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "Murph is thinking…";

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
