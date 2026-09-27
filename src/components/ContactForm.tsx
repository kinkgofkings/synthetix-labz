import { FormEvent, useState } from "react";
import { useProfile } from "../context/ProfileContext";

export function ContactForm() {
  const { profile } = useProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [note, setNote] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (honey) {
      setStatus("sent");
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      setNote("Name, email, and message are required.");
      return;
    }
    setStatus("sending");
    setNote("");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(profile.formEmail)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          _subject: `Synthetix Labz — ${name.trim()}`,
          _template: "table",
          _replyto: email.trim(),
        }),
      });
      const payload = (await response.json()) as { success?: string; message?: string };
      if (!response.ok || payload.success === "false") {
        throw new Error(payload.message || "The lab could not accept the message.");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
      setNote(payload.message || `Delivered to ${profile.formEmail}.`);
    } catch (error) {
      setStatus("error");
      setNote(error instanceof Error ? error.message : "Send failed.");
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-3" noValidate>
      <label className="grid gap-1 text-[10px] tracking-[0.2em] text-mute">
        NAME
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
          className="border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none focus:border-lab"
        />
      </label>
      <label className="grid gap-1 text-[10px] tracking-[0.2em] text-mute">
        EMAIL
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none focus:border-lab"
        />
      </label>
      <label className="grid gap-1 text-[10px] tracking-[0.2em] text-mute">
        MESSAGE
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={5}
          className="border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none focus:border-lab"
        />
      </label>
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Company
        <input value={honey} onChange={(event) => setHoney(event.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="border border-lab bg-lab px-4 py-3 text-xs tracking-[0.28em] text-void disabled:opacity-60"
      >
        {status === "sending" ? "SENDING" : "SEND TO THE LAB"}
      </button>
      <p className="text-xs text-mute" role="status">
        {status === "sent" ? note || `Sent to ${profile.formEmail}.` : note}
      </p>
    </form>
  );
}
