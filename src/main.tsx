import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = document.getElementById('root')

if (root) {
  const reactRoot = createRoot(root)
  reactRoot.render(<App />)
} else {
  console.error('ERRO: Root element não encontrado!')
} 