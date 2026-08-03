import { Check, File } from 'lucide-react';
import LinearProgressBar from '@/components/atoms/LinearProgressBar';
import { formatFileSize } from '@/utils/file-formatters';

export type DocumentUploadStatus = 'uploading' | 'ready' | 'error';

export type DocumentUploadProgressCardProps = {
  fileName: string;
  fileSizeBytes: number;
  progress: number;
  status: DocumentUploadStatus;
  estimatedPageCount: number | null;
  estimatedChunkCount: number | null;
  errorMessage?: string;
  onCancel: () => void;
};

function formatEstimates(pages: number | null, chunks: number | null): string | null {
  const parts: string[] = [];
  if (pages != null) {
    parts.push(`~${pages} page${pages === 1 ? '' : 's'}`);
  }
  if (chunks != null) {
    parts.push(`~${chunks} chunk${chunks === 1 ? '' : 's'}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export default function DocumentUploadProgressCard({
  fileName,
  fileSizeBytes,
  progress,
  status,
  estimatedPageCount,
  estimatedChunkCount,
  errorMessage,
  onCancel,
}: DocumentUploadProgressCardProps) {
  const estimateLine = formatEstimates(estimatedPageCount, estimatedChunkCount);

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {status === 'ready' ? (
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
              aria-hidden
            />
          ) : (
            <File className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
              {fileName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(fileSizeBytes)}
            </p>
            {estimateLine && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{estimateLine}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-sm text-red-600 hover:underline dark:text-red-400"
        >
          {status === 'uploading' ? 'Cancel upload' : 'Remove'}
        </button>
      </div>

      {status === 'uploading' && (
        <div className="space-y-1">
          <LinearProgressBar value={progress} max={100} label="Upload progress" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Uploading… {progress}%</p>
        </div>
      )}

      {status === 'ready' && (
        <p className="text-xs font-medium text-green-700 dark:text-green-400">Ready to create</p>
      )}

      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
