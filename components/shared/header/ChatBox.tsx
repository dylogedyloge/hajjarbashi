"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Mic, SendHorizontal, ArrowLeft, ArrowRight, Trash2, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useLocaleDirection } from "@/hooks/useLocaleDirection";
import { useParams } from "next/navigation";
import { getChatList, deleteChat as deleteChatApi, getMessages, uploadAttachment, blockUser, unblockUser } from "@/lib/chat";
import socket from "@/utils/socket";
import { useReactMediaRecorder } from "react-media-recorder";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Ban, Undo2 } from "lucide-react";

// No more mockConversations; use chatList from API

type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
  attachments?: any[];
  seen?: boolean;
};

type Conversation = {
  id: number;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  lastTime: string;
  isOnline: boolean;
  messages: Message[];
  userId?: string; // for online tracking
};

type InitialSelectedUser = {
  userId: string;
  name: string;
  avatarUrl: string;
  company?: string;
};

interface ChatBoxProps {
  onClose: () => void;
  initialSelectedUser?: InitialSelectedUser | null;
}

export default function ChatBox({ onClose, initialSelectedUser }: ChatBoxProps) {
  const t = useTranslations('ChatBox');
  const { isRTL } = useLocaleDirection();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Voice recorder state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sendingVoice, setSendingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Blocked state for the selected user
  const [blocked, setBlocked] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  // Placeholder handlers for block/unblock
  const handleBlockUser = async () => {
    setBlockError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const lang = locale;
      const userId = selected?.userId;
      if (!userId) throw new Error('No user selected');
      await blockUser({ userId, token: token || '', lang });
      setBlocked(true);
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
      setBlocked(false);
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



  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selected]);

  // Socket setup for real-time chat
  useEffect(() => {
    if (!selected) return;
    
    console.log('[ChatBox] Initial socket connection state:', socket.connected); // Log initial connection state
    setConnected(socket.connected);
    // Listen for connect/disconnect
    const handleConnect = () => {
      console.log('[ChatBox] Socket connected');
      setConnected(true);
    };
    const handleDisconnect = () => {
      console.log('[ChatBox] Socket disconnected');
      setConnected(false);
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      console.log('[ChatBox] RAW incoming message object:', msg);
      const myUserId = getMyUserId();
      const senderType = msg.msg_sender_id === myUserId ? 'me' : 'them';
      const senderName = senderType === 'me' ? '[You]' : (selected?.name || '[Unknown]');
      console.log('[ChatBox] handleNewMessage debug:', {
        msg_sender_id: msg.msg_sender_id,
        myUserId,
        computed_senderType: senderType,
        msg,
      });
      console.log('[ChatBox] Received new message:', {
        from: senderName,
        sender_id: msg.msg_sender_id,
        chat_id: msg.chat_id,
        text: msg.message,
        attachments: msg.attachments,
        time: msg.time || new Date().toISOString(),
        raw: msg
      });
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
        console.log('[ChatBox] Emitted seenMessage for chat_id:', selected.id);
      }
    };
    socket.on("newMessage", handleNewMessage);

    // Listen for seen events
    const handleNewSeen = (data: any) => {
      console.log('[ChatBox] newSeen event:', data);
    };
    socket.on("newSeen", handleNewSeen);

    // Track online status of the other user
    const selectedUserId = selected.userId || (initialSelectedUser && typeof initialSelectedUser === 'object' ? initialSelectedUser.userId : undefined);
    if (selected && selectedUserId) {
      socket.emit("joinOnlineTrack", { id: selectedUserId });
      console.log('[ChatBox] Emitted joinOnlineTrack for user:', selected.name);
      const handleOnlineStatus = (data: any) => {
        console.log('[ChatBox] Online status update for', selected.name + ':', data);
        if (data.user_id === selectedUserId) setIsOnline(data.is_online);
      };
      socket.on(selectedUserId, handleOnlineStatus);
    }

    // Mark all messages as seen when chat is opened
    socket.emit("seenMessage", { chat_id: selected.id });
    console.log('[ChatBox] Emitted seenMessage for chat_id (on open):', selected.id);

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
      if (!selected) return;
      setLoadingMessages(true);
      setMessagesError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const myUserId = getMyUserId();
        const msgs = await getMessages({ chatId: selected.id, token: token || '', lang: locale, limit: 50, page: 1, search: '' });
        setMessages(
          (msgs || []).map((msg: any) => ({
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
    console.log('[ChatBox] Sending message:', msg);
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

  // Attach file and upload
  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && selected) {
      setUploadingAttachment(true);
      setAttachmentError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        console.log('[ChatBox] Uploading attachment:', files[0]);
        const data = await uploadAttachment({ chatId: selected.id, file: files[0], token: token || '', lang: locale });
        // Send the attachment as a message
        const attachmentMsg = {
          chat_id: selected.id,
          message: '',
          attachments: [data.media_path],
        };
        console.log('[ChatBox] Sending attachment message:', attachmentMsg);
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
    }
  };

  // Voice recorder setup
  const {
    startRecording,
    stopRecording,
    // mediaBlobUrl,
    clearBlobUrl,
    // status: recordingStatus,
  } = useReactMediaRecorder({
    audio: true,
    onStop: (url, blob) => {
      setAudioBlob(blob);
      setAudioUrl(url);
    },
  });

  const handleStartVoice = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecording(true);
    setRecordingTime(0);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    startRecording();
  };

  const handleStopVoice = () => {
    stopRecording();
    setRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const handleSendVoice = async () => {
    if (!audioBlob || !selected) return;
    setSendingVoice(true);
    setAttachmentError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      // Convert blob to File
      const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: audioBlob.type });
      console.log('[ChatBox] Uploading voice message:', file);
      const data = await uploadAttachment({ chatId: selected.id, file, token: token || '', lang: locale });
      // Send the attachment as a message
      const voiceMsg = {
        chat_id: selected.id,
        message: '',
        attachments: [data.media_path],
      };
      console.log('[ChatBox] Sending voice message:', voiceMsg);
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
      setAudioBlob(null);
      setAudioUrl(null);
      clearBlobUrl();
    } catch (err: any) {
      setAttachmentError(err.message || 'Failed to upload voice message');
      console.error('[ChatBox] Voice message upload error:', err);
    } finally {
      setSendingVoice(false);
    }
  };

  // Reset timer on cancel
  useEffect(() => {
    if (!recording && recordingTime !== 0 && !audioBlob) {
      setRecordingTime(0);
    }
  }, [recording, audioBlob, recordingTime]);

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
    <Card className="w-full max-w-md h-[500px] shadow-lg border bg-background flex flex-col mt-auto">
      {/* Header */}
      {/* Only show the simple header when no user is selected */}
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
      {/* Conversation List (dynamic from API) */}
      {!selected && (
        <ScrollArea className="flex-1">
          {loadingChats ? (
            <div className="text-center text-muted-foreground py-8">{t('loading')}</div>
          ) : chatListError ? (
            <div className="text-center text-red-500 py-8">{chatListError}</div>
          ) : chatList.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{t('noMessages')}</div>
          ) : (
            <div className="divide-y">
              {chatList.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center gap-3 p-4 group cursor-pointer hover:bg-muted"
                >
                  <div
                    className="flex-1 flex items-center gap-3"
                    onClick={() => {
                      setSelected({
                        id: conv.id,
                        name: conv.name,
                        avatarUrl: conv.avatar,
                        isOnline: conv.is_online,
                        lastMessage: conv.message || "",
                        lastTime: conv.last_message_created_at ? new Date(conv.last_message_created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
                        messages: [], // Will fetch messages later
                        userId: conv.user_id,
                      });
                      setMessages([]);
                    }}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conv.avatar} alt={conv.name} />
                        <AvatarFallback>{conv?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      {/* Availability dot */}
                      <span
                        className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-background ${conv.is_online ? "bg-green-500" : "bg-gray-400"}`}
                        title={conv.is_online ? t('online') : t('offline')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{conv.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{conv.message || ""}</div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{conv.last_message_created_at ? new Date(conv.last_message_created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</div>
                  </div>
                  <button
                    className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title={t('deleteChat')}
                    disabled={deletingChatId === conv.id}
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteChat(conv.id);
                    }}
                  >
                    {deletingChatId === conv.id ? (
                      <span className="w-4 h-4 animate-spin border-2 border-gray-400 border-t-transparent rounded-full inline-block align-middle" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
              {deleteError && (
                <div className="text-center text-red-500 py-2">{deleteError}</div>
              )}
            </div>
          )}
        </ScrollArea>
      )}
      {/* Chat Area */}
      {selected && (
        <>
          {/* Chat Header with avatar, name, and availability */}
          <div className="flex items-center gap-3 p-4 border-b bg-background">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              {isRTL ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ArrowLeft className="w-5 h-5" />
              )}
            </Button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selected.avatarUrl} alt={selected.name} />
                <AvatarFallback>{selected?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              {/* Availability dot */}
              <span
                className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-background ${selected.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                title={selected.isOnline ? t('online') : t('offline')}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg truncate">{selected.name}</div>
              <div className={`text-xs ${isOnline ? "text-green-600" : "text-gray-400"}`}>{isOnline ? t('online') : t('offline')}</div>
            </div>
            {/* Block/Unblock Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                {blocked ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUnblockUser}
                    className="shrink-0"
                    title="Unblock user"
                  >
                    <Undo2 className="w-5 h-5 text-green-600" />
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleBlockUser}
                    className="shrink-0"
                    title="Block user"
                  >
                    <Ban className="w-5 h-5" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>{blocked ? t('unblockUser') || 'Unblock user' : t('blockUser') || 'Block user'}</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-0 p-4 space-y-3 bg-muted">
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
                  <div
                    key={msg.id}
                    className={`flex w-full mb-2 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex flex-col max-w-xs">
                      <div
                        className={`rounded-2xl px-4 py-2 shadow text-sm break-words
                          ${msg.sender === "me"
                            ? "bg-blue-500 text-white ml-auto"
                            : "bg-gray-100 text-gray-900 mr-auto border border-gray-200"}
                        `}
                      >
                        {msg.text}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            {msg.attachments.map((att, i) => {
                              const url = typeof att === 'string' ? `/${att}` : '#';
                              const filename = typeof att === 'string' ? att.split('/').pop() : att.name || 'Attachment';
                              const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'webm'];
                              const ext = filename.split('.').pop()?.toLowerCase();
                              if (audioExts.includes(ext || '')) {
                                return (
                                  <div key={i} className="flex flex-col items-start w-full">
                                    <span className={`text-xs font-medium mb-1 ${msg.sender === 'me' ? 'text-white' : 'text-gray-700'}`}>{t('voiceMessage') || 'Voice message'}</span>
                                    <audio
                                      src={url}
                                      controls
                                      className={`max-w-[180px] mt-0 rounded shadow-none border-none bg-transparent ${msg.sender === 'me' ? 'text-white' : ''}`}
                                      style={{
                                        background: 'none',
                                        boxShadow: 'none',
                                        border: 'none',
                                        color: msg.sender === 'me' ? 'white' : undefined,
                                      }}
                                    />
                                  </div>
                                );
                              }
                              return (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-700 underline break-all cursor-pointer"
                                >
                                  📎 {filename}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${msg.sender === "me" ? "text-blue-400 text-right ml-auto" : "text-gray-400 text-left mr-auto"}`}>
                        {msg.sender === "me" ? t('you') : selected.name} • {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        {msg.sender === "me" && msg.seen && (
                          <span className="ml-2 text-green-500">✓✓</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          {/* Input Area */}
          {/* Blocked message or input area */}
          {blocked ? (
            <div className="flex flex-col items-center justify-center p-4 border-t bg-background text-destructive text-sm font-medium">
              {t('userBlocked') || 'You have blocked this user. Unblock to continue chatting.'}
              {blockError && <span className="text-xs text-red-500 mt-2">{blockError}</span>}
            </div>
          ) : (
            <form
              className="flex items-center gap-2 p-4 border-t bg-background shrink-0"
              onSubmit={handleSend}
            >
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0"
                title={t('attachFile')}
                disabled={uploadingAttachment || recording}
              >
                {uploadingAttachment ? (
                  <span className="w-5 h-5 animate-spin border-2 border-blue-400 border-t-transparent rounded-full inline-block align-middle" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleAttach}
                />
              </Button>
              {attachmentError && (
                <span className="text-xs text-red-500 ml-2">{attachmentError}</span>
              )}
              {/* Voice message controls */}
              <div className="flex items-center gap-2 min-w-[120px]">
                {/* Idle: show mic button with tooltip */}
                {!recording && !audioBlob && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={handleStartVoice}
                        className="shrink-0 border-blue-500 text-blue-500 hover:bg-blue-50"
                        disabled={uploadingAttachment || sendingVoice}
                      >
                        <Mic className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('sendVoiceMessage')}</TooltipContent>
                  </Tooltip>
                )}
                {/* Recording: show stop button and timer in a Card with tooltip */}
                {recording && (
                  <Card className="flex flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1 animate-pulse mb-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          onClick={handleStopVoice}
                          className="shrink-0"
                        >
                          <Mic className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('stopRecording')}</TooltipContent>
                    </Tooltip>
                    <span className="font-mono text-xs text-red-600 min-w-[40px] text-center">
                      {`${Math.floor(recordingTime / 60).toString().padStart(2, '0')}:${(recordingTime % 60).toString().padStart(2, '0')}`}
                    </span>
                    <span className="text-xs text-red-400">{t('recording')}</span>
                  </Card>
                )}
                {/* Preview: show audio player, send/cancel in a Card with tooltips */}
                {audioBlob && audioUrl && !recording && (
                  <Card className="flex flex-row items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 mb-0">
                    <audio src={audioUrl} controls className="max-w-[120px]" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          type="button"
                          onClick={handleSendVoice}
                          className="shrink-0"
                          disabled={sendingVoice}
                        >
                          {sendingVoice ? (
                            <span className="w-5 h-5 animate-spin border-2 border-blue-400 border-t-transparent rounded-full inline-block align-middle" />
                          ) : (
                            <SendHorizontal className="w-5 h-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('sendVoiceMessage')}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => { setAudioBlob(null); setAudioUrl(null); clearBlobUrl(); }}
                          className="shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('cancel')}</TooltipContent>
                    </Tooltip>
                  </Card>
                )}
              </div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1"
                disabled={!connected}
              />
              <Button
                variant="default"
                type="submit"
                className="rounded-full"
                disabled={!connected || !input.trim()}
                title={t('send')}
              >
                <SendHorizontal className={`w-5 h-5${isRTL ? ' rotate-180' : ''}`} />
              </Button>
            </form>
          )}
        </>
      )}
    </Card>
  );
} 