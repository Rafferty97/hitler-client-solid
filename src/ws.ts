import { createMemo, createSignal } from 'solid-js'
import { LinearBackoff, WebsocketBuilder } from 'websocket-ts'
import { BoardAction, PlayerAction } from './action'
import { GameState, serverMsg } from './zod'

interface Cxn {
  gameId: string
  name: string | null
}

export function createWs(init?: Cxn) {
  const [connected, setConnected] = createSignal(false)
  const [state, setState] = createSignal<GameState | undefined>(
    connectingState(init)
  )

  const cxn = createMemo<Cxn | undefined>(() => {
    const s = state()
    return s ? { gameId: s.game_id, name: s.name } : undefined
  })

  const ws = new WebsocketBuilder('ws://localhost:8888')
    .withBackoff(new LinearBackoff(1000, 250, 3000))
    .onOpen((ws) => {
      setConnected(true)
      const msg = connectionMessage(cxn())
      if (msg) ws.send(msg)
    })
    .onMessage((ws, event) => {
      const msg = serverMsg.parse(JSON.parse(event.data))
      if (msg.type === 'update') setState(msg.state)
    })
    .onClose(() => setConnected(false))
    .build()

  const options = {
    communists: true,
    monarchist: true,
    anarchist: true,
    capitalist: true,
    centrists: true,
  }

  const join = (cxn: Cxn) => {
    setState(connectingState(cxn))
    ws.send(connectionMessage(cxn)!)
  }

  return {
    connected,
    state,
    gameId: createMemo(() => state()?.game_id),
    createGame: () => ws.send(JSON.stringify({ CreateGame: { options } })),
    joinAsBoard: (gameId: string) => join({ gameId, name: null }),
    joinAsPlayer: (gameId: string, name: string) => join({ gameId, name }),
    startGame: () => ws.send(JSON.stringify('StartGame')),
    boardAction: (action: BoardAction) =>
      ws.send(JSON.stringify({ BoardAction: action })),
    playerAction: (action: PlayerAction) =>
      ws.send(JSON.stringify({ PlayerAction: action })),
  }
}

function connectingState(id: Cxn | undefined): GameState | undefined {
  if (!id) return undefined
  return {
    game_id: id.gameId,
    name: id.name,
    players: [],
    state: { type: 'connecting' },
  }
}

function connectionMessage(id: Cxn | undefined): string | undefined {
  if (!id) return
  return JSON.stringify({
    [id.name ? 'JoinAsPlayer' : 'JoinAsBoard']: {
      game_id: id.gameId,
      name: id.name,
    },
  })
}
