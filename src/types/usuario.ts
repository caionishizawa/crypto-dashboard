export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'user';
  dataRegistro: string;
}

export interface UsuarioCompleto extends Usuario {
  senha: string;
}

export interface LoginData {
  email: string;
  senha: string;
  manterConectado?: boolean;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface UsuarioAprovado {
  id: string;
  nome: string;
  email: string;
  tipo: 'user';
  dataRegistro: string;
  createdAt: string;
} 