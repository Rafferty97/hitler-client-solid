import { createMemo, createSignal } from 'solid-js'
import { LinearBackoff, WebsocketBuilder } from 'websocket-ts'
import { z } from 'zod'
import { BoardAction, PlayerAction } from './dm/action'
import { ErrorKind, gameState, GameState } from './dm/state'

export interface Credentials {
  gameId: string
  name: string | null
}

export interface GameOptions {
  communists: boolean
  monarchist: boolean
  anarchist: boolean
  capitalist: boolean
  centrists: boolean
}

export function createWs() {
  const [connected, setConnected] = createSignal(false)
  const [state, setState] = createSignal<GameState | undefined>(undefined)

  const cxn = createMemo<Credentials | undefined>(() => {
    const s = state()
    return s ? { gameId: s.game_id, name: s.name } : undefined
  })

  const ws = new WebsocketBuilder('ws://localhost:8888')
    .withBackoff(new LinearBackoff(1000, 250, 2500))
    .onOpen(ws => {
      setConnected(true)
      const msg = connectionMessage(cxn())
      if (msg) ws.send(msg)
    })
    .onMessage((ws, event) => {
      const msg = serverMsg.safeParse(JSON.parse(event.data))
      if (!msg.success) {
        console.error(`Could not parse message`, JSON.parse(event.data))
        return
      }
      if (msg.data.type === 'update') setState(msg.data.state)
      if (msg.data.type === 'error') {
        const gameId = cxn()?.gameId
        if (msg.data.error === 'game does not exist') {
          setState(gameId ? errorState(gameId, 'notfound') : undefined)
        }
        if (msg.data.error === 'too many players in the game') {
          setState(gameId ? errorState(gameId, 'toomanyplayers') : undefined)
        }
        if (msg.data.error === 'cannot join a game in progress') {
          setState(gameId ? errorState(gameId, 'inprogress') : undefined)
        }
      }
    })
    .onClose(() => setConnected(false))
    .build()

  const join = (cxn: Credentials) => {
    setState(connectingState(cxn))
    ws.send(connectionMessage(cxn)!)
  }

  return {
    connected,
    state,
    gameId: createMemo(() => state()?.game_id),
    createGame: (options: GameOptions) => ws.send(JSON.stringify({ CreateGame: { options } })),
    joinAsBoard: (gameId: string) => join({ gameId, name: null }),
    joinAsPlayer: (gameId: string, name: string) => join({ gameId, name }),
    leave: () => {
      setState(undefined)
      ws.send(JSON.stringify('LeaveGame'))
    },
    startGame: () => ws.send(JSON.stringify('StartGame')),
    endGame: () => ws.send(JSON.stringify('EndGame')),
    boardAction: (action: BoardAction) => ws.send(JSON.stringify({ BoardAction: action })),
    playerAction: (action: PlayerAction) => ws.send(JSON.stringify({ PlayerAction: action })),
  }
}

function connectingState(id: Credentials | undefined): GameState | undefined {
  if (!id) return undefined
  return {
    game_id: id.gameId,
    name: id.name,
    players: [],
    state: { type: 'connecting' },
  }
}

function endedState(gameId: string): GameState {
  return {
    game_id: gameId,
    name: null,
    players: [],
    state: { type: 'ended' },
  }
}

function errorState(gameId: string, error: ErrorKind): GameState {
  return {
    game_id: gameId,
    name: null,
    players: [],
    state: { type: 'error', error },
  }
}

function connectionMessage(id: Credentials | undefined): string | undefined {
  if (!id) return
  return JSON.stringify({
    [id.name ? 'JoinAsPlayer' : 'JoinAsBoard']: {
      game_id: id.gameId,
      name: id.name,
    },
  })
}

const serverMsg = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('update'),
    state: gameState,
  }),
  z.object({
    type: z.literal('error'),
    error: z.string(),
  }),
])
