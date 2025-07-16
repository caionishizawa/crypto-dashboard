import { useState, useEffect } from 'react';

// Hook para gerenciar localStorage de forma reativa
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Função para obter o valor inicial do localStorage
  const getStoredValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage para a chave "${key}":`, error);
      return initialValue;
    }
  };

  // Estado reativo
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Função para atualizar o valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value seja uma função para consistência com useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salvar no estado
      setStoredValue(valueToStore);
      
      // Salvar no localStorage
      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar no localStorage para a chave "${key}":`, error);
    }
  };

  // Função para remover o valor
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Erro ao remover do localStorage para a chave "${key}":`, error);
    }
  };

  // Sincronizar com mudanças no localStorage de outras abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Erro ao sincronizar localStorage para a chave "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue] as const;
};

// Hook específico para sessão de usuário
export const useUserSession = () => {
  const [session, setSession, removeSession] = useLocalStorage('sessaoUsuario', null);

  const isValidSession = (sessionData: any): boolean => {
    if (!sessionData || typeof sessionData !== 'object') return false;
    
    const { usuarioId, timestamp, manterConectado } = sessionData;
    
    // Verificar se tem os campos necessários
    if (!usuarioId || !timestamp) return false;
    
    // Se marcou "manter conectado", nunca expira
    if (manterConectado) return true;
    
    // Verificar se a sessão não expirou (ex: 24 horas)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - timestamp > ONE_DAY;
    
    return !isExpired;
  };

  const createSession = (usuarioId: string, manterConectado: boolean = false) => {
    (setSession as any)({
      usuarioId,
      timestamp: Date.now(),
      manterConectado
    });
  };

  const getValidSession = () => {
    return isValidSession(session) ? session : null;
  };

  const clearSession = () => {
    removeSession();
  };

  return {
    session,
    isValidSession: isValidSession(session),
    createSession,
    getValidSession,
    clearSession
  };
};

// Hook para configurações do usuário
export const useUserSettings = () => {
  const [settings, setSettings] = useLocalStorage('userSettings', {
    theme: 'dark',
    language: 'pt-BR',
    notifications: true,
    currency: 'USD',
    timezone: 'America/Sao_Paulo'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    setSettings({
      theme: 'dark',
      language: 'pt-BR',
      notifications: true,
      currency: 'USD',
      timezone: 'America/Sao_Paulo'
    });
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    theme: settings.theme,
    language: settings.language,
    notifications: settings.notifications,
    currency: settings.currency,
    timezone: settings.timezone
  };
};

// Hook para dados temporários/cache
export const useCache = <T>(key: string, defaultValue: T, ttl: number = 5 * 60 * 1000) => {
  const [cacheData, setCacheData] = useLocalStorage(`cache_${key}`, {
    data: defaultValue,
    timestamp: Date.now(),
    ttl
  });

  const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;

  const setCache = (data: T) => {
    setCacheData({
      data,
      timestamp: Date.now(),
      ttl
    });
  };

  const getCache = (): T | null => {
    return isExpired ? null : cacheData.data;
  };

  const clearCache = () => {
    setCacheData({
      data: defaultValue,
      timestamp: Date.now(),
      ttl
    });
  };

  return {
    data: isExpired ? defaultValue : cacheData.data,
    isExpired,
    setCache,
    getCache,
    clearCache
  };
}; 