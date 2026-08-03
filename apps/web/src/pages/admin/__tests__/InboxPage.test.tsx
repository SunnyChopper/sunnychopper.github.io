import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import InboxPage from '@/pages/admin/InboxPage';
import type { InboxItem, InboxIngestionJob } from '@/services/knowledge-vault/inbox.service';

const { list, file, getIngestionJob, create, remove } = vi.hoisted(() => ({
  list: vi.fn(),
  file: vi.fn(),
  getIngestionJob: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@/services/knowledge-vault/inbox.service', () => ({
  inboxService: {
    list,
    create,
    triageAll: vi.fn(),
    file,
    getIngestionJob,
    remove,
  },
}));

vi.mock('@/services/knowledge-vault/file-upload.service', () => ({
  vaultFileUploadService: {
    uploadFile: vi.fn(),
  },
}));

const triagedUrlItem: InboxItem = {
  id: 'in-1',
  rawContent: 'https://example.com/article',
  sourceType: 'url',
  sourceUrl: 'https://example.com/article',
  aiSuggestedTitle: 'Example Article',
  aiSuggestedType: 'note',
  aiSuggestedTags: ['web'],
  aiSuggestedArea: 'Learning',
  aiTriageStatus: 'triaged',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const pendingItem: InboxItem = {
  id: 'in-2',
  rawContent: 'https://blog.bytebytego.com/p/example',
  sourceType: 'url',
  sourceUrl: 'https://blog.bytebytego.com/p/example',
  aiSuggestedTags: [],
  aiTriageStatus: 'pending',
  createdAt: '2026-01-02T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

const filedItem: InboxItem = {
  id: 'in-3',
  rawContent: 'https://www.alphaxiv.org/abs/example',
  sourceType: 'url',
  sourceUrl: 'https://www.alphaxiv.org/abs/example',
  aiSuggestedTags: [],
  aiTriageStatus: 'filed',
  createdAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',
};

const queuedJob: InboxIngestionJob = {
  jobId: 'job-1',
  inboxItemId: 'in-1',
  status: 'queued',
  stage: 'fetching',
  message: 'Queued',
  graphEdgesCreated: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('InboxPage ingestion UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    list.mockResolvedValue({ success: true, data: { items: [triagedUrlItem] } });
  });

  it('selects a row and shows preview; Escape clears selection', async () => {
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/example\.com\/article/i)).toBeInTheDocument();
    });

    const row = screen.getByRole('button', { name: /example\.com\/article/i });
    await user.click(row);

    expect(row).toHaveAttribute('aria-pressed', 'true');
    expect(row.className).toContain('bg-green-50');
    expect(screen.getByRole('heading', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByText(/suggested title:/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.getByText(/select an inbox item to preview and file/i)).toBeInTheDocument();
    });
    expect(row).toHaveAttribute('aria-pressed', 'false');
  });

  it('starts ingestion job when filing a URL item', async () => {
    file.mockResolvedValue({
      success: true,
      data: { ingestionJob: queuedJob },
    });

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/example\.com\/article/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/example\.com\/article/i));
    await user.click(screen.getByRole('button', { name: /file into vault/i }));

    await waitFor(() => {
      expect(file).toHaveBeenCalledWith('in-1', expect.objectContaining({ targetType: 'note' }));
    });
    await waitFor(() => {
      expect(screen.getByText(/stage:\s*fetching/i)).toBeInTheDocument();
    });
  });

  it('shows manual upload CTA when ingestion needs upload', async () => {
    const needsUpload: InboxItem = {
      ...triagedUrlItem,
      ingestionStatus: 'needsManualUpload',
      ingestionError: '404',
    };
    list.mockResolvedValue({ success: true, data: { items: [needsUpload] } });

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/needs manual upload/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/example\.com\/article/i));

    await waitFor(() => {
      expect(screen.getByText(/upload pdf, html export, or markdown/i)).toBeInTheDocument();
    });
  });
});

