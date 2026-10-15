# ORM Basico

API de tarefas criada com NestJS, Prisma ORM 7 e MySQL.

## Requisitos

- Node.js 22.22.3, 24.15.0 ou 26+ e npm
- MySQL 8 ou superior, ou Docker Desktop para iniciar o MySQL pelo `docker-compose.yml`

## Configuracao e execucao

No PowerShell, abra a pasta que contem `package.json`:

```powershell
cd "$HOME\Downloads\orm-basico-rpv-master\orm-basico-rpv-master"
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d mysql
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

A API fica disponivel em `http://localhost:3000`. O comando do Docker pode ser omitido se voce ja tiver um MySQL local ativo e configurado na variavel `DATABASE_URL` do arquivo `.env`.

O `docker-compose.yml` cria o banco `tarefas` e expoe o MySQL na porta `3306`. O usuario e a senha locais usados no exemplo sao `root` e `root`. A migration `20261014200000_adicionar_detalhes_prioridade_tarefas` apenas amplia `descricao` e adiciona `prazo` e `prioridade` com valores compativeis para linhas existentes.

Se o banco `tarefas` ja tiver tabelas que nao pertencem a esta aplicacao e ainda nao tiver historico de migrations do Prisma, nao rode `migrate dev` ou `migrate deploy` sem antes revisar o estado. Nao use `migrate reset`: isso apagaria dados.

## Rotas

As requisicoes de exemplo estao em [routes.http](./routes.http).

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `POST` | `/tarefas` | Cria uma tarefa; titulo obrigatorio, descricao, prazo e prioridade opcionais |
| `GET` | `/tarefas` | Lista e filtra tarefas por conclusao, prioridade e titulo; ordena por criacao |
| `GET` | `/tarefas/:id` | Busca uma tarefa |
| `PATCH` | `/tarefas/:id` | Atualiza parcialmente titulo, descricao, prazo, prioridade ou conclusao |
| `DELETE` | `/tarefas/:id` | Remove uma tarefa |

Filtros aceitos por `GET /tarefas`: `concluida=true|false`, `prioridade=BAIXA|MEDIA|ALTA`, `busca=texto` e `ordem=asc|desc`. A busca usa a collation case-insensitive da coluna MySQL `titulo`.

## Testes

```powershell
npm run build
npm run test
npm run test:e2e
```
