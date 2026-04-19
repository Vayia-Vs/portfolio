declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function getGtag() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return null;
  }

  return window.gtag;
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  const gtag = getGtag();
  if (!gtag) {
    return;
  }

  gtag("event", eventName, params ?? {});
}

export function trackPageView(url: string, gaId: string) {
  const gtag = getGtag();
  if (!gtag) {
    return;
  }

  gtag("config", gaId, {
    page_path: url,
  });
}
