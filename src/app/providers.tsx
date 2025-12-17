"use client";

import { useRef } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { makeStore, AppStore } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return (
    <ReduxProvider store={storeRef.current}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
