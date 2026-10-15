const { Router } = require('express');
const veiculoController = require('./controllers/veiculoController');

const routes = Router();

// Rotas do recurso /veiculos (Requisitos Funcionais do PDF)
routes.get('/veiculos', veiculoController.listar);
routes.get('/veiculos/:id', veiculoController.buscarPorId);
routes.post('/veiculos', veiculoController.criar);
routes.put('/veiculos/:id', veiculoController.atualizar);
routes.delete('/veiculos/:id', veiculoController.remover);

module.exports = routes;
