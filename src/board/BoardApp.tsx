import { Component, createEffect, createSignal, Match, Show, Switch, untrack } from 'solid-js'
import { LiveHeader } from '../components/LiveHeader'
import { GameState } from '../dm/state'
import { validateGameId } from '../validate'
import { createWs } from '../ws'
import { JoinGame } from './JoinGame'
import { PlayerRail } from './PlayerRail'
import { BoardContent } from './BoardContent'
import { Button } from '../player/Button'
import s from './BoardApp.module.css'

interface Props {
  gameId?: string
  onJoin: (gameId: string) => void
  create?: boolean
}

export const BoardApp: Component<Props> = props => {
  const ws = createWs()

  if (props.create) {
    ws.createGame()
  }

  createEffect(() => {
    const next = validateGameId(props.gameId)
    const current = untrack(ws.credentials)
    if (next && (next !== current?.gameId || current.name)) {
      ws.joinAsBoard(next)
    }
    if (!next && current) {
      ws.leave()
    }
  })

  createEffect(() => {
    const creds = ws.credentials()
    if (creds && !creds.name) {
      props.onJoin(creds.gameId)
    }
  })

  const [promptInteraction, setPromptInteraction] = createSignal(new AudioContext().state !== 'running')

  return (
    <div class={s.BoardApp}>
      <LiveHeader name={ws.state()?.game_id} connected={ws.connected()} />
      <Switch>
        <Match when={ws.creating()}>
          {/* FIXME */}
          <div>Creating game...</div>
        </Match>
        <Match when={ws.state() == null || ws.state()?.state.type === 'ended'}>
          <JoinGame join={ws.joinAsBoard} createGame={ws.createGame} />
        </Match>
        <Match when={isError(ws.state())} keyed>
          {error => (
            <JoinGame gameId={props.gameId} join={props.onJoin} createGame={ws.createGame} error={error} />
          )}
        </Match>
        <Match when={ws.state() && promptInteraction()}>
          <div class={s.ResumeScreen}>
            <Button white label="Resume game" onClick={() => setPromptInteraction(false)} />
          </div>
        </Match>
        <Match when={ws.state()}>
          <div class={s.Board}>
            <BoardContent state={ws.state()!} action={ws.boardAction} />
            <PlayerRail state={ws.state()!} />
          </div>
        </Match>
      </Switch>
    </div>
  )
}

function isError(state: GameState | undefined) {
  if (state?.state.type === 'error') {
    switch (state.state.error) {
      case 'notfound':
        return `Game ${state.game_id} not found`
      case 'toomanyplayers':
        return `The game has reached its maximum player count`
      case 'inprogress':
        return `Game has already started`
    }
  }
}
