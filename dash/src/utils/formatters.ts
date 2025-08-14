// Formatação de moeda em USD
export const formatarMoeda = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Formatação de percentual
export const formatarPercentual = (value: number): string => {
  // Verificar se é Infinity, -Infinity ou NaN
  if (!isFinite(value) || isNaN(value)) {
    return '0.00%';
  }
  
  // Limitar valores extremos
  const limitedValue = Math.max(-999.99, Math.min(999.99, value));
  
  return `${limitedValue > 0 ? '+' : ''}${limitedValue.toFixed(2)}%`;
};

// Obter cor baseada no retorno
export const getCorRetorno = (value: number): string => {
  if (value > 20) return 'text-green-400';
  if (value > 0) return 'text-green-300';
  if (value === 0) return 'text-gray-400';
  if (value > -10) return 'text-red-300';
  return 'text-red-400';
};

// Formatação de data
export const formatarData = (dataString: string): string => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

// Formatação de data e hora
export const formatarDataHora = (dataString: string): string => {
  const data = new Date(dataString);
  return data.toLocaleString('pt-BR');
}; 