"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useTranslations } from 'next-intl';
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  useChatList, 
  useDeleteChat, 
  useMessages, 
  useUploadAttachment, 
  useBlockUser, 
  useUnblockUser 
} from "@/hooks/useChat";
import socket from "@/utils/socket";
import { Conversation, InitialSelectedUser, Message } from "@/types/chat";
import ChatList from "@/components/chat/ChatList/ChatList";
import ChatHeader from "@/components/chat/ChatView/ChatHeader";
import MessageList from "@/components/chat/ChatView/MessageList";
import ChatInput from "@/components/chat/ChatView/ChatInput";

interface ChatBoxProps {
  onClose: () => void;
  initialSelectedUser?: InitialSelectedUser | null;
}

export default function ChatBox({ onClose, initialSelectedUser }: ChatBoxProps) {
  const t = useTranslations('ChatBox');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { token } = useAuth();
  
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // Real-time chat state
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Blocked state for the selected user
  const [youBlockedUser, setYouBlockedUser] = useState(false);
  const [userBlockedYou, setUserBlockedYou] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  // React Query hooks
  const chatListQuery = useChatList(token, locale);
  const deleteChatMutation = useDeleteChat();
  const messagesQuery = useMessages(selected?.id || null, token, locale);
  const uploadAttachmentMutation = useUploadAttachment();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  // Block/unblock handlers
  const handleBlockUser = async () => {
    setBlockError(null);
    const userId = selected?.userId;
    if (!userId || !token) {
      setBlockError('No user selected or not authenticated');
      return;
    }
    
    blockUserMutation.mutate(
      { userId, token, locale },
      {
        onSuccess: () => {
          setYouBlockedUser(true);
        },
        onError: (error) => {
          setBlockError(error instanceof Error ? error.message : 'Failed to block user');
        },
      }
    );
  };

  const handleUnblockUser = async () => {
    setBlockError(null);
    const userId = selected?.userId;
    if (!userId || !token) {
      setBlockError('No user selected or not authenticated');
      return;
    }
    
    unblockUserMutation.mutate(
      { userId, token, locale },
      {
        onSuccess: () => {
          setYouBlockedUser(false);
        },
        onError: (error) => {
          setBlockError(error instanceof Error ? error.message : 'Failed to unblock user');
        },
      }
    );
  };

  // Helper to get current user id from localStorage
  const getMyUserId = () => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed.id;
    } catch {
      return null;
    }
  };

  // Extract data from React Query hooks
  const chatList = chatListQuery.data || [];
  const loadingChats = chatListQuery.isLoading;
  const chatListError = chatListQuery.error?.message || null;
  const deleteError = deleteChatMutation.error?.message || null;
  const deletingChatId = deleteChatMutation.isPending ? selected?.id || null : null;

  // Select initial user if provided (from AdCreatorCard) ONLY on first mount
  useEffect(() => {
    if (initialSelectedUser && chatList.length > 0) {
      // Try to find the user in chatList
      const found = chatList.find(
        (c:any) => c.user_id === initialSelectedUser.userId || c.name === initialSelectedUser.name
      );
      if (found) {
        setSelected({
          id: found.id,
          name: found.name,
          avatarUrl: found.avatar,
          isOnline: found.is_online,
          lastMessage: found.message || "",
          lastTime: found.last_message_created_at ? new Date(found.last_message_created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          messages: [], // Will fetch messages later
          userId: found.user_id,
        });
        setMessages([]);
      } else {
        setSelected(null);
      }
    }
  }, [initialSelectedUser, chatList]);

  // Track selected state changes for debugging
  useEffect(() => {
    // Removed console.log
  }, [selected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selected]);

  // Socket setup for real-time chat
  useEffect(() => {
    if (!selected) return;
    
    setConnected(socket.connected);
    // Listen for connect/disconnect
    const handleConnect = () => {
      setConnected(true);
    };
    const handleDisconnect = () => {
      setConnected(false);
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      const myUserId = getMyUserId();
      const senderType = msg.msg_sender_id === myUserId ? 'me' : 'them';
      if (msg.chat_id === selected.id) {
        setMessages((prev) => [...prev, {
          id: msg.id || Date.now(),
          chat_id: msg.chat_id,
          sender: senderType,
          text: msg.message,
          time: msg.time || new Date().toISOString(),
          attachments: msg.attachments,
          seen: msg.seen,
        }]);
        // Mark as seen
        socket.emit("seenMessage", { chat_id: selected.id });
      }
    };
    socket.on("newMessage", handleNewMessage);

    // Listen for seen events
    const handleNewSeen = (data: any) => {
      // Handle seen events if needed
      console.log('newSeen', data);
    };
    socket.on("newSeen", handleNewSeen);

    // Track online status of the other user
    const selectedUserId = selected.userId || (initialSelectedUser && typeof initialSelectedUser === 'object' ? initialSelectedUser.userId : undefined);
    if (selected && selectedUserId) {
      socket.emit("joinOnlineTrack", { id: selectedUserId });
      const handleOnlineStatus = (data: any) => {
        if (data.user_id === selectedUserId) setIsOnline(data.is_online);
      };
      socket.on(selectedUserId, handleOnlineStatus);
    }

    // Mark all messages as seen when chat is opened
    socket.emit("seenMessage", { chat_id: selected.id });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newMessage", handleNewMessage);
      socket.off("newSeen", handleNewSeen);
      if (selected && selectedUserId) {
        socket.off(selectedUserId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Process messages from React Query
  useEffect(() => {
    if (messagesQuery.data?.data && selected) {
      const myUserId = getMyUserId();
      const msgs = messagesQuery.data;
      
      // Handle blocked user states from API response
      if (msgs?.data) {
        const { you_blocked_user, user_blocked_you } = msgs.data;
        setYouBlockedUser(!!you_blocked_user);
        setUserBlockedYou(!!user_blocked_you);
      }
      
      // Ensure messages is an array before mapping
      const messagesArray = Array.isArray(msgs?.data?.messages) ? msgs.data.messages : [];
      
      setMessages(
        messagesArray.map((msg: any) => ({
          id: msg.id,
          chat_id: selected.id,
          sender: msg.maker_id === myUserId ? "me" : "them",
          text: msg.message,
          time: msg.time
            ? msg.time
            : msg.created_at
              ? new Date(typeof msg.created_at === 'number' ? msg.created_at : parseInt(msg.created_at)).toISOString()
              : new Date().toISOString(),
          attachments: msg.attachments,
          seen: msg.seen,
        }))
      );
    }
  }, [messagesQuery.data, selected]);

  // Send message handler (real-time)
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !selected || !connected) return;
    const msg = {
      chat_id: selected.id,
      message: input,
      attachments: [],
    };
    socket.emit("sendMessage", msg);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        chat_id: selected.id,
        sender: "me",
        text: input,
        time: new Date().toISOString(),
      },
    ]);
    setInput("");
  };





  // Delete chat handler
  const handleDeleteChat = async (chatId: number) => {
    if (!token) return;
    
    deleteChatMutation.mutate(
      { chatId, token, locale },
      {
        onSuccess: () => {
          // If we're deleting the currently selected chat, go back to list
          if (selected?.id === chatId) {
            setSelected(null);
            setMessages([]);
          }
        },
        onError: (error) => {
          console.error('Failed to delete chat:', error);
        },
      }
    );
  };

  const handleBackToList = () => {
    setSelected(null);
    setMessages([]);
    // fetchChatList will be triggered by useEffect when selected becomes null
  };

  return (
    <Card className="w-full max-w-md h-[500px] shadow-lg  flex flex-col mt-auto">
      {/* Header */}
      {!selected && (
        <div className="flex items-center gap-3 p-4 border-b bg-background">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-lg">{t('chats')}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </div>
      )}
      
      {/* Chat List View */}
      {!selected && (
        <ChatList
          chatList={chatList}
          loadingChats={loadingChats}
          chatListError={chatListError}
          deleteError={deleteError}
          deletingChatId={deletingChatId}
                     onSelectChat={(conv) => {
             setSelected({
               id: conv.id,
               name: conv.name,
               avatarUrl: conv.avatar,
               isOnline: conv.is_online,
               lastMessage: conv.message || "",
               lastTime: conv.last_message_created_at ? new Date(conv.last_message_created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
               messages: [],
               userId: conv.user_id,
             });
             setMessages([]);
             // Reset blocked state when selecting a new chat
             setYouBlockedUser(false);
             setUserBlockedYou(false);
           }}
          onDeleteChat={handleDeleteChat}
        />
      )}
      
      {/* Chat View */}
      {selected && (
        <>
                     <ChatHeader
             selected={selected}
             isOnline={isOnline}
             youBlockedUser={youBlockedUser}
             userBlockedYou={userBlockedYou}
             onBackToList={handleBackToList}
             onClose={onClose}
             onBlockUser={handleBlockUser}
             onUnblockUser={handleUnblockUser}
           />
          
          <MessageList
            messages={messages}
            selected={selected}
            loadingMessages={messagesQuery.isLoading}
            messagesError={messagesQuery.error?.message || null}
            messagesEndRef={messagesEndRef}
          />
          
          {/* Input Area */}
          {userBlockedYou ? (
            <div className="flex flex-col items-center justify-center p-4 border-t bg-background text-destructive text-sm font-medium">
              {t('userBlockedYou') || 'This user has blocked you. You cannot send messages to them.'}
              {blockError && <span className="text-xs text-red-500 mt-2">{blockError}</span>}
            </div>
          ) : youBlockedUser ? (
            <div className="flex flex-col items-center justify-center p-4 border-t bg-background text-destructive text-sm font-medium">
              {t('youBlockedUser') || 'You have blocked this user. Unblock to continue chatting.'}
              {blockError && <span className="text-xs text-red-500 mt-2">{blockError}</span>}
            </div>
          ) : (
                      <ChatInput
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onAttachFile={async (file) => {
              setAttachmentError(null);
              if (!token || !selected) return;
              
              uploadAttachmentMutation.mutate(
                { chatId: selected.id, file, token, locale },
                {
                  onSuccess: (data) => {
                    const attachmentMsg = {
                      chat_id: selected.id,
                      message: '',
                      attachments: [data.media_path],
                    };
                    socket.emit("sendMessage", attachmentMsg);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        chat_id: selected.id,
                        sender: "me",
                        text: '',
                        time: new Date().toISOString(),
                        attachments: [data.media_path],
                      },
                    ]);
                  },
                  onError: (error) => {
                    setAttachmentError(error instanceof Error ? error.message : 'Failed to upload attachment');
                    console.error('[ChatBox] Attachment upload error:', error);
                  },
                }
              );
            }}
            onSendVoice={async (audioBlob) => {
              setAttachmentError(null);
              if (!token || !selected) return;
              
              const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: audioBlob.type });
              uploadAttachmentMutation.mutate(
                { chatId: selected.id, file, token, locale },
                {
                  onSuccess: (data) => {
                    const voiceMsg = {
                      chat_id: selected.id,
                      message: '',
                      attachments: [data.media_path],
                    };
                    socket.emit("sendMessage", voiceMsg);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        chat_id: selected.id,
                        sender: "me",
                        text: '',
                        time: new Date().toISOString(),
                        attachments: [data.media_path],
                      },
                    ]);
                  },
                  onError: (error) => {
                    setAttachmentError(error instanceof Error ? error.message : 'Failed to upload voice message');
                    console.error('[ChatBox] Voice message upload error:', error);
                  },
                }
              );
            }}
            uploadingAttachment={uploadAttachmentMutation.isPending}
            attachmentError={attachmentError}
            connected={connected}
          />
          )}
        </>
      )}
    </Card>
  );
} 