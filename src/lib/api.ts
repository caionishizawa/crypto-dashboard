const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 
    (window.location.hostname.includes('onrender.com') ? 'https://crypto-dashboard-backend.onrender.com/api' : 
     '/api') : 
    'http://localhost:3001/api');

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Obter token do localStorage
  private getToken(): string | null {
    const user = localStorage.getItem('dashboardUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Headers padrão para requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Método genérico para requests
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // === MÉTODOS ESPECÍFICOS DA API ===

  // Auth
  async login(email: string, senha: string) {
    const response = await this.post<ApiResponse>('/auth/login', { email, senha });
    
    if (response.success && response.user && response.token) {
      // Salvar usuário com token no localStorage
      const userData = { ...response.user, token: response.token };
      localStorage.setItem('dashboardUser', JSON.stringify(userData));
    }
    
    return response;
  }

  async register(nome: string, email: string, senha: string, confirmarSenha: string) {
    const response = await this.post<ApiResponse>('/auth/register', { 
      nome, email, senha, confirmarSenha 
    });
    
    if (response.success && response.user && response.token) {
      // Salvar usuário com token no localStorage
      const userData = { ...response.user, token: response.token };
      localStorage.setItem('dashboardUser', JSON.stringify(userData));
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Clientes
  async getClientes() {
    return this.get('/clientes');
  }

  async getCliente(id: string) {
    return this.get(`/clientes/${id}`);
  }

  async createCliente(clienteData: any) {
    return this.post('/clientes', clienteData);
  }

  async updateCliente(id: string, clienteData: any) {
    return this.put(`/clientes/${id}`, clienteData);
  }

  async deleteCliente(id: string) {
    return this.delete(`/clientes/${id}`);
  }

  async addTransacao(clienteId: string, transacaoData: any) {
    return this.post(`/clientes/${clienteId}/transacoes`, transacaoData);
  }

  // Carteiras
  async getCarteirasCliente(clienteId: string) {
    return this.get(`/carteiras/cliente/${clienteId}`);
  }

  async getCarteira(id: string) {
    return this.get(`/carteiras/${id}`);
  }

  async createCarteira(carteiraData: any) {
    return this.post('/carteiras', carteiraData);
  }

  async updateCarteira(id: string, carteiraData: any) {
    return this.put(`/carteiras/${id}`, carteiraData);
  }

  async deleteCarteira(id: string) {
    return this.delete(`/carteiras/${id}`);
  }

  async refreshCarteira(id: string) {
    return this.post(`/carteiras/${id}/refresh`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  async getPerformanceData() {
    return this.get('/dashboard/performance');
  }

  async getDistributionData() {
    return this.get('/dashboard/distribution');
  }

  async getRecentActivity() {
    return this.get('/dashboard/recent-activity');
  }
}

// Exportar instância única
export const apiClient = new ApiClient();

// Exportar tipos
export type { ApiResponse }; 