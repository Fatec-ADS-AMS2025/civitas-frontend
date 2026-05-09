import { getSituacaoLabel } from "@/global/situacao";

export const mapFornecedorRows = (items: any[]) => {
  return items.map((item) => ({
    ...item,
    situacaoLabel: getSituacaoLabel(item.situacao),
  }));
};

export const shouldLoadPreviousPage = (pageResult: any) => {
  return (
    pageResult.totalRecords > 0 &&
    pageResult.totalPages > 0 &&
    pageResult.items.length === 0 &&
    pageResult.currentPage > pageResult.totalPages
  );
};