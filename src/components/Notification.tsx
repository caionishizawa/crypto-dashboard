import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(onClose, 300); // Aguarda a animação terminar
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`max-w-sm w-full bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-2xl border p-4 ${getTypeStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <span className="text-lg">{getIcon()}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(onClose, 300);
              }}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification; 