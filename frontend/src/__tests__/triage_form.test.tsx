import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { TriageWizard } from '@/components/TriageWizard';

describe('TriageWizard Form Accessibility & Interaction Tests', () => {
  it('form controls have associated accessible labels and IDs', () => {
    const onComplete = vi.fn();
    const onProceed = vi.fn();

    render(
      <TriageWizard
        language="en"
        onTriageComplete={onComplete}
        onProceedToChecklist={onProceed}
      />
    );

    // Textarea has accessible label and is required
    const narrativeInput = screen.getByLabelText(/explain your dispute/i);
    expect(narrativeInput).toBeInTheDocument();
    expect(narrativeInput).toHaveAttribute('id', 'grievance-narrative');
    expect(narrativeInput).toHaveAttribute('aria-required', 'true');

    // State select is bound to its label
    const stateSelect = screen.getByLabelText(/state \/ union territory/i);
    expect(stateSelect).toBeInTheDocument();
    expect(stateSelect).toHaveAttribute('id', 'state-select');

    // Role input is bound to its label
    const roleInput = screen.getByLabelText(/your role/i);
    expect(roleInput).toBeInTheDocument();
    expect(roleInput).toHaveAttribute('id', 'citizen-role');
  });

  it('clicking quick scenario button populates grievance narrative', () => {
    const onComplete = vi.fn();
    const onProceed = vi.fn();

    render(
      <TriageWizard
        language="en"
        onTriageComplete={onComplete}
        onProceedToChecklist={onProceed}
      />
    );

    const chequeBtn = screen.getByRole('button', { name: /load scenario: cheque bounce/i });
    fireEvent.click(chequeBtn);

    const narrativeInput = screen.getByLabelText(/explain your dispute/i) as HTMLTextAreaElement;
    expect(narrativeInput.value).toContain('2,50,000');
  });
});
