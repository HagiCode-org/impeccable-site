import { SITE_LOCALE_STORAGE_KEY } from '@/lib/i18n/site-entry-locale';

export function initDocsLanguageSwitcher() {
  const root = document.querySelector<HTMLElement>('[data-locale-switcher]');
  if (!root || root.dataset.bound === 'true') {
    return;
  }

  root.dataset.bound = 'true';

  const trigger = root.querySelector<HTMLButtonElement>('[data-locale-trigger]');
  const portal = root.querySelector<HTMLElement>('[data-locale-portal]');
  const closeButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-locale-close]'));
  const options = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-locale-option]'));

  if (!trigger || !portal || options.length === 0) {
    return;
  }

  const setOpen = (open: boolean) => {
    root.dataset.open = open ? 'true' : 'false';
    portal.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');

    if (open) {
      const selected = options.find((option) => option.getAttribute('aria-selected') === 'true') ?? options[0];
      selected?.focus();
      return;
    }

    trigger.focus();
  };

  const focusOption = (index: number) => {
    const target = options[(index + options.length) % options.length];
    target?.focus();
  };

  trigger.addEventListener('click', () => {
    setOpen(root.dataset.open !== 'true');
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (root.dataset.open !== 'true') {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  });

  options.forEach((option, index) => {
    option.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusOption(index + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusOption(index - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusOption(0);
          break;
        case 'End':
          event.preventDefault();
          focusOption(options.length - 1);
          break;
        default:
          break;
      }
    });

    option.addEventListener('click', () => {
      const nextLocale = option.dataset.locale;
      const href = option.dataset.href;
      if (!nextLocale || !href) {
        return;
      }

      try {
        localStorage.setItem(SITE_LOCALE_STORAGE_KEY, nextLocale);
      } catch {
        // Ignore unavailable storage.
      }

      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (href === currentUrl || option.getAttribute('aria-selected') === 'true') {
        setOpen(false);
        return;
      }

      window.location.assign(href);
    });
  });
}
