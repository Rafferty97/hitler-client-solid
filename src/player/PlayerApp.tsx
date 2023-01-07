import { Component, createEffect, Match, Switch, untrack } from 'solid-js'
import { LiveHeader } from '../components/LiveHeader'
import { GameState } from '../dm/state'
import { validateGameIdAndName } from '../validate'
import { createWs } from '../ws'
import { JoinGame } from './JoinGame'
import { Lobby } from './Lobby'
import { Prompt } from './Prompt'
import s from './PlayerApp.module.css'

interface Props {
  gameId?: string
  name?: string
  onJoin: (gameId: string, name: string) => void
}

export const PlayerApp: Component<Props> = props => {
  const ws = createWs()

  createEffect(() => {
    const next = validateGameIdAndName(props.gameId, props.name)
    const current = untrack(ws.credentials)
    if (next && (next.gameId !== current?.gameId || next.name !== current?.name)) {
      ws.joinAsPlayer(next.gameId, next.name)
    }
    if (!next && current) {
      ws.leave()
    }
  })

  createEffect(() => {
    const creds = ws.credentials()
    if (creds && creds.name) {
      props.onJoin(creds.gameId, creds.name)
    }
  })

  const name = () => ws.state()?.name ?? undefined

  return (
    <div class={s.PlayerApp}>
      <LiveHeader connected={ws.connected()} name={name()} />
      <div class={s.Container}>
        <Switch>
          <Match when={ws.state() == null || ws.state()?.state.type === 'ended'}>
            <JoinGame gameId={props.gameId} name={props.name} join={ws.joinAsPlayer} />
          </Match>
          <Match when={isError(ws.state())} keyed>
            {error => (
              <JoinGame gameId={props.gameId} name={props.name} join={ws.joinAsPlayer} error={error} />
            )}
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
      </div>
    </div>
  )
}

function isLobby(state: GameState | undefined) {
  if (state?.state.type !== 'lobby') return undefined
  return {
    gameId: state.game_id,
    name: state.name ?? '',
    numPlayers: state.players.length,
    canStart: state.state.can_start,
  }
}

function isPrompt(state: GameState | undefined) {
  if (state?.state.type === 'player' && state.state.prompt != null) {
    const others = state.state.others.map(o => (o === 'Unknown' ? {} : o))
    return {
      prompt: state.state.prompt,
      role: state.state.role,
      players: state.players.map((player, i) => ({
        ...player,
        ...others[i],
      })),
    }
  }
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
