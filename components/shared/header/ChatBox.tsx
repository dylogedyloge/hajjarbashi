import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Paperclip, Mic, SendHorizontal, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useLocaleDirection } from "@/hooks/useLocaleDirection";
import { useParams } from "next/navigation";
import { getChatList, deleteChat as deleteChatApi, getMessages, uploadAttachment } from "@/lib/chat";
import socket from "@/lib/socket";
import { useReactMediaRecorder } from "react-media-recorder";

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
    setConnected(socket.connected);
    // Listen for connect/disconnect
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      if (msg.chat_id === selected.id) {
        setMessages((prev) => [...prev, {
          id: msg.id || Date.now(),
          chat_id: msg.chat_id,
          sender: msg.sender_id === params.id ? "me" : "them",
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
      console.log(data);
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
      if (!selected) return;
      setLoadingMessages(true);
      setMessagesError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const msgs = await getMessages({ chatId: selected.id, token: token || '', lang: locale, limit: 50, page: 1, search: '' });
        setMessages(
          (msgs || []).map((msg: any) => ({
            id: msg.id,
            chat_id: selected.id,
            sender: msg.maker_id === params.id ? "me" : "them",
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

  // Attach file and upload
  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && selected) {
      setUploadingAttachment(true);
      setAttachmentError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const data = await uploadAttachment({ chatId: selected.id, file: files[0], token: token || '', lang: locale });
        // Send the attachment as a message
        socket.emit("sendMessage", {
          chat_id: selected.id,
          message: '',
          attachments: [data.media_path],
        });
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
    startRecording();
  };

  const handleStopVoice = () => {
    stopRecording();
    setRecording(false);
  };

  const handleSendVoice = async () => {
    if (!audioBlob || !selected) return;
    setSendingVoice(true);
    setAttachmentError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      // Convert blob to File
      const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: audioBlob.type });
      const data = await uploadAttachment({ chatId: selected.id, file, token: token || '', lang: locale });
      // Send the attachment as a message
      socket.emit("sendMessage", {
        chat_id: selected.id,
        message: '',
        attachments: [data.media_path],
      });
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
    } finally {
      setSendingVoice(false);
    }
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
                        <AvatarFallback>{conv.name[0]}</AvatarFallback>
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
                <AvatarFallback>{selected.name[0]}</AvatarFallback>
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
                            {msg.attachments.map((att, i) => (
                              <a
                                key={i}
                                href={typeof att === 'string' ? `/${att}` : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-700 underline break-all cursor-pointer"
                              >
                                📎 {typeof att === 'string' ? att.split('/').pop() : att.name || 'Attachment'}
                              </a>
                            ))}
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
              disabled={uploadingAttachment}
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
            <div className="flex items-center gap-1">
              {!recording && !audioBlob && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleStartVoice}
                  className="shrink-0"
                  title={t('sendVoiceMessage')}
                  disabled={uploadingAttachment || sendingVoice}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
              {recording && (
                <Button
                  variant="destructive"
                  size="icon"
                  type="button"
                  onClick={handleStopVoice}
                  className="shrink-0 animate-pulse"
                  title={t('sendVoiceMessage')}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
              {audioBlob && audioUrl && !recording && (
                <div className="flex items-center gap-1">
                  <audio src={audioUrl} controls className="max-w-[120px]" />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => { setAudioBlob(null); setAudioUrl(null); clearBlobUrl(); }}
                    className="shrink-0"
                  >
                    ×
                  </Button>
                </div>
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
        </>
      )}
    </Card>
  );
} 