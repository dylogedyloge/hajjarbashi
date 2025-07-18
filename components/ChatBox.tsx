import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Minus, X } from "lucide-react";

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
            <div className="text-xs text-muted-foreground truncate">
              {company}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMinimized(true)}
          >
            <Minus className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted">
          {/* Placeholder messages */}
          <div className="flex flex-col items-start">
            <div className="bg-card card-foreground rounded-lg px-4 py-2 shadow text-sm max-w-xs">
              Hello! How can I help you?
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              John Doe • 09:00
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 shadow text-sm max-w-xs">
              Hi, I am interested in your ad.
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              You • 09:01
            </span>
          </div>
        </div>
        {/* Input Area */}
        <form className="flex items-center gap-2 p-4 border-t bg-background">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
          <Button variant="default" type="submit" className=" rounded-full">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
