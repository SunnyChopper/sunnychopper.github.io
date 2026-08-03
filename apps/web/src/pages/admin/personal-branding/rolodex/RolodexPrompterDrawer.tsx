import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Sparkles, X } from 'lucide-react';
import { AIThinkingIndicator } from '@/components/atoms/AIThinkingIndicator';
import OverlayPortal from '@/components/molecules/OverlayPortal';
import ReplyGenerationPanel from '@/components/molecules/personal-branding/ReplyGenerationPanel';
import ReplySuggestionsList from '@/components/molecules/personal-branding/ReplySuggestionsList';
import { overlayBackdropClassName, overlaySurfaceClassName } from '@/lib/overlay-layer';
import {
  buildManualInteractionIntent,
  isXStatusUrl,
  stripStatusUrlFromText,
  type PrompterIntentAction,
} from '@/lib/personal-branding/manual-prompter-paste';
import { personalBrandingService } from '@/services/personal-branding.service';
import { cn } from '@/lib/utils';
import { FormTextarea } from '../PersonalBrandingFormFields';
import { selectableChipClassName } from '../personal-branding-ui';
import {
  BRAND_PLATFORM_LABELS,
  type BrandPlatform,
  type CreatorConnection,
  type ReplyGenerationDraft,
  type ReplyRun,
  type ReplySuggestion,
} from '@/types/api/personal-branding.dto';
import { Select } from '@/components/atoms/Select';

const PLATFORMS: BrandPlatform[] = [
  'linkedin',
  'x',
  'medium',
  'youtube',
  'instagram',
  'newsletter',
];

export interface PrompterAcceptMeta {
  evidenceUrl?: string | null;
  platformPostId?: string | null;
  authorHandle?: string | null;
}

interface RolodexPrompterDrawerProps {
  open: boolean;
  connection: CreatorConnection | null;
  profiles: { id: string; name: string }[];
  defaultProfileId?: string | null;
  activeRun?: ReplyRun | null;
  isGenerating?: boolean;
  isUpdatingSuggestion?: boolean;
  initialCreatorText?: string;
  initialInteractionIntent?: string;
  initialAuthorHandle?: string | null;
  initialEvidenceUrl?: string | null;
  initialPlatformPostId?: string | null;
  onClose: () => void;
  onGenerate: (
    payload: {
      creatorText: string;
      platform: BrandPlatform;
      interactionIntent?: string;
    },
    draft: ReplyGenerationDraft,
    resolved: { provider: string; model: string }
  ) => void;
  onAcceptSuggestion: (
    suggestion: ReplySuggestion,
    creatorText: string,
    meta?: PrompterAcceptMeta
  ) => void;
  onRejectSuggestion: (suggestion: ReplySuggestion, feedbackText: string | null) => void;
}

