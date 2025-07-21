import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Minus, X } from "lucide-react";
import socket from "./socket";

interface ChatBoxProps {
  avatarUrl: string;
  name: string;
  company: string;
  open: boolean;
  onClose: () => void;
}

export function ChatBox({
  avatarUrl,
  name,
  company,
  open,
  onClose,
}: ChatBoxProps) {
  const [minimized, setMinimized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, minimized]);

  // Socket connection and listeners
  useEffect(() => {
    if (!open) return;
    // Connection status
    const handleConnect = () => {
      setConnected(true);
    };
    const handleDisconnect = () => {
      setConnected(false);
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Listen for incoming messages
    const handleReceive = (msg: any) => {
      setMessages((prev) => [...prev, { ...msg, self: false }]);
    };
    socket.on("receive_message", handleReceive);

    // Fetch chat history (replace with real API call)
    setLoading(true);
    // Example: fetch(`/api/chat/history?...`).then(...)
    setTimeout(() => {
      setMessages([
        {
          content: "Hello! How can I help you?",
          senderName: name,
          time: "09:00",
          self: false,
        },
        {
          content: "Hi, I am interested in your ad.",
          senderName: "You",
          time: "09:01",
          self: true,
        },
      ]);
      setLoading(false);
    }, 500);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleReceive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs cursor-pointer">
        <div className="bg-background rounded-lg shadow-lg w-full flex items-center p-2 gap-3 border">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{name}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMinimized(false)}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMinimized(false);
              onClose();
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;
    const msg = {
      content: input,
      senderName: "You",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      self: true,
    };
    setMessages((prev) => [...prev, msg]);
    socket.emit("send_message", { content: input }); // Add recipient/adId as needed
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
      <div className="bg-background rounded-lg shadow-lg w-full flex flex-col h-[500px]">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{name}</div>
            <div className="text-xs text-muted-foreground truncate">{company}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMinimized(true)}>
            <Minus className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.self ? "items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 shadow text-sm max-w-xs
                    ${msg.self ? "bg-secondary text-secondary-foreground" : "bg-card card-foreground"}
                  `}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {msg.self ? "You" : msg.senderName || name} • {msg.time || ""}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <form className="flex items-center gap-2 p-4 border-t bg-background" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connected ? "Type your message..." : "Connecting..."}
            className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!connected || loading}
          />
          <Button variant="default" type="submit" className="rounded-full" disabled={!connected || loading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
