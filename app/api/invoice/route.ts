import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Dummy AI response — full OpenAI Agents SDK implementation coming in next phase
  await new Promise((r) => setTimeout(r, 800));

  return NextResponse.json({
    message:
      "I'm your AI invoice assistant! Full AI-powered editing is coming soon. For now, use the settings panel on the right to customize your invoice.",
    data: {},
  });
}
