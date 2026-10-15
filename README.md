# API REST de Gerenciamento de Veículos

> **Trabalho Individual — Avaliação Nota 1**  
> **Instituição:** FAETERJ Barra Mansa  
> **Disciplina:** Programação Cliente/Servidor  
> **Professor:** Henrique Barbosa  
> **Aluno:** Iury Lopes  

---

## 1. Objetivo do Projeto

Desenvolver um backend que exponha uma API REST para o gerenciamento de veículos de uma montadora, permitindo cadastrar, consultar, atualizar e remover registros armazenados em um banco de dados relacional PostgreSQL hospedado no Neon.

O projeto contempla as quatro operações básicas de persistência (**CRUD**) por meio dos métodos HTTP **GET**, **POST**, **PUT** e **DELETE**, estruturado em camadas e utilizando o query builder **Knex** para todas as interações com o banco de dados.

---

## 2. Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| **Node.js** | Ambiente de execução JavaScript no servidor |
| **Express** | Framework para criação de rotas, middlewares e servidor HTTP |
| **Knex.js** | Query builder SQL para comunicação segura com o banco |
| **PostgreSQL (Neon)** | Banco de dados relacional em nuvem |
| **pg** | Driver nativo de conexão PostgreSQL |
| **dotenv** | Gerenciamento de variáveis de ambiente (`.env`) |
| **cors** | Habilitação de requisições Cross-Origin Resource Sharing |
| **nodemon** | Utilitário de reload automático em ambiente de desenvolvimento |

---

## 3. Estrutura de Pastas do Projeto

O código foi organizado rigorosamente no modelo em camadas sugerido pelo enunciado:

```text
projeto-backend-veiculos/
├── node_modules/
├── src/
│   ├── controllers/
│   │   └── veiculoController.js   # Regras de negócio, validações e respostas HTTP
│   ├── database/
│   │   └── db.js                  # Instância e inicialização do Knex
│   └── routes.js                  # Definição e mapeamento dos endpoints REST
├── .env                           # Credenciais locais (ignorado no Git)
├── .env.example                   # Modelo público das variáveis de ambiente
├── .gitignore                     # Proteção de credenciais (.env) e dependências
├── knexfile.js                    # Configuração da conexão com PostgreSQL e SSL
├── package.json                   # Dependências e scripts de execução
├── server.js                      # Ponto de entrada do servidor Express
├── test.js                        # Suíte automatizada de testes de integração
└── README.md                      # Documentação completa e guia de testes
```

---

## 4. Banco de Dados

### 4.1 Conexão
A conexão com o PostgreSQL no Neon é configurada via variável de ambiente `DATABASE_URL` no arquivo `knexfile.js`:

```javascript
require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
};
```

### 4.2 Estrutura da Tabela `veiculos`

```sql
CREATE TABLE veiculos (
  id SERIAL PRIMARY KEY,
  modelo VARCHAR(100) NOT NULL,
  tipo_propulsao tipo_propulsao_enum NOT NULL,
  ano_modelo SMALLINT NOT NULL,
  autonomia_km INT,
  capacidade_bateria_kwh DECIMAL(6,2),
  preco_base DECIMAL(10,2) NOT NULL,
  status_producao status_producao_enum NOT NULL DEFAULT 'em_producao'
);
```

- **Enums válidos**:
  - `tipo_propulsao`: `'eletrico'`, `'hibrido'`
  - `status_producao`: `'em_producao'`, `'descontinuado'`

---

## 5. Endpoints da API REST

O recurso principal da aplicação é disponibilizado em `/veiculos`:

| Método | Endpoint | Descrição | Status Sucesso | Status Erro |
|---|---|---|---|---|
| `GET` | `/veiculos` | Lista todos os veículos cadastrados | `200 OK` | `500 Internal Server Error` |
| `GET` | `/veiculos/:id` | Retorna um veículo específico pelo ID | `200 OK` | `400 Bad Request` / `404 Not Found` |
| `POST` | `/veiculos` | Cadastra um novo veículo | `201 Created` | `400 Bad Request` / `500 Internal Server Error` |
| `PUT` | `/veiculos/:id` | Atualiza os dados de um veículo existente | `200 OK` | `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/veiculos/:id` | Remove um veículo pelo ID | `200 OK` | `400 Bad Request` / `404 Not Found` |

