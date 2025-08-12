// SCRIPT TEMPORÁRIO PARA CRIAR USUÁRIO ADMIN
// Execute este script no console do navegador quando estiver no site

// Função para criar usuário admin
async function criarAdmin() {
  try {
    // Dados do usuário admin
    const dadosAdmin = {
      nome: 'Caio Jundi',
      email: 'caiojundi@gmail.com',
      senha: '123456'
    };

    console.log('🔧 Criando usuário admin...', dadosAdmin);

    // Chamar a função da API
    const response = await window.apiClient.criarUsuarioAdmin(
      dadosAdmin.nome,
      dadosAdmin.email,
      dadosAdmin.senha
    );

    if (response.success) {
      console.log('✅ Usuário admin criado com sucesso!', response);
      alert('Usuário admin criado com sucesso!\n\nEmail: caiojundi@gmail.com\nSenha: 123456\n\nFaça login para acessar o painel administrativo.');
    } else {
      console.error('❌ Erro ao criar usuário admin:', response.error);
      alert('Erro ao criar usuário admin: ' + response.error);
    }
  } catch (error) {
    console.error('❌ Erro na execução:', error);
    alert('Erro na execução: ' + error.message);
  }
}

// Executar a função
criarAdmin();
