import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Plus, Edit2, Trash2, Send, Loader2, Sparkles, CheckSquare, Target, BarChart3 } from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import type { ChatThread, ChatMessage } from '../../types/chatbot';

export default function ChatbotPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (activeThread) {
      loadMessages(activeThread.id);
    }
  }, [activeThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const data = await chatbotService.getThreads();
      setThreads(data);
      if (data.length > 0 && !activeThread) {
        setActiveThread(data[0]);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const data = await chatbotService.getMessages(threadId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleCreateThread = async () => {
    try {
      const newThread = await chatbotService.createThread({ title: 'New Chat' });
      setThreads([newThread, ...threads]);
      setActiveThread(newThread);
      setMessages([]);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleDeleteThread = async (id: string) => {
    try {
      await chatbotService.deleteThread(id);
      setThreads(threads.filter((t) => t.id !== id));
      if (activeThread?.id === id) {
        setActiveThread(threads[0] || null);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleRenameThread = async (id: string) => {
    if (!editingTitle.trim()) return;
    try {
      const updated = await chatbotService.updateThread({ id, title: editingTitle });
      setThreads(threads.map((t) => (t.id === id ? updated : t)));
      setEditingThreadId(null);
    } catch (error) {
      console.error('Error renaming thread:', error);
    }
  };

  const generateMockResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();

    if (lower.includes('task') && (lower.includes('create') || lower.includes('add'))) {
      return `I can help you create a task! Based on your message, I'll add this to your task list. Tasks in Personal OS connect to your projects and goals, helping you break down strategic objectives into actionable steps.\n\nWould you like me to:\n1. Create this as a high-priority task\n2. Link it to an existing project\n3. Set a specific deadline`;
    }

    if (lower.includes('goal') && (lower.includes('progress') || lower.includes('how'))) {
      return `Let me check your goals progress. In Personal OS, goals are part of the Strategic Layer, driving your projects and daily actions.\n\nYour active goals show:\n- Goal completion tracking\n- Linked projects and their status\n- Key metrics aligned with each goal\n\nWould you like me to show detailed progress on a specific goal?`;
    }

    if (lower.includes('metric') || lower.includes('progress') || lower.includes('performance')) {
      return `Your metrics dashboard provides data-driven insights. The Measurement Layer tracks KPIs tied to your goals and projects.\n\nI can help you:\n- View current metric values\n- Analyze trends over time\n- Identify what's working well\n- Suggest areas for improvement\n\nWhich metrics would you like to review?`;
    }

    if (lower.includes('habit') || lower.includes('routine')) {
      return `Habits are part of the Tactical Layer, turning your strategy into consistent daily action. I can help you:\n\n- Review your current habits and streaks\n- Create new habits aligned with your goals\n- Analyze habit completion patterns\n- Suggest optimal times for habits\n\nWhat habit would you like to work on?`;
    }

    if (lower.includes('project') && lower.includes('status')) {
      return `Let me pull up your project statuses. Projects bridge strategy and execution, breaking down goals into manageable milestones.\n\nI can show you:\n- Active project progress percentages\n- Upcoming milestones\n- Tasks per project\n- Blocked items needing attention\n\nWhich project would you like details on?`;
    }

    return `I'm your Personal OS Assistant! I have access to all your Growth System data and can help you:\n\n📋 **Tasks**: Create, update, or review your tasks\n🎯 **Goals**: Track progress and align actions\n📊 **Metrics**: Analyze performance data\n📅 **Habits**: Build consistent routines\n📁 **Projects**: Manage complex initiatives\n📖 **Logbook**: Reflect on your journey\n\nI can create items, provide insights, and help you understand how everything connects. What would you like to work on?`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeThread || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      await chatbotService.createMessage({
        thread_id: activeThread.id,
        role: 'user',
        content: userMessage,
      });

      await loadMessages(activeThread.id);

      setTimeout(async () => {
        const aiResponse = generateMockResponse(userMessage);
        await chatbotService.createMessage({
          thread_id: activeThread.id,
          role: 'assistant',
          content: aiResponse,
        });
        await loadMessages(activeThread.id);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCreateThread}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`group relative p-3 rounded-lg mb-1 cursor-pointer transition ${
                activeThread?.id === thread.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveThread(thread)}
            >
              {editingThreadId === thread.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleRenameThread(thread.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameThread(thread.id)}
                  className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  autoFocus
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                      {thread.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition absolute right-2 top-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingThreadId(thread.id);
                        setEditingTitle(thread.title);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        {activeThread ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal OS Assistant</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Connected to your Growth System</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sparkles className="text-blue-600 dark:text-blue-400 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Ask me about your tasks, goals, metrics, or habits. I can help you create items, track progress, and understand how everything connects.
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-w-2xl">
                    <button
                      onClick={() => setInputValue('Show me my active goals')}
                      className="p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition text-left"
                    >
                      <Target size={20} className="text-blue-600 dark:text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">View Goals</p>
                    </button>
                    <button
                      onClick={() => setInputValue('Create a new task')}
                      className="p-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition text-left"
                    >
                      <CheckSquare size={20} className="text-green-600 dark:text-green-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Add Task</p>
                    </button>
                    <button
                      onClick={() => setInputValue('Show my performance metrics')}
                      className="p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition text-left"
                    >
                      <BarChart3 size={20} className="text-purple-600 dark:text-purple-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">View Metrics</p>
                    </button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                    <Loader2 className="animate-spin text-gray-600 dark:text-gray-400" size={20} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about your tasks, goals, metrics..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Select or create a chat to get started
          </div>
        )}
      </div>
    </div>
  );
}
