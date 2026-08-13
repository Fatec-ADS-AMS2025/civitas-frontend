/**
 * O contrato multipart/hash atual nao define tamanho maximo de anexo.
 * Defina este valor apenas quando o limite for confirmado pelo backend.
 */
export const DOCUMENT_SIZE_LIMIT_BYTES: number | null = null;

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
};

const SUPPORTED_DOCUMENT_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

const getExtension = (fileName?: string): string => {
  const normalizedName = fileName?.trim().toLowerCase() ?? "";
  const separatorIndex = normalizedName.lastIndexOf(".");
  return separatorIndex >= 0 ? normalizedName.slice(separatorIndex + 1) : "";
};

export const getDocumentMimeType = (fileName?: string, mimeType?: string): string => {
  const normalizedMimeType = mimeType?.trim().toLowerCase() ?? "";
  if (SUPPORTED_DOCUMENT_MIME_TYPES.has(normalizedMimeType)) {
    return normalizedMimeType;
  }

  return MIME_BY_EXTENSION[getExtension(fileName)] ?? normalizedMimeType;
};

export const getDocumentFileName = (fileName?: string, fallback = "documento"): string => {
  const normalizedName = fileName
    ?.trim()
    .split(/[\\/]/)
    .pop()
    ?.replace(/[\u0000-\u001F]/g, "")
    .trim();
  if (normalizedName) return normalizedName;

  return `${fallback}.pdf`;
};

export const formatDocumentFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "Nao informado";

  const units = ["B", "KB", "MB", "GB"];
  let nextSize = bytes;
  let unitIndex = 0;

  while (nextSize >= 1024 && unitIndex < units.length - 1) {
    nextSize /= 1024;
    unitIndex += 1;
  }

  return `${nextSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const validateDocumentFile = (file: File): string | null => {
  if (file.size <= 0) return "O arquivo selecionado esta vazio.";

  if (DOCUMENT_SIZE_LIMIT_BYTES !== null && file.size > DOCUMENT_SIZE_LIMIT_BYTES) {
    return `O documento deve ter no maximo ${formatDocumentFileSize(DOCUMENT_SIZE_LIMIT_BYTES)}.`;
  }

  const mimeType = getDocumentMimeType(file.name, file.type);
  if (!SUPPORTED_DOCUMENT_MIME_TYPES.has(mimeType)) {
    return "Formato nao suportado. Envie um arquivo PDF.";
  }

  return null;
};

export const readDocumentFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo selecionado."));
    reader.onabort = () => reject(new Error("A leitura do arquivo foi cancelada."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Nao foi possivel converter o arquivo para Base64."));
        return;
      }

      const separatorIndex = reader.result.indexOf(",");
      const rawBase64 = separatorIndex >= 0 ? reader.result.slice(separatorIndex + 1) : "";
      if (!rawBase64) {
        reject(new Error("Arquivo convertido sem conteudo Base64."));
        return;
      }

      resolve(rawBase64);
    };

    reader.readAsDataURL(file);
  });
};

const normalizeBase64 = (base64: string): string => {
  const value = base64.trim();
  const separatorIndex = value.indexOf(",");
  return (separatorIndex >= 0 ? value.slice(separatorIndex + 1) : value).replace(/\s/g, "");
};

export const base64ToDocumentBlob = (base64: string, mimeType?: string, fileName?: string): Blob => {
  const normalizedBase64 = normalizeBase64(base64);
  if (!normalizedBase64) throw new Error("Documento sem conteudo para abertura.");

  try {
    const binary = window.atob(normalizedBase64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], {
      type: getDocumentMimeType(fileName, mimeType) || "application/octet-stream",
    });
  } catch {
    throw new Error("O conteudo do documento esta invalido ou corrompido.");
  }
};

export const canPreviewDocument = (mimeType?: string, fileName?: string): boolean => {
  const resolvedMimeType = getDocumentMimeType(fileName, mimeType);
  return resolvedMimeType === "application/pdf";
};

export const buildDocumentPreviewUrl = (
  base64: string,
  mimeType?: string,
  fileName?: string
): string => {
  const resolvedMimeType = getDocumentMimeType(fileName, mimeType);
  const normalizedBase64 = normalizeBase64(base64);

  if (!normalizedBase64 || !canPreviewDocument(resolvedMimeType, fileName)) return "";
  return `data:${resolvedMimeType};base64,${normalizedBase64}`;
};

const revokeObjectUrlLater = (url: string): void => {
  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};

export const downloadDocumentBlob = (blob: Blob, fileName?: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getDocumentFileName(fileName);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  revokeObjectUrlLater(url);
};

export const openDocumentBlob = (blob: Blob, target?: Window | null): boolean => {
  const url = window.URL.createObjectURL(blob);
  const documentWindow =
    target === undefined
      ? openDocumentWindow()
      : target && !target.closed
        ? target
        : null;

  if (!documentWindow) {
    window.URL.revokeObjectURL(url);
    return false;
  }

  documentWindow.location.replace(url);
  documentWindow.focus();
  revokeObjectUrlLater(url);
  return true;
};

export const openDocumentWindow = (): Window | null => {
  const documentWindow = window.open("", "_blank");
  if (documentWindow) {
    documentWindow.opener = null;
  }

  return documentWindow;
};
