"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  addAuthorizedEmail,
  listAuthorizedEmails,
  removeAuthorizedEmail,
  updateAuthorizedEmail,
} from "@/lib/sheet-actions";
import type { AuthorizedUser } from "../types";
import { filterAuthorizedUsers } from "../helpers/filterAuthorizedUsers";

const SESSION_KEY = "authorized_access_code";

const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((cb) => cb());
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSavedPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

function setSavedPassword(val: string | null) {
  if (typeof window === "undefined") return;
  if (val) {
    sessionStorage.setItem(SESSION_KEY, val);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
  notify();
}

type Options = {
  currentUserEmail: string | null;
  addAuthorizedEnabled: boolean;
};

export function useAuthorizedPage({
  currentUserEmail,
  addAuthorizedEnabled,
}: Options) {
  const savedPassword = useSyncExternalStore(
    subscribe,
    getSavedPassword,
    () => null,
  );

  const [passwordVerified, setPasswordVerified] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [userToDelete, setUserToDelete] = useState<AuthorizedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [userToEdit, setUserToEdit] = useState<AuthorizedUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isCheckingSession = Boolean(
    savedPassword && !passwordVerified && !passwordError,
  );

  const loadUsers = useCallback(async (password: string) => {
    setLoadingList(true);
    setListError(null);
    try {
      const result = await listAuthorizedEmails(password);
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setListError(result.error ?? "שגיאה בטעינת רשימת המורשים.");
      }
    } catch {
      setListError("שגיאת תקשורת בטעינת הנתונים.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!savedPassword || passwordVerified) return;

    let isMounted = true;
    listAuthorizedEmails(savedPassword)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.users) {
          setCurrentPassword(savedPassword);
          setPasswordVerified(true);
          setUsers(res.users);
        } else {
          setSavedPassword(null);
          setPasswordError("פג תוקף קוד האבטחה. נא להזין שוב.");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSavedPassword(null);
        setPasswordError("שגיאת תקשורת באימות הקוד.");
      });

    return () => {
      isMounted = false;
    };
  }, [savedPassword, passwordVerified]);

  const handleGateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!enteredPassword.trim()) return;

    setVerifyingPassword(true);
    setPasswordError(null);

    try {
      const result = await listAuthorizedEmails(enteredPassword);
      if (result.success && result.users) {
        setCurrentPassword(enteredPassword);
        setPasswordVerified(true);
        setUsers(result.users);
        setSavedPassword(enteredPassword);
      } else {
        setPasswordError(result.error ?? "קוד אבטחה שגוי. נא לנסות שוב.");
      }
    } catch {
      setPasswordError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addAuthorizedEnabled || !currentPassword) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setActionError("נא להזין שם מלא.");
      return;
    }
    if (!trimmedEmail) {
      setActionError("נא להזין כתובת אימייל.");
      return;
    }

    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const result = await addAuthorizedEmail(
        currentPassword,
        trimmedEmail,
        trimmedName,
      );
      if (result.success) {
        setName("");
        setEmail("");
        setActionSuccess("המורשה נוסף בהצלחה למערכת.");
        await loadUsers(currentPassword);
      } else {
        setActionError(result.error ?? "אירעה שגיאה בהוספת המורשה.");
      }
    } catch {
      setActionError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || !currentPassword) return;

    setDeleting(true);
    setActionError(null);
    try {
      const result = await removeAuthorizedEmail(
        currentPassword,
        userToDelete.email,
      );
      if (result.success) {
        setUserToDelete(null);
        await loadUsers(currentPassword);
      } else {
        setActionError(result.error ?? "אירעה שגיאה במחיקת המורשה.");
      }
    } catch {
      setActionError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmEdit = async (newName: string, newEmail: string) => {
    if (!userToEdit || !currentPassword) return;

    setEditing(true);
    setEditError(null);
    try {
      const result = await updateAuthorizedEmail(
        currentPassword,
        userToEdit.email,
        newEmail,
        newName,
      );
      if (result.success) {
        setUserToEdit(null);
        await loadUsers(currentPassword);
      } else {
        setEditError(result.error ?? "אירעה שגיאה בעדכון המורשה.");
      }
    } catch {
      setEditError("שגיאת תקשורת. נא לנסות שוב.");
    } finally {
      setEditing(false);
    }
  };

  const handleLock = () => {
    setSavedPassword(null);
    setPasswordVerified(false);
    setCurrentPassword("");
    setEnteredPassword("");
    setUsers([]);
    setPasswordError(null);
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const filteredUsers = useMemo(
    () => filterAuthorizedUsers(users, searchQuery),
    [users, searchQuery],
  );

  return {
    isCheckingSession,
    passwordVerified,
    enteredPassword,
    setEnteredPassword,
    showPassword,
    toggleShowPassword,
    verifyingPassword,
    passwordError,
    handleGateSubmit,
    users,
    filteredUsers,
    totalCount: users.length,
    filteredCount: filteredUsers.length,
    loadingList,
    listError,
    searchQuery,
    setSearchQuery,
    name,
    setName,
    email,
    setEmail,
    submitting,
    actionError,
    actionSuccess,
    handleCreateUser,
    userToDelete,
    setUserToDelete,
    deleting,
    handleConfirmDelete,
    userToEdit,
    setUserToEdit,
    editing,
    editError,
    handleConfirmEdit,
    loadUsers: () => loadUsers(currentPassword),
    handleLock,
    currentUserEmail,
    addAuthorizedEnabled,
  };
}
