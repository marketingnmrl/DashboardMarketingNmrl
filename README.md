# Dashboard MktNaMoral

Dashboard CRM em Next.js para visualizacao de vendas, leads e metricas da Hotmart.

## Stack

- Node.js 20+
- Next.js 15
- Axios
- Chart.js via CDN
- Vercel

## Estrutura

- `pages/index.js`: dashboard protegido por cookie/JWT
- `pages/login.js`: tela de login
- `pages/api/auth/*`: login/logout/sessao autenticada
- `pages/api/data.js`: endpoint principal `GET /api/data`
- `services/hotmart.js`: autenticacao, cache e consolidacao de dados
- `services/auth.js`: validacao de usuario/senha e emissao de token
- `public/js/app.js`: frontend do dashboard
- `public/css/style.css`: estilos

## Variaveis de ambiente

Crie um arquivo `.env` na raiz:

```env
HOTMART_CLIENT_ID=seu-client-id
HOTMART_CLIENT_SECRET=seu-client-secret
HOTMART_BASIC=Basic seu-token-base64
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
AUTH_JWT_SECRET=troque-por-uma-chave-longa-e-segura
```

`HOTMART_BASIC` deve conter o header `Authorization` completo no formato `Basic ...`.
Para integracoes server-side com Supabase, use `SUPABASE_SERVICE_ROLE_KEY`. A `SUPABASE_ANON_KEY` fica disponivel caso voce precise expor consultas controladas no frontend no futuro.

## Autenticacao

1. Rode o SQL de [supabase_auth_schema.sql](c:/Users/johnmoreira/Documents/github/Dashboard-MktNaMoral/supabase_auth_schema.sql) no Supabase.
2. Defina `AUTH_JWT_SECRET` no ambiente local e na Vercel.
3. Acesse `/login` e entre com o usuario criado na tabela `app_users`.

Rotas protegidas:
- `/` (dashboard)
- `/api/data`
- `/api/supabase/test`
- `/api/zouti/debug`
- `/api/auth/me`

## Rodando localmente

### npm

```bash
npm install
npm run dev
```

Build de producao:
```bash
npm run build
npm start
```

### yarn

```bash
yarn
yarn dev
```

Build de producao:
```bash
yarn build
yarn start
```

A aplicacao sobe em `http://localhost:3000` por padrao. Se `PORT` estiver definida, ela sera respeitada.

## Deploy na Vercel

1. Importe o repositorio na Vercel.
2. Configure as variaveis `HOTMART_CLIENT_ID`, `HOTMART_CLIENT_SECRET`, `HOTMART_BASIC`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `AUTH_JWT_SECRET`.
3. A Vercel detecta Next.js automaticamente (`framework: nextjs` em `vercel.json`).
4. Build command: `npm run build`.

## Endpoint interno

### `GET /api/data`

Query params suportados:

- `periodo`: `Ultimos 7 dias`, `Ultimos 15 dias`, `Ultimos 30 dias`, `Este mes`, `Mes passado`
- `canal`: `Todos`, `Hotmart`, `Zouti`

Exemplo:

```text
/api/data?canal=Hotmart&periodo=Ultimos%207%20dias
```

### `GET /api/supabase/test`

Testa a conexao com o Supabase usando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

Exemplo de retorno:

```json
{
  "ok": true,
  "projectUrl": "https://seu-projeto.supabase.co",
  "buckets": 0
}
```

## Observacoes

- O projeto usa `dotenv` localmente e `process.env` em producao.
- O cache de vendas fica em memoria por 5 minutos.
- Se as credenciais estiverem ausentes ou invalidas, a API retorna erro no carregamento dos dados.
- Nao ha testes automatizados configurados no repositorio hoje.