export default function RolodexPrompterDrawer({
  open,
  connection,
  profiles,
  defaultProfileId,
  activeRun,
  isGenerating = false,
  isUpdatingSuggestion = false,
  initialCreatorText = '',
  initialInteractionIntent = '',
  initialAuthorHandle,
  initialEvidenceUrl,
  initialPlatformPostId,
  onClose,
  onGenerate,
  onAcceptSuggestion,
  onRejectSuggestion,
}: RolodexPrompterDrawerProps) {
  const [creatorText, setCreatorText] = useState('');
  const [platform, setPlatform] = useState<BrandPlatform>('x');
  const [interactionIntent, setInteractionIntent] = useState('');
  const [intentAction, setIntentAction] =
    useState<Extract<PrompterIntentAction, 'reply' | 'quote'>>('reply');
  const [authorHandle, setAuthorHandle] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [platformPostId, setPlatformPostId] = useState<string | null>(null);
  const [isResolvingPaste, setIsResolvingPaste] = useState(false);
  const resolveRequestId = useRef(0);

  useEffect(() => {
    if (!open) return;
    setCreatorText(initialCreatorText);
    setPlatform('x');
    setInteractionIntent(initialInteractionIntent);
    setAuthorHandle(initialAuthorHandle ?? null);
    setEvidenceUrl(initialEvidenceUrl ?? null);
    setPlatformPostId(initialPlatformPostId ?? null);
    setIntentAction(initialInteractionIntent.toLowerCase().includes('quote') ? 'quote' : 'reply');
  }, [
    open,
    initialCreatorText,
    initialInteractionIntent,
    initialAuthorHandle,
    initialEvidenceUrl,
    initialPlatformPostId,
  ]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const applyIntentChip = (action: Extract<PrompterIntentAction, 'reply' | 'quote'>) => {
    setIntentAction(action);
    setInteractionIntent(
      buildManualInteractionIntent({
        action,
        authorUsername: authorHandle,
      })
    );
  };

  const resolvePastedUrl = async (raw: string) => {
    const { text, statusUrl } = stripStatusUrlFromText(raw);
    if (!statusUrl) return;

    setCreatorText(text);
    setEvidenceUrl(statusUrl.evidenceUrl);
    setPlatformPostId(statusUrl.platformPostId);
    if (statusUrl.authorUsername) {
      setAuthorHandle(statusUrl.authorUsername);
    }

    const requestId = ++resolveRequestId.current;
    setIsResolvingPaste(true);
    try {
      const result = await personalBrandingService.resolveXContent({
        url: statusUrl.evidenceUrl,
        authorUsername: statusUrl.authorUsername,
        platformPostId: statusUrl.platformPostId,
      });
      if (requestId !== resolveRequestId.current) return;
      if (result.authorUsername) {
        setAuthorHandle(result.authorUsername.replace(/^@+/, ''));
      }
      if (result.evidenceUrl) setEvidenceUrl(result.evidenceUrl);
      if (result.platformPostId) setPlatformPostId(result.platformPostId);
      if (result.creatorText?.trim()) {
        setCreatorText(result.creatorText.trim());
      }
    } finally {
      if (requestId === resolveRequestId.current) {
        setIsResolvingPaste(false);
      }
    }
  };

  const handleCreatorTextChange = (value: string) => {
    if (isXStatusUrl(value.trim())) {
      void resolvePastedUrl(value.trim());
      return;
    }
    setCreatorText(value);
  };

  if (!connection) return null;

  const suggestions = activeRun?.suggestions ?? [];
  const showRunProgress =
    isGenerating || activeRun?.status === 'QUEUED' || activeRun?.status === 'RUNNING';
  const displayHandle = authorHandle ?? initialAuthorHandle;

  return (
    <AnimatePresence>
      {open ? (
        <OverlayPortal>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed inset-0 cursor-default bg-black/50 backdrop-blur-[2px]',
              overlayBackdropClassName
            )}
            aria-label="Close response prompter"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Rolodex response prompter"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className={cn(
              'fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800',
              overlaySurfaceClassName
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Response prompter
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {connection.name}
                    {displayHandle ? ` · @${displayHandle}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Platform
                </label>
                <Select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as BrandPlatform)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {BRAND_PLATFORM_LABELS[p]}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Creator text
                </label>
                <FormTextarea
                  value={creatorText}
                  onChange={(e) => handleCreatorTextChange(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    if (isXStatusUrl(pasted.trim())) {
                      e.preventDefault();
                      void resolvePastedUrl(pasted.trim());
                    }
                  }}
                  placeholder="Paste post URL or text…"
                  className="min-h-[120px]"
                />
                {isResolvingPaste ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Resolving post from URL…
                  </p>
                ) : null}
                {evidenceUrl ? (
                  <a
                    href={evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Evidence link
                  </a>
                ) : null}
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Intent
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(['reply', 'quote'] as const).map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => applyIntentChip(action)}
                        className={cn(
                          selectableChipClassName(
                            intentAction === action,
                            intentAction === action ? 'ring-2 ring-blue-500/40' : undefined
                          ),
                          'capitalize'
                        )}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
                <FormTextarea
                  value={interactionIntent}
                  onChange={(e) => setInteractionIntent(e.target.value)}
                  placeholder="Warm follow-up, technical debate, share resource…"
                />
              </div>

              <ReplyGenerationPanel
                profiles={profiles}
                defaultProfileId={defaultProfileId}
                disabled={!creatorText.trim() || showRunProgress}
                isGenerating={showRunProgress}
                onGenerate={(draft, resolved) =>
                  onGenerate(
                    {
                      creatorText: creatorText.trim(),
                      platform,
                      interactionIntent: interactionIntent.trim() || undefined,
                    },
                    draft,
                    resolved
                  )
                }
              />

              {showRunProgress && !suggestions.length ? (
                <div className="flex justify-center py-8">
                  <AIThinkingIndicator message="Crafting replies…" size="lg" />
                </div>
              ) : null}

              {activeRun?.status === 'FAILED' && activeRun.error ? (
                <p className="text-sm text-red-600 dark:text-red-400">{activeRun.error}</p>
              ) : null}

              <ReplySuggestionsList
                suggestions={suggestions}
                isUpdating={isUpdatingSuggestion}
                onAccept={(s) =>
                  onAcceptSuggestion(s, creatorText.trim(), {
                    evidenceUrl,
                    platformPostId,
                    authorHandle: displayHandle,
                  })
                }
                onReject={onRejectSuggestion}
              />
            </div>
          </motion.aside>
        </OverlayPortal>
      ) : null}
    </AnimatePresence>
  );
}
