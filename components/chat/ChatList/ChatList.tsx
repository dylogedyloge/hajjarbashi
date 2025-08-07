import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from 'next-intl';
import ChatListItem from "./ChatListItem";

interface ChatListProps {
  chatList: any[];
  loadingChats: boolean;
  chatListError: string | null;
  deleteError: string | null;
  deletingChatId: number | null;
  onSelectChat: (conv: any) => void;
  onDeleteChat: (chatId: number) => void;
}

export default function ChatList({
  chatList,
  loadingChats,
  chatListError,
  deleteError,
  deletingChatId,
  onSelectChat,
  onDeleteChat
}: ChatListProps) {
  const t = useTranslations('ChatBox');

  return (
    <ScrollArea className="flex-1 h-full max-h-full">
      {loadingChats ? (
        <div className="text-center text-muted-foreground py-8">{t('loading')}</div>
      ) : chatListError ? (
        <div className="text-center text-red-500 py-8">{chatListError}</div>
      ) : chatList.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">{t('noMessages')}</div>
      ) : (
        <div className="divide-y">
          {chatList
            .sort((a, b) => {
              const dateA = a.last_message_created_at ? new Date(a.last_message_created_at).getTime() : 0;
              const dateB = b.last_message_created_at ? new Date(b.last_message_created_at).getTime() : 0;
              return dateB - dateA; // Sort newest first
            })
            .map((conv) => (
            <ChatListItem
              key={conv.id}
              conv={conv}
              deletingChatId={deletingChatId}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
            />
          ))}
          {deleteError && (
            <div className="text-center text-red-500 py-2">{deleteError}</div>
          )}
        </div>
      )}
    </ScrollArea>
  );
} 