import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentForm from '@/components/organisms/DocumentForm';

const mockCreateDocument = vi.fn();
const mockRefreshVaultItems = vi.fn().mockResolvedValue(undefined);

vi.mock('@/contexts/KnowledgeVault', () => ({
  useKnowledgeVault: () => ({
    createDocument: mockCreateDocument,
    updateDocument: vi.fn(),
    refreshVaultItems: mockRefreshVaultItems,
  }),
}));

const mockGetPresignedUrl = vi.fn().mockResolvedValue({
  uploadUrl: 'https://s3.example/presigned',
  fileId: 'file-id-1',
  s3Key: 'vault-docs/u/1/x.pdf',
});
const mockUploadProgress = vi.fn().mockResolvedValue(undefined);
const mockCreateFromFile = vi.fn().mockResolvedValue({
  id: 'doc-1',
  type: 'document',
  title: 'Test doc',
  indexingStatus: 'pending',
});

vi.mock('@/services/knowledge-vault/document-upload.service', () => ({
  documentUploadService: {
    getPresignedUrl: (...args: unknown[]) => mockGetPresignedUrl(...args),
    uploadToS3WithProgress: (...args: unknown[]) => mockUploadProgress(...args),
    createDocumentFromFile: (...args: unknown[]) => mockCreateFromFile(...args),
  },
}));

vi.mock('@/lib/knowledge-vault/estimate-document-stats', () => ({
  estimateDocumentStats: vi.fn().mockResolvedValue({ pageCount: 5, chunkCount: 4 }),
}));

const mockFetchUrlMetadata = vi.fn();

vi.mock('@/services/knowledge-vault/url-metadata.service', () => ({
  fetchUrlMetadata: (...args: unknown[]) => mockFetchUrlMetadata(...args),
}));

vi.mock('@/components/molecules/FileUploadZone', () => ({
  default: ({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) => (
    <button
      type="button"
      data-testid="mock-pick-file"
      onClick={() =>
        onFilesSelected([new File(['hello'], 'report.pdf', { type: 'application/pdf' })])
      }
    >
      Pick file
    </button>
  ),
}));

describe('DocumentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchUrlMetadata.mockResolvedValue({
      url: 'https://x.com/a.pdf',
      title: 'Remote PDF Title',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=x.com&sz=32',
      fileType: 'pdf',
      fetchFailed: false,
      warning: null,
    });
  });

  it('starts eager upload on file pick before Create', async () => {
    const user = userEvent.setup();
    render(<DocumentForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByTestId('mock-pick-file'));

    await waitFor(() => {
      expect(mockGetPresignedUrl).toHaveBeenCalledTimes(1);
      expect(mockUploadProgress).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateFromFile).not.toHaveBeenCalled();
  });

  it('creates via from-file only after upload is ready', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<DocumentForm onSuccess={onSuccess} onCancel={vi.fn()} />);

    await user.click(screen.getByTestId('mock-pick-file'));

    await waitFor(() => {
      expect(screen.getByText(/ready to create/i)).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create document/i }));

    expect(mockUploadProgress).toHaveBeenCalledTimes(1);
    expect(mockCreateFromFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: 'file-id-1',
        title: 'report',
        area: 'Operations',
      })
    );
    expect(mockRefreshVaultItems).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(mockCreateDocument).not.toHaveBeenCalled();
  });

  it('creates via URL path when no file is selected', async () => {
    mockCreateDocument.mockResolvedValue({
      id: 'd2',
      type: 'document',
      title: 'URL doc',
    });
    const user = userEvent.setup();
    render(<DocumentForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /paste a file url/i }));
    await user.type(screen.getByPlaceholderText(/example\.com\/document/i), 'https://x.com/a.pdf');
    await user.type(screen.getByPlaceholderText(/enter document title/i), 'URL doc');

    await user.click(screen.getByRole('button', { name: /create document/i }));

    expect(mockCreateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'URL doc',
        fileUrl: 'https://x.com/a.pdf',
      })
    );
    expect(mockGetPresignedUrl).not.toHaveBeenCalled();
  });

  it('offers fetched title for URL paste when title is empty', async () => {
    const user = userEvent.setup();
    render(<DocumentForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /paste a file url/i }));
    await user.type(screen.getByPlaceholderText(/example\.com\/document/i), 'https://x.com/a.pdf');

    await waitFor(() => {
      expect(mockFetchUrlMetadata).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Remote PDF Title')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /use title as document title/i }));
    expect(screen.getByDisplayValue('Remote PDF Title')).toBeInTheDocument();
  });

  it('cancels upload and returns to dropzone', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockUploadProgress.mockImplementation(
      (
        _url: string,
        _file: File,
        _onProgress: (n: number) => void,
        opts?: { signal?: AbortSignal }
      ) => {
        capturedSignal = opts?.signal;
        return new Promise(() => {
          /* never resolves until abort */
        });
      }
    );

    const user = userEvent.setup();
    render(<DocumentForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByTestId('mock-pick-file'));

    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel upload/i }));

    expect(capturedSignal?.aborted).toBe(true);
    await waitFor(() => {
      expect(screen.getByTestId('mock-pick-file')).toBeInTheDocument();
    });
  });
});
