import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { StatutoryBanner } from '@/components/StatutoryBanner';
import { Navbar } from '@/components/Navbar';
import { ChecklistViewer } from '@/components/ChecklistViewer';

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    authId: 'test_guest_12345',
    userName: 'Guest Citizen',
    userEmail: null,
    isGuest: false,
    loading: false,
    signingIn: false,
    authNotice: null,
    dismissNotice: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInGuest: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

// Mock fetchChecklist API call
vi.mock('@/lib/api', () => ({
  fetchChecklist: vi.fn().mockResolvedValue({
    category: 'Cheque Bounce & Debt Recovery',
    total_mandatory: 1,
    total_supportive: 1,
    documents: [
      {
        id: 'doc-1',
        name: 'Original Bounced Cheque',
        name_tamil: 'அசல் காசோலை',
        is_mandatory: true,
        category: 'Financial',
        purpose: 'Direct primary evidence under Section 138 NI Act',
        how_to_obtain: 'Collect from your bank',
        evidentiary_value: 'Primary Evidence under Section 57 BSA'
      }
    ],
    evidence_golden_rules: ['Section 63 BSA certificate required for WhatsApp/Email records.'],
    disclaimer: 'Informational utility only'
  })
}));

describe('Accessibility & ARIA Compliance Tests', () => {
  it('StatutoryBanner renders with proper role="region" and aria-label', () => {
    render(<StatutoryBanner language="en" />);
    const banner = screen.getByRole('region', { name: /statutory disclaimer/i });
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/Advocates Act, 1961/i);
  });

  it('Navbar buttons have accessible names for screen readers', () => {
    const handleLangChange = vi.fn();
    render(<Navbar language="en" onLanguageChange={handleLangChange} />);

    // Check language switcher buttons have accessible names
    const enBtn = screen.getByRole('button', { name: /switch language to english/i });
    const taBtn = screen.getByRole('button', { name: /switch language to tamil/i });
    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(taBtn).toHaveAttribute('aria-pressed', 'false');

    // Google Sign In & Guest buttons have accessible labels
    const googleBtn = screen.getByRole('button', { name: /sign in with google/i });
    const guestBtn = screen.getByRole('button', { name: /continue as guest/i });
    expect(googleBtn).toBeInTheDocument();
    expect(guestBtn).toBeInTheDocument();
  });

  it('ChecklistViewer renders accessible progressbar with ARIA value attributes', async () => {
    const onOpenPrep = vi.fn();
    render(
      <ChecklistViewer
        language="en"
        category="Cheque Bounce"
        narrative="Cheque bounced for 50000"
        onOpenPrepSheet={onOpenPrep}
      />
    );

    // Verify progressbar semantics
    const progressbar = await screen.findByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow');
  });
});
