import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSchema() {
  try {
    console.log('🔍 Verificando estrutura das tabelas...')

    // Verificar tabela clientes
    console.log('\n📋 Tabela clientes:')
    const clientes = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clientes'
      ORDER BY ordinal_position
    `
    console.log(clientes)

    // Verificar tabela carteiras
    console.log('\n📋 Tabela carteiras:')
    const carteiras = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'carteiras'
      ORDER BY ordinal_position
    `
    console.log(carteiras)

    // Verificar tabela usuarios
    console.log('\n📋 Tabela usuarios:')
    const usuarios = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `
    console.log(usuarios)

    // Verificar constraints
    console.log('\n🔒 Constraints da tabela carteiras:')
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type, column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'carteiras'
    `
    console.log(constraints)

  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkSchema()
    .then(() => {
      console.log('✅ Verificação concluída')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro:', error)
      process.exit(1)
    })
}

export { checkSchema }
