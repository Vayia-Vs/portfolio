import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { trackPageView } from "@/lib/analytics";

const notoSans = Noto_Sans({
  subsets: ["latin", "greek"],
  variable: "--font-ui",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  subsets: ["latin", "greek"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export default function App({ Component, pageProps }: AppProps) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-0V7N5LDWZF";
  const router = useRouter();
  const [gaDebug, setGaDebug] = useState<{
    hasGtag: boolean;
    hasScript: boolean;
  }>({
    hasGtag: false,
    hasScript: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const handleRouteChangeComplete = (url: string) => {
      if (gaId) {
        trackPageView(url, gaId);
      }

      const hashIndex = url.indexOf("#");

      if (hashIndex >= 0) {
        const targetId = decodeURIComponent(url.slice(hashIndex + 1));

        window.setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({
            behavior: "auto",
            block: "start",
          });
        }, 0);
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [gaId, router.asPath, router.events]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDebugState = () => {
      setGaDebug({
        hasGtag: typeof window.gtag === "function",
        hasScript: Boolean(
          document.querySelector("script[src*='googletagmanager.com/gtag/js']"),
        ),
      });
    };

    updateDebugState();
    const timer = window.setInterval(updateDebugState, 1500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}
      <main className={`${notoSans.variable} ${notoSerif.variable}`}>
        <Component {...pageProps} />
      </main>
      <div className="fixed bottom-3 left-3 z-[300] rounded-xl border border-white/15 bg-black/85 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/80 shadow-[0_12px_34px_rgba(0,0,0,0.35)] backdrop-blur">
        <p>GA ID: {gaId || "missing"}</p>
        <p>gtag: {gaDebug.hasGtag ? "yes" : "no"}</p>
        <p>script: {gaDebug.hasScript ? "yes" : "no"}</p>
      </div>
    </>
  );
}
