import { useRef, useState } from 'react';
import { BackendStatusBanner } from '@/components/molecules/BackendStatusBanner';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAssistantChatPage } from '@/hooks/chatbot/useAssistantChatPage';
import { ChatComposer, type ChatComposerHandle } from '@/components/organisms/ChatComposer';
import { AssistantChatTranscript } from '@/components/organisms/AssistantChatTranscript';
import { AssistantMemoryPanel } from '@/components/organisms/AssistantMemoryPanel';
import { ChatThreadList } from '@/components/organisms/ChatThreadList';

export default function ChatbotPage() {
  const composerRef = useRef<ChatComposerHandle>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'memory'>('chat');

  const {
    assistantChatsOpen,
    closeAssistantChats,
    sidebarCollapsed,
    setSidebarCollapsed,
    threadListProps,
    ToastContainer,
    activeThread,
    isTreeLoading,
    isTreeError,
    treeError,
    refetchTree,
    transcript,
    isStreaming,
    isAwaitingRunStart,
    runByAssistantMessageId,
    getSiblings,
    selectSibling,
    sendFollowUp,
    thinkingExpanded,
    onToggleThinking,
    executionTraceExpanded,
    onToggleExecutionTrace,
    editingMessageId,
    setEditingMessageId,
    handleEditMessage,
    handleRetryAssistantRun,
    handleRetryUserMessage,
    handleSendMessage,
    isLoading,
    awaitingWsFollowUp,
    isInputDisabled,
    isLocalDraft,
    connectionState,
    showReconnectingBanner,
    showDisconnectedBanner,
    reconnect,
    activeRunId,
    cancelRun,
    respondToToolApproval,
    latestUserMessageId,
  } = useAssistantChatPage({
    onRestoreInput: (content) => composerRef.current?.setValue(content),
  });

  const assistantHeaderTitle =
    activeThread?.title?.trim() && activeThread.title.trim().toLowerCase() !== 'new chat'
      ? activeThread.title.trim()
      : 'Personal OS Assistant';

  return (
    <div className="relative flex h-full min-h-0 bg-white dark:bg-gray-800 pt-16 lg:pt-0">
      {assistantChatsOpen && (
        <button
          type="button"
          aria-label="Close chat list"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeAssistantChats}
        />
      )}
      {assistantChatsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat threads"
          className="fixed right-0 top-0 bottom-0 w-80 sm:w-80 md:w-96 z-40 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl lg:hidden flex flex-col pt-16"
        >
          <ChatThreadList {...threadListProps} />
        </div>
      )}

      <div
        className={`hidden lg:flex bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col transition-[width] duration-300 relative z-10 h-full overflow-hidden ${
          sidebarCollapsed ? 'w-0 border-r-0' : 'w-64'
        }`}
      >
        <ChatThreadList {...threadListProps} />
      </div>

      <button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`hidden lg:inline-flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
          sidebarCollapsed ? 'left-4' : 'left-64'
        }`}
        aria-label={sidebarCollapsed ? 'Open chat list' : 'Close chat list'}
        aria-expanded={!sidebarCollapsed}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex-1 min-w-0 min-h-0 bg-white dark:bg-gray-800 flex flex-col">
        <BackendStatusBanner />
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
          <div className="flex-1 min-w-0">
            <h2
              className="text-lg font-bold text-gray-900 dark:text-white truncate"
              title={assistantHeaderTitle}
            >
              {assistantHeaderTitle}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Connected to your Personal OS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                viewMode === 'chat'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setViewMode('memory')}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                viewMode === 'memory'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Memory
            </button>
          </div>
        </div>
        {viewMode === 'memory' ? (
          <AssistantMemoryPanel />
        ) : activeThread ? (
          <>
            <AssistantChatTranscript
              isTreeLoading={isTreeLoading}
              isTreeError={isTreeError}
              treeError={treeError}
              onRetryTree={refetchTree}
              transcript={transcript}
              runByAssistantMessageId={runByAssistantMessageId}
              getSiblings={getSiblings}
              latestUserMessageId={latestUserMessageId}
              isLoading={isLoading}
              isStreaming={isStreaming}
              isAwaitingRunStart={isAwaitingRunStart}
              awaitingWsFollowUp={awaitingWsFollowUp}
              thinkingExpanded={thinkingExpanded}
              onToggleThinking={onToggleThinking}
              executionTraceExpanded={executionTraceExpanded}
              onToggleExecutionTrace={onToggleExecutionTrace}
              editingMessageId={editingMessageId}
              onSetEditingMessageId={setEditingMessageId}
              onEditMessage={handleEditMessage}
              onRetryAssistantRun={handleRetryAssistantRun}
              onRetryUserMessage={handleRetryUserMessage}
              onSendFollowUp={sendFollowUp}
              onSelectSibling={selectSibling}
              onPickStarterPrompt={(prompt) => composerRef.current?.setValue(prompt)}
              onRespondToToolApproval={respondToToolApproval}
            />

            <ChatComposer
              ref={composerRef}
              onSend={(value) => {
                handleSendMessage(value);
                composerRef.current?.clear();
              }}
              isInputDisabled={isInputDisabled}
              isLocalDraft={isLocalDraft}
              connectionState={connectionState}
              showReconnectingBanner={showReconnectingBanner}
              showDisconnectedBanner={showDisconnectedBanner}
              onReconnect={reconnect}
              isStreaming={isStreaming}
              activeRunId={activeRunId}
              onCancelRun={cancelRun}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Select or create a chat to get started
          </div>
        )}
        <ToastContainer />
      </div>
    </div>
  );
}
