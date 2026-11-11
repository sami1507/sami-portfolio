"use client";
import { useRef, useState } from "react";
import { copy, profile, type Locale } from "@/data/site";
import { Arrow } from "./Icons";
export function Contact({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "copying" | "success" | "error">(
    "idle",
  );
  const pending = useRef(false);
  async function copyAddress() {
    if (pending.current) return;
    pending.current = true;
    setState("copying");
    setMessage("");
    try {
      await navigator.clipboard.writeText(profile.email);
      setMessage(t.copied);
      setState("success");
    } catch {
      setMessage(t.copyError);
      setState("error");
    } finally {
      pending.current = false;
    }
  }
  return (
    <section className="contact-section section" id="contact">
      <div className="container">
        <p className="eyebrow">{t.contactEyebrow}</p>
        <div className="contact-grid">
          <h2>
            {t.contactTitle.split("\n").map((line, i) => (
              <span key={line}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h2>
          <div className="contact-details">
            <p>{t.contactText}</p>
            <a
              className="contact-email"
              href={`mailto:${profile.email}`}
              dir="ltr"
            >
              {profile.email}
              <Arrow diagonal />
            </a>
            <div className="contact-actions">
              <a href={`mailto:${profile.email}`}>
                {t.emailAction}
                <Arrow diagonal />
              </a>
              <button
                data-testid="copy-email"
                onClick={copyAddress}
                aria-label={state === "copying" ? t.copying : t.copyEmail}
                disabled={state === "copying"}
                aria-busy={state === "copying"}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="8"
                    y="8"
                    width="12"
                    height="12"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M15 8V4H4v11h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                {state === "copying" ? t.copying : t.copyEmail}
              </button>
            </div>
            <p
              className="copy-status"
              data-state={state}
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
            <div className="social-links">
              <a href={profile.github}>
                GitHub
                <Arrow diagonal />
              </a>
              <a href={profile.linkedin}>
                LinkedIn
                <Arrow diagonal />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
