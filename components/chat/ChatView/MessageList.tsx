import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from 'next-intl';
import MessageBubble from "./MessageBubble";
import { Message, Conversation } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  selected: Conversation;
  loadingMessages: boolean;
  messagesError: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageList({
  messages,
  selected,
  loadingMessages,
  messagesError,
  messagesEndRef
}: MessageListProps) {
  const t = useTranslations('ChatBox');

  return (
    <ScrollArea className="flex-1 min-h-0 p-4 space-y-3 ">
      {loadingMessages ? (
        <div className="text-center text-muted-foreground">{t('loading')}</div>
      ) : messagesError ? (
        <div className="text-center text-red-500">{messagesError}</div>
      ) : messages.length === 0 ? (
        <div className="text-center text-muted-foreground">{t('noMessages')}</div>
      ) : (
        [...messages]
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
          .map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              senderName={selected.name}
            />
          ))
      )}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
} 