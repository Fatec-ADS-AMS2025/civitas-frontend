import { despesaService } from "@/hooks/despesa";
import { fornecedorService } from "@/hooks/fornecedor";
import { instituicaoService } from "@/hooks/instituicao";
import { orcamentoService } from "@/hooks/orcamento";
import { secretariaService } from "@/hooks/secretaria";
import { tipoCodigoService } from "@/hooks/tipoCodigo";
import { tipoDespesaService } from "@/hooks/tipoDespesa";
import { unidadeConsumidoraService } from "@/hooks/unidadeConsumidora";
import { unidadeMedidaService } from "@/hooks/unidadeMedida";
import type { DashboardData } from "@/hooks/useDespesasDashboard";
import { usuarioService } from "@/hooks/usuario";

export const loadDespesasPageData = async (): Promise<DashboardData> => {
  const [
    despesasTodas,
    tipoCodigos,
    tiposDespesa,
    orcamentos,
    instituicoes,
    secretarias,
    fornecedores,
    unidadesConsumidorasAtivas,
    unidadesMedida,
    usuarios,
    unidadesConsumidorasAll,
  ] = await Promise.all([
    despesaService.getAllStatusData(),
    tipoCodigoService.getAllOptional(),
    tipoDespesaService.getAllData(),
    orcamentoService.getAllData(),
    instituicaoService.getAllData(),
    secretariaService.getAllData(),
    fornecedorService.getAllData(),
    unidadeConsumidoraService.getAllActiveData(),
    unidadeMedidaService.getAllData(),
    usuarioService.getAllData(),
    unidadeConsumidoraService.getAllData(),
  ]);

  return {
    despesas: despesasTodas ?? [],
    tipoCodigos: tipoCodigos ?? [],
    tiposDespesa: tiposDespesa ?? [],
    orcamentos: orcamentos ?? [],
    instituicoes: instituicoes ?? [],
    secretarias: secretarias ?? [],
    fornecedores: fornecedores ?? [],
    unidadesConsumidoras: unidadesConsumidorasAtivas ?? unidadesConsumidorasAll ?? [],
    unidadesMedida: unidadesMedida ?? [],
    usuarios: usuarios ?? [],
  };
};
