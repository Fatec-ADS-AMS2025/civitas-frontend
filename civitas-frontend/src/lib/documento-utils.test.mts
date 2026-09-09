import assert from "node:assert/strict";
import test from "node:test";
import {
  DOCUMENT_SIZE_LIMIT_BYTES,
  base64ToDocumentBlob,
  buildDocumentPreviewUrl,
  canPreviewDocument,
  getDocumentFileName,
  getDocumentMimeType,
  validateDocumentFile,
} from "./documento-utils.ts";

test("aceita PDF e nao aplica limite de tamanho sem contrato confirmado", () => {
  const pdf = new File(["conteudo"], "fatura.pdf", { type: "application/pdf" });

  assert.equal(DOCUMENT_SIZE_LIMIT_BYTES, null);
  assert.equal(validateDocumentFile(pdf), null);
  assert.match(validateDocumentFile(new File([""], "vazio.pdf", { type: "application/pdf" })) ?? "", /vazio/);
  assert.match(validateDocumentFile(new File(["conteudo"], "nota.txt", { type: "text/plain" })) ?? "", /PDF/);
});

test("resolve MIME ausente pelo nome e limita preview ao PDF recuperavel", () => {
  assert.equal(getDocumentMimeType("fatura.pdf", ""), "application/pdf");
  assert.equal(getDocumentFileName("C:\\temp\\fatura.pdf"), "fatura.pdf");
  assert.equal(canPreviewDocument("application/pdf", "fatura.pdf"), true);
  assert.equal(canPreviewDocument("image/png", "imagem.png"), false);
  assert.equal(
    buildDocumentPreviewUrl("aGVsbG8=", "application/pdf", "fatura.pdf"),
    "data:application/pdf;base64,aGVsbG8="
  );
});

test("converte Base64 valido e rejeita conteudo corrompido", async () => {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { atob: globalThis.atob },
  });

  try {
    const blob = base64ToDocumentBlob("aGVsbG8=", "application/pdf", "fatura.pdf");
    assert.equal(blob.type, "application/pdf");
    assert.equal(await blob.text(), "hello");
    assert.throws(
      () => base64ToDocumentBlob("base64-invalido!", "application/pdf", "fatura.pdf"),
      /invalido ou corrompido/
    );
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
});
