"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import ConsentBanner from "@/components/ConsentBanner";
import { trackPerformanceMetric, type ConsentPreferences } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";

const CONSENT_KEY = "alliance_consent_v1";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-TR2J78K3F0";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";

type AnalyticsContextValue = {
  consent: ConsentPreferences | null;
  consentReady: boolean;
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  preferencesOpen: boolean;
  updateConsent: (preferences: Omit<ConsentPreferences, "necessary" | "updatedAt">) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

function readConsent(): ConsentPreferences | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value ? (JSON.parse(value) as ConsentPreferences) : null;
  } catch {
    return null;
  }
}

function bootstrapGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer.push(args);
    });
}

function updateGoogleConsent(consent: ConsentPreferences) {
  bootstrapGtag();
  window.gtag?.("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
    functionality_storage: consent.preferences ? "granted" : "denied",
    personalization_storage: consent.preferences ? "granted" : "denied",
    security_storage: "granted",
  });
}

function loadGtm() {
  if (!GTM_ID || document.getElementById("alliance-gtm")) return;
  window.__allianceUsesGtm = true;
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.id = "alliance-gtm";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(script);
}

function loadGa4() {
  // Script is already in root layout HTML (id=alliance-ga4) so Google can detect it.
  // Only inject if somehow missing (e.g. older cached page).
  if (!GA_ID || document.getElementById("alliance-ga4")) {
    window.__allianceUsesGtm = false;
    bootstrapGtag();
    return;
  }
  window.__allianceUsesGtm = false;
  bootstrapGtag();
  const script = document.createElement("script");
  script.id = "alliance-ga4";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_ID, {
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false,
  });
}

function loadClarity() {
  if (!CLARITY_ID || document.getElementById("alliance-clarity")) return;
  const marker = document.createElement("meta");
  marker.id = "alliance-clarity";
  document.head.appendChild(marker);
  window.clarity =
    window.clarity ||
    ((...args: unknown[]) => {
      (window.clarity!.q = window.clarity!.q || []).push(args);
    });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`;
  document.head.appendChild(script);
  window.clarity("consent", true);
}

function clearAnalyticsCookies() {
  const hostname = window.location.hostname;
  document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => /^(_ga|_gid|_gat|_clck|_clsk)/.test(name))
    .forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${hostname}`;
    });
}

function AnalyticsRuntime({ enabled }: { enabled: boolean }) {
  usePageTracking(enabled);
  useReportWebVitals(
    useCallback(
      (metric) => {
        if (enabled) trackPerformanceMetric(metric.name, metric.value, metric.rating);
      },
      [enabled]
    )
  );
  return null;
}

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);
  const [consentReady, setConsentReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      window.__allianceAnalyticsConsent = false;
      setConsentReady(true);
      return;
    }
    bootstrapGtag();
    window.gtag?.("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    });

    const saved = readConsent();
    setConsent(saved);
    setConsentReady(true);
    window.__allianceAnalyticsConsent = saved?.analytics === true;
    if (saved) updateGoogleConsent(saved);
    if (saved?.analytics) {
      if (GTM_ID) loadGtm();
      else loadGa4();
      loadClarity();
    }

    const open = () => setPreferencesOpen(true);
    window.addEventListener("alliance:open-consent", open);
    return () => window.removeEventListener("alliance:open-consent", open);
  }, [isAdmin]);

  const updateConsent = useCallback(
    (preferences: Omit<ConsentPreferences, "necessary" | "updatedAt">) => {
      const wasAnalyticsEnabled = window.__allianceAnalyticsConsent === true;
      const next: ConsentPreferences = {
        necessary: true,
        ...preferences,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
      } catch {
        // Consent still applies for the current page.
      }
      window.__allianceAnalyticsConsent = next.analytics;
      updateGoogleConsent(next);
      setConsent(next);
      setPreferencesOpen(false);

      if (next.analytics) {
        if (GTM_ID) loadGtm();
        else loadGa4();
        loadClarity();
      } else {
        window.clarity?.("consent", false);
        if (wasAnalyticsEnabled) {
          clearAnalyticsCookies();
          window.setTimeout(() => window.location.reload(), 50);
        }
      }
    },
    []
  );

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      consent,
      consentReady,
      analyticsEnabled: consent?.analytics === true,
      marketingEnabled: consent?.marketing === true,
      preferencesOpen,
      updateConsent,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [consent, consentReady, preferencesOpen, updateConsent]
  );

  if (isAdmin) return <>{children}</>;

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      <AnalyticsRuntime enabled={value.analyticsEnabled} />
      <ConsentBanner />
    </AnalyticsContext.Provider>
  );
}
