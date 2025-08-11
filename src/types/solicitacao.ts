export interface SolicitacaoUsuario {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  data_solicitacao: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  motivo_rejeicao?: string;
  observacoes?: string;
}

export interface SolicitacoesData {
  [key: string]: SolicitacaoUsuario;
}

export interface AprovarSolicitacaoData {
  solicitacaoId: string;
  aprovado: boolean;
  motivo_rejeicao?: string;
  observacoes?: string;
}
