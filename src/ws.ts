import { createMemo, createSignal } from 'solid-js'
import { LinearBackoff, Websocket, WebsocketBuilder } from 'websocket-ts'
import { z } from 'zod'
import { BoardAction, PlayerAction } from './dm/action'
import { ErrorKind, gameState, GameState } from './dm/state'

export interface GameCredentials {
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

const DEFAULT_GAME_OPTS: GameOptions = {
  communists: false,
  monarchist: false,
  anarchist: false,
  capitalist: false,
  centrists: false,
}

type WsState = { game?: GameState; create?: GameOptions }

export function createWs() {
  const [connected, setConnected] = createSignal(false)
  const [state, setState] = createSignal<WsState>({})

  const sendConnectMsg = (ws: Websocket, state: WsState) => {
    if (state.game) {
      const msg = {
        [state.game.name ? 'JoinAsPlayer' : 'JoinAsBoard']: {
          game_id: state.game.game_id,
          name: state.game.name,
        },
      }
      return ws.send(JSON.stringify(msg))
    }
    if (state.create) {
      const msg = { CreateGame: { options: state.create } }
      return ws.send(JSON.stringify(msg))
    }
  }

  const ws = new WebsocketBuilder(import.meta.env.VITE_WS_URL)
    .withBackoff(new LinearBackoff(1000, 250, 2500))
    .onOpen(ws => {
      setConnected(true)
      sendConnectMsg(ws, state())
    })
    .onMessage((ws, event) => {
      const msg = serverMsg.safeParse(JSON.parse(event.data))
      if (!msg.success) {
        console.error(`Could not parse message`, JSON.parse(event.data))
        return
      }
      setState(nextState(state(), msg.data))
    })
    .onError(() => {
      setConnected(false)
      setState(s => ({ game: s.game }))
    })
    .onClose(() => {
      setConnected(false)
      setState(s => ({ game: s.game }))
    })
    .build()

  const join = (cxn: GameCredentials) => {
    sendConnectMsg(ws, setState(connectingState(cxn)))
  }

  const create = (options: GameOptions) => {
    sendConnectMsg(ws, setState(createState(options)))
  }

  return {
    connected,
    state: () => state().game,
    gameId: () => state().game?.game_id,
    creating: () => state().create != null,
    credentials: () => {
      const s = state().game
      return s ? { gameId: s.game_id, name: s.name } : undefined
    },
    createGame: (options = DEFAULT_GAME_OPTS) => create(options),
    joinAsBoard: (gameId: string) => join({ gameId, name: null }),
    joinAsPlayer: (gameId: string, name: string) => join({ gameId, name }),
    leave: () => {
      setState({})
      ws.send(JSON.stringify('LeaveGame'))
    },
    startGame: () => ws.send(JSON.stringify('StartGame')),
    endGame: () => ws.send(JSON.stringify('EndGame')),
    boardAction: (action: BoardAction) => ws.send(JSON.stringify({ BoardAction: action })),
    playerAction: (action: PlayerAction) => ws.send(JSON.stringify({ PlayerAction: action })),
  }
}

function nextState(state: WsState, msg: ServerMsg): WsState {
  const gameId = state.game?.game_id
  if (msg.type === 'update') {
    return { game: msg.state }
  }
  if (msg.type === 'error' && gameId) {
    if (msg.error === 'game does not exist') {
      return errorState(gameId, 'notfound')
    }
    if (msg.error === 'too many players in the game') {
      return errorState(gameId, 'toomanyplayers')
    }
    if (msg.error === 'cannot join a game in progress') {
      return errorState(gameId, 'inprogress')
    }
  }
  return { game: state.game }
}

function createState(options: GameOptions): WsState {
  return { create: options }
}

function connectingState(id: GameCredentials | undefined): WsState {
  return {
    game: id && {
      game_id: id.gameId,
      name: id.name,
      players: [],
      state: { type: 'connecting' },
    },
  }
}

function errorState(gameId: string, error: ErrorKind): WsState {
  return {
    game: {
      game_id: gameId,
      name: null,
      players: [],
      state: { type: 'error', error },
    },
  }
}

type ServerMsg = z.infer<typeof serverMsg>

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
