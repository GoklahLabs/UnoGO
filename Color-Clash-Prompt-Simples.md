# PROMPT SIMPLES - JOGO ESTILO UNO PARA CASAL

## Objetivo

Criar um jogo web simples inspirado em UNO para eu jogar online com minha namorada.

Não é um produto comercial.
Não terá milhares de usuários.
Não precisa de arquitetura complexa.

O foco é apenas funcionar bem para duas pessoas.

---

## Tecnologias

Frontend:
- React
- Vite
- TypeScript

Backend:
- Node.js
- Express
- Socket.IO

---

## Requisitos

### Tela Inicial

- Campo para nickname
- Botão Criar Sala
- Campo para inserir código da sala
- Botão Entrar na Sala

---

### Sistema de Sala

Quando criar uma sala:

- Gerar código simples
- Exemplo: ABC123

Gerar link:

https://site.com/ABC123

Enviar para a outra pessoa.

---

### Jogadores

Apenas:

- Eu
- Minha namorada

Máximo:
2 jogadores

---

### Partida

Ao iniciar:

- Embaralhar cartas
- Distribuir 7 cartas para cada jogador
- Revelar primeira carta da mesa

---

### Cartas

Cores:

- Vermelho
- Azul
- Verde
- Amarelo

Cartas:

- 0 até 9
- Bloquear
- Inverter
- +2
- Coringa
- +4

---

### Regras

Pode jogar:

- Mesma cor
- Mesmo número
- Mesmo símbolo
- Coringa

---

### Comprar

Se não puder jogar:

- Comprar carta

Depois:

- Jogar se quiser
- Ou passar

---

### Carta Bloquear

O outro jogador perde a vez.

---

### Carta Inverter

Como são apenas 2 jogadores:

Funciona igual Bloquear.

---

### Carta +2

Próximo jogador:

- Compra 2 cartas
- Perde a vez

---

### Carta +4

Próximo jogador:

- Compra 4 cartas
- Perde a vez

Ao jogar:

- Escolher nova cor

---

### Coringa

Permite escolher:

- Vermelho
- Azul
- Verde
- Amarelo

---

### UNO

Quando ficar com 2 cartas:

- Mostrar botão UNO

Quando ficar com 1 carta:

- Se não tiver apertado UNO
- O adversário pode acusar

Penalidade:

- Comprar 2 cartas

---

### Vitória

Quando um jogador ficar sem cartas:

- Encerrar partida
- Mostrar vencedor

---

## Interface

Centro:

- Carta atual
- Cor atual
- Turno atual

Parte inferior:

- Minhas cartas

Parte superior:

- Quantidade de cartas do adversário

---

## Visual

Visual moderno.

Cartas desenhadas usando:

- HTML
- CSS

Não usar imagens.

Não baixar assets.

Não usar API externa.

---

## Estrutura

Frontend:

- HomePage
- LobbyPage
- GamePage

Componentes:

- Card
- Hand
- GameBoard

Backend:

- roomManager
- gameManager

---

## Não implementar

Não criar:

- Login
- Cadastro
- Banco de dados
- Ranking
- Chat
- Loja
- Perfil
- Sistema de amigos
- Matchmaking
- IA/Bot
- Estatísticas
- Segurança avançada
- Escalabilidade

---

## Objetivo Final

Quero um projeto simples, bonito e funcional para duas pessoas jogarem online através de um link compartilhado.

Forneça todos os arquivos necessários.

O projeto deve rodar com:

npm install

npm run dev

Sem depender de serviços externos.
