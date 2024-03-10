import { Component, createEffect, createSignal, Signal } from 'solid-js'
import { Error } from '../components/Error'
import { Button } from '../player/Button'
import { validateGameId } from '../validate'
import { GameOptions } from '../ws'
import s from './JoinGame.module.css'

interface Props {
  gameId?: string
  join: (gameId: string) => void
  createGame: (opts?: GameOptions) => void
  error?: string
}

export const JoinGame: Component<Props> = props => {
  const [gameId, setGameId] = createSignal(props.gameId)

  const validated = () => validateGameId(gameId())

  const join = (ev: Event) => {
    ev.preventDefault()
    const gameId_ = validated()
    if (gameId_) props.join(gameId_)
  }

  const createGame = (ev: Event) => {
    ev.preventDefault()
    props.createGame()
  }

  return (
    <div class={s.JoinForm}>
      <form onSubmit={join}>
        <div class={s.JoinRow}>
          <label for="gameid">Room code:</label>
          <input
            id="gameid"
            type="text"
            value={gameId() ?? ''}
            maxLength={4}
            style={{ 'text-transform': 'uppercase' }}
            onInput={ev => setGameId((ev.target as HTMLInputElement).value)}
          />
        </div>
        <Button submit label="Join game" disabled={!validated()} />
        <Error error={props.error} />
      </form>
      <div class={s.Or}>
        <span>OR</span>
      </div>
      <form onSubmit={createGame}>
        <Button yellow submit label="Create new game" />
      </form>
    </div>
  )
}

const Checkbox: Component<{
  label: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}> = props => {
  return (
    <label class={s.Checkbox}>
      <input
        type="checkbox"
        onChange={ev => props.onChange((ev.target as HTMLInputElement).checked)}
        checked={props.value}
        disabled={props.disabled}
      />
      {props.label}
    </label>
  )
}
