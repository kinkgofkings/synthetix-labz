import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { Logo } from "./Logo";

const INSTALLED_KEY = "synthetix-pwa-installed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(nav.standalone);
}

function rememberInstalled() {
  localStorage.setItem(INSTALLED_KEY, "1");
}

function rememberedInstalled() {
  return localStorage.getItem(INSTALLED_KEY) === "1";
}

function isIosBrowser() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function deviceHint() {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "On iPhone or iPad, open the Share sheet and choose Add to Home Screen.";
  if (/android/i.test(ua)) return "Open the browser menu and choose Install app or Add to Home screen.";
  return "Use the install icon in the address bar, or the browser menu, and choose Install.";
}

export function InstallModal({ active }: { active: boolean }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(() => isStandalone() || rememberedInstalled());
  const prompted = useRef(false);

  useEffect(() => {
    if (isStandalone()) {
      rememberInstalled();
      setInstalled(true);
      return;
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      prompted.current = true;
      localStorage.removeItem(INSTALLED_KEY);
      setInstalled(false);
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      rememberInstalled();
      setInstalled(true);
      setOpen(false);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const nav = navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<Array<{ platform?: string }>>;
    };
    let cancelled = false;
    if (nav.getInstalledRelatedApps) {
      void nav.getInstalledRelatedApps().then((apps) => {
        if (cancelled || prompted.current) return;
        if (apps.some((app) => app.platform === "webapp")) {
          rememberInstalled();
          setInstalled(true);
          setOpen(false);
        }
      }).catch(() => undefined);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!active || installed) return;
    if (sessionStorage.getItem("synthetix-install-dismissed") === "1") return;
    if (!deferred && !isIosBrowser()) return;
    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [active, installed, deferred]);

  if (!active || installed || !open) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "accepted") {
      rememberInstalled();
      setInstalled(true);
      setOpen(false);
    }
  }

  function dismiss() {
    sessionStorage.setItem("synthetix-install-dismissed", "1");
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/65 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        className="w-full max-w-md border border-lab/60 bg-void p-5 shadow-[0_0_48px_rgba(0,240,255,0.28)]"
      >
        <div className="flex items-start gap-3">
          <Logo className="h-12 w-12 shrink-0" />
          <div className="min-w-0 flex-1">
            <p id="install-title" className="text-sm tracking-[0.22em] text-ink">
              INSTALL SYNTHETIX LABZ
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              Put the lab on your home screen. It opens full screen, like an installed app, on phone, tablet, or desktop.
            </p>
          </div>
          <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="text-mute hover:text-lab">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 border border-lab/20 bg-panel px-3 py-2 text-xs leading-relaxed text-ink">{deviceHint()}</p>
        <div className="mt-4 flex gap-2">
          {deferred && (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex flex-1 items-center justify-center gap-2 bg-lab px-3 py-2 text-xs tracking-[0.18em] text-void"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              INSTALL
            </button>
          )}
          <button type="button" onClick={dismiss} className="flex-1 border border-lab/40 px-3 py-2 text-xs tracking-[0.18em] text-lab">
            LATER
          </button>
        </div>
      </div>
    </div>
  );
}
