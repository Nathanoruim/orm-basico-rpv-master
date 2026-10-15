# PROMPT — Sistema de Tarefas SENAI
**Atividade: Sala de Aula SENAI — 14/10/2026**

Quero que você analise e atualize meu projeto de gerenciamento de tarefas desenvolvido com NestJS, Prisma e MySQL, implementando os desafios descritos abaixo.

## 1. Regras gerais

- Primeiro, analise a estrutura atual do projeto antes de modificar qualquer arquivo.
- Identifique os módulos, controllers, services, models, DTOs, schema.prisma e configurações existentes.
- Aproveite o código atual e mantenha a arquitetura do projeto.
- Não recrie o projeto do zero.
- Não apague bancos de dados, tabelas, registros ou funcionalidades existentes.
- Não execute comandos destrutivos, como `DROP DATABASE`, `DROP TABLE`, `prisma migrate reset` ou equivalentes.
- Utilize migrações incrementais do Prisma para atualizar o banco de dados.
- Gere e atualize o Prisma Client quando necessário.
- Utilize validação com `class-validator` e, quando necessário, `class-transformer`.
- Mantenha os endpoints existentes funcionando.
- Siga boas práticas de NestJS, TypeScript, Prisma e MySQL.
- Não deixe métodos incompletos, código fictício ou comentários indicando que algo ainda precisa ser implementado.
- Não altere arquivos sem necessidade.
- Ao finalizar, apresente os arquivos modificados com seu conteúdo completo, e não apenas trechos isolados.
- Explique os comandos necessários para executar as migrações e testar a aplicação.

## 2. Filtro por tarefas concluídas

Implemente a busca por query params no endpoint `GET /tarefas`, permitindo filtrar tarefas pelo campo `concluida`.

Requisitos:
- `GET /tarefas?concluida=true`: retorna somente tarefas concluídas.
- `GET /tarefas?concluida=false`: retorna somente tarefas não concluídas.
- `GET /tarefas`: retorna todas as tarefas, sem aplicar esse filtro.
- Valores inválidos para `concluida` devem retornar HTTP 400.
- O filtro deve funcionar em conjunto com os demais filtros.

Não trate a string `"false"` como verdadeira. Converta e valide os parâmetros corretamente.

## 3. Desafio 1 — Descrição e prazo

Permita que cada tarefa tenha uma descrição e uma data limite, ambas opcionais.

### Alterações no Prisma

No model `Tarefa`, adicione:

- `descricao`: texto opcional, aceitando até 500 caracteres.
- `prazo`: data opcional.

Utilize os tipos e a sintaxe apropriados para a versão do Prisma já instalada. Os campos devem ser opcionais e compatíveis com o banco MySQL.

### DTOs

Atualize os DTOs de criação e atualização para aceitar os novos campos.

Validações obrigatórias:
- `titulo` continua obrigatório na criação.
- `descricao` é opcional e deve ter no máximo 500 caracteres.
- `prazo` é opcional e deve ser uma data válida no formato ISO 8601, aceitando valores como `2026-12-31`.
- Uma data inválida, como `"amanha"`, deve resultar em HTTP 400.
- Os campos opcionais podem ser omitidos ou enviados como `null`, conforme o padrão adotado pelo projeto.

### Service e controller

Atualize a criação e a atualização para persistir os campos corretamente.

Converta o prazo para um objeto `Date` quando necessário antes de enviar o valor ao Prisma.

Critérios de aceite:
1. `POST /tarefas` com `{"titulo":"Estudar"}` funciona normalmente, deixando `descricao` e `prazo` nulos.
2. `POST /tarefas` com `{"titulo":"Estudar","descricao":"Ler docs","prazo":"2026-12-31"}` retorna a tarefa com os três campos.
3. `POST /tarefas` com `{"titulo":"x","prazo":"amanha"}` retorna HTTP 400.
4. Uma descrição com mais de 500 caracteres retorna HTTP 400.
5. O `PATCH` ou `PUT` utilizado pelo projeto também permite atualizar os novos campos sem apagar os valores que não foram enviados.

## 4. Desafio 2 — Prioridade com enum

Classifique cada tarefa com uma prioridade.

### Schema Prisma

Crie o enum `Prioridade` com os valores:

- `BAIXA`
- `MEDIA`
- `ALTA`

Adicione ao model `Tarefa` o campo `prioridade`, com valor padrão `MEDIA`.

Utilize a sintaxe correta do Prisma e confirme que o tipo é compatível com a configuração atual do MySQL.

### DTOs

Aceite a prioridade na criação e na atualização.

Validações:
- O campo deve ser opcional na requisição de criação, pois possui valor padrão no banco.
- Os valores permitidos são exclusivamente `BAIXA`, `MEDIA` e `ALTA`.
- Utilize `@IsEnum()` ou uma validação equivalente.
- Valores inválidos devem retornar HTTP 400 com uma mensagem clara.
- Na atualização, não modifique a prioridade quando o campo não for enviado.

### Service e controller

Persista a prioridade corretamente e permita filtrar a listagem por query param.

Exemplos:
- `GET /tarefas?prioridade=ALTA`
- `GET /tarefas?prioridade=MEDIA`
- `GET /tarefas?prioridade=BAIXA`

Critérios de aceite:
1. Criar uma tarefa sem prioridade resulta em `"prioridade":"MEDIA"`.
2. Enviar `"prioridade":"URGENTE"` na criação retorna HTTP 400.
3. `GET /tarefas?prioridade=ALTA` retorna somente tarefas de prioridade alta.
4. `GET /tarefas?prioridade=XPTO` retorna HTTP 400.
5. Utilize o enum gerado pelo Prisma quando isso for compatível com a estrutura atual do projeto.

