import sanitizeHtml from "sanitize-html";

function sanitizeString(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function sanitizeObjectStrings<T>(
  value: T,
  exemptKeys = new Set<string>(),
): T {
  if (typeof value === "string") {
    return sanitizeString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObjectStrings(item, exemptKeys)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, nestedValue]) => [
        key,
        exemptKeys.has(key)
          ? nestedValue
          : sanitizeObjectStrings(nestedValue, exemptKeys),
      ],
    );

    return Object.fromEntries(entries) as T;
  }

  return value;
}