require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const db = require('./src/database/db');

// Inicia servidor temporário em porta de teste
const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const TEST_PORT = 3099;
let server;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  server = app.listen(TEST_PORT);
  console.log('='.repeat(70));
  console.log('  BATERIA DE TESTES DE INTEGRAÇÃO - API REST VEÍCULOS (FAETERJ)');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;
  let testId = null;

  function assert(condition, title, details = '') {
    if (condition) {
      console.log(`  [PASSOU] ${title}`);
      passed++;
    } else {
      console.error(`  [FALHOU] ${title} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. GET /veiculos (Sucesso - 200)
    const resGet = await request('GET', '/veiculos');
    assert(resGet.status === 200 && Array.isArray(resGet.data), 'GET /veiculos retorna 200 e um array');

    // 2. POST /veiculos (Sucesso - 201 com default em_producao)
    const novoVeiculo = {
      modelo: 'Pulse Abarth Bio-Hybrid Teste',
      tipo_propulsao: 'hibrido',
      ano_modelo: 2026,
      autonomia_km: 650,
      capacidade_bateria_kwh: null,
      preco_base: 149990.00
      // status_producao omitido para testar valor default 'em_producao'
    };
    const resPost = await request('POST', '/veiculos', novoVeiculo);
    assert(
      resPost.status === 201 && resPost.data && resPost.data.id && resPost.data.status_producao === 'em_producao',
      'POST /veiculos insere registro, gera id e aplica default status_producao="em_producao"'
    );
    if (resPost.data && resPost.data.id) {
      testId = resPost.data.id;
    }

    // 3. POST /veiculos (Erro - 400 por campos obrigatórios ausentes)
    const resPostInvalido = await request('POST', '/veiculos', { modelo: 'Incompleto' });
    assert(resPostInvalido.status === 400, 'POST /veiculos rejeita dados incompletos com status 400');

    // 4. POST /veiculos (Erro - 400 por enum inválido)
    const resPostEnumInvalido = await request('POST', '/veiculos', {
      modelo: 'Teste Propulsao',
      tipo_propulsao: 'nuclear',
      ano_modelo: 2026,
      preco_base: 100000
    });
    assert(resPostEnumInvalido.status === 400, 'POST /veiculos rejeita tipo_propulsao inválido com status 400');

    // 5. GET /veiculos/:id (Sucesso - 200)
    if (testId) {
      const resGetId = await request('GET', `/veiculos/${testId}`);
      assert(
        resGetId.status === 200 && resGetId.data && resGetId.data.id === testId,
        `GET /veiculos/:id retorna 200 com os dados do veículo criado (ID: ${testId})`
      );
    }

    // 6. GET /veiculos/:id (Erro - 404 para ID inexistente)
    const resGet404 = await request('GET', '/veiculos/99999999');
    assert(resGet404.status === 404, 'GET /veiculos/:id retorna 404 para veículo inexistente');

    // 7. PUT /veiculos/:id (Sucesso - 200)
    if (testId) {
      const resPut = await request('PUT', `/veiculos/${testId}`, {
        preco_base: 155000.00,
        status_producao: 'descontinuado'
      });
      assert(
        resPut.status === 200 && resPut.data && Number(resPut.data.preco_base) === 155000 && resPut.data.status_producao === 'descontinuado',
        `PUT /veiculos/:id atualiza campos e retorna 200 com o registro atualizado`
      );
    }

    // 8. PUT /veiculos/:id (Erro - 404 para ID inexistente)
    const resPut404 = await request('PUT', '/veiculos/99999999', { preco_base: 200000 });
    assert(resPut404.status === 404, 'PUT /veiculos/:id retorna 404 para id inexistente');

    // 9. DELETE /veiculos/:id (Sucesso - 200)
    if (testId) {
      const resDel = await request('DELETE', `/veiculos/${testId}`);
      assert(resDel.status === 200, `DELETE /veiculos/:id remove o veículo e retorna status 200`);
    }

    // 10. DELETE /veiculos/:id (Erro - 404 para ID inexistente)
    const resDel404 = await request('DELETE', '/veiculos/99999999');
    assert(resDel404.status === 404, 'DELETE /veiculos/:id retorna 404 para id inexistente');

  } catch (err) {
    console.error('Erro na execução da suíte de testes:', err);
    failed++;
  } finally {
    console.log('-'.repeat(70));
    console.log(`TOTAL: ${passed + failed} testes | PASSOU: ${passed} | FALHOU: ${failed}`);
    console.log('='.repeat(70));

    server.close();
    await db.destroy();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
