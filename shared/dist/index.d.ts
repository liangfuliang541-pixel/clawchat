export interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    status: 'online' | 'offline' | 'away';
    kind: 'human' | 'agent';
    agentType?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Message {
    _id: string;
    sender: string | User;
    receiver: string | User;
    conversationId: string;
    content: string;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
    isRead: boolean;
    createdAt: string;
}
export interface Conversation {
    _id: string;
    participants: string[] | User[];
    type: 'private' | 'group';
    name?: string;
    avatar?: string;
    lastMessage?: Message | string;
    updatedAt: string;
}
export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: User;
    token: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface ServerToClientEvents {
    receive_message: (message: Message) => void;
    user_typing: (data: {
        conversationId: string;
        userId: string;
    }) => void;
    user_status_changed: (data: {
        userId: string;
        status: User['status'];
    }) => void;
    message_read: (data: {
        messageId: string;
        conversationId: string;
        userId: string;
    }) => void;
    unread_messages: (data: {
        conversationId: string;
        messages: Message[];
    }) => void;
    error: (data: {
        message: string;
    }) => void;
}
export interface ClientToServerEvents {
    send_message: (payload: {
        conversationId: string;
        content: string;
        type?: Message['type'];
    }) => void;
    typing: (payload: {
        conversationId: string;
    }) => void;
    read_message: (payload: {
        messageId: string;
        conversationId: string;
    }) => void;
    join_conversation: (conversationId: string) => void;
    leave_conversation: (conversationId: string) => void;
}
