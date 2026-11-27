import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AboutPage from '@/app/(public)/about/page';
import FeaturesPage from '@/app/(public)/features/page';
import LandingPage from '@/app/(public)/page';
import PrivacyPage from '@/app/(public)/privacy/page';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { FaqAccordion } from '@/components/public/FaqAccordion';
import { PublicNavbar } from '@/components/public/PublicNavbar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Public Website, Navigation, SEO & IndexedDB Isolation', () => {
  it('TC-041: Landing Page renders single H1, Open My Finance -> /app, Explore Features -> /features', () => {
    render(
      <>
        <PublicNavbar />
        <LandingPage />
      </>
    );

    const h1List = screen.getAllByRole('heading', { level: 1 });
    expect(h1List).toHaveLength(1);

    const openFinanceLinks = screen.getAllByRole('link', { name: /Open My Finance/i });
    expect(openFinanceLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of openFinanceLinks) {
      expect(link).toHaveAttribute('href', '/app');
    }

    const exploreLinks = screen.getAllByRole('link', { name: /Explore Features/i });
    expect(exploreLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of exploreLinks) {
      expect(link).toHaveAttribute('href', '/features');
    }
  });

  it('TC-042: Public pages render cleanly without touching indexedDB', () => {
    const openSpy = vi.spyOn(globalThis.indexedDB, 'open');

    render(<LandingPage />);
    render(<FeaturesPage />);
    render(<AboutPage />);
    render(<PrivacyPage />);

    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('TC-043: sitemap() and robots() expose only public routes and block /app/', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith('/'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/features'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/about'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/privacy'))).toBe(true);
    expect(urls.some((u) => u.includes('/app'))).toBe(false);

    const robotsConfig = robots();
    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
    expect(rules?.disallow).toContain('/app/');
    expect(rules?.disallow).toContain('/offline');
    expect(robotsConfig.sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it('TC-044: FaqAccordion toggles aria-expanded accessibly', async () => {
    const user = userEvent.setup();
    render(
      <FaqAccordion
        items={[
          { question: 'Pertanyaan Satu', answer: 'Jawaban Satu' },
          { question: 'Pertanyaan Dua', answer: 'Jawaban Dua' },
        ]}
      />
    );

    const btn1 = screen.getByRole('button', { name: 'Pertanyaan Satu' });
    const btn2 = screen.getByRole('button', { name: 'Pertanyaan Dua' });

    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    expect(btn2).toHaveAttribute('aria-expanded', 'false');

    await user.click(btn2);
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Jawaban Dua')).toBeInTheDocument();

    await user.click(btn2);
    expect(btn2).toHaveAttribute('aria-expanded', 'false');
  });
});
