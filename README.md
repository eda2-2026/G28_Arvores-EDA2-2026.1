# Árvores - Fui Com a Cara

Esse repositório documenta a aplicação de **estruturas de árvores** em um sistema de avaliação de professores, desenvolvido como trabalho 3 da disciplina de Estruturas de Dados 2 da Universidade de Brasília, no semestre 26.1.

A proposta do trabalho foi usar uma base já existente e aplicar uma estrutura de dados que trouxesse ganho real em busca e organização. No nosso caso, a equipe escolheu dividir a implementação entre backend e frontend, usando **TypeScript** como tecnologia principal.

## Alunas

| Matrícula | Nome |
| -- | -- |
| 231026840  | Laryssa Felix Ribeiro Lopes |
| 231035731 |  Mayara Marques Silva |

## Vídeo de Apresentação

[Link da Apresentação](https://youtu.be/rnvlIQ1202c?si=-TzQ5bir7FQc76vX)

## Objetivo 

O objetivo foi aplicar árvores em um projeto funcional já existente para melhorar a performance de consultas e tornar a justificativa da disciplina mais concreta. Em vez de usar árvores apenas como exercício isolado, o trabalho foi encaixado em fluxos reais do sistema:

- busca de professores por nome e departamento na interface;
- exibição de sugestões de pesquisa;
- comparação de desempenho no benchmark;

## Estruturas e ideia central

Escolhemos trabalhar com uma estrutura de árvore balanceada no backend e com uma Trie no frontend para as consultas por prefixo.

### Por que árvore balanceada

A árvore balanceada foi pensada para os fluxos de cadastro e manutenção de professores, porque essas operações exigem inserção, remoção e busca com custo previsível. Em estruturas desse tipo, a ideia é evitar que a árvore fique desbalanceada e perca performance com o crescimento da base.

### Por que Trie na interface

A Trie foi aplicada nas buscas por prefixo da home e no benchmark porque esse tipo de estrutura é muito adequada para sugestões instantâneas e consultas textuais repetidas. Ela combina bem com o comportamento da busca do usuário, que normalmente digita parte do nome ou do departamento.

### O que isso melhora

- reduz o custo de buscas repetidas;
- evita varrer listas inteiras a cada tecla digitada;
- deixa a interface mais responsiva para sugestões;
- fortalece a comparação teórica e prática para a disciplina.

## O que foi aplicado

### Home

A página principal passou a trabalhar com árvore indexada. Além disso, a barra de pesquisa foi ajustada para usar estrutura de prefixo nas sugestões, tornando a navegação mais coerente com a proposta do trabalho.

Arquivos relacionados:

- `frontend/app/page.tsx`
- `frontend/app/components/pesquisa/pesquisa.tsx`
- `frontend/app/utils/trie.ts`

### Benchmark

A página de benchmark foi transformada em uma demonstração direta da Trie, com foco em tempo total de consultas, tempo médio e amostra de prefixo pesquisado. Isso tornou a comparação mais alinhada ao objetivo da disciplina.

Arquivos relacionados:

- `frontend/app/benchmark/page.tsx`
- `frontend/app/utils/trie.ts`

### Backend

Escolhemos usar uma árvore balanceada no backend para suportar o fluxo de professores. A justificativa é de preservar boa performance nas operações de manutenção da base e manter a estrutura preparada para crescer sem perder eficiência.

Arquivos relacionados:

- `backend/src/professores/professores.service.ts`
- `backend/src/professores/professores.controller.ts`
- `backend/src/shared/trees/*`

#### `backend/src/shared/trees/avl-tree.ts`

Este arquivo implementa a estrutura de dados **Árvore AVL**, uma árvore binária de busca balanceada. Nele foram desenvolvidas as operações de inserção, remoção, busca por chave exata e busca por prefixo, além dos mecanismos de balanceamento por meio de rotações. A árvore é utilizada para armazenar e organizar os professores pelo nome, permitindo buscas mais eficientes do que uma busca sequencial tradicional.

#### `backend/src/professores/professores.service.ts`

Este arquivo foi adaptado para integrar a árvore AVL ao gerenciamento de professores. Foi criada uma instância da árvore para armazenar os professores em memória, além de métodos para carregar e reconstruir a estrutura quando necessário. Também foram implementadas buscas utilizando a AVL, buscas sequenciais para comparação e um benchmark que mede o desempenho das duas abordagens. A árvore é mantida sincronizada sempre que um professor é criado, atualizado ou removido.

#### `backend/src/professores/professores.controller.ts`

Este arquivo foi modificado para disponibilizar novas rotas relacionadas à busca de professores. Foram adicionados endpoints para realizar buscas utilizando a árvore AVL, buscas sequenciais e comparações de desempenho entre os dois métodos. Essas rotas permitem que o frontend e as ferramentas de teste acessem diretamente os resultados e evidenciem os ganhos obtidos com a utilização da árvore AVL.

### Evidências

Abaixo podemos ver a página `home` com a implementação de `Trie`, tornando a busca de professores mais rápida (por nome e departamento). 

![gif-busca](./assets/gif-busca.gif)

Também podemos observar a página de `benchmark` com a eficiência da busca com árvore.

![gif-benchmark](./assets/gif-benchmark.gif)

## Como rodar o projeto 

### Pré-requisitos
- Node.js (v18+)

### Rodando o Backend

1. Navegue até a pasta do backend:
```bash
cd G28_Arvores-EDA2-2026.1\backend
```

2. Crie um arquivo `.env` na raiz da pasta backend com as seguintes variáveis:
```env
JWT_SECRET="sua_chave_secreta_muito_segura_aqui_minimo_32_caracteres"
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV="development"
```

> **Nota**: O `JWT_SECRET` deve ter no mínimo 32 caracteres por segurança. Gere uma chave forte se possível.

3. Instale as dependências:
```bash
npm install
```

4. Configure o banco de dados (gere o cliente Prisma e aplique as migrations):
```bash
npx prisma generate
npx prisma migrate deploy
```

5. Inicie o servidor:

```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3001`

### Rodando o Frontend

1. Em uma **nova aba do terminal**, navegue até a pasta do frontend:
```bash
cd G28_Arvores-EDA2-2026.1\frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

