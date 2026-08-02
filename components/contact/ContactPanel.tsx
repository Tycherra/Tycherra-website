"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lockIn } from "@/lib/lockin-engine";
import { contact } from "@/content/contact";
import { site } from "@/content/site";
import { WhatsApp } from "@/components/ui/Glyph";

/*  ═══════════════════════════════════════════════════════════════════
    THE PANEL — PART 4.4 / 6.4.
    The only instrument on the quietest page.

      · a status light per row that warms when the row holds something
        valid — email only lights on a valid address
      · an n-of-5 counter
      · a send control that lights only when the message is ready
      · on submit the panel is replaced by the lock-in and the
        confirmation, which is the same motion as the home loader

    Errors render inside the panel in the system's own type. Never an
    alert, never a red toast — PART 6.4.
    ═══════════════════════════════════════════════════════════════════ */

type Values = Record<string, string>;

const REQUIRED = ["name", "email", "what", "when"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isFilled = (name: string, v: string) =>
  name === "email" ? EMAIL_RE.test(v.trim()) : v.trim().length > 1;

export function ContactPanel() {
  const [values, setValues] = useState<Values>({});
  const [services, setServices] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const lockRef = useRef<HTMLCanvasElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const filledCount = contact.fields.filter((f) =>
    isFilled(f.name, values[f.name] ?? ""),
  ).length;
  const ready = REQUIRED.every((n) => isFilled(n, values[n] ?? ""));

  /* the lock-in only exists once the panel has been replaced */
  useEffect(() => {
    if (state !== "sent" || !lockRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stop = lockIn(lockRef.current, reduced);
    sentRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    });
    return stop;
  }, [state]);

  const set = useCallback(
    (name: string, v: string) => setValues((p) => ({ ...p, [name]: v })),
    [],
  );

  const toggle = (chip: string) =>
    setServices((p) => (p.includes(chip) ? p.filter((c) => c !== chip) : [...p, chip]));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || state === "sending") return;
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: values.name ?? "",
          email: values.email ?? "",
          company: values.company ?? "",
          what: values.what ?? "",
          when: values.when ?? "",
          services,
          /* the honeypot. Never filled by a person, never focusable. */
          website: values.website ?? "",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not send just now. Please try again.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError(
        "Could not reach us just now. Please try again, or email tycherra@gmail.com directly.",
      );
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="sent show" ref={sentRef} aria-live="polite">
        <canvas ref={lockRef} width={72} height={72} aria-hidden="true" />
        <div>
          <h3>{contact.sent.title}</h3>
          <p>{contact.sent.body}</p>
        </div>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <fieldset className="f__set skw">
        <legend className="lb f__legend">{contact.chipsLegend}</legend>
        <div className="chips">
          {contact.chips.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={services.includes(c)}
              onClick={() => toggle(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="pair">
        {contact.fields.slice(0, 2).map((f) => (
          <Row key={f.id} field={f} value={values[f.name] ?? ""} onChange={set} />
        ))}
      </div>
      {contact.fields.slice(2).map((f) => (
        <Row key={f.id} field={f} value={values[f.name] ?? ""} onChange={set} />
      ))}

      {/* PART 6.1 — the honeypot. Off-screen, not display:none, so a
          bot that respects visibility still fills it. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input
          id="f-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website ?? ""}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <div className="send">
        <button
          className={`btn${ready ? " ready" : ""}`}
          type="submit"
          disabled={!ready || state === "sending"}
        >
          <i aria-hidden="true" />
          {state === "sending" ? contact.hint.sending : contact.button}
        </button>
        <span className="lb" data-counter>
          {state === "sending"
            ? contact.hint.sending
            : ready
              ? contact.hint.ready
              : contact.hint.idle}
        </span>
        <span className="lb ml-auto">
          <b>{filledCount}</b> {contact.panel.counterSuffix}
        </span>
      </div>

      <p className="f__err" role="status" aria-live="polite">
        {error}
      </p>

      {/*  The immediate route, alongside the considered one. It sits
           under the send row rather than in the aside list because a
           visitor who does not want to write a brief decides that while
           looking at the brief, not three columns away. */}
      <div className="ask">
        <span className="ask__rule" aria-hidden="true" />
        <span className="lb ask__lb">{contact.whatsapp.rule}</span>
        <a
          className="ask__go"
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsApp />
          <span>{contact.whatsapp.action}</span>
          <i aria-hidden="true" />
        </a>
        <span className="lb ask__note">{contact.whatsapp.note}</span>
      </div>
    </form>
  );
}

function Row({
  field,
  value,
  onChange,
}: {
  field: (typeof contact.fields)[number];
  value: string;
  onChange: (name: string, v: string) => void;
}) {
  const filled = isFilled(field.name, value);
  const common = {
    id: field.id,
    name: field.name,
    value,
    placeholder: field.placeholder,
    required: field.required,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(field.name, e.target.value),
  };

  return (
    <div className={`row${filled ? " filled" : ""}`}>
      <label className="lb" htmlFor={field.id}>
        {field.label}
        {field.optional && <span className="opacity-50"> — optional</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea {...common} />
      ) : (
        <input {...common} type={field.type} autoComplete={field.autoComplete} />
      )}
    </div>
  );
}
