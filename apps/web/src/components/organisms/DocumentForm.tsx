import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Tag as TagIcon, ChevronDown, ChevronUp } from 'lucide-react';
import FileUploadZone from '@/components/molecules/FileUploadZone';
import DocumentUploadProgressCard from '@/components/molecules/knowledge-vault/DocumentUploadProgressCard';
import UrlMetadataPreview from '@/components/molecules/knowledge-vault/UrlMetadataPreview';
import type { DocumentUploadStatus } from '@/components/molecules/knowledge-vault/DocumentUploadProgressCard';
import { useKnowledgeVault } from '@/contexts/KnowledgeVault';
import { useUrlMetadataPreview } from '@/hooks/useUrlMetadataPreview';
import { documentUploadService } from '@/services/knowledge-vault/document-upload.service';
import { estimateDocumentStats } from '@/lib/knowledge-vault/estimate-document-stats';
import { isValidHttpUrl } from '@/lib/knowledge-vault/url-metadata';
import type { Document, CreateDocumentInput, UpdateDocumentInput } from '@/types/knowledge-vault';
import type { Area } from '@/types/growth-system';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';

const AREAS: Area[] = ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'Day Job'];

const DOC_UPLOAD_EXTENSIONS = [
  'pdf',
  'docx',
  'pptx',
  'png',
  'jpg',
  'jpeg',
  'txt',
  'md',
  'markdown',
];

function titleFromFilename(file: File): string {
  const name = file.name;
  const i = name.lastIndexOf('.');
  const base = (i > 0 ? name.slice(0, i) : name).replace(/[-_]/g, ' ').trim();
  return base || 'Untitled';
}

