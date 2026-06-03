# UnoGO v1.0

Jogo de cartas estilo UNO para dois jogadores — multiplayer online em tempo real.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + Socket.IO |
| Estilo | CSS puro (sem Tailwind) |
| Sons | Web Audio API (sem arquivos externos) |

---

## Rodar localmente

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev       # http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

---

## Deploy em Produção

### Frontend → Vercel

1. Importe o repositório no [vercel.com](https://vercel.com)
2. Configure **Root Directory** para `client`
3. Adicione a variável de ambiente:
   ```
   VITE_SOCKET_URL = https://seu-backend.railway.app
   ```
4. Deploy automático a cada push

### Backend → Railway (recomendado)

> O Socket.IO exige conexões persistentes (WebSocket), que **não** são suportadas no plano free da Vercel. Use Railway, Render ou Fly.io para o servidor.

1. Crie um projeto no [railway.app](https://railway.app)
2. Conecte o repositório, defina **Root Directory** como `server`
3. Start command: `npm run build && npm start`
4. Copie a URL gerada (ex: `https://unogo-server.up.railway.app`)
5. Cole essa URL como `VITE_SOCKET_URL` no Vercel

---

## Regras do Jogo

- 108 cartas, 7 por jogador no início
- Jogar por cor, número ou tipo
- Cartas especiais: Bloquear, Inverter, +2, Wild, Wild +4
- Botão **UNO** quando restar 1 carta
- Acusar adversário sem UNO: penalidade de +2

## Estrutura

```
/
├── client/          ← React frontend
│   ├── src/
│   │   ├── components/   Card, Hand, GameBoard, etc.
│   │   ├── pages/        HomePage, LobbyPage, GamePage
│   │   ├── sounds.ts     Web Audio API (sintético)
│   │   ├── socket.ts     Socket.IO client
│   │   └── utils.ts      Helpers
│   └── vercel.json
│
└── server/          ← Node.js backend
    └── src/
        ├── types.ts
        ├── deck.ts
        ├── roomManager.ts
        ├── gameManager.ts
        └── index.ts
```
