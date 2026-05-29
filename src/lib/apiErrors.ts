/** User-facing message from API / fetch failures */
export function getApiErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (err instanceof TypeError) {
    return "Brak połączenia z serwerem. Na telefonie uruchom aplikację przez pnpm dev:mobile (mocki), albo ustaw backend dostępny w sieci — nie localhost.";
  }

  if (err instanceof Error) {
    return err.message || "Nieznany błąd";
  }

  if (typeof err === "object" && err !== null) {
    const body = err as { message?: string; title?: string; detail?: string; errors?: string[] };
    const parts = [body.message, body.title, body.detail].filter(Boolean);
    if (body.errors?.length) parts.push(...body.errors);
    if (parts.length > 0) return parts.join(" — ");
  }

  return "Błąd połączenia z API";
}
