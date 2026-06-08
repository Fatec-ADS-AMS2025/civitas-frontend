import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./orcamento-suggestion.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const { calculateOrcamentoSuggestion } = await import(moduleUrl);

test("calcula a media apenas de orcamentos com mesma instituicao e tipo", () => {
  const result = calculateOrcamentoSuggestion(
    [
      { idOrcamento: 1, idInstituicao: 10, idTipoDespesa: 20, valorOrcamento: 100 },
      { idOrcamento: 2, idInstituicao: 10, idTipoDespesa: 20, valor: 300 },
      { idOrcamento: 3, idInstituicao: 99, idTipoDespesa: 20, valorOrcamento: 900 },
      { idOrcamento: 4, idInstituicao: 10, idTipoDespesa: 99, valorOrcamento: 900 },
      { idOrcamento: 5, idInstituicao: 10, idTipoDespesa: 20, valorOrcamento: "invalido" },
    ],
    { idInstituicao: "10", idTipoDespesa: "20" }
  );

  assert.deepEqual(result, {
    status: "available",
    averageValue: 200,
    count: 2,
  });
});

test("nao calcula sugestao antes de instituicao e tipo estarem preenchidos", () => {
  const result = calculateOrcamentoSuggestion(
    [{ idOrcamento: 1, idInstituicao: 10, idTipoDespesa: 20, valorOrcamento: 100 }],
    { idInstituicao: "10", idTipoDespesa: "" }
  );

  assert.deepEqual(result, {
    status: "idle",
    count: 0,
  });
});

test("retorna vazio quando nao ha orcamentos similares com valor valido", () => {
  const result = calculateOrcamentoSuggestion(
    [{ idOrcamento: 1, idInstituicao: 10, idTipoDespesa: 99, valorOrcamento: 100 }],
    { idInstituicao: "10", idTipoDespesa: "20" }
  );

  assert.deepEqual(result, {
    status: "empty",
    count: 0,
  });
});
