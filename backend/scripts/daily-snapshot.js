#!/usr/bin/env node

const { captureDailySnapshots, cleanupOldSnapshots } = require('../dist/utils/snapshotService')

async function main() {
  console.log('🕐 Iniciando rotina diária de snapshots...')
  console.log(`📅 Data/Hora: ${new Date().toISOString()}`)
  
  try {
    // Capturar snapshots diários
    await captureDailySnapshots()
    
    // Limpar snapshots antigos (executar apenas uma vez por semana)
    const today = new Date().getDay() // 0 = Domingo, 1 = Segunda, etc.
    if (today === 0) { // Domingo
      console.log('🧹 Executando limpeza semanal de snapshots antigos...')
      await cleanupOldSnapshots()
    }
    
    console.log('✅ Rotina diária concluída com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro na rotina diária:', error)
    process.exit(1)
  }
}

main()
