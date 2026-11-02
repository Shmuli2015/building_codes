export function checkEnvPassword(
  envKey: string,
  passwordAttempt: string,
  missingMessage: string,
): { ok: true } | { ok: false; error: string } {
  const secretCode = process.env[envKey];
  if (!secretCode) {
    return { ok: false, error: missingMessage };
  }

  if (passwordAttempt !== secretCode) {
    return { ok: false, error: "קוד אבטחה שגוי." };
  }

  return { ok: true };
}
