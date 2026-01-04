export interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    task_id?: string;
    goal_id?: string;
    project_id?: string;
    action?: string;
  };
  created_at: string;
}

export interface CreateThreadRequest {
  title?: string;
}

export interface CreateMessageRequest {
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: ChatMessage['metadata'];
}

export interface UpdateThreadRequest {
  id: string;
  title: string;
}
