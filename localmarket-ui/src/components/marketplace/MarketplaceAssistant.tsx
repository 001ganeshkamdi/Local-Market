import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  AlertCircle,
  Bot,
  Loader2,
  MapPin,
  PackageSearch,
  Send,
  Sparkles,
  Store,
  Tag,
} from "lucide-react";

import { chatWithAssistant } from "@/lib/api";

import type { AssistantChatResponse, Coordinates, Product, ShopSearchResult } from "@/types";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  products?: Product[];
  shops?: ShopSearchResult[];
  isError?: boolean;
};

type MarketplaceAssistantProps = {
  userLocation: Coordinates | null;
};

const quickSuggestions = [
  "Nearby electronics",
  "Cheapest products",
  "Trending shops",
  "Toys nearby",
];

const initialMessage: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content: "What are you looking for today?",
};

export function MarketplaceAssistant({ userLocation }: MarketplaceAssistantProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [loading, message]);

  const sendMessage = useCallback(
    async (value: string) => {
      const trimmedMessage = value.trim();
      if (!trimmedMessage || loading) {
        return;
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedMessage,
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setMessage("");
      setLoading(true);

      try {
        const result = await chatWithAssistant(trimmedMessage, userLocation);
        setMessages((currentMessages) => [
          ...currentMessages,
          toAssistantMessage(result),
        ]);
      } catch (error) {
        console.error(error);
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "I couldn't reach LocalMarket AI right now. Please try again in a moment.",
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, userLocation],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(message);
  }

  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div className="space-y-1">
          <span className="text-sm font-medium text-slate-500">
            LocalMarket AI
          </span>

          <h3 className="text-lg font-semibold text-slate-900">
            Shopping Assistant
          </h3>
        </div>

        <div className="flex size-10 items-center justify-center rounded-full bg-green-100 shadow-inner">
          <Sparkles className="size-5 text-green-700" />
        </div>
      </div>

      <div className="flex h-[650px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-5">
          {messages.map((chatMessage) => (
            <MessageBubble key={chatMessage.id} message={chatMessage} />
          ))}

          {loading ? <TypingIndicator /> : null}
          <div ref={scrollRef} />
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white/90 px-4 py-3 backdrop-blur">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void sendMessage(suggestion)}
              className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-green-500 focus-within:bg-white focus-within:shadow-sm">
            <input
              type="text"
              placeholder="Ask LocalMarket AI..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!canSend}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-md bg-green-700 px-4 py-3 text-white shadow-sm">
          <p className="whitespace-pre-line text-sm leading-6">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white shadow-sm">
        {message.isError ? <AlertCircle className="size-5" /> : <Bot className="size-5" />}
      </div>

      <div className="max-w-[85%] rounded-3xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
        <div className="space-y-3">
          <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
            {message.content}
          </p>

          {message.shops && message.shops.length > 0 ? (
            <div className="space-y-2">
              {message.shops.slice(0, 3).map((shop) => (
                <ShopSuggestion key={shop.shopId} shop={shop} />
              ))}
            </div>
          ) : null}

          {message.products && message.products.length > 0 ? (
            <div className="grid gap-2">
              {message.products.slice(0, 3).map((product) => (
                <ProductSuggestion key={product.productId} product={product} />
              ))}
            </div>
          ) : null}

          {!message.isError &&
          message.products &&
          message.shops &&
          message.products.length === 0 &&
          message.shops.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Try a product, category, price, or radius in one message.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ShopSuggestion({ shop }: { shop: ShopSearchResult }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Store className="size-4 shrink-0 text-green-700" />
            <h4 className="truncate text-sm font-semibold text-slate-900">
              {shop.shopName}
            </h4>
          </div>

          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="size-3.5" />
            {shop.distanceKm !== null ? `${shop.distanceKm} km away` : shop.location}
          </p>
        </div>

        {shop.lowestPrice !== null ? (
          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            {formatCurrency(shop.lowestPrice)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ProductSuggestion({ product }: { product: Product }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <PackageSearch className="size-4 shrink-0 text-slate-500" />
            <h4 className="truncate text-sm font-semibold text-slate-900">
              {product.productName}
            </h4>
          </div>

          <p className="truncate text-xs text-slate-500">
            {product.shopName}
            {product.distanceKm !== null ? ` • ${product.distanceKm} km` : ""}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          <Tag className="size-3" />
          {formatCurrency(product.price)}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white shadow-sm">
        <Bot className="size-5" />
      </div>

      <div className="rounded-3xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="size-4 animate-spin text-green-700" />
          LocalMarket AI is thinking...
        </div>
      </div>
    </div>
  );
}

function toAssistantMessage(response: AssistantChatResponse): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: response.response,
    products: response.products,
    shops: response.shops,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
