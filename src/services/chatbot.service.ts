import type { ChatThread, ChatMessage, CreateThreadRequest, CreateMessageRequest, UpdateThreadRequest } from '../types/chatbot';

const STORAGE_KEYS = {
  THREADS: 'chatbot_threads',
  MESSAGES: 'chatbot_messages',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getThreads(): ChatThread[] {
  const data = localStorage.getItem(STORAGE_KEYS.THREADS);
  return data ? JSON.parse(data) : [];
}

function saveThreads(threads: ChatThread[]): void {
  localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
}

function getMessages(): ChatMessage[] {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
}

function saveMessages(messages: ChatMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export const chatbotService = {
  async getThreads(): Promise<ChatThread[]> {
    return getThreads().sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  async getThread(id: string): Promise<ChatThread | null> {
    const threads = getThreads();
    return threads.find(t => t.id === id) || null;
  },

  async createThread(request: CreateThreadRequest): Promise<ChatThread> {
    const threads = getThreads();
    const newThread: ChatThread = {
      id: generateId(),
      user_id: 'local-user',
      title: request.title || 'New Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    threads.push(newThread);
    saveThreads(threads);
    return newThread;
  },

  async updateThread(request: UpdateThreadRequest): Promise<ChatThread> {
    const threads = getThreads();
    const index = threads.findIndex(t => t.id === request.id);
    if (index === -1) {
      throw new Error('Thread not found');
    }
    threads[index] = {
      ...threads[index],
      title: request.title,
      updated_at: new Date().toISOString(),
    };
    saveThreads(threads);
    return threads[index];
  },

  async deleteThread(id: string): Promise<void> {
    const threads = getThreads().filter(t => t.id !== id);
    saveThreads(threads);

    const messages = getMessages().filter(m => m.thread_id !== id);
    saveMessages(messages);
  },

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const messages = getMessages();
    return messages
      .filter(m => m.thread_id === threadId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async createMessage(request: CreateMessageRequest): Promise<ChatMessage> {
    const messages = getMessages();
    const newMessage: ChatMessage = {
      id: generateId(),
      thread_id: request.thread_id,
      role: request.role,
      content: request.content,
      thinking: request.thinking,
      metadata: request.metadata,
      created_at: new Date().toISOString(),
      parent_id: request.parent_id,
    };
    messages.push(newMessage);
    saveMessages(messages);

    const threads = getThreads();
    const threadIndex = threads.findIndex(t => t.id === request.thread_id);
    if (threadIndex !== -1) {
      threads[threadIndex].updated_at = new Date().toISOString();
      saveThreads(threads);
    }

    return newMessage;
  },

  async updateMessage(id: string, content: string): Promise<ChatMessage> {
    const messages = getMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Message not found');
    }
    messages[index].content = content;
    saveMessages(messages);
    return messages[index];
  },

  async deleteMessagesAfter(messageId: string, threadId: string): Promise<void> {
    const messages = getMessages();
    const targetIndex = messages.findIndex(m => m.id === messageId && m.thread_id === threadId);
    if (targetIndex === -1) return;

    const filtered = messages.filter((m, idx) =>
      m.thread_id !== threadId || idx <= targetIndex
    );
    saveMessages(filtered);
  },
};