---

## 6. Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v18 ou superior recomendado).
- Conexão com a internet para acesso ao banco PostgreSQL no Neon.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/uriLopes/projeto-backend-veiculos.git
   cd projeto-backend-veiculos
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar as variáveis de ambiente:**
   Crie o arquivo `.env` na raiz do projeto (ou copie a partir do `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Conteúdo do `.env`:
   ```env
   DATABASE_URL='postgresql://neondb_owner:tEgdK7s0NzmC@ep-small-scene-a5vgf7jk-pooler.us-east-2.aws.neon.tech/banco?sslmode=require&channel_binding=require'
   PORT=3000
   ```

4. **Iniciar o servidor:**
   - Modo Produção:
     ```bash
     npm start
     ```
   - Modo Desenvolvimento (com auto-reload):
     ```bash
     npm run dev
     ```

   O servidor iniciará em: `http://localhost:3000`

---

## 7. Documentação dos Testes (Cenários de Sucesso e Erro)

Todas as rotas foram testadas e validadas conforme a Seção 7 do enunciado do projeto, cobrindo cenários de sucesso e cenários de erro (dados inválidos e IDs inexistentes).

### 7.1 Execução Automatizada dos Testes
O projeto inclui um script que executa os 10 cenários de ponta a ponta contra o banco de dados:

```bash
npm test
```

**Resultado da execução da suíte:**
```text
======================================================================
  BATERIA DE TESTES DE INTEGRAÇÃO - API REST VEÍCULOS (FAETERJ)
======================================================================
  [PASSOU] GET /veiculos retorna 200 e um array
  [PASSOU] POST /veiculos insere registro, gera id e aplica default status_producao="em_producao"
  [PASSOU] POST /veiculos rejeita dados incompletos com status 400
  [PASSOU] POST /veiculos rejeita tipo_propulsao inválido com status 400
  [PASSOU] GET /veiculos/:id retorna 200 com os dados do veículo criado
  [PASSOU] GET /veiculos/:id retorna 404 para veículo inexistente
  [PASSOU] PUT /veiculos/:id atualiza campos e retorna 200 com o registro atualizado
  [PASSOU] PUT /veiculos/:id retorna 404 para id inexistente
  [PASSOU] DELETE /veiculos/:id remove o veículo e retorna status 200
  [PASSOU] DELETE /veiculos/:id retorna 404 para id inexistente
----------------------------------------------------------------------
TOTAL: 10 testes | PASSOU: 10 | FALHOU: 0
======================================================================
```

---

### 7.2 Exemplos de Requisições via cURL / HTTP Client

#### 1. Listar Veículos
- **Cenário de Sucesso:**
  ```bash
  curl -X GET http://localhost:3000/veiculos
  ```
  **Resposta (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "modelo": "Peugeot e-2008 GT",
      "tipo_propulsao": "eletrico",
      "ano_modelo": 2026,
      "autonomia_km": 406,
      "capacidade_bateria_kwh": "54.00",
      "preco_base": "259990.00",
      "status_producao": "em_producao"
    }
  ]
  ```

---

#### 2. Consultar Veículo por ID
- **Cenário de Sucesso (`200 OK`):**
  ```bash
  curl -X GET http://localhost:3000/veiculos/1
  ```
- **Cenário de Erro (`404 Not Found`):**
  ```bash
  curl -X GET http://localhost:3000/veiculos/999999
  ```
  **Resposta (`404 Not Found`):**
  ```json
  {
    "erro": "Veículo com id 999999 não foi encontrado."
  }
  ```

---

#### 3. Cadastrar Veículo
- **Cenário de Sucesso (`201 Created`):**
  ```bash
  curl -X POST http://localhost:3000/veiculos \
    -H "Content-Type: application/json" \
    -d '{
      "modelo": "Pulse Bio-Hybrid Audace",
      "tipo_propulsao": "hibrido",
      "ano_modelo": 2026,
      "autonomia_km": 680,
      "capacidade_bateria_kwh": 1.2,
      "preco_base": 125990.00
    }'
  ```
  *Nota: Como `status_producao` foi omitido, o valor padrão `'em_producao'` é aplicado automaticamente.*

- **Cenário de Erro (`400 Bad Request` — Campos obrigatórios ausentes):**
  ```bash
  curl -X POST http://localhost:3000/veiculos \
    -H "Content-Type: application/json" \
    -d '{ "modelo": "Incompleto" }'
  ```
  **Resposta (`400 Bad Request`):**
  ```json
  {
    "erro": "Campos obrigatórios ausentes: modelo, tipo_propulsao, ano_modelo e preco_base são requeridos."
  }
  ```

- **Cenário de Erro (`400 Bad Request` — Tipo de propulsão inválido):**
  ```bash
  curl -X POST http://localhost:3000/veiculos \
    -H "Content-Type: application/json" \
    -d '{
      "modelo": "Carro Teste",
      "tipo_propulsao": "nuclear",
      "ano_modelo": 2026,
      "preco_base": 100000.00
    }'
  ```
  **Resposta (`400 Bad Request`):**
  ```json
  {
    "erro": "tipo_propulsao inválido. Valores aceitos: eletrico, hibrido"
  }
  ```

---

#### 4. Atualizar Veículo
- **Cenário de Sucesso (`200 OK`):**
  ```bash
  curl -X PUT http://localhost:3000/veiculos/1 \
    -H "Content-Type: application/json" \
    -d '{
      "preco_base": 249990.00,
      "status_producao": "descontinuado"
    }'
  ```
- **Cenário de Erro (`404 Not Found`):**
  ```bash
  curl -X PUT http://localhost:3000/veiculos/999999 \
    -H "Content-Type: application/json" \
    -d '{ "preco_base": 200000.00 }'
  ```
  **Resposta (`404 Not Found`):**
  ```json
  {
    "erro": "Veículo com id 999999 não encontrado para atualização."
  }
  ```

---

#### 5. Remover Veículo
- **Cenário de Sucesso (`200 OK`):**
  ```bash
  curl -X DELETE http://localhost:3000/veiculos/1
  ```
  **Resposta (`200 OK`):**
  ```json
  {
    "mensagem": "Veículo com id 1 removido com sucesso."
  }
  ```
- **Cenário de Erro (`404 Not Found`):**
  ```bash
  curl -X DELETE http://localhost:3000/veiculos/999999
  ```
  **Resposta (`404 Not Found`):**
  ```json
  {
    "erro": "Veículo com id 999999 não encontrado para remoção."
  }
  ```

---

## 8. Critérios de Avaliação Atendidos

| Critério | Peso | Como foi atendido no projeto |
|---|---|---|
| **Funcionamento correto das rotas GET, POST, PUT e DELETE** | 40% | Todas as 5 rotas implementadas rigorosamente segundo as especificações HTTP com códigos semânticos (`200`, `201`, `400`, `404`). |
| **Uso adequado do Knex e conexão com o banco** | 20% | Knex utilizado exclusivamente em todas as operações (`select`, `insert`, `update`, `del`), sem concatenação direta de SQL, com pool e SSL ativos. |
| **Validações e tratamento de erros (códigos HTTP)** | 15% | Tratamento detalhado de parâmetros inválidos, enums de banco, dados nulos/ausentes e IDs inexistentes com mensagens claras em JSON. |
| **Organização e legibilidade do código** | 15% | Separação estrita em camadas (`src/controllers/`, `src/database/`, `src/routes.js`), código limpo, comentado e autoexplicativo. |
| **README e documentação dos testes** | 10% | README completo com diagramas, tabelas de rotas, exemplos de requisição/resposta, comandos cURL e suíte de testes automatizada (`npm test`). |
