import { Component, createEffect, createSignal, Signal } from 'solid-js'
import { Error } from '../components/Error'
import { Button } from '../player/Button'
import { validateGameId } from '../validate'
import { GameOptions } from '../ws'
import s from './JoinGame.module.css'

interface Props {
  gameId?: string
  join: (gameId: string) => void
  createGame: (opts: GameOptions) => void
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

  const [communists, setCommunists] = createSignal(false)

  const createGame = (ev: Event) => {
    ev.preventDefault()
    props.createGame({
      communists: communists(),
      monarchist: false,
      anarchist: false,
      capitalist: false,
      centrists: false,
    })
  }

  return (
    <div class={s.JoinGame}>
      <div class={s.Column}>
        <h2>Join game</h2>
        <form onSubmit={join}>
          <label for="gameid">Room code:</label>
          <input
            id="gameid"
            type="text"
            value={gameId() ?? ''}
            maxLength={4}
            style={{ 'text-transform': 'uppercase' }}
            onInput={ev => setGameId((ev.target as HTMLInputElement).value)}
          />
          <Button submit label="Join game" />
          <Error error={props.error} />
        </form>
      </div>
      <div class={s.Divider} />
      <div class={s.Column}>
        <h2>Create game</h2>
        <form onSubmit={createGame}>
          <Checkbox label="Communists" value={communists()} onChange={setCommunists} />
          <Button submit label="Create game" />
        </form>
      </div>
    </div>
  )
}

const Checkbox: Component<{ label: string; value: boolean; onChange: (value: boolean) => void }> = props => {
  return (
    <label>
      <input
        type="checkbox"
        onChange={ev => props.onChange((ev.target as HTMLInputElement).checked)}
        checked={props.value}
      />
      {props.label}
    </label>
  )
}
