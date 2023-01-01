import { JSX, Component, createEffect, Match, Switch } from 'solid-js'
import { LiveHeader } from '../components/LiveHeader'
import { GameState } from '../dm/state'
import { validateGameIdAndName } from '../validate'
import { createWs } from '../ws'
import { JoinGame } from './JoinGame'
import { Lobby } from './Lobby'
import s from './PlayerApp.module.css'
import { Prompt } from './Prompt'

interface Props {
  gameId?: string
  name?: string
}

export const PlayerApp: Component<Props> = props => {
  const ws = createWs()

  createEffect(() => {
    const creds = validateGameIdAndName(props.gameId, props.name)
    if (creds) {
      ws.joinAsPlayer(creds.gameId, creds.name)
    } else {
      ws.leave()
    }
  })

  return (
    <div class={s.PlayerApp}>
      <LiveHeader connected={ws.connected()} name={ws.state()?.name ?? '--'} />
      <div class={s.Container}>
        <Switch>
          <Match when={ws.state() == null}>
            <JoinGame join={ws.joinAsPlayer} />
          </Match>
          <Match when={isEnded(ws.state())} keyed>
            {gameId => {
              const error = `Game ${gameId} does not exist`
              return (
                <JoinGame
                  gameId={props.gameId}
                  name={props.name}
                  join={ws.joinAsPlayer}
                  error={error}
                />
              )
            }}
          </Match>
          <Match when={ws.state()?.state.type === 'connecting'}>
            <p class={s.Message}>Joining game...</p>
          </Match>
          <Match when={isLobby(ws.state())} keyed>
            {state => <Lobby {...state} start={ws.startGame} />}
          </Match>
          <Match when={isPrompt(ws.state())} keyed>
            {state => <Prompt {...state} action={ws.playerAction} />}
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

function isEnded(state: GameState | undefined) {
  return state?.state.type === 'ended' ? state.game_id : undefined
}
