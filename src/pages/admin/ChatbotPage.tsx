import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  CheckSquare,
  Target,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import { findBestResponse } from '../../data/chatbot-responses';
import type { ChatThread, ChatMessage } from '../../types/chatbot';

interface MessageBranch {
  content: string;
  response?: string;
  responseThinking?: string;
}

export default function ChatbotPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState<{ [key: string]: boolean }>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThinking, setStreamingThinking] = useState('');
  const [thinkingComplete, setThinkingComplete] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageBranches, setMessageBranches] = useState<{ [key: string]: MessageBranch[] }>({});
  const [currentBranchIndex, setCurrentBranchIndex] = useState<{ [key: string]: number }>({});
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
  }, [messages, streamingContent]);

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

  const streamText = async (text: string, callback: (chunk: string) => void) => {
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      callback(currentText);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  };

  const handleSendMessage = async (messageContent?: string, isEdit: boolean = false, editedMessageId?: string) => {
    const userMessage = messageContent || inputValue.trim();
    if (!userMessage || !activeThread || isLoading) return;

    setInputValue('');
    setIsLoading(true);
    setEditingMessageId(null);

    try {
      let userMsg;

      if (isEdit && editedMessageId) {
        await chatbotService.updateMessage(editedMessageId, userMessage);
        await chatbotService.deleteMessagesAfter(editedMessageId, activeThread.id);
        await loadMessages(activeThread.id);
        userMsg = { id: editedMessageId };
      } else {
        userMsg = await chatbotService.createMessage({
          thread_id: activeThread.id,
          role: 'user',
          content: userMessage,
        });
        await loadMessages(activeThread.id);
      }

      const responseData = findBestResponse(userMessage);

      if (responseData.webSearch) {
        setIsSearching(true);
        setSearchQuery(userMessage);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSearching(false);
      }

      const tempMessageId = `temp-${Date.now()}`;
      setStreamingMessageId(tempMessageId);
      setStreamingContent('');
      setStreamingThinking('');
      setThinkingComplete(false);

      if (responseData.thinking) {
        await streamText(responseData.thinking, (chunk) => {
          setStreamingThinking(chunk);
        });
        setThinkingComplete(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      await streamText(responseData.content, (chunk) => {
        setStreamingContent(chunk);
      });

      await chatbotService.createMessage({
        thread_id: activeThread.id,
        role: 'assistant',
        content: responseData.content,
        thinking: responseData.thinking,
        metadata: {
          web_search: responseData.webSearch,
          search_query: responseData.webSearch ? userMessage : undefined,
        },
        parent_id: userMsg.id,
      });

      setStreamingMessageId(null);
      setStreamingContent('');
      setStreamingThinking('');
      setThinkingComplete(false);
      await loadMessages(activeThread.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setStreamingMessageId(null);
      setStreamingContent('');
      setStreamingThinking('');
      setThinkingComplete(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim() || !activeThread) return;

    try {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      const originalMessage = messages[messageIndex];
      const branchKey = `${messageId}`;

      const updatedBranches = messageBranches[branchKey] || [];

      if (updatedBranches.length === 0) {
        updatedBranches.push({
          content: originalMessage.content,
          response: messageIndex < messages.length - 1 ? messages[messageIndex + 1].content : undefined,
          responseThinking: messageIndex < messages.length - 1 ? messages[messageIndex + 1].thinking : undefined,
        });
      }

      if (originalMessage.content !== newContent) {
        updatedBranches.push({
          content: newContent,
        });

        setMessageBranches({
          ...messageBranches,
          [branchKey]: updatedBranches,
        });

        setCurrentBranchIndex({
          ...currentBranchIndex,
          [branchKey]: updatedBranches.length - 1,
        });
      }

      setEditingMessageId(null);
      await handleSendMessage(newContent, true, messageId);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const switchBranch = async (messageId: string, direction: 'prev' | 'next') => {
    const branchKey = `${messageId}`;
    const branches = messageBranches[branchKey] || [];
    const currentIndex = currentBranchIndex[branchKey] || 0;

    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < branches.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex === currentIndex) return;

    setCurrentBranchIndex({ ...currentBranchIndex, [branchKey]: newIndex });

    const branch = branches[newIndex];
    if (!activeThread) return;

    try {
      await chatbotService.updateMessage(messageId, branch.content);
      await chatbotService.deleteMessagesAfter(messageId, activeThread.id);

      if (branch.response) {
        await chatbotService.createMessage({
          thread_id: activeThread.id,
          role: 'assistant',
          content: branch.response,
          thinking: branch.responseThinking,
          parent_id: messageId,
        });
      }

      await loadMessages(activeThread.id);
    } catch (error) {
      console.error('Error switching branch:', error);
    }
  };

  const countTokens = (text: string) => {
    return text.split(' ').length;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="fixed inset-0 lg:left-64 top-0 flex">
      <div
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-0' : 'w-64'
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={handleCreateThread}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
          >
            <Plus size={18} />
            <span>New</span>
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
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} className="text-gray-400 flex-shrink-0" />
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
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        style={{ left: sidebarCollapsed ? '0' : '16rem' }}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex-1 bg-white dark:bg-gray-800 flex flex-col">
        {activeThread ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Personal OS Assistant
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Connected to your Growth System
                </p>
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
                    Ask me about your tasks, goals, metrics, or habits. I can help you create items,
                    track progress, and understand how everything connects.
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-w-2xl">
                    <button
                      onClick={() => setInputValue('Show me my active goals')}
                      className="p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition text-left"
                    >
                      <Target size={20} className="text-blue-600 dark:text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        View Goals
                      </p>
                    </button>
                    <button
                      onClick={() => setInputValue('Create a new task')}
                      className="p-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition text-left"
                    >
                      <CheckSquare size={20} className="text-green-600 dark:text-green-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Add Task
                      </p>
                    </button>
                    <button
                      onClick={() => setInputValue('Show my performance metrics')}
                      className="p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition text-left"
                    >
                      <BarChart3 size={20} className="text-purple-600 dark:text-purple-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        View Metrics
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {messages.map((message, index) => {
                const branchKey = `${message.id}`;
                const branches = messageBranches[branchKey] || [];
                const currentIndex = currentBranchIndex[branchKey] || 0;

                return (
                  <div key={message.id}>
                    <div
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1 max-w-[80%]">
                        {message.role === 'assistant' && message.thinking && (
                          <div className="mb-2">
                            <button
                              onClick={() =>
                                setThinkingExpanded({
                                  ...thinkingExpanded,
                                  [message.id]: !thinkingExpanded[message.id],
                                })
                              }
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
                            >
                              {thinkingExpanded[message.id] ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              <span className="font-medium">
                                Show Thinking ({countTokens(message.thinking)} tokens)
                              </span>
                            </button>
                            {thinkingExpanded[message.id] && (
                              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border-l-2 border-gray-300 dark:border-gray-600">
                                {message.thinking}
                              </div>
                            )}
                          </div>
                        )}

                        {message.metadata?.web_search && (
                          <div className="mb-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <Search size={14} />
                            <span>Searched: {message.metadata.search_query}</span>
                          </div>
                        )}

                        {editingMessageId === message.id ? (
                          <input
                            type="text"
                            defaultValue={message.content}
                            onBlur={(e) => {
                              if (e.target.value !== message.content) {
                                handleEditMessage(message.id, e.target.value);
                              } else {
                                setEditingMessageId(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditMessage(message.id, e.currentTarget.value);
                              } else if (e.key === 'Escape') {
                                setEditingMessageId(null);
                              }
                            }}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <>
                            <div
                              className={`rounded-lg px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {message.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-ul:my-2 prose-li:my-1">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                      ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-3">{children}</ul>,
                                      ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-3">{children}</ol>,
                                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                      a: ({ node, ...props }) => {
                                        const href = props.href || '';
                                        if (href.startsWith('/')) {
                                          return (
                                            <Link
                                              to={href}
                                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                            >
                                              {props.children}
                                            </Link>
                                          );
                                        }
                                        return (
                                          <a
                                            {...props}
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          />
                                        );
                                      },
                                      code: ({ className, children, ...props }) => {
                                        const isInline = !className?.includes('language-');
                                        return isInline ? (
                                          <code
                                            className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-sm"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        ) : (
                                          <code
                                            className="block bg-gray-200 dark:bg-gray-600 p-2 rounded text-sm overflow-x-auto"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        );
                                      },
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                message.content
                              )}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                              {formatTimestamp(message.created_at)}
                            </div>
                          </>
                        )}

                        {message.role === 'user' && index === messages.length - 2 && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => setEditingMessageId(message.id)}
                              className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            {branches.length > 0 && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => switchBranch(message.id, 'prev')}
                                  disabled={currentIndex === 0}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ArrowLeft size={12} />
                                </button>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {currentIndex + 1} / {branches.length}
                                </span>
                                <button
                                  onClick={() => switchBranch(message.id, 'next')}
                                  disabled={currentIndex === branches.length - 1}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isSearching && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Search className="text-blue-600 dark:text-blue-400 animate-pulse" size={16} />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-sm">Searching the web for "{searchQuery}"...</span>
                    </div>
                  </div>
                </div>
              )}

              {streamingMessageId && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    {streamingThinking && !thinkingComplete && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Loader2 className="animate-spin" size={16} />
                          <span className="font-medium">
                            Thinking... ({countTokens(streamingThinking)} tokens)
                          </span>
                        </div>
                      </div>
                    )}
                    {streamingContent && (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100">
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-ul:my-2 prose-li:my-1">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-3">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-3">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            }}
                          >
                            {streamingContent}
                          </ReactMarkdown>
                        </div>
                        <span className="inline-block w-1 h-4 bg-blue-600 dark:bg-blue-400 ml-1 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isLoading && !streamingMessageId && !isSearching && (
                <div className="flex gap-3 justify-start">
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
                  onClick={() => handleSendMessage()}
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
