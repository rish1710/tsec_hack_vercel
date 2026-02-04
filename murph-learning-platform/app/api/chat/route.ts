import { NextResponse } from "next/server"

const GROK_BASE_URL = process.env.GROK_BASE_URL || "https://api.x.ai/v1"
const GROK_MODEL = process.env.GROK_MODEL || "grok-2-latest"

const SYSTEM_PROMPT = `You are Murph, a calm, helpful, and encouraging learning guide for the Murph pay-per-minute learning platform.

Your role:
- Help students understand concepts clearly and patiently
- Break down complex topics into digestible parts
- Encourage curiosity and questions
- Provide examples and analogies when helpful
- Be supportive but also challenge students to think critically
- Keep responses concise but thorough - students pay per minute

Style:
- Warm and approachable
- Clear and well-structured explanations
- Use markdown formatting for code, lists, and emphasis when appropriate
- Ask clarifying questions if the student's query is ambiguous`

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json()

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json(
        { error: "Grok API key not configured" },
        { status: 500 }
      )
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 1024,
      }),
    })

    if (!res.ok) {
      const errorData = await res.text()
      console.error("Grok API error:", errorData)
      return NextResponse.json(
        { error: "Failed to get response from Murph" },
        { status: res.status }
      )
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? "Let me think about that..."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
