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
  thinking?: string;
  metadata?: {
    task_id?: string;
    goal_id?: string;
    project_id?: string;
    action?: string;
    web_search?: boolean;
    search_query?: string;
  };
  created_at: string;
  parent_id?: string;
  branches?: ChatMessage[];
}

export interface CreateThreadRequest {
  title?: string;
}

export interface CreateMessageRequest {
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  metadata?: ChatMessage['metadata'];
  parent_id?: string;
}

export interface UpdateThreadRequest {
  id: string;
  title: string;
}
