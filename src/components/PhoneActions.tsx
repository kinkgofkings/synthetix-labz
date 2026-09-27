import { useEffect, useId, useState } from "react";
import { MessageSquare, Phone, X } from "lucide-react";

export function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : "";
}

export function PhoneActions({ phone, className = "" }: { phone: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const e164 = toE164(phone);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`underline decoration-lab/40 underline-offset-4 hover:text-lab ${className}`}
      >
        {phone}
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 sm:items-center" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-sm border border-lab/50 bg-void p-5 shadow-[0_0_40px_rgba(0,240,255,0.25)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p id={titleId} className="text-xs tracking-[0.28em] text-lab">
                  DIRECT LINE
                </p>
                <p className="mt-2 text-lg text-ink">{phone}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-mute hover:text-lab">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a
                href={`tel:${e164}`}
                className="inline-flex items-center justify-center gap-2 border border-lab bg-lab px-3 py-3 text-xs tracking-[0.2em] text-void"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                CALL
              </a>
              <a
                href={`sms:${e164}`}
                className="inline-flex items-center justify-center gap-2 border border-lab px-3 py-3 text-xs tracking-[0.2em] text-lab hover:bg-lab hover:text-void"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                TEXT
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