## 5. Desafio 3 — Busca por texto e ordenação

Implemente a busca por título e a ordenação das tarefas.

### Busca por texto

Aceite o parâmetro `busca` no endpoint `GET /tarefas`.

Exemplo:

`GET /tarefas?busca=nest`

Retorne somente as tarefas cujo título contenha o texto informado.

Requisitos:
- A busca deve ignorar diferenças entre letras maiúsculas e minúsculas.
- Uma busca vazia ou um parâmetro ausente não deve filtrar os resultados.
- Utilize os recursos de filtragem do Prisma.
- Como o projeto usa MySQL, verifique a collation e a configuração do banco para garantir o comportamento esperado de comparação sem distinção de maiúsculas e minúsculas. Não presuma que `mode: "insensitive"` funciona em todas as versões e provedores do Prisma.

### Ordenação

Aceite o parâmetro `ordem` com os seguintes valores:

- `asc`: tarefas mais antigas primeiro.
- `desc`: tarefas mais recentes primeiro.

Requisitos:
- Quando `ordem` não for informado, utilize `asc`.
- Valores diferentes de `asc` e `desc` devem retornar HTTP 400.
- Utilize o campo de data de criação que já existe no model. Se ele se chamar `criadaEm`, utilize esse campo; não crie outro campo desnecessário.

### DTO para listagem

Crie uma classe `ListarTarefasDto` para centralizar os parâmetros de consulta:

- `concluida`
- `prioridade`
- `busca`
- `ordem`

Valide os parâmetros usando `class-validator` e as ferramentas do NestJS.

Configure corretamente a validação global e a conversão de tipos, respeitando o padrão já utilizado no projeto.

### Combinação de filtros

Todos os filtros devem funcionar simultaneamente.

Exemplo:

`GET /tarefas?concluida=false&busca=nest&ordem=desc&prioridade=ALTA`

Nesse caso, retorne apenas tarefas que:
- Não estejam concluídas.
- Tenham o texto informado no título.
- Sejam de prioridade alta.
- Estejam ordenadas da mais recente para a mais antiga.

Monte o objeto `where` dinamicamente, incluindo somente os filtros fornecidos. Não aplique filtros para parâmetros ausentes.

Critérios de aceite:
1. Com as tarefas `"Estudar NestJS"` e `"Revisar nest"`, `?busca=nest` retorna ambas.
2. `?ordem=desc` retorna a tarefa mais recente primeiro.
3. `?ordem=qualquer` retorna HTTP 400.
4. Sem `busca`, nenhuma filtragem por título é aplicada.
5. Os filtros combinados retornam somente as tarefas que atendem a todos os critérios.

## 6. Banco de dados e migrações

O projeto utiliza MySQL e o banco de dados existente se chama `tarefas`, com uma tabela `tarefas`.

Preserve os registros já existentes.

Antes de gerar uma migração:
1. Verifique o schema atual do Prisma.
2. Confira a estrutura real da tabela no MySQL.
3. Compare os campos existentes com os novos requisitos.
4. Evite recriar tabelas ou sobrescrever dados.
5. Gere uma migração incremental com um nome descritivo, como `adicionar_detalhes_prioridade_tarefas`.
6. Execute a migração apenas depois de verificar que ela preserva os dados.
7. Atualize o Prisma Client.

Não afirme que uma migração foi executada com sucesso sem confirmar o resultado do comando.

Se houver divergência entre o schema do Prisma e o banco, explique o problema e proponha a correção segura antes de executar alterações potencialmente destrutivas.

## 7. Testes obrigatórios

Depois da implementação, forneça exemplos de requisições para testar todos os endpoints.

Inclua:
- Criação de tarefa sem campos opcionais.
- Criação com descrição, prazo e prioridade.
- Rejeição de prazo inválido.
- Rejeição de descrição acima de 500 caracteres.
- Rejeição de prioridade inválida.
- Atualização parcial de tarefa.
- Listagem sem filtros.
- Filtro por `concluida=true` e `concluida=false`.
- Filtro por prioridade.
- Busca por título sem diferenciar maiúsculas e minúsculas.
- Ordenação ascendente e descendente.
- Rejeição de valores inválidos para `ordem`.
- Combinação de todos os filtros.

Para cada teste, informe o método HTTP, a URL, o JSON do corpo quando houver e o resultado esperado.

## 8. Formato da resposta final

Ao terminar a implementação:

1. Mostre a estrutura final dos arquivos relevantes.
2. Envie o conteúdo completo e atualizado de cada arquivo criado ou modificado.
3. Inclua o `schema.prisma` completo, preservando os demais models existentes.
4. Inclua todos os DTOs, controllers e services que foram alterados.
5. Apresente os comandos de instalação, migração e execução necessários para o projeto atual.
6. Forneça exemplos de testes usando Insomnia, Postman ou `curl`.
7. Informe os resultados dos testes realmente executados e diferencie-os dos testes que ainda precisam ser feitos.
8. Explique resumidamente como cada desafio foi implementado.
9. Não omita arquivos importantes nem responda apenas com pseudocódigo.

**Objetivo final:** deixar o sistema de tarefas funcionando com descrição, prazo, prioridade, filtros por conclusão e prioridade, busca por texto, ordenação e validação completa, sem perder dados existentes e mantendo compatibilidade com o projeto atual.