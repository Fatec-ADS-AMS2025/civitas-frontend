"use client";

import { DetailCard, DetailCardGrid, DetailFieldGrid, DetailSection } from "@/components/details/info-details";
import type { UserRow } from "./UsuariosPageClient";

type UsuarioDetailsViewProps = {
  usuario: UserRow;
};

const getPermissaoResumo = (tipoUsuario: number): string => {
  if (tipoUsuario === 2) return "Acesso administrativo";
  if (tipoUsuario === 3) return "Acesso operacional";
  return "Acesso de consulta";
};

const getPermissaoDescricao = (tipoUsuario: number): string => {
  if (tipoUsuario === 2) return "Pode administrar cadastros e rotinas do sistema";
  if (tipoUsuario === 3) return "Pode operar fluxos internos conforme perfil funcional";
  return "Perfil limitado para acompanhamento";
};

const getLocalidade = (usuario: UserRow): string => {
  if (usuario.cidade && usuario.estado) return `${usuario.cidade}/${usuario.estado}`;
  return usuario.cidade || usuario.estado || "";
};

export default function UsuarioDetailsView({ usuario }: UsuarioDetailsViewProps) {
  return (
    <div className="space-y-5">
      <DetailSection title="Resumo do usuario" description="Perfil de acesso, permissao e identificadores funcionais.">
        <DetailCardGrid>
          <DetailCard
            title="Cargo / perfil"
            value={usuario.tipoUsuarioLabel}
            description={getPermissaoResumo(usuario.tipoUsuario)}
            icon="badge"
            tone="teal"
          />
          <DetailCard
            title="Permissoes"
            value={getPermissaoResumo(usuario.tipoUsuario)}
            description={getPermissaoDescricao(usuario.tipoUsuario)}
            icon="admin_panel_settings"
            tone={usuario.tipoUsuario === 2 ? "amber" : "slate"}
          />
          <DetailCard
            title="Status"
            value={usuario.situacaoLabel}
            description="Situacao atual do acesso"
            icon="verified_user"
            tone={usuario.situacaoLabel === "Ativo" ? "slate" : "danger"}
          />
          <DetailCard
            title="Matricula"
            value={usuario.matricula}
            description="Identificador funcional"
            icon="confirmation_number"
          />
        </DetailCardGrid>
      </DetailSection>

      <DetailSection title="Identificacao e contato">
        <DetailFieldGrid
          items={[
            { label: "Nome", value: usuario.nome },
            { label: "E-mail", value: usuario.email },
            { label: "CPF", value: usuario.cpf },
            { label: "RG", value: usuario.rg },
            { label: "Localidade", value: getLocalidade(usuario) },
            { label: "Endereco", value: `${usuario.logradouro}, ${usuario.numero} - ${usuario.bairro}` },
            { label: "CEP", value: usuario.cep },
          ]}
        />
      </DetailSection>
    </div>
  );
}
