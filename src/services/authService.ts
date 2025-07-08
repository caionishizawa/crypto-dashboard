import type { Usuario, LoginData, RegisterData } from '../types';
import { usuariosIniciais } from '../data';

class AuthService {
  private usuarios: Usuario[] = [...usuariosIniciais];

  // Login do usuário
  login(loginData: LoginData): { success: boolean; usuario?: Usuario; error?: string } {
    const usuario = this.usuarios.find(u => u.email === loginData.email && u.senha === loginData.senha);
    
    if (usuario) {
      localStorage.setItem('dashboardUser', JSON.stringify(usuario));
      return { success: true, usuario };
    }
    
    return { success: false, error: 'Email ou senha incorretos' };
  }

  // Registro de novo usuário
  register(registerData: RegisterData): { success: boolean; usuario?: Usuario; error?: string } {
    if (registerData.senha !== registerData.confirmarSenha) {
      return { success: false, error: 'As senhas não coincidem' };
    }

    if (registerData.senha.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
    }
    
    // Verificar se email já existe
    if (this.usuarios.find(u => u.email === registerData.email)) {
      return { success: false, error: 'Este email já está cadastrado' };
    }

    const novoUsuario: Usuario = {
      id: `user-${Date.now()}`,
      nome: registerData.nome,
      email: registerData.email,
      senha: registerData.senha,
      tipo: 'admin',
      dataRegistro: new Date().toISOString().split('T')[0]
    };

    this.usuarios.push(novoUsuario);
    localStorage.setItem('dashboardUser', JSON.stringify(novoUsuario));
    
    return { success: true, usuario: novoUsuario };
  }

  // Logout do usuário
  logout(): void {
    localStorage.removeItem('dashboardUser');
  }

  // Verificar sessão salva
  checkSavedSession(): Usuario | null {
    const savedUser = localStorage.getItem('dashboardUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Erro ao recuperar sessão:', error);
        this.logout();
        return null;
      }
    }
    return null;
  }

  // Obter usuário atual
  getCurrentUser(): Usuario | null {
    return this.checkSavedSession();
  }
}

// Exportar instância única (Singleton)
export const authService = new AuthService(); 