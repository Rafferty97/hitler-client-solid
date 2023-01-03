import { Component, createEffect, Match, Switch } from 'solid-js'
import { LiveHeader } from '../components/LiveHeader'
import { GameState } from '../dm/state'
import { validateGameId } from '../validate'
import { createWs } from '../ws'
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

  return (
    <div class={s.PlayerApp}>
      <LiveHeader connected={ws.connected()} />
      {/* <div class={s.Container}>
        <Switch>
          <Match when={ws.state() == null || ws.state()?.state.type === 'ended'}>
            <JoinGame name={props.name} join={props.onJoin} />
          </Match>
          <Match when={isError(ws.state())} keyed>
            {error => <JoinGame gameId={props.gameId} name={props.name} join={props.onJoin} error={error} />}
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
