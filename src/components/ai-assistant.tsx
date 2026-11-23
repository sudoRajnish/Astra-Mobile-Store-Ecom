"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Bot, ChevronDown, LoaderCircle, MessageCircle, Send, Trash2, X } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };
type ChatProduct = { name: string; slug: string; brand: string; price: number; color: string; ram: string; storage: string; inStock: boolean };
const welcome = "Hey! Welcome to ASTRA MOBILE. I'm your AI shopping assistant. How can I help you find your perfect smartphone?";
const suggestions = ["Find a gaming phone", "Recommend a camera phone", "Find a phone under 20,000", "Compare smartphones"];
const subscribeToHydration = () => () => {};
const getHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function AiAssistant() {
  const portalReady = useSyncExternalStore(subscribeToHydration, getHydrationSnapshot, getServerHydrationSnapshot);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: welcome }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<ChatProduct[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, products]);

  function closeChat() {
    if (!open || closing) return;
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, 170);
  }

  async function sendMessage(value = input, retry = false) {
    const text = value.trim();
    if (!text || loading) return;
    const next = retry && messages.at(-1)?.role === "user" ? messages : [...messages, { role: "user" as const, text }];
    setMessages(next); setInput(""); setLoading(true); setError(""); setProducts([]);
    try {
      const completed = (retry ? messages.slice(0, -1) : messages).filter((item, index) => !(index === 0 && item.role === "assistant" && item.text === welcome));
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history: completed.slice(-12).map(({ role, text: content }) => ({ role, content })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ASTRA AI is unavailable. Please try again.");
      setMessages([...next, { role: "assistant", text: data.reply }]); setProducts(data.products || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reach ASTRA AI. Please try again."); }
    finally { setLoading(false); }
  }

  function reset() { setMessages([{ role: "assistant", text: welcome }]); setProducts([]); setError(""); setInput(""); }
  function submit(event: FormEvent) { event.preventDefault(); void sendMessage(); }

  if (!portalReady) return null;

  return createPortal(<div className="astra-ai-root">
    {open && <section className={`astra-ai-window${closing ? " closing" : ""}`} aria-label="ASTRA AI shopping assistant">
      <header className="astra-ai-header"><span className="astra-ai-avatar"><Bot size={19}/></span><span className="astra-ai-heading"><strong>ASTRA AI</strong><small><i/> Your shopping assistant</small></span><button title="Clear conversation" aria-label="Clear conversation" onClick={reset}><Trash2 size={17}/></button><button title="Minimize chat" aria-label="Minimize chat" onClick={closeChat}><ChevronDown size={20}/></button></header>
      <div className="astra-ai-messages" aria-live="polite">{messages.map((message, index) => <div className={`astra-ai-message ${message.role}`} key={`${index}-${message.role}`}><span className="astra-ai-message-icon">{message.role === "assistant" ? <Bot size={15}/> : "You"}</span><p>{message.text}</p></div>)}
        {products.length > 0 && <div className="astra-ai-product-list">{products.map((product) => <a key={`${product.slug}-${product.ram}-${product.storage}-${product.color}`} className="astra-ai-product" href={`/products/${encodeURIComponent(product.slug)}`}><span><b>{product.brand} {product.name}</b><small>{[product.ram, product.storage, product.color].filter(Boolean).join(" / ")}</small></span><strong>INR {product.price.toLocaleString("en-IN")}</strong><small className={product.inStock ? "astra-ai-stock" : "astra-ai-out-stock"}>{product.inStock ? "In stock" : "Out of stock"}</small></a>)}</div>}
        {messages.length === 1 && <div className="astra-ai-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void sendMessage(suggestion)}>{suggestion}</button>)}</div>}
        {loading && <div className="astra-ai-typing"><LoaderCircle size={16}/> Finding the right answer…</div>}
        {error && <div className="astra-ai-error" role="alert"><span>{error}</span><button onClick={() => { const last = [...messages].reverse().find((item) => item.role === "user"); if (last) void sendMessage(last.text, true); }}>Retry</button></div>}
        <div ref={endRef}/>
      </div>
      <form className="astra-ai-form" onSubmit={submit}><input aria-label="Message ASTRA AI" placeholder="Ask about phones, features, budget…" value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000} disabled={loading}/><button aria-label="Send message" disabled={loading || !input.trim()}><Send size={17}/></button></form><div className="astra-ai-disclaimer">Recommendations use live store listings. AI can make mistakes.</div>
    </section>}
    <button className={`astra-ai-launcher${open ? " active" : ""}`} aria-label={open ? "Close ASTRA AI" : "Chat with ASTRA AI"} onClick={() => open ? closeChat() : setOpen(true)}>{open ? <X size={23}/> : <><MessageCircle size={22}/><span>Ask ASTRA AI</span></>}</button>
  </div>, document.body);
}
