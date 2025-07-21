import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Minus, X } from "lucide-react";
import socket from "./socket";
import { useParams } from "next/navigation";

interface ChatBoxProps {
  avatarUrl: string;
  name: string;
  company: string;
  open: boolean;
  onClose: () => void;
  chatId: number;
  otherUserId: string;
}

type ChatMessage = {
  id: number;
  chat_id: number;
  sender_id: string;
  message: string;
  time: string;
  attachments?: string[];
  self?: boolean;
};

export function ChatBox({
  avatarUrl,
  name,
  company,
  open,
  onClose,
  chatId,
  otherUserId,
}: ChatBoxProps) {
  const [minimized, setMinimized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, minimized]);

  // Fetch messages and set up socket listeners
  useEffect(() => {
    if (!open || !chatId) return;
    setLoading(true);
    setError(null);
    // Fetch chat history
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    fetch(`https://api.hajjardevs.ir/messages/${chatId}?limit=50&page=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then((data) => {
        // Adjust this based on your backend's response structure
        setMessages(
          (data.messages || data.results || []).map((msg: ChatMessage) => ({
            ...msg,
            self: msg.sender_id === params.id,
          }))
        );
      })
      .catch((e) => setError(e.message || "Unknown error"))
      .finally(() => setLoading(false));

    // Socket connection status
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Join online tracking and mark as seen
    socket.emit("joinOnlineTrack", { id: otherUserId });
    socket.emit("seenMessage", { chat_id: chatId });

    // Listen for new messages
    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.chat_id === chatId) {
        setMessages((prev) => [...prev, { ...msg, self: msg.sender_id === params.id }]);
        // Mark as seen if chat is open
        socket.emit("seenMessage", { chat_id: chatId });
      }
    };
    socket.on("newMessage", handleNewMessage);

    // Listen for seen events
    const handleNewSeen = (data: { chat_id: number }) => {
      console.log("newSeen", data);
    };
    socket.on("newSeen", handleNewSeen);

    // Listen for online status
    const handleOnlineStatus = (data: { user_id: string; is_online: boolean }) => {
      if (data.user_id === otherUserId) setIsOnline(data.is_online);
    };
    socket.on(otherUserId, handleOnlineStatus);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newMessage", handleNewMessage);
      socket.off("newSeen", handleNewSeen);
      socket.off(otherUserId, handleOnlineStatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, chatId, otherUserId]);

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
      chat_id: chatId,
      message: input,
      attachments: [],
    };
    socket.emit("sendMessage", msg);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        chat_id: chatId,
        sender_id: params.id as string,
        message: input,
        time: new Date().toISOString(),
        self: true,
      },
    ]);
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
            <div className="text-xs text-green-600">{isOnline ? "Online" : "Offline"}</div>
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
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${msg.self ? "items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 shadow text-sm max-w-xs
                    ${msg.self ? "bg-secondary text-secondary-foreground" : "bg-card card-foreground"}
                  `}
                >
                  {msg.message}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {msg.self ? "You" : name} • {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
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
