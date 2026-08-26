const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractAndDeduplicateEmails(rawContent: string): string[] {
  if (!rawContent || typeof rawContent !== 'string') {
    return [];
  }

  const matches = rawContent.match(EMAIL_REGEX) || [];
  const uniqueEmails = new Set<string>();

  for (const email of matches) {
    const cleaned = email.trim().toLowerCase();
    if (cleaned.length > 3) {
      uniqueEmails.add(cleaned);
    }
  }

  return Array.from(uniqueEmails);
}
