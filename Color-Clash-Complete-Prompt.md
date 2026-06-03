
# COLOR CLASH - DOCUMENTO COMPLETO DE DESENVOLVIMENTO

## Visão Geral

Desenvolver um jogo web multiplayer inspirado na mecânica clássica de UNO, porém utilizando identidade visual própria e sem qualquer asset, logotipo ou elemento protegido por direitos autorais.

Nome do projeto: Color Clash

Objetivo:
Permitir que jogadores criem salas privadas, compartilhem um link e joguem online em tempo real.

Tecnologias:

Frontend:
- React
- TypeScript
- Vite
- Socket.IO Client

Backend:
- Node.js
- Express
- Socket.IO
- TypeScript

Estado do jogo:
- Mantido exclusivamente no servidor

Persistência:
- Nenhuma inicialmente
- Salas em memória

---

# Requisitos Gerais

- 2 a 4 jogadores
- Sala privada por link
- Nickname personalizado
- Regras configuráveis
- Responsivo para desktop e celular
- Anti-cheat no servidor
- Sem banco de dados no MVP

---

# Fluxo do Usuário

## Tela Inicial

Campos:

Nickname

Botões:

- Criar Sala
- Entrar em Sala

Ao criar:

- gerar código curto
- gerar URL compartilhável

Exemplo:

https://meusite.com/room/ABCD12

---

# Sistema de Salas

Cada sala deve conter:

- roomCode
- hostId
- players
- gameState

Regras:

- mínimo 2 jogadores
- máximo 4 jogadores
- host inicia partida
- host pode alterar regras
- host pode reiniciar partida

Caso host saia:

- próximo jogador vira host

---

# Baralho

Cores:

- vermelho
- azul
- verde
- amarelo

Cartas numéricas:

0 = 1 por cor

1-9 = 2 por cor

Cartas especiais:

Skip = 2 por cor
Reverse = 2 por cor
Draw2 = 2 por cor

Coringas:

Wild = 4
WildDraw4 = 4

Total aproximado:

108 cartas

---

# Estrutura das Cartas

```ts
type CardColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "wild";

type CardType =
  | "number"
  | "skip"
  | "reverse"
  | "draw2"
  | "wild"
  | "wildDraw4";

type Card = {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number;
};
```

---

# Estrutura dos Jogadores

```ts
type Player = {
  id: string;
  nickname: string;
  hand: Card[];
  saidUno: boolean;
  connected: boolean;
  isHost: boolean;
};
```

---

# Regras Base

- iniciar com 7 cartas
- revelar carta inicial
- jogar mesma cor
- jogar mesmo número
- jogar mesmo símbolo
- jogar coringa

Se não puder jogar:

- comprar 1 carta

Se carta comprada for válida:

- jogar
ou
- passar

Vitória:

- mão vazia

---

# Regras Brasileiras Configuráveis

```ts
const rules = {
  allowStacking: true,
  allowPlus2OnPlus2: true,
  allowPlus4OnPlus4: true,
  allowPlus4OnPlus2: false,
  sevenZeroRule: false,
  mustSayUno: true,
  unoPenaltyCards: 2,
  drawUntilPlayable: false
};
```

---

# Empilhamento

Exemplo:

Jogador A:
+2

Jogador B:
+2

Jogador C:
+2

Jogador D:
compra 6

Sistema:

```ts
pendingDraw
pendingDrawType
```

---

# UNO

Botão UNO

Quando ficar com 2 cartas:

- jogador deve apertar UNO

Caso fique com 1 carta:

- adversário pode acusar

Penalidade:

- comprar 2 cartas

---

# Regras para 2 Jogadores

Skip:

- adversário perde vez

Reverse:

- funciona igual Skip

---

# Escolha de Cor

Ao jogar:

Wild
WildDraw4

Abrir modal:

- vermelho
- azul
- verde
- amarelo

Servidor valida.

---

# Estado Global

```ts
type GameState = {
 roomCode: string;
 players: Player[];
 deck: Card[];
 discardPile: Card[];
 currentPlayerIndex: number;
 direction: 1 | -1;
 currentColor: CardColor;
 pendingDraw: number;
 status: "waiting" | "playing" | "finished";
};
```

---

# Eventos Socket.IO

Cliente:

createRoom

joinRoom

startGame

playCard

drawCard

passTurn

sayUno

challengeUno

updateRules

leaveRoom

Servidor:

roomCreated

joinedRoom

gameState

gameFinished

errorMessage

---

# Segurança

OBRIGATÓRIO

Cliente:

- nunca valida regra

Servidor:

- valida tudo

Não enviar:

- cartas dos adversários

Não confiar:

- em nenhum dado do cliente

---

# Interface

Centro:

- descarte
- cor atual
- compra acumulada

Inferior:

- mão do jogador

Superior:

- adversários

Lateral:

- log

---

# Design das Cartas

NÃO usar imagens.

Criar componente:

CardView.tsx

Renderizar usando:

HTML
CSS
SVG

Símbolos:

Skip = ⊘

Reverse = ↺

Draw2 = +2

Wild = W

WildDraw4 = +4

---

# Efeitos Visuais

Cartas inválidas:

opacity reduzida

Hover:

levantar carta

Turno:

brilho

Vitória:

confete simples

---

# Funções Obrigatórias

createDeck()

shuffleDeck()

drawCards()

canPlayCard()

playCard()

advanceTurn()

checkWinner()

startGame()

getPublicGameStateForPlayer()

---

# Estrutura de Pastas

color-clash/

server/

client/

shared/

---

server/src

game/

rooms/

socket/

types/

---

client/src

pages/

components/

hooks/

services/

styles/

---

# MVP

Fase 1

- criar sala
- entrar sala
- iniciar jogo

Fase 2

- distribuir cartas
- jogar carta
- comprar carta

Fase 3

- especiais
- coringas

Fase 4

- empilhamento
- UNO

Fase 5

- polimento visual

---

# Funcionalidades Futuras

Chat

Bot

Ranking

Login

Histórico

Reconnect

Modo espectador

Partidas privadas protegidas por senha

Torneios

---

# Deploy

Frontend:
Vercel

Backend:
Render

ou Railway

Variáveis:

CLIENT_URL

PORT

NODE_ENV

---

# Instrução Final para IA

Crie todos os arquivos necessários para este projeto.

Implemente primeiro o backend completo.

Depois implemente frontend.

Forneça código completo arquivo por arquivo.

Nunca use pseudo-código.

O projeto deve rodar imediatamente após:

npm install

npm run dev
