import {
  getSituacaoLabel,
} from "@/global/situacao";

export const mapSecretariaRows =
  (items: any[]) => {
    return items.map(
      (item) => ({
        ...item,

        situacaoLabel:
          getSituacaoLabel(
            item.situacao
          ),
      })
    );
  };