import { NextRequest, NextResponse } from "next/server";
import { translateTexts } from "@/lib/gemini-client";

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLanguage } = await request.json();

    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return NextResponse.json({ error: "texts (array) and targetLanguage required" }, { status: 400 });
    }

    if (targetLanguage !== "hi" && targetLanguage !== "ur") {
      return NextResponse.json({ error: "targetLanguage must be 'hi' or 'ur'" }, { status: 400 });
    }

    const translations = await translateTexts(texts, targetLanguage);

    return NextResponse.json({ translations, language: targetLanguage });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Failed to translate" },
      { status: 500 }
    );
  }
}
