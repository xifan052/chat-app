export interface MessageType {
    sender: "user" | "ai";
    text: string;
    defaultText?: string;
  }
  
  export interface ChatMessagePropType {
    messageList: MessageType[];
  }
  