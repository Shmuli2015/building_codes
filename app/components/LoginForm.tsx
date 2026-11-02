"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
} from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

import { login } from "@/lib/auth-actions";
import { ADDRESS_INPUT_CLASS } from "./home-search/constants";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [shake, setShake] = useState(false);
  const [isPending, startTransition] = useTransition();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const rawWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_E164?.trim();
  const whatsappPhone = rawWhatsapp ? rawWhatsapp.replace(/\D/g, "") : "";

  // Auto-fill last used email and set appropriate focus
  useEffect(() => {
    try {
      const saved = localStorage.getItem("building_codes_last_email");
      if (saved) {
        setEmail(saved);
        passwordInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
    } catch {
      emailInputRef.current?.focus();
    }
  }, []);

  const isSubmitDisabled = !email.trim() || !password.trim();

  async function handleSubmit(formData: FormData) {
    setError(null);

    try {
      if (rememberEmail && email.trim()) {
        localStorage.setItem("building_codes_last_email", email.trim());
      } else if (!rememberEmail) {
        localStorage.removeItem("building_codes_last_email");
      }
    } catch {
      // Ignore storage errors
    }

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    });
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={
          shake
            ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1, y: 0 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: shake ? 0.45 : 0.35, ease: "easeOut" }}
        className="rounded-2xl border border-white/60 bg-linear-to-b from-(--surface-strong) via-white/93 to-white/88 p-5 sm:p-7 shadow-(--shadow-card) ring-1 ring-slate-900/4 backdrop-blur-xl"
      >
        <div className="text-start mb-6">
          <h1 className="font-display text-balance text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl">
            כניסה ל
            <span className="bg-linear-to-l from-blue-600 to-indigo-700 bg-clip-text text-transparent mr-1">
              קודי בניין
            </span>
          </h1>
          <p className="mt-1 text-sm leading-snug text-slate-500">
            הזן את פרטי הגישה המורשים שלך למערכת
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5 text-right">
            <label
              htmlFor="email"
              className="text-xs sm:text-sm font-medium text-slate-700 block"
            >
              כתובת אימייל
            </label>
            <input
              id="email"
              ref={emailInputRef}
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordInputRef.current?.focus();
                }
              }}
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              dir="ltr"
              placeholder="name@example.com"
              aria-invalid={error ? "true" : "false"}
              className={`${ADDRESS_INPUT_CLASS} text-left text-base sm:text-sm ${
                error
                  ? "!border-red-400 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.15)]"
                  : ""
              }`}
            />
          </div>

          {/* Password input */}
          <div className="space-y-1.5 text-right">
            <label
              htmlFor="password"
              className="text-xs sm:text-sm font-medium text-slate-700 block"
            >
              סיסמה
            </label>
            <div className="relative">
              <input
                id="password"
                ref={passwordInputRef}
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.getModifierState) {
                    setCapsLockOn(e.getModifierState("CapsLock"));
                  }
                }}
                onKeyUp={(e) => {
                  if (e.getModifierState) {
                    setCapsLockOn(e.getModifierState("CapsLock"));
                  }
                }}
                onBlur={() => setCapsLockOn(false)}
                autoComplete="current-password"
                enterKeyHint="go"
                required
                dir="ltr"
                placeholder="••••••••"
                aria-invalid={error ? "true" : "false"}
                className={`${ADDRESS_INPUT_CLASS} text-left pl-12 text-base sm:text-sm tracking-wider ${
                  error
                    ? "!border-red-400 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.15)]"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 p-2.5 sm:p-2 text-slate-400 hover:text-slate-600 active:text-slate-800 transition-colors rounded-xl touch-manipulation"
                aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Caps Lock indicator */}
            {capsLockOn && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200/70 rounded-xl px-3 py-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>שים לב: מקש Caps Lock פעיל</span>
              </div>
            )}
          </div>

          {/* Remember email */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-slate-600 hover:text-slate-800 py-1 touch-manipulation">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
              />
              <span>זכור אותי במכשיר זה</span>
            </label>
          </div>

          {/* Error & Support */}
          <AnimatePresence mode="wait">
            {error && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 overflow-hidden pt-1"
              >
                <div className="bg-red-50/90 border border-red-200/80 text-red-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2.5 text-right">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="flex-1">{error}</span>
                </div>

                {whatsappPhone && error.includes("מורשה") && (
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                      `שלום, ברצוני לבקש הרשאת גישה למערכת קודי בניין עבור כתובת המייל: ${email.trim()}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl py-2.5 px-3 transition-colors shadow-sm touch-manipulation"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>בקש הרשאה בוואטסאפ מהמנהל</span>
                  </a>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || isSubmitDisabled}
              className="relative min-h-[50px] sm:min-h-12 w-full overflow-hidden rounded-2xl bg-linear-to-l from-blue-600 via-indigo-600 to-blue-700 px-5 py-3 text-base font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_12px_36px_-12px_rgba(37,99,235,0.45)] ring-1 ring-white/25 outline-none hover:brightness-[1.04] active:scale-[0.98] active:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[0.3] transition-all flex items-center justify-center gap-2 touch-manipulation"
            >
              {isPending ? (
                <>
                  <span>מתחבר למערכת...</span>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                </>
              ) : (
                <span>כניסה למערכת</span>
              )}
            </button>
          </div>
        </form>
      </m.div>
    </LazyMotion>
  );
}
