"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function detectInitialLanguage(): "es" | "en" {
  if (typeof window === "undefined") return "es";
  const lang = window.navigator.language.toLowerCase();
  return lang.startsWith("en") ? "en" : "es";
}

function getInitialAssistantMessage(language: "es" | "en"): ChatMessage {
  return language === "en"
    ? {
        role: "assistant",
        content:
          "Hi, I'm the HI DESERT MOTORS assistant. I can help you with availability, prices, titles, mileage, and vehicle details.",
      }
    : {
        role: "assistant",
        content:
          "Hola, soy el asistente de HI DESERT MOTORS. Puedo ayudarte con disponibilidad, precios, títulos, millaje y detalles de los vehículos.",
      };
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const detected = detectInitialLanguage();
    setLanguage(detected);
    setMessages([getInitialAssistantMessage(detected)]);
  }, []);

  const placeholder = useMemo(() => {
    return language === "en"
      ? "Ask about a vehicle..."
      : "Pregunta por un vehículo...";
  }, [language]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function detectMessageLanguage(
    text: string,
    currentLanguage: "es" | "en"
  ): "es" | "en" {
    const lower = text.toLowerCase();

    const looksEnglish =
      /\b(the|price|clean|title|available|truck|car|miles|hello|hi|thanks|do you|what|how much)\b/i.test(
        lower
      );

    const looksSpanish =
      /\b(hola|precio|título|titulo|disponible|camioneta|carro|millas|gracias|cuánto|cuanto|quiero|busco)\b/i.test(
        lower
      );

    if (looksEnglish) return "en";
    if (looksSpanish) return "es";
    return currentLanguage;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextLanguage = detectMessageLanguage(text, language);
    if (nextLanguage !== language) {
      setLanguage(nextLanguage);
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };

    const pendingMessages = [...messages, userMessage];

    setMessages(pendingMessages);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: pendingMessages,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detail =
          data?.detail || data?.error || `HTTP ${res.status}: ${res.statusText}`;

        throw new Error(detail);
      }

      setMessages([
        ...pendingMessages,
        {
          role: "assistant",
          content:
            data?.reply ||
            (nextLanguage === "en"
              ? "I couldn't generate a response right now."
              : "No pude generar una respuesta en este momento."),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      setMessages([
        ...pendingMessages,
        {
          role: "assistant",
          content:
            nextLanguage === "en"
              ? `Sorry, something went wrong.\n\n${message}`
              : `Perdón, ocurrió un error.\n\n${message}`,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function resetChat() {
    setMessages([getInitialAssistantMessage(language)]);
    setInput("");
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AI chat"
        style={{
          position: "fixed",
          right: "18px",
          bottom: "18px",
          width: "58px",
          height: "58px",
          borderRadius: "999px",
          border: "none",
          background: "linear-gradient(135deg, #f5c542, #d88a00)",
          color: "#071018",
          fontWeight: 900,
          fontSize: "22px",
          cursor: "pointer",
          boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
          zIndex: 9999,
        }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: "18px",
            bottom: "86px",
            width: "360px",
            maxWidth: "calc(100vw - 24px)",
            height: "560px",
            maxHeight: "74vh",
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid rgba(216,138,0,0.12)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.24)",
            overflow: "hidden",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(180deg, #071018, #0b1622)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: "14px" }}>
                HI DESERT MOTORS AI
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>
                {language === "en" ? "Bilingual assistant" : "Asistente bilingüe"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={resetChat}
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  borderRadius: "999px",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {language === "en" ? "Reset" : "Reiniciar"}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  borderRadius: "999px",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "86%",
                  padding: "11px 13px",
                  borderRadius: "16px",
                  background:
                    message.role === "user"
                      ? "linear-gradient(135deg, #f5c542, #d88a00)"
                      : "#ffffff",
                  color: message.role === "user" ? "#071018" : "#1b2c42",
                  border:
                    message.role === "assistant"
                      ? "1px solid rgba(216,138,0,0.10)"
                      : "none",
                  lineHeight: 1.5,
                  fontSize: "14px",
                  whiteSpace: "pre-wrap",
                  boxShadow:
                    message.role === "assistant"
                      ? "0 8px 20px rgba(0,0,0,0.04)"
                      : "none",
                }}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "86%",
                  padding: "11px 13px",
                  borderRadius: "16px",
                  background: "#ffffff",
                  color: "#5b6b7f",
                  border: "1px solid rgba(216,138,0,0.10)",
                  fontSize: "14px",
                }}
              >
                {language === "en" ? "Typing..." : "Escribiendo..."}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "12px",
              borderTop: "1px solid rgba(216,138,0,0.10)",
              background: "#ffffff",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void sendMessage();
                }
              }}
              placeholder={placeholder}
              style={{
                flex: 1,
                height: "46px",
                borderRadius: "999px",
                border: "1px solid rgba(216,138,0,0.18)",
                padding: "0 14px",
                outline: "none",
                fontSize: "14px",
                color: "#0b1622",
                background: "#fffdf9",
              }}
            />

            <button
              onClick={() => void sendMessage()}
              disabled={loading}
              style={{
                minWidth: "52px",
                height: "46px",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(135deg, #f5c542, #d88a00)",
                color: "#071018",
                fontWeight: 900,
                fontSize: "18px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.65 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}