describe('InboxPage status tab counts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    list.mockResolvedValue({
      success: true,
      data: { items: [pendingItem, triagedUrlItem, filedItem] },
    });
  });

  it('shows live counts for each status tab', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'All, 3 items' })).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: 'Pending, 1 item' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Triaged, 1 item' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Filed, 1 item' })).toBeInTheDocument();
  });

  it('marks the active tab with aria-selected and heavier font weight', async () => {
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'All, 3 items' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    const pendingTab = screen.getByRole('tab', { name: 'Pending, 1 item' });
    expect(pendingTab).toHaveAttribute('aria-selected', 'false');

    await user.click(pendingTab);

    expect(pendingTab).toHaveAttribute('aria-selected', 'true');
    expect(pendingTab.className).toMatch(/font-semibold/);
    expect(screen.getByRole('tab', { name: 'All, 3 items' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('updates counts after adding an item without navigation', async () => {
    list
      .mockResolvedValueOnce({
        success: true,
        data: { items: [pendingItem] },
      })
      .mockResolvedValue({
        success: true,
        data: { items: [pendingItem, { ...pendingItem, id: 'in-4', rawContent: 'New capture' }] },
      });
    create.mockResolvedValue({ success: true, data: { id: 'in-4' } });

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'All, 1 item' })).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/quick capture/i), 'New capture');
    await user.click(screen.getByRole('button', { name: /add to inbox/i }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'All, 2 items' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Pending, 2 items' })).toBeInTheDocument();
    });
    expect(create).toHaveBeenCalled();
  });

  it('updates counts after discard without navigation', async () => {
    list
      .mockResolvedValueOnce({
        success: true,
        data: { items: [pendingItem, triagedUrlItem] },
      })
      .mockResolvedValue({
        success: true,
        data: { items: [triagedUrlItem] },
      });
    remove.mockResolvedValue({ success: true, data: null });

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Pending, 1 item' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /blog\.bytebytego\.com/i }));
    await user.click(screen.getByRole('button', { name: /discard/i }));

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'All, 1 item' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Pending, 0 items' })).toBeInTheDocument();
    });
    expect(remove).toHaveBeenCalledWith('in-2');
  });
});

describe('InboxPage bucket empty states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows three dashed empty states under All when inbox is empty', async () => {
    list.mockResolvedValue({ success: true, data: { items: [] } });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole('status')).toHaveLength(3);
    });

    expect(screen.getByText(/nothing awaiting triage/i)).toBeInTheDocument();
    expect(screen.getByText(/no items ready to file/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing filed yet/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /quick capture/i })).toHaveLength(3);
  });

  it('focuses Quick Capture input when empty-state CTA is clicked', async () => {
    list.mockResolvedValue({ success: true, data: { items: [] } });

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /quick capture/i }).length).toBeGreaterThan(0);
    });

    const captureInput = screen.getByPlaceholderText(/quick capture/i);
    await user.click(screen.getAllByRole('button', { name: /quick capture/i })[0]);

    await waitFor(() => {
      expect(captureInput).toHaveFocus();
    });
  });

  it('shows empty only for empty groups when other buckets have items', async () => {
    list.mockResolvedValue({ success: true, data: { items: [pendingItem] } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /blog\.bytebytego\.com/i })).toBeInTheDocument();
    });

    expect(screen.queryByText(/nothing awaiting triage/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no items ready to file/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing filed yet/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /quick capture/i })).toHaveLength(2);
  });

  it('shows single empty state on Triaged tab when that bucket is empty', async () => {
    list.mockResolvedValue({ success: true, data: { items: [pendingItem] } });

    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Triaged, 0 items' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: 'Triaged, 0 items' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/no items ready to file/i);
    });
    expect(screen.getAllByRole('button', { name: /quick capture/i })).toHaveLength(1);
  });
});