function extFromFilename(file: File): string {
  const n = file.name;
  const i = n.lastIndexOf('.');
  return i > 0 ? n.slice(i + 1).toLowerCase() : '';
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

interface DocumentFormProps {
  document?: Document;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DocumentForm({ document, onSuccess, onCancel }: DocumentFormProps) {
  const { createDocument, updateDocument, refreshVaultItems } = useKnowledgeVault();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [stagedFileId, setStagedFileId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<DocumentUploadStatus | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [estimatedPages, setEstimatedPages] = useState<number | null>(null);
  const [estimatedChunks, setEstimatedChunks] = useState<number | null>(null);
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const uploadGenerationRef = useRef(0);

  const [formData, setFormData] = useState({
    title: document?.title || '',
    content: document?.content || '',
    area: document?.area || ('Operations' as Area),
    fileUrl: (document as Document)?.fileUrl || '',
    fileType: (document as Document)?.fileType || '',
    pageCount: (document as Document)?.pageCount || null,
    tags: document?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        content: document.content || '',
        area: document.area,
        fileUrl: (document as Document).fileUrl || '',
        fileType: (document as Document).fileType || '',
        pageCount: (document as Document).pageCount || null,
        tags: document.tags,
      });
      setPendingFile(null);
    }
  }, [document]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const resetUploadState = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPendingFile(null);
    setStagedFileId(null);
    setUploadProgress(0);
    setUploadStatus(null);
    setUploadError(null);
    setEstimatedPages(null);
    setEstimatedChunks(null);
  }, []);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const startEagerUpload = useCallback(
    async (file: File) => {
      const generation = ++uploadGenerationRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setPendingFile(file);
      setStagedFileId(null);
      setUploadProgress(0);
      setUploadStatus('uploading');
      setUploadError(null);
      setEstimatedPages(null);
      setEstimatedChunks(null);
      setError(null);

      setFormData((prev) => ({
        ...prev,
        fileType: extFromFilename(file),
        title: prev.title.trim() ? prev.title : titleFromFilename(file),
        fileUrl: '',
      }));
      setShowAdvancedUrl(false);

      const estimatePromise = estimateDocumentStats(file).then((stats) => {
        if (generation !== uploadGenerationRef.current) return;
        setEstimatedPages(stats.pageCount);
        setEstimatedChunks(stats.chunkCount);
        if (stats.pageCount != null) {
          setFormData((prev) => ({ ...prev, pageCount: stats.pageCount }));
        }
      });

      try {
        const presign = await documentUploadService.getPresignedUrl(file);
        if (generation !== uploadGenerationRef.current || controller.signal.aborted) return;

        await documentUploadService.uploadToS3WithProgress(
          presign.uploadUrl,
          file,
          (pct) => {
            if (generation === uploadGenerationRef.current) {
              setUploadProgress(pct);
            }
          },
          { signal: controller.signal }
        );

        if (generation !== uploadGenerationRef.current) return;

        await estimatePromise;

        setStagedFileId(presign.fileId);
        setUploadStatus('ready');
        setUploadProgress(100);
      } catch (err) {
        if (generation !== uploadGenerationRef.current) return;
        if (isAbortError(err)) {
          resetUploadState();
          return;
        }
        const message = err instanceof Error ? err.message : 'Upload failed';
        setUploadStatus('error');
        setUploadError(message);
        setError(message);
      }
    },
    [resetUploadState]
  );

  const onFilesSelected = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    void startEagerUpload(f);
  };

  const clearPendingFile = () => {
    resetUploadState();
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (document) {
        const input: UpdateDocumentInput = {
          title: formData.title,
          content: formData.content || undefined,
          area: formData.area,
          fileUrl: formData.fileUrl || undefined,
          fileType: formData.fileType || undefined,
          pageCount: formData.pageCount || undefined,
          tags: formData.tags,
        };
        await updateDocument(document.id, input);
      } else if (pendingFile && stagedFileId) {
        if (uploadStatus !== 'ready') {
          throw new Error('Please wait for the file upload to finish');
        }
        await documentUploadService.createDocumentFromFile({
          fileId: stagedFileId,
          title: formData.title.trim(),
          area: formData.area,
          tags: formData.tags,
          content: formData.content.trim() || undefined,
          fileType: formData.fileType || undefined,
        });
        await refreshVaultItems();
      } else if (pendingFile) {
        throw new Error('File upload is not ready yet');
      } else {
        const input: CreateDocumentInput = {
          title: formData.title,
          content: formData.content || undefined,
          area: formData.area,
          fileUrl: formData.fileUrl || undefined,
          fileType: formData.fileType || undefined,
          pageCount: formData.pageCount || undefined,
          tags: formData.tags,
        };
        await createDocument(input);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const isCreate = !document;
  const isUploading = uploadStatus === 'uploading';
  const canSubmitWithFile = !pendingFile || (uploadStatus === 'ready' && stagedFileId != null);
  const urlMetadataPreview = useUrlMetadataPreview(formData.fileUrl, {
    enabled: isValidHttpUrl(formData.fileUrl) && !pendingFile,
  });

  return (
    <form onSubmit={handleSubmit}>
      <fieldset
        disabled={loading}
        className="min-w-0 space-y-6 border-0 p-0 m-0 disabled:opacity-60"
      >
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            placeholder="Enter document title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary/Notes
          </label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            placeholder="Add notes or summary about this document"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Type
            </label>
            <input
              type="text"
              value={formData.fileType}
              onChange={(e) => setFormData((prev) => ({ ...prev, fileType: e.target.value }))}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
              placeholder="PDF, DOCX, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Page Count
            </label>
            <input
              type="number"
              value={formData.pageCount || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pageCount: e.target.value ? parseInt(e.target.value, 10) : null,
                }))
              }
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
              placeholder="Number of pages"
              min="1"
            />
          </div>
        </div>

        {isCreate && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload file
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF, DOCX, PPTX, PNG, JPG, TXT, Markdown (max 50 MB). Optional if you use a link
              below.
            </p>
            {pendingFile && uploadStatus ? (
              <DocumentUploadProgressCard
                fileName={pendingFile.name}
                fileSizeBytes={pendingFile.size}
                progress={uploadProgress}
                status={uploadStatus}
                estimatedPageCount={estimatedPages}
                estimatedChunkCount={estimatedChunks}
                errorMessage={uploadError ?? undefined}
                onCancel={clearPendingFile}
              />
            ) : (
              <FileUploadZone
                onFilesSelected={onFilesSelected}
                accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.txt,.md,.markdown"
                extensions={DOC_UPLOAD_EXTENSIONS}
                multiple={false}
                maxSizeMB={50}
              />
            )}

            <button
              type="button"
              onClick={() => setShowAdvancedUrl((v) => !v)}
              className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline"
              disabled={isUploading}
            >
              {showAdvancedUrl ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Or paste a file URL
            </button>
            {showAdvancedUrl && (
              <>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fileUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                  placeholder="https://example.com/document.pdf"
                  disabled={isUploading || !!pendingFile}
                />
                <UrlMetadataPreview
                  url={formData.fileUrl}
                  status={urlMetadataPreview.status}
                  title={urlMetadataPreview.title}
                  faviconUrl={urlMetadataPreview.faviconUrl}
                  warning={urlMetadataPreview.warning}
                  currentTitle={formData.title}
                  applyLabel="Use title as document title"
                  onApplyTitle={(title) => setFormData((prev) => ({ ...prev, title }))}
                />
              </>
            )}
          </div>
        )}

        {!isCreate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File URL
            </label>
            <input
              type="url"
              value={formData.fileUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, fileUrl: e.target.value }))}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
              placeholder="https://example.com/document.pdf"
            />
            <UrlMetadataPreview
              url={formData.fileUrl}
              status={urlMetadataPreview.status}
              title={urlMetadataPreview.title}
              faviconUrl={urlMetadataPreview.faviconUrl}
              warning={urlMetadataPreview.warning}
              currentTitle={formData.title}
              applyLabel="Use title as document title"
              onApplyTitle={(title) => setFormData((prev) => ({ ...prev, title }))}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Area *
          </label>
          <Select
            value={formData.area}
            onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value as Area }))}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            required
          >
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                >
                  <TagIcon size={12} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !canSubmitWithFile || isUploading}
          >
            {loading ? 'Saving...' : document ? 'Update Document' : 'Create Document'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
