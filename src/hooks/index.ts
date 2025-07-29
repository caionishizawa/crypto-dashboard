// Hooks de autenticação
export { useAuth } from './useAuth';

// Hooks de gestão de clientes
export { useClientes } from './useClientes';

// Hooks de gestão de carteiras
export { useCarteiras } from './useCarteiras';

// Hooks de dashboard e estatísticas
export { useDashboard } from './useDashboard';

// Re-exportar tipos úteis se necessário
export type { Usuario, LoginData, RegisterData } from '../types/usuario';
export type { Cliente, ClientesData } from '../types/cliente';
export type { Carteira } from '../types/carteira'; 