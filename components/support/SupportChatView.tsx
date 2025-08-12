"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip } from "lucide-react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { type Ticket, type TicketMessage, fetchTicketMessages, sendTicketMessage } from "@/lib/profile";
import { useAuth } from "@/lib/auth-context";
import { useLocale, useTranslations } from "next-intl";

interface SupportChatViewProps {
  ticket: Ticket;
  onBackToList: () => void;
}

const SupportChatView: React.FC<SupportChatViewProps> = ({
  ticket,
  onBackToList
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { token, user } = useAuth();
  const locale = useLocale();
  const t = useTranslations('Support.chatView');

  // Fetch ticket messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!token || !ticket.id) return;
      
      try {
        setLoading(true);
        setError(null);
                 const response = await fetchTicketMessages(ticket.id, token, locale);
         if (response.success) {
           setMessages(response.data.messages || []);
         } else {
           throw new Error(response.message || t('failedToFetchMessages'));
         }
       } catch (err) {
         console.error('Error fetching ticket messages:', err);
         setError(err instanceof Error ? err.message : t('failedToFetchMessages'));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [ticket.id, token, locale]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      // Validate file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
             const validFiles = fileArray.filter(file => {
         if (file.size > maxSize) {
           toast.error(t('fileTooLarge', { fileName: file.name }));
           return false;
         }
         return true;
       });
       
       if (validFiles.length > 0) {
         setSelectedFiles(prev => [...prev, ...validFiles]);
         toast.success(`${validFiles.length} ${t('fileSelected')}`);
       }
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;
    
    setSending(true);
    
    try {
      // Debug logging
      console.log('Sending message with files:', {
        ticket_id: ticket.id,
        message: messageText,
        attachments: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
      
      // Send the message via API
      const response = await sendTicketMessage(
        {
          ticket_id: ticket.id,
          message: messageText,
          attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
        },
        token!,
        locale
      );
      
      if (response.success) {
        console.log('Message sent successfully. Response attachments:', response.data.attachments);
        
        // Add the new message to the local state immediately
        const newMessage: TicketMessage = {
          id: response.data.id,
          message: response.data.message,
          attachments: response.data.attachments,
          created_at: response.data.created_at,
          sender_id: response.data.sender_id,
          sender_name: user?.name || 'You',
          sender_avatar_thumb: user?.avatar_thumb || null,
        };
        
        setMessages(prev => [...prev, newMessage]);
        setMessageText('');
        setSelectedFiles([]);
        
                 // Show different success message if attachments were sent
         if (selectedFiles.length > 0 && !response.data.attachments) {
           toast.success(t('messageSentWithWarning'));
         } else {
           toast.success(t('messageSent'));
         }
       } else {
         throw new Error(response.message || t('failedToSendMessage'));
       }
     } catch (err) {
       console.error('Error sending message:', err);
       toast.error(err instanceof Error ? err.message : t('failedToSendMessage'));
    } finally {
      setSending(false);
    }
  };

     // Helper function to format date
   const formatMessageDate = (timestamp: number) => {
     const date = new Date(timestamp);
     const now = new Date();
     const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
     
     if (diffInHours < 1) {
       return t('now');
     } else if (diffInHours < 24) {
       return `${Math.floor(diffInHours)}${t('hour')}`;
     } else {
       return date.toLocaleDateString('en-US', { 
         month: 'short', 
         day: 'numeric',
         year: 'numeric'
       });
     }
   };

  // Helper function to get attachment URL
  const getAttachmentUrl = (attachment: string) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.hajjardevs.ir';
    return `${apiBaseUrl}/${attachment}`;
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-card rounded-xl border shadow-sm">
        {/* Header Section */}
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{ticket.subject}</h2>
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                <span className='text-muted-foreground'>{t('department')}: <span className="font-semibold text-gray-900">{ticket.category_name}</span></span>
                <span>•</span>
                <span className='text-muted-foreground'>{t('topic')}: <span className="font-semibold text-gray-900">{ticket.topic_name || 'N/A'}</span></span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onBackToList}
            className="px-4 py-2 border-red-300 bg-white text-red-500 rounded-lg hover:bg-red-50"
          >
            {t('close')}
          </Button>
        </CardHeader>

        {/* Chat Conversation Area */}
        <CardContent className="pt-0">
          <div className=" rounded-lg p-4 min-h-[400px] bg-gray-100">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">{t('loadingMessages')}</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-600">{t('error')}: {error}</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">{t('noMessages')}</div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isUserMessage = message.sender_id === (ticket.creator_id || user?.id);
                  return (
                    <div key={message.id} className={`flex ${isUserMessage ? 'justify-end' : 'items-start gap-3'} mb-4`}>
                      {!isUserMessage && (
                        <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          {message.sender_avatar_thumb ? (
                            <img 
                              src={getAttachmentUrl(message.sender_avatar_thumb)} 
                              alt={message.sender_name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 text-xs">
                              {message.sender_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      <div className={`${isUserMessage ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'} p-3 rounded-lg shadow-sm max-w-md`}>
                        {!isUserMessage && (
                          <div className="font-medium text-sm text-gray-900 mb-1">{message.sender_name}</div>
                        )}
                        <p className="text-sm">{message.message}</p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                <a 
                                  href={getAttachmentUrl(attachment)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm underline hover:no-underline"
                                >
                                  {t('attachmentNumber', { number: index + 1 })}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className={`flex justify-end items-center gap-2 mt-2 text-xs ${isUserMessage ? 'text-gray-300' : 'text-gray-500'}`}>
                          <span>✓</span>
                          <span>{formatMessageDate(message.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Section */}
          <div className="mt-4 space-y-3">
            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white px-2 py-1 rounded border text-sm">
                    <Paperclip className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-700">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Label htmlFor="message-input" className="sr-only">Type your message</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="*/*"
                multiple
              />
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full border-gray-300 bg-white hover:bg-gray-50"
                onClick={triggerFileInput}
              >
                <Paperclip className="w-4 h-4 text-gray-600" />
              </Button>
              <Input
                id="message-input"
                placeholder={t('typeMessage')}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 border-gray-300 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-gray-900 text-white hover:bg-gray-800 rounded-lg"
                disabled={!messageText.trim() || sending}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportChatView;
