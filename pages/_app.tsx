import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans, Noto_Serif } from "next/font/google";

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
  return (
    <main className={`${notoSans.variable} ${notoSerif.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
