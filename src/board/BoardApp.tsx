import { Component, createEffect, Match, Switch } from 'solid-js'
import { LiveHeader } from '../components/LiveHeader'
import { GameState } from '../dm/state'
import { validateGameId } from '../validate'
import { createWs } from '../ws'
import { JoinGame } from './JoinGame'
import s from './BoardApp.module.css'

interface Props {
  gameId?: string
  onJoin: (gameId: string) => void
  onExit: () => void
}

export const BoardApp: Component<Props> = props => {
  const ws = createWs()

  createEffect(() => {
    const gameId = validateGameId(props.gameId)
    if (gameId != null) {
      ws.joinAsBoard(gameId)
    } else {
      ws.leave()
    }
  })

  createEffect(() => {
    const gameId = ws.gameId()
    if (gameId) props.onJoin(gameId)
  })

  const create = () =>
    ws.createGame({
      communists: false,
      anarchist: false,
      capitalist: false,
      centrists: false,
      monarchist: false,
    })

  return (
    <div class={s.BoardApp}>
      <LiveHeader connected={ws.connected()} />
      <Switch>
        <Match when={ws.state() == null || ws.state()?.state.type === 'ended'}>
          <JoinGame join={props.onJoin} createGame={create} />
        </Match>
        <Match when={isError(ws.state())} keyed>
          {error => <JoinGame gameId={props.gameId} join={props.onJoin} createGame={create} error={error} />}
        </Match>
        <Match when={true}>
          <pre>{JSON.stringify(ws.state(), undefined, 2)}</pre>
        </Match>
      </Switch>
      {/* <div class={s.Container}>
        <Switch>
          <Match when={ws.state() == null || ws.state()?.state.type === 'ended'}>
            <JoinGame join={props.onJoin} />
          </Match>
          <Match when={isError(ws.state())} keyed>
            {error => <JoinGame gameId={props.gameId} join={props.onJoin} error={error} />}
          </Match>
          <Match when={ws.state()?.state.type === 'connecting'}>
            <p class={s.Message}>Joining game...</p>
          </Match>
          <Match when={isLobby(ws.state())} keyed>
            {state => <Lobby {...state} start={ws.startGame} />}
          </Match>
          <Match when={isPrompt(ws.state())} keyed>
            {state => (
              <Prompt {...state} action={ws.playerAction} startGame={ws.startGame} endGame={ws.endGame} />
            )}
          </Match>
        </Switch>
      </div> */}
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
