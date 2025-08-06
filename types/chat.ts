export type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
  attachments?: any[];
  seen?: boolean;
};

export type Conversation = {
  id: number;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  lastTime: string;
  isOnline: boolean;
  messages: Message[];
  userId?: string; // for online tracking
};

export type InitialSelectedUser = {
  userId: string;
  name: string;
  avatarUrl: string;
  company?: string;
};

export type BlockType = 'you_blocked' | 'user_blocked' | null; 