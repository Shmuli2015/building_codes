"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addAuthorizedEmail,
  listAuthorizedEmails,
  removeAuthorizedEmail,
} from "@/lib/sheet-actions";
import type { AuthorizedUser } from "@/lib/auth-types";

type UseAuthorizedUsersAdminOptions = {
  open: boolean;
  addAuthorizedEnabled?: boolean;
  onSuccess: () => void;
};

export function useAuthorizedUsersAdmin({
  open,
  addAuthorizedEnabled,
  onSuccess,
}: UseAuthorizedUsersAdminOptions) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadList = useCallback(async (password: string) => {
    setLoadingList(true);
    setError(null);
    try {
      const result = await listAuthorizedEmails(password);
      if (result.success && result.users) {
        setAuthorizedUsers(result.users);
      } else {
        setError(result.error ?? "שגיאה בטעינת רשימת המורשים.");
      }
    } catch {
      setError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setName("");
    setAuthorizedUsers([]);
    setError(null);
    setSuccess(false);
    setLoadingList(false);
    setDeletingEmail(null);
    setEmailToDelete(null);
  }, [open]);

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
    password: string,
  ) => {
    e.preventDefault();
    if (!addAuthorizedEnabled) return;

    if (!email.trim()) {
      setError("נא להזין כתובת אימייל.");
      return;
    }

    if (!name.trim()) {
      setError("נא להזין שם.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await addAuthorizedEmail(
        password,
        email.trim(),
        name.trim(),
      );

      if (result.success) {
        setSuccess(true);
        setEmail("");
        setName("");
        onSuccess();
        await loadList(password);
      } else {
        setError(result.error ?? "אירעה שגיאה בהוספת המורשה.");
      }
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!addAuthorizedEnabled || !emailToDelete) return;

    setDeletingEmail(emailToDelete);
    setError(null);
    setSuccess(false);

    try {
      const result = await removeAuthorizedEmail(password, emailToDelete);
      if (result.success) {
        setEmailToDelete(null);
        onSuccess();
        await loadList(password);
      } else {
        setError(result.error ?? "אירעה שגיאה במחיקת המורשה.");
      }
    } catch (err) {
      setError("שגיאת תקשורת. נא לנסות שוב.");
      console.error(err);
    } finally {
      setDeletingEmail(null);
    }
  };

  const userToDelete = emailToDelete
    ? authorizedUsers.find((user) => user.email === emailToDelete)
    : null;

  return {
    email,
    setEmail,
    name,
    setName,
    authorizedUsers,
    loadingList,
    submitting,
    deletingEmail,
    emailToDelete,
    setEmailToDelete,
    error,
    success,
    loadList,
    handleSubmit,
    handleDeleteConfirm,
    userToDelete,
  };
}
