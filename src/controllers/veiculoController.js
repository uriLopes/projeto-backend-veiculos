const db = require('../database/db');

// Valores válidos aceitos pelos enums do PostgreSQL no Neon
const TIPOS_PROPULSAO_VALIDOS = ['eletrico', 'hibrido'];
const STATUS_PRODUCAO_VALIDOS = ['em_producao', 'descontinuado'];

const veiculoController = {
  /**
   * GET /veiculos
   * Retorna status 200 e um array JSON com todos os registros
   * (array vazio caso não existam veículos).
   */
  async listar(req, res) {
    try {
      const veiculos = await db('veiculos')
        .select('*')
        .orderBy('id', 'asc');

      return res.status(200).json(veiculos);
    } catch (error) {
      console.error('Erro ao listar veículos:', error);
      return res.status(500).json({
        erro: 'Erro interno ao consultar veículos no banco de dados.'
      });
    }
  },

  /**
   * GET /veiculos/:id
   * Retorna status 200 e o objeto do veículo;
   * se o id não existir, retorna 404 com mensagem de erro.
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(Number(id))) {
        return res.status(400).json({
          erro: 'O parâmetro id deve ser um número inteiro válido.'
        });
      }

      const veiculo = await db('veiculos')
        .where({ id: Number(id) })
        .first();

      if (!veiculo) {
        return res.status(404).json({
          erro: `Veículo com id ${id} não foi encontrado.`
        });
      }

      return res.status(200).json(veiculo);
    } catch (error) {
      console.error('Erro ao buscar veículo por id:', error);
      return res.status(500).json({
        erro: 'Erro interno ao buscar veículo por id.'
      });
    }
  },

  /**
   * POST /veiculos
   * Recebe os dados no corpo da requisição (JSON), insere o registro e retorna
   * 201 com o veículo criado (incluindo o id gerado).
   * Se status_producao não for informado, deve prevalecer o padrão 'em_producao'.
   */
  async criar(req, res) {
    try {
      const {
        modelo,
        tipo_propulsao,
        ano_modelo,
        autonomia_km,
        capacidade_bateria_kwh,
        preco_base,
        status_producao
      } = req.body;

      // Validação de campos obrigatórios
      if (!modelo || !tipo_propulsao || ano_modelo === undefined || preco_base === undefined) {
        return res.status(400).json({
          erro: 'Campos obrigatórios ausentes: modelo, tipo_propulsao, ano_modelo e preco_base são requeridos.'
        });
      }

      // Validação do tipo de propulsão
      if (!TIPOS_PROPULSAO_VALIDOS.includes(tipo_propulsao)) {
        return res.status(400).json({
          erro: `tipo_propulsao inválido. Valores aceitos: ${TIPOS_PROPULSAO_VALIDOS.join(', ')}`
        });
      }

      // Validação do status de produção (default: 'em_producao')
      const statusFinal = status_producao || 'em_producao';
      if (!STATUS_PRODUCAO_VALIDOS.includes(statusFinal)) {
        return res.status(400).json({
          erro: `status_producao inválido. Valores aceitos: ${STATUS_PRODUCAO_VALIDOS.join(', ')}`
        });
      }

      // Inserção no PostgreSQL via Knex
      const [novoVeiculo] = await db('veiculos')
        .insert({
          modelo: String(modelo).trim(),
          tipo_propulsao,
          ano_modelo: Number(ano_modelo),
          autonomia_km: autonomia_km !== undefined && autonomia_km !== null ? Number(autonomia_km) : null,
          capacidade_bateria_kwh: capacidade_bateria_kwh !== undefined && capacidade_bateria_kwh !== null ? Number(capacidade_bateria_kwh) : null,
          preco_base: Number(preco_base),
          status_producao: statusFinal
        })
        .returning('*');

      return res.status(201).json(novoVeiculo);
    } catch (error) {
      console.error('Erro ao cadastrar veículo:', error);
      return res.status(500).json({
        erro: 'Erro interno ao cadastrar veículo no banco de dados.'
      });
    }
  },

  /**
   * PUT /veiculos/:id
   * Atualiza o veículo indicado e retorna 200 com o registro atualizado;
   * se o id não existir, retorna 404.
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(Number(id))) {
        return res.status(400).json({
          erro: 'O parâmetro id deve ser um número inteiro válido.'
        });
      }

      // Verifica se o registro existe
      const veiculoExistente = await db('veiculos')
        .where({ id: Number(id) })
        .first();

      if (!veiculoExistente) {
        return res.status(404).json({
          erro: `Veículo com id ${id} não encontrado para atualização.`
        });
      }

      const {
        modelo,
        tipo_propulsao,
        ano_modelo,
        autonomia_km,
        capacidade_bateria_kwh,
        preco_base,
        status_producao
      } = req.body;

      // Validação de enums se fornecidos
      if (tipo_propulsao && !TIPOS_PROPULSAO_VALIDOS.includes(tipo_propulsao)) {
        return res.status(400).json({
          erro: `tipo_propulsao inválido. Valores aceitos: ${TIPOS_PROPULSAO_VALIDOS.join(', ')}`
        });
      }

      if (status_producao && !STATUS_PRODUCAO_VALIDOS.includes(status_producao)) {
        return res.status(400).json({
          erro: `status_producao inválido. Valores aceitos: ${STATUS_PRODUCAO_VALIDOS.join(', ')}`
        });
      }

      // Monta objeto com campos a serem atualizados
      const camposAtualizar = {};
      if (modelo !== undefined) camposAtualizar.modelo = String(modelo).trim();
      if (tipo_propulsao !== undefined) camposAtualizar.tipo_propulsao = tipo_propulsao;
      if (ano_modelo !== undefined) camposAtualizar.ano_modelo = Number(ano_modelo);
      if (autonomia_km !== undefined) camposAtualizar.autonomia_km = autonomia_km !== null ? Number(autonomia_km) : null;
      if (capacidade_bateria_kwh !== undefined) camposAtualizar.capacidade_bateria_kwh = capacidade_bateria_kwh !== null ? Number(capacidade_bateria_kwh) : null;
      if (preco_base !== undefined) camposAtualizar.preco_base = Number(preco_base);
      if (status_producao !== undefined) camposAtualizar.status_producao = status_producao;

      if (Object.keys(camposAtualizar).length === 0) {
        return res.status(400).json({
          erro: 'Nenhum campo fornecido para atualização.'
        });
      }

      const [veiculoAtualizado] = await db('veiculos')
        .where({ id: Number(id) })
        .update(camposAtualizar)
        .returning('*');

      return res.status(200).json(veiculoAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      return res.status(500).json({
        erro: 'Erro interno ao atualizar veículo no banco de dados.'
      });
    }
  },

  /**
   * DELETE /veiculos/:id
   * Remove o veículo e retorna 200 com mensagem de confirmação (ou 204);
   * se o id não existir, retorna 404.
   */
  async remover(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(Number(id))) {
        return res.status(400).json({
          erro: 'O parâmetro id deve ser um número inteiro válido.'
        });
      }

      // Verifica se o registro existe
      const veiculoExistente = await db('veiculos')
        .where({ id: Number(id) })
        .first();

      if (!veiculoExistente) {
        return res.status(404).json({
          erro: `Veículo com id ${id} não encontrado para remoção.`
        });
      }

      await db('veiculos')
        .where({ id: Number(id) })
        .del();

      return res.status(200).json({
        mensagem: `Veículo com id ${id} removido com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao remover veículo:', error);
      return res.status(500).json({
        erro: 'Erro interno ao remover veículo no banco de dados.'
      });
    }
  }
};

module.exports = veiculoController;
