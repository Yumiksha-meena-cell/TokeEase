"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Send,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { AI_PROMPTS } from "../data/mockData";

export const AiAssistantSection: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "guide"; text: string }>
  >([
    {
      sender: "guide",
      text: "Hello! I am TokeEase Guide. Ask me anything about how real estate, land plots, gold and bonds work on our testnet.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendPrompt = (question: string, answer: string) => {
    if (isTyping) return;
    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "guide", text: answer }]);
      setIsTyping(false);
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userText = inputVal.trim();
    setInputVal("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsTyping(true);

    const lower = userText.toLowerCase();
    let reply =
      "On TokeEase, every tokenised asset represents a simulated real-world asset. Smart contracts handle fractional transfers, simulated yield accrual, and custody records on the Sepolia testnet.";

    if (lower.includes("risk")) {
      reply =
        "Asset risk varies: Digital Gold (TGOLD) tracks physical gold rate models; Sample Bonds (TBOND) carry credit risk with an 8% coupon payout; Jaipur Flat (JFT) yields fluctuate with tenant occupancies; and Jaipur Plot (JPT) focuses on land appreciation. All assets are safely simulated for educational learning.";
    } else if (lower.includes("gold")) {
      reply =
        "Our Digital Gold (TGOLD) token represents fractional units of vaulted gold priced at ₹150 (0.00003 ETH). 1 token equals 0.01g without having to buy a whole bullion bar. Simulated asset for demo. No real reserves.";
    } else if (lower.includes("bond")) {
      reply =
        "Sample Bond (TBOND) is a simulated renewable energy corporate debt instrument with an 8% coupon payout, priced at ₹500 (0.0001 ETH) per token.";
    } else if (lower.includes("real estate") || lower.includes("flat") || lower.includes("house") || lower.includes("property") || lower.includes("plot")) {
      reply =
        "Jaipur Flat (JFT) models rental distributions from a prime 3BHK apartment in Vaishali Nagar, Jaipur. Jaipur Plot (JPT) models commercial-residential land appreciation in Jagatpura Extension, Jaipur. Both are priced at ₹500 (0.0001 ETH) per token.";
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "guide", text: reply }]);
      setIsTyping(false);
    }, 900);
  };

  const handleFocusChat = () => {
    inputRef.current?.focus();
  };

  return (
    <section id="toke-ease-guide" className="relative py-24 md:py-32 scroll-mt-20">
      {/* Background warm glow */}
      <div className="absolute top-1/2 right-10 w-[550px] h-[350px] bg-gradient-to-l from-amber-600/10 via-orange-500/5 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Interactive Chat Interface */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl bg-[#120f0d]/90 border border-amber-900/30 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col h-[520px]">
              {/* Chat Header */}
              <div className="p-4 px-5 border-b border-white/5 bg-[#16120f]/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#f6f5f0]">
                        TokeEase Guide
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                        AI Copilot
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8e887d] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Sandbox Ready · Plain Language
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#787268]">
                  v1.2-edu
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-sm">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.sender === "guide" && (
                      <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 leading-relaxed text-xs sm:text-sm ${
                        m.sender === "user"
                          ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none shadow-md shadow-amber-900/30"
                          : "bg-[#181411] text-[#eae6dd] border border-white/5 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-[#181411] border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Suggestion Chips */}
              <div className="p-3 border-t border-white/5 bg-[#14100e]/50">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#736e64] mb-2 px-1">
                  Suggested inquiries
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AI_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(item.question, item.answer)}
                      type="button"
                      disabled={isTyping}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/15 text-[#c7c1b5] hover:text-amber-200 border border-white/5 hover:border-amber-500/30 transition-all text-left whitespace-nowrap"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input Form */}
              <form
                onSubmit={handleCustomSubmit}
                className="p-3 bg-[#110e0c] border-t border-white/5 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask a question about tokenised assets..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#f6f5f0] placeholder-[#6b665c] focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 transition-colors"
                  aria-label="Send query"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Editorial Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-widest text-amber-400">
              <span>PLAIN LANGUAGE, NOT JARGON</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#f6f5f0] leading-[1.15]">
              Meet your investing guide.
            </h2>

            <p className="text-base text-[#a39e94] leading-relaxed">
              TokeEase Guide explains asset risks, ownership structures, and key
              terms in simple language before you make a simulated investment.
            </p>

            <p className="text-sm text-[#8c867c] leading-relaxed">
              No financial engineering jargon or obscure legal contracts. Ask about
              how gold custody works, what bond duration means for yield, or how
              real estate tenant dividend distributions are calculated in the prototype.
            </p>

            {/* CTA button */}
            <div className="pt-2">
              <button
                onClick={handleFocusChat}
                type="button"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-semibold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
              >
                <span>Ask TokeEase Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle Disclaimer */}
            <div className="pt-2 flex items-center gap-2 text-xs text-[#787268] font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500/60" />
              <span>Educational guidance only. Not financial advice.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
