export const DEFAULT_MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
export const DEFAULT_MAX_MEDIA_FILE_BYTES = 12 * 1024 * 1024; // 12 MB
export const DEFAULT_MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB

export interface FileValidationResult {
  ok: boolean;
  errorEn?: string;
  errorAr?: string;
}

export function validateAttachmentFile(
  file: File | null | undefined,
  options?: {
    maxBytes?: number;
    allowedMimePrefixes?: string[];
    allowedExtensions?: string[];
  },
): FileValidationResult {
  if (!file) {
    return {
      ok: false,
      errorEn: "No file was selected.",
      errorAr: "لم يتم اختيار أي ملف.",
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      errorEn: "The selected file is empty (0 bytes).",
      errorAr: "الملف المحدد فارغ (0 بايت).",
    };
  }

  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_ATTACHMENT_BYTES;
  if (file.size > maxBytes) {
    const mb = Math.max(1, Math.round(maxBytes / (1024 * 1024)));
    return {
      ok: false,
      errorEn: `File is too large. Maximum allowed size is ${mb} MB.`,
      errorAr: `حجم الملف كبير جداً. الحد الأقصى المسموح به هو ${mb} ميجابايت.`,
    };
  }

  const prefixes = options?.allowedMimePrefixes;
  const exts = options?.allowedExtensions;
  const nameLower = (file.name || "").toLowerCase();
  const typeLower = (file.type || "").toLowerCase();

  if (prefixes?.length || exts?.length) {
    const mimeMatched = Boolean(prefixes?.some((p) => typeLower.startsWith(p.toLowerCase())));
    const extMatched = Boolean(exts?.some((ext) => nameLower.endsWith(ext.toLowerCase())));
    if (!mimeMatched && !extMatched) {
      return {
        ok: false,
        errorEn: "Unsupported file format. Please choose a valid file type.",
        errorAr: "صيغة الملف غير مدعومة. يرجى اختيار صيغة ملف صالحة.",
      };
    }
  }

  return { ok: true };
}

export function readFileAsTextSafe(
  file: File,
  options?: {
    maxBytes?: number;
    allowedExtensions?: string[];
    allowedMimePrefixes?: string[];
  },
): Promise<string> {
  const check = validateAttachmentFile(file, {
    maxBytes: options?.maxBytes ?? DEFAULT_MAX_TEXT_FILE_BYTES,
    ...(options?.allowedExtensions ? { allowedExtensions: options.allowedExtensions } : {}),
    ...(options?.allowedMimePrefixes ? { allowedMimePrefixes: options.allowedMimePrefixes } : {}),
  });
  if (!check.ok) {
    return Promise.reject(new Error(check.errorEn || "Invalid file."));
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      reject(new Error("Could not read file contents cleanly."));
    };
    reader.onabort = () => {
      reject(new Error("File reading was cancelled."));
    };
    try {
      reader.readAsText(file);
    } catch (err) {
      reject(err instanceof Error ? err : new Error("Failed to start reading file."));
    }
  });
}

export function readFileAsDataUrlSafe(
  file: File,
  options?: {
    maxBytes?: number;
    allowedMimePrefixes?: string[];
    allowedExtensions?: string[];
  },
): Promise<string> {
  const check = validateAttachmentFile(file, {
    maxBytes: options?.maxBytes ?? DEFAULT_MAX_MEDIA_FILE_BYTES,
    ...(options?.allowedMimePrefixes ? { allowedMimePrefixes: options.allowedMimePrefixes } : {}),
    ...(options?.allowedExtensions ? { allowedExtensions: options.allowedExtensions } : {}),
  });
  if (!check.ok) {
    return Promise.reject(new Error(check.errorEn || "Invalid file."));
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === "string" ? reader.result : "";
      if (!res) {
        reject(new Error("Empty file output."));
        return;
      }
      resolve(res);
    };
    reader.onerror = () => {
      reject(new Error("Could not load file preview."));
    };
    reader.onabort = () => {
      reject(new Error("File preview loading was cancelled."));
    };
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      reject(err instanceof Error ? err : new Error("Failed to read file."));
    }
  });
}

/**
 * Safely triggers a browser file download from a Blob without revoking the ObjectURL
 * synchronously (which can abort downloads in Safari/Chromium), and guarantees cleanup.
 */
export function downloadBlobFile(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const safeName = filename.trim() || "download.txt";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  try {
    link.href = url;
    link.download = safeName;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
  } finally {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    window.setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore already-revoked URL */
      }
    }, 1500);
  }
}

export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function downloadDataUrlFile(dataUrl: string, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const safeName = filename.trim() || "download";
  try {
    const commaIdx = dataUrl.indexOf(",");
    if (dataUrl.startsWith("data:") && commaIdx > 0) {
      const header = dataUrl.slice(5, commaIdx);
      const body = dataUrl.slice(commaIdx + 1);
      const mimeType = header.split(";")[0] || "application/octet-stream";
      if (header.includes(";base64")) {
        const binary = window.atob(body);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        downloadBlobFile(new Blob([bytes], { type: mimeType }), safeName);
        return;
      }
      downloadBlobFile(new Blob([decodeURIComponent(body)], { type: mimeType }), safeName);
      return;
    }
  } catch {
    /* fallback to direct anchor download */
  }
  const link = document.createElement("a");
  try {
    link.href = dataUrl;
    link.download = safeName;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
  } finally {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType = "text/plain;charset=utf-8",
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlobFile(blob, filename);
}

const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

export function getSupportedAudioMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return "";
  if (typeof MediaRecorder.isTypeSupported !== "function") return "";
  for (const mime of AUDIO_MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    } catch {
      /* continue probing */
    }
  }
  return "";
}

export function safeStopMediaRecorder(
  recorder: MediaRecorder | null | undefined,
  stream?: MediaStream | null,
): void {
  if (recorder) {
    try {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    } catch {
      /* ignore InvalidStateError on already inactive recorders */
    }
  }
  if (stream) {
    try {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          /* ignore */
        }
      });
    } catch {
      /* ignore */
    }
  }
}
