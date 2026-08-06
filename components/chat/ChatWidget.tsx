"use client";

/**
 * Keyword-matching support widget.
 *
 * It is not AI and does not pretend to be. Store facts — the free-delivery
 * threshold, accepted payment methods — come from `/config/`, because this
 * once quoted a ₦200,000 threshold against a configured ₦80,000 and offered
 * PayPal, which was never a payment method here.
 */
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getStoreConfig } from "@/lib/api/cart";
import type { StoreConfig } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

/**
 * Where this must not appear.
 *
 * It is a `fixed bottom-4 right-4 z-50` button mounted once in
 * `ClientProviders`, so it sits over every page in the application — including
 * the ones it has no business being on.
 *
 * That is not only untidy. It overlays the rightmost column of every
 * back-office table, which is where the row actions live, and on the driver's
 * screen it covers the "Couldn't deliver" button — at a gate, on a phone, in
 * the rain. The end-to-end suite found it by being unable to click a status
 * dropdown for forty-five seconds.
 *
 * It is a customer sales bot besides. Staff and drivers have nobody to ask.
 */
const HIDDEN_ON = ["/admin", "/driver"];

/**
 * Floating support widget, on customer-facing pages only.
 */
export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your Kuyash Farm assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  // The widget used to quote a ₦200,000 free-shipping threshold, PayPal as a
  // payment method and a flat ₦15,000 delivery fee — none of which were true.
  // Store facts come from /config/ now, so the bot and the checkout cannot
  // disagree about the same number.
  const [config, setConfig] = useState<StoreConfig | null>(null);
  useEffect(() => {
    void getStoreConfig().then(setConfig, () => setConfig(null));
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userName = user?.full_name?.split(" ")[0] || "Customer";

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate bot response based on user input
    const botResponse = generateBotResponse(inputMessage, userName, config);

    const botMessage: Message = {
      id: `bot_${Date.now()}`,
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // After every hook, never before: a conditional return above them changes
  // the hook order between renders, which React refuses at runtime.
  if (HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-primary text-white rounded-full p-3 sm:p-4 shadow-lg hover:bg-secondary transition-all duration-300 hover:scale-110 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />

          {/* Tooltip - hidden on mobile */}
          <span className="hidden sm:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with us
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-96 h-[calc(100vh-2rem)] sm:h-[600px] max-h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Kuyash Farm Support</h3>
                <p className="text-xs text-white/80">Online • Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2 -m-2"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-white border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setInputMessage(action.text)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-primary text-white rounded-full p-2 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Quick action buttons for common queries
 */
const quickActions = [
  { id: 1, label: "Order Status", text: "What's my order status?" },
  { id: 2, label: "Product Info", text: "Tell me about your products" },
  { id: 3, label: "Wholesale", text: "How do I apply for wholesale?" },
  { id: 4, label: "Shipping", text: "What are your shipping options?" },
];

/**
 * Generate contextual bot responses based on user input
 */
function generateBotResponse(
  userInput: string,
  userName: string,
  config: StoreConfig | null,
): string {
  const input = userInput.toLowerCase();

  // Order status queries
  if (input.includes("order") && (input.includes("status") || input.includes("track"))) {
    return `Hi ${userName}! To check your order status, please visit your Orders page in the navigation menu. You can track all your orders there with real-time updates. If you need specific help with an order, please share your order number.`;
  }

  // Product queries
  if (input.includes("product") || input.includes("vegetable") || input.includes("fruit") || input.includes("dairy")) {
    return `We offer a wide range of fresh farm products including:\n\n🥬 Vegetables - Tomatoes, Carrots, Lettuce, Bell Peppers\n🍎 Fruits - Strawberries, Apples, Bananas, Oranges\n🐔 Poultry - Free-range Chicken, Fresh Eggs\n🥛 Dairy - Fresh Milk, Organic Cheese\n🌾 Grains - Brown Rice, Organic Wheat\n🐟 Fishery - Fresh Tilapia, Catfish\n\nAll products are grown using sustainable farming practices. Browse our shop to see full details!`;
  }

  // Wholesale queries
  if (input.includes("wholesale") || input.includes("bulk")) {
    return `We offer wholesale pricing to approved business customers:\n\n✅ Bulk price breaks that apply automatically\n✅ Distributor tiers for multi-state coverage\n✅ Priority support\n\nTo apply, head to /become-wholesaler (or /become-distributor if you supply retailers). You'll need an account, since approval upgrades your account's pricing. We usually review within two business days.`;
  }

  // Shipping queries
  if (input.includes("ship") || input.includes("delivery") || input.includes("deliver")) {
    {
      const threshold = config
        ? formatPrice(Number(config.free_shipping_threshold))
        : null;
      return `Our shipping details:\n\n${
        threshold ? `📦 Free delivery on orders over ${threshold}\n` : ""
      }🚚 Delivery is calculated at checkout from your address\n⏱️ Delivery time: 2-5 business days\n🌍 We deliver across Nigeria\n\nYou'll see the exact delivery cost before you pay, and you can follow your order from the Orders page.`;
    }
  }

  // Payment queries
  if (input.includes("payment") || input.includes("pay")) {
    return `We accept:\n\n💳 Cards, bank transfer and USSD — securely through Paystack${
      config && !config.cod_enabled ? "" : "\\n💵 Cash on delivery"
    }\n\nWe never see or store your card details — Paystack handles that side entirely. Choose your method at checkout.`;
  }

  // Price queries
  if (input.includes("price") || input.includes("cost") || input.includes("expensive")) {
    return `Our prices vary by product and quantity. Retail customers see standard pricing, while verified wholesale customers automatically get bulk discounts when ordering 10+ units.\n\nVisit our shop to see current prices for all products. All prices are in Nigerian Naira (₦).`;
  }

  // Account queries
  if (input.includes("account") || input.includes("profile") || input.includes("login")) {
    return `You can manage your account from the user menu (top-right corner):\n\n👤 View/Edit Profile\n📍 Manage Shipping Addresses\n📦 View Order History\n🔄 Reorder Previous Orders\n\nIf you're having trouble logging in, please make sure you're using the correct email address.`;
  }

  // Greeting
  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return `Hello ${userName}! 👋 Welcome to Kuyash Integrated Farm. How can I assist you today? I can help with:\n\n• Product information\n• Order tracking\n• Wholesale applications\n• Shipping & delivery\n• Payment options\n\nWhat would you like to know?`;
  }

  // Thank you
  if (input.includes("thank")) {
    return `You're very welcome, ${userName}! 😊 If you have any other questions, I'm here to help. Have a great day!`;
  }

  // Contact
  if (input.includes("contact") || input.includes("phone") || input.includes("email")) {
    return `You can reach us through:\n\n📧 Email: support@kuyashfarm.com\n📱 Phone: +234 800 KUYASH (589274)\n⏰ Hours: Mon-Sat, 8AM-6PM WAT\n\nOr continue chatting with me here - I'm available 24/7!`;
  }

  // Default response
  return `Thanks for your message, ${userName}! I'm here to help with any questions about:\n\n• Our products and pricing\n• Order status and tracking\n• Wholesale applications\n• Shipping and delivery\n• Payment methods\n\nCould you please provide more details about what you need help with? Or try one of the quick action buttons below!`;
}
