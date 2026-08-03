import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUploadZone from '@/components/molecules/FileUploadZone';

describe('FileUploadZone', () => {
  it('shows inline error for unsupported file types without calling onFilesSelected', () => {
    const onFilesSelected = vi.fn();
    render(
      <FileUploadZone
        onFilesSelected={onFilesSelected}
        extensions={['pdf', 'txt']}
        multiple={false}
        maxSizeMB={50}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = new File(['x'], 'virus.exe', { type: 'application/octet-stream' });
    fireEvent.change(input, { target: { files: [badFile] } });

    expect(screen.getByText(/not a supported file type/i)).toBeInTheDocument();
    expect(onFilesSelected).not.toHaveBeenCalled();
  });

  it('calls onFilesSelected for valid files', () => {
    const onFilesSelected = vi.fn();
    render(
      <FileUploadZone
        onFilesSelected={onFilesSelected}
        extensions={['pdf']}
        multiple={false}
        maxSizeMB={50}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const goodFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [goodFile] } });

    expect(onFilesSelected).toHaveBeenCalledWith([goodFile]);
  });
});
