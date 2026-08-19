"use client";

import { useState, useRef, useEffect } from "react";
import { X, Leaf, User as UserIcon, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { id: 1, label: "Order Status", text: "What's my order status?" },
  { id: 2, label: "Our Products", text: "Tell me about your products" },
  { id: 3, label: "Wholesale", text: "How do I apply for wholesale?" },
  { id: 4, label: "Shipping", text: "What are your delivery options?" },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm the Kuyash Farm assistant. Ask me about our products, orders, wholesale or delivery.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const currentUser = getCurrentUser();
    const userName = currentUser?.name || "there";

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 700));

    const botMessage: Message = {
      id: `bot_${Date.now()}`,
      text: generateBotResponse(inputMessage, userName),
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ── Trigger button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 bg-[#080f0a] hover:bg-[#2d5f3f] text-white pl-4 pr-5 py-3 rounded-full shadow-xl transition-all duration-300"
          >
            <div className="w-6 h-6 rounded-full bg-[#2d5f3f] group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-sans font-semibold text-sm">Chat with us</span>
            {/* live dot */}
            <span className="w-2 h-2 rounded-full bg-[#6b9d7a] animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[440px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e8ede9]"
          >

            {/* Header */}
            <div className="bg-[#080f0a] px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2d5f3f] flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-serif font-bold text-white text-sm leading-none">Kuyash Farm</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6b9d7a]" />
                    <p className="text-white/45 text-[10px] font-sans">Online — replies instantly</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf8f5]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "bot" && (
                    <div className="w-6 h-6 rounded-lg bg-[#2d5f3f] flex items-center justify-center shrink-0 mb-0.5">
                      <Leaf className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                      message.sender === "user"
                        ? "bg-[#2d5f3f] text-white rounded-br-sm"
                        : "bg-white text-[#080f0a] rounded-bl-sm border border-[#e8ede9]"
                    }`}
                  >
                    <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-[10px] mt-1 font-mono ${message.sender === "user" ? "text-white/50" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="w-6 h-6 rounded-lg bg-[#eef5f1] border border-[#c6dece] flex items-center justify-center shrink-0 mb-0.5">
                      <UserIcon className="w-3 h-3 text-[#2d5f3f]" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-[#2d5f3f] flex items-center justify-center shrink-0">
                    <Leaf className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white border border-[#e8ede9] rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map((delay) => (
                        <div
                          key={delay}
                          className="w-1.5 h-1.5 bg-[#6b9d7a] rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div className="px-3 py-2 bg-white border-t border-[#e8ede9] shrink-0">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setInputMessage(action.text)}
                    className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-[#2d5f3f] bg-[#eef5f1] hover:bg-[#c6dece] border border-[#c6dece] px-3 py-1.5 rounded-full transition-colors duration-200 whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-3 py-3 bg-white border-t border-[#e8ede9] shrink-0">
              <div className="flex items-center gap-2 bg-[#faf8f5] border border-[#e8ede9] rounded-full px-3 py-1.5 focus-within:border-[#2d5f3f] transition-colors duration-200">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent text-sm font-sans text-[#080f0a] placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  aria-label="Send message"
                  className="w-7 h-7 rounded-full bg-[#2d5f3f] hover:bg-[#4a7c59] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function generateBotResponse(userInput: string, userName: string): string {
  const input = userInput.toLowerCase();

  if (input.includes("order") && (input.includes("status") || input.includes("track"))) {
    return `To check your order status, visit the Orders page from the navigation menu. You can track all orders there in real time. If you need help with a specific order, share your order number and I'll assist you.`;
  }

  if (input.includes("product") || input.includes("vegetable") || input.includes("fruit") || input.includes("fish") || input.includes("poultry")) {
    return `We grow a wide range of farm produce at our Nasarawa farm:\n\nCrops & Vegetables — tomatoes, peppers, greens\nPoultry — free-range chicken, fresh eggs\nAquaculture — catfish, tilapia\nLivestock — cattle, sheep\nProcessed goods — packaged farm products\n\nBrowse our shop to see current availability and pricing.`;
  }

  if (input.includes("wholesale") || input.includes("bulk")) {
    return `We offer wholesale pricing for verified business buyers.\n\nTo apply:\n1. Go to "Become a Distributor" in the menu\n2. Fill out the business application\n3. Our team reviews within 1-2 business days\n4. Once approved, wholesale prices apply automatically.\n\nWould you like more details?`;
  }

  if (input.includes("ship") || input.includes("delivery") || input.includes("deliver")) {
    return `We deliver across Nigeria.\n\nFree delivery on orders over ₦200,000\nStandard shipping — ₦15,000\nDelivery time — 2 to 5 business days\nCash on delivery is available.\n\nYou can track your delivery in real time after checkout.`;
  }

  if (input.includes("payment") || input.includes("pay")) {
    return `We accept card payments, bank transfer and cash on delivery. All online payments are SSL secured. You can choose your preferred method at checkout.`;
  }

  if (input.includes("academy") || input.includes("training") || input.includes("course") || input.includes("learn")) {
    return `The Kuyash Academy offers NABTEB-certified agricultural training programmes — from crop production and aquaculture to agribusiness management.\n\nVisit the Academy page from the navigation menu to browse all 20+ programmes and enrol.`;
  }

  if (input.includes("farm") || input.includes("location") || input.includes("visit") || input.includes("nasarawa")) {
    return `Our farm is located in Nasarawa State, Nigeria — 56 hectares of integrated farmland.\n\nWe welcome visitors, partners and institutions. Reach us at hello@kuyashfarm.com to schedule a visit or partnership discussion.`;
  }

  if (input.includes("contact") || input.includes("phone") || input.includes("email")) {
    return `You can reach us at:\n\nEmail — hello@kuyashfarm.com\nPhone — +234 800 000 0000\nHours — Monday to Saturday, 8AM to 6PM\n\nOr keep chatting here — I'm available around the clock.`;
  }

  if (input.includes("hello") || input.includes("hi") || input.includes("hey") || input.includes("good")) {
    return `Hello ${userName}! Welcome to Kuyash Integrated Farm. I can help with our products, orders, wholesale, delivery or the Academy. What would you like to know?`;
  }

  if (input.includes("thank")) {
    return `You're welcome, ${userName}. If you need anything else, I'm right here.`;
  }

  return `Thanks for your message. I can help with our products and pricing, order tracking, wholesale applications, delivery and the Kuyash Academy.\n\nCould you give me a bit more detail about what you need? Or use one of the quick buttons above.`;
}
