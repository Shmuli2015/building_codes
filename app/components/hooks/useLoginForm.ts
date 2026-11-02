"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { login } from "@/lib/auth-actions";

const LAST_EMAIL_KEY = "building_codes_last_email";

export function useLoginForm() {
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_EMAIL_KEY);
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

  const clearError = () => {
    if (error) setError(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearError();
  };

  const updateCapsLock = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    try {
      if (rememberEmail && email.trim()) {
        localStorage.setItem(LAST_EMAIL_KEY, email.trim());
      } else if (!rememberEmail) {
        localStorage.removeItem(LAST_EMAIL_KEY);
      }
    } catch {}

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    });
  };

  const focusPassword = () => passwordInputRef.current?.focus();

  return {
    email,
    password,
    error,
    showPassword,
    setShowPassword,
    capsLockOn,
    setCapsLockOn,
    rememberEmail,
    setRememberEmail,
    shake,
    isPending,
    isSubmitDisabled,
    emailInputRef,
    passwordInputRef,
    whatsappPhone,
    handleEmailChange,
    handlePasswordChange,
    updateCapsLock,
    handleSubmit,
    focusPassword,
  };
}
