require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Rotas da API REST
app.use(routes);

// Rota raiz para conferência do status da API
app.get('/', (req, res) => {
  return res.json({
    projeto: 'API REST de Gerenciamento de Veículos',
    disciplina: 'Programação cliente/servidor',
    professor: 'Henrique Barbosa',
    instituicao: 'FAETERJ',
    autor: 'Iury Lopes',
    status: 'online',
    recurso: '/veiculos'
  });
});

// Porta definida por variável de ambiente (PORT), com padrão 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`Recurso disponível em: http://localhost:${PORT}/veiculos`);
});
