"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type SpeechRecognitionResultLike = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionEventLike = { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const welcome: Message = {
  role: "assistant",
  content: "Hi! I'm the portfolio assistant. Ask me about the work, modeling services, or how to make a booking. You can also use the microphone to speak.",
};

export default function VoiceTextChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, busy]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  function speak(text: string) {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    const userMessage: Message = { role: "user", content };
    const next: Message[] = [...messages, userMessage].slice(-20);

    setMessages(next);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((message, index) => !(index === 0 && message === welcome)) }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error || "The assistant is temporarily unavailable.");

      const assistantMessage: Message = { role: "assistant", content: data.answer };
      const updated: Message[] = [...next, assistantMessage].slice(-20);
      setMessages(updated);
      speak(data.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function startListening() {
    setError("");
    if (typeof window === "undefined") return;
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not supported in this browser. You can still type a message.");
      return;
    }
    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) setInput((previous) => `${previous} ${transcript}`.trim());
    };
    recognition.onerror = () => {
      setListening(false);
      setError("Microphone input failed. Check browser microphone permission or type your message instead.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      setError("Could not start the microphone. Please try again.");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="portfolio-chatbot-root">
      {open && (
        <section className="portfolio-chat-panel" aria-label="AI portfolio assistant">
          <header className="portfolio-chat-header">
            <div className="portfolio-chat-avatar" aria-hidden="true">✳</div>
            <div className="portfolio-chat-heading"><strong>Portfolio assistant</strong><span><i /> Here to help</span></div>
            <button className="portfolio-chat-icon-button" type="button" aria-label={voiceEnabled ? "Mute spoken responses" : "Enable spoken responses"} title={voiceEnabled ? "Mute voice" : "Enable voice"} onClick={() => { setVoiceEnabled((value) => !value); window.speechSynthesis?.cancel(); }}>{voiceEnabled ? "◖))" : "◖×"}</button>
            <button className="portfolio-chat-icon-button" type="button" aria-label="Close chat" onClick={() => { setOpen(false); recognitionRef.current?.stop(); setListening(false); }}>×</button>
          </header>
          <div className="portfolio-chat-messages" aria-live="polite">
            {messages.map((message, index) => <div className={`portfolio-chat-message ${message.role}`} key={`${index}-${message.role}`}>{message.content}</div>)}
            {busy && <div className="portfolio-chat-message assistant portfolio-chat-typing"><span /><span /><span /></div>}
            <div ref={bottomRef} />
          </div>
          {error && <p className="portfolio-chat-error" role="alert">{error}</p>}
          <form className="portfolio-chat-form" onSubmit={onSubmit}>
            <button className={`portfolio-chat-mic ${listening ? "is-listening" : ""}`} type="button" aria-label={listening ? "Stop listening" : "Speak a message"} title={listening ? "Stop listening" : "Speak a message"} onClick={() => { if (listening) { recognitionRef.current?.stop(); setListening(false); } else startListening(); }}>{listening ? "■" : "🎙"}</button>
            <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} placeholder={listening ? "Listening…" : "Write a message…"} aria-label="Your message" />
            <button className="portfolio-chat-send" type="submit" disabled={busy || !input.trim()} aria-label="Send message">↑</button>
          </form>
          <p className="portfolio-chat-disclaimer">AI can make mistakes. Don’t share sensitive payment or wallet information.</p>
        </section>
      )}
      <button className={`portfolio-chat-launcher ${open ? "is-open" : ""}`} type="button" aria-label={open ? "Close portfolio assistant" : "Open portfolio assistant"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <span aria-hidden="true">×</span> : <><span className="portfolio-chat-launcher-spark" aria-hidden="true">✳</span><span className="portfolio-chat-launcher-label">Ask me</span></>}
      </button>
    </div>
  );
}
