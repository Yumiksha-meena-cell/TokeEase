import { NextResponse } from "next/server";
import { getRiskFallback } from "../../../lib/riskFallback";

const RISK_MAP: Record<string, string> = {
  "Real Estate": "liquidity, valuation, regulatory, and tenant concentration risk",
  RealEstate: "liquidity, valuation, regulatory, and tenant concentration risk",
  "Land Plot": "liquidity, valuation, title dispute and encroachment, and regulatory risk",
  Plot: "liquidity, valuation, title dispute and encroachment, and regulatory risk",
  Gold: "price volatility, custody and storage, physical redemption, and regulatory risk",
  Bond: "credit or default, interest-rate fluctuation, liquidity, and regulatory risk",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assetName, assetType } = body;

    if (!assetType || typeof assetType !== "string") {
      return NextResponse.json(
        { error: "assetType is required (Real Estate, Land Plot, Gold, Bond)" },
        { status: 400 }
      );
    }

    const cleanType = assetType.trim();
    const cleanName = (assetName || cleanType).slice(0, 80);

    const riskList = RISK_MAP[cleanType] || "market volatility, liquidity, and regulatory risk";

    const apiKey = process.env.LLM_API_KEY;
    const apiUrl = process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";
    const model = process.env.LLM_MODEL || "gpt-4o-mini";

    // If no LLM API key is configured in the environment, return fallback gracefully
    if (!apiKey) {
      const fallback = getRiskFallback(cleanType, cleanName);
      return NextResponse.json({ text: fallback, isFallback: true });
    }

    const prompt = `You are a financial education assistant for beginners in India. Explain in plain English, under 120 words, the main risks of investing in a fractional token of ${cleanType} called "${cleanName}": ${riskList}. Do not give investment advice. End with: This is educational, not financial advice.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an objective financial education assistant for first-time retail investors.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 220,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LLM provider responded with status ${response.status}`);
      }

      const data = await response.json();
      const generatedText =
        data.choices?.[0]?.message?.content?.trim() ||
        getRiskFallback(cleanType, cleanName);

      return NextResponse.json({ text: generatedText, isFallback: false });
    } catch (llmErr) {
      clearTimeout(timeoutId);
      // Return static fallback on LLM network or quota failure
      const fallback = getRiskFallback(cleanType, cleanName);
      return NextResponse.json({ text: fallback, isFallback: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process risk explanation request" },
      { status: 500 }
    );
  }
}
