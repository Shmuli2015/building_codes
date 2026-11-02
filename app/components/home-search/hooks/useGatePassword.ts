"use client";

import { useEffect, useState } from "react";

type VerifyResult = { verified: boolean; error?: string };

type UseGatePasswordOptions = {
  open: boolean;
  verify: (password: string) => Promise<VerifyResult>;
  onVerified?: (password: string) => void | Promise<void>;
};

export function useGatePassword({
  open,
  verify,
  onVerified,
}: UseGatePasswordOptions) {
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPasswordVerified(false);
    setEnteredPassword("");
    setShowPassword(false);
    setPasswordError(null);
    setVerifyingPassword(false);
  }, [open]);

  const handlePasswordSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setVerifyingPassword(true);
    setPasswordError(null);

    try {
      const result = await verify(enteredPassword);
      if (result.verified) {
        setPasswordVerified(true);
        setPasswordError(null);
        await onVerified?.(enteredPassword);
      } else {
        setPasswordError(result.error ?? "קוד אבטחה שגוי. נא לנסות שוב.");
      }
    } catch {
      setPasswordError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return {
    passwordVerified,
    enteredPassword,
    setEnteredPassword,
    showPassword,
    toggleShowPassword,
    passwordError,
    verifyingPassword,
    handlePasswordSubmit,
  };
}
