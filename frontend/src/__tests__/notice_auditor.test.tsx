import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { NoticeAuditor } from '@/components/NoticeAuditor';

describe('NoticeAuditor Accessibility & Functionality Tests', () => {
  it('notice text input and file upload have accessible labels', () => {
    render(<NoticeAuditor language="en" />);

    // Text input is bound to label
    const textInput = screen.getByLabelText(/paste notice text/i);
    expect(textInput).toBeInTheDocument();
    expect(textInput).toHaveAttribute('id', 'notice-text-input');

    // File input has accessible label
    const fileInput = screen.getByLabelText(/select file/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('id', 'notice-file-upload');
  });

  it('clicking sample notice button loads notice text', () => {
    render(<NoticeAuditor language="en" />);

    const sample138Btn = screen.getByRole('button', { name: /load sample 15-day cheque bounce notice/i });
    fireEvent.click(sample138Btn);

    const textInput = screen.getByLabelText(/paste notice text/i) as HTMLTextAreaElement;
    expect(textInput.value).toContain('SECTION 138');
  });
});
