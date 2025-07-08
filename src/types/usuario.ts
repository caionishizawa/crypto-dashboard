export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'cliente';
  dataRegistro: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
} 