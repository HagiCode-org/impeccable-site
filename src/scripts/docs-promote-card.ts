const DISMISSED_PROMOTION_KEY = 'impeccable-site:promo-dismissed:v1';

function readDismissedState(): boolean {
  try {
    return localStorage.getItem(DISMISSED_PROMOTION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissedState(): void {
  try {
    localStorage.setItem(DISMISSED_PROMOTION_KEY, '1');
  } catch {
    // Ignore unavailable storage.
  }
}

export function initDocsPromoteCard() {
  const root = document.querySelector<HTMLElement>('[data-docs-promote]');
  if (!root || root.dataset.bound === 'true') {
    return;
  }

  root.dataset.bound = 'true';

  if (readDismissedState()) {
    root.hidden = true;
    return;
  }

  root.hidden = false;

  const closeButton = root.querySelector<HTMLButtonElement>('[data-docs-promote-close]');
  closeButton?.addEventListener('click', () => {
    writeDismissedState();
    root.hidden = true;
  });

  const footer = document.querySelector<HTMLElement>('[data-footer-root]');
  if (!footer || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      root.hidden = Boolean(entry?.isIntersecting) || readDismissedState();
    },
    { threshold: 0.01 },
  );

  observer.observe(footer);
}
