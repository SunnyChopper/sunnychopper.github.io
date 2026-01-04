import { createClient } from '@supabase/supabase-js';
import type { ChatThread, ChatMessage, CreateThreadRequest, CreateMessageRequest, UpdateThreadRequest } from '../types/chatbot';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const chatbotService = {
  async getThreads(): Promise<ChatThread[]> {
    const { data, error } = await supabase
      .from('chat_threads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getThread(id: string): Promise<ChatThread | null> {
    const { data, error } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createThread(request: CreateThreadRequest): Promise<ChatThread> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('chat_threads')
      .insert({
        user_id: user.id,
        title: request.title || 'New Chat',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateThread(request: UpdateThreadRequest): Promise<ChatThread> {
    const { data, error } = await supabase
      .from('chat_threads')
      .update({
        title: request.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteThread(id: string): Promise<void> {
    const { error } = await supabase
      .from('chat_threads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createMessage(request: CreateMessageRequest): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: request.thread_id,
        role: request.role,
        content: request.content,
        metadata: request.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', request.thread_id);

    return data;
  },
};
