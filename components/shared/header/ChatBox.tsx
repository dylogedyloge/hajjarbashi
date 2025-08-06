"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useTranslations } from 'next-intl';
import { useParams } from "next/navigation";
import { getChatList, deleteChat as deleteChatApi, getMessages, uploadAttachment, blockUser, unblockUser } from "@/lib/chat";
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
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatList, setChatList] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chatListError, setChatListError] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // Real-time chat state
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Blocked state for the selected user
  const [youBlockedUser, setYouBlockedUser] = useState(false);
  const [userBlockedYou, setUserBlockedYou] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  // Block/unblock handlers
  const handleBlockUser = async () => {
    setBlockError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const lang = locale;
      const userId = selected?.userId;
      if (!userId) throw new Error('No user selected');
      await blockUser({ userId, token: token || '', lang });
      setYouBlockedUser(true);
    } catch (err: any) {
      setBlockError(err.message || 'Failed to block user');
    }
  };
  const handleUnblockUser = async () => {
    setBlockError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const lang = locale;
      const userId = selected?.userId;
      if (!userId) throw new Error('No user selected');
      await unblockUser({ userId, token: token || '', lang });
      setYouBlockedUser(false);
    } catch (err: any) {
      setBlockError(err.message || 'Failed to unblock user');
    }
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

  // Fetch chat list from API
  const fetchChatList = async () => {
    setLoadingChats(true);
    setChatListError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const chats = await getChatList({ token: token || '', lang: locale });
      setChatList(chats);
    } catch (e: any) {
      setChatListError(e.message || 'Failed to fetch chats');
    } finally {
      setLoadingChats(false);
    }
  };

  // Fetch chat list on mount and whenever returning to chat list (when selected is null)
  useEffect(() => {
    if (!selected) {
      fetchChatList();
    }
  }, [selected]);

  // Select initial user if provided (from AdCreatorCard) ONLY on first mount
  useEffect(() => {
    if (initialSelectedUser) {
      // Try to find the user in chatList
      const found = chatList.find(
        (c) => c.user_id === initialSelectedUser.userId || c.name === initialSelectedUser.name
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Fetch message history when a chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selected) {
        return;
      }
      setLoadingMessages(true);
      setMessagesError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const myUserId = getMyUserId();
        const msgs = await getMessages({ chatId: selected.id, token: token || '', lang: locale, limit: 50, page: 1, search: '' });
        
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
      } catch (e: any) {
        setMessagesError(e.message || 'Failed to fetch messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

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
    setDeletingChatId(chatId);
    setDeleteError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      await deleteChatApi({ chatId, token: token || '', lang: locale });
      setChatList((prev) => prev.filter((c) => c.id !== chatId));
    } catch (e: any) {
      setDeleteError(e.message || 'Failed to delete chat');
    } finally {
      setDeletingChatId(null);
    }
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
            loadingMessages={loadingMessages}
            messagesError={messagesError}
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
                setUploadingAttachment(true);
                setAttachmentError(null);
                try {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                  const data = await uploadAttachment({ chatId: selected.id, file, token: token || '', lang: locale });
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
                } catch (err: any) {
                  setAttachmentError(err.message || 'Failed to upload attachment');
                  console.error('[ChatBox] Attachment upload error:', err);
                } finally {
                  setUploadingAttachment(false);
                }
              }}
              onSendVoice={async (audioBlob) => {
                setAttachmentError(null);
                try {
                  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                  const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: audioBlob.type });
                  const data = await uploadAttachment({ chatId: selected.id, file, token: token || '', lang: locale });
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
                } catch (err: any) {
                  setAttachmentError(err.message || 'Failed to upload voice message');
                  console.error('[ChatBox] Voice message upload error:', err);
                } finally {
                  // setSendingVoice(false); // Removed as per edit hint
                }
              }}
              uploadingAttachment={uploadingAttachment}
              attachmentError={attachmentError}
              connected={connected}
            />
          )}
        </>
      )}
    </Card>
  );
} 