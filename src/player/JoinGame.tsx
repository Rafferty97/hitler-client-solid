import { Component, createSignal } from 'solid-js'
import { validateGameIdAndName } from '../validate'
import { Button } from './Button'
import s from './JoinGame.module.css'
import { Error } from '../components/Error'

interface Props {
  gameId?: string
  name?: string
  join: (gameId: string, name: string) => void
  error?: string
}

export const JoinGame: Component<Props> = props => {
  const [gameId, setGameId] = createSignal(props.gameId)
  const [name, setName] = createSignal(props.name)

  const validated = () => validateGameIdAndName(gameId(), name())

  const join = (ev: Event) => {
    ev.preventDefault()
    const data = validated()
    if (!data) return
    const { gameId, name } = data
    props.join(gameId, name)
  }

  return (
    <form class={s.JoinForm} onSubmit={join}>
      <div class={s.Row}>
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
      <div class={s.Row}>
        <label for="gameid">Your name:</label>
        <input
          type="text"
          value={name() ?? ''}
          maxLength={15}
          style={{ 'text-transform': 'uppercase' }}
          onInput={ev => setName((ev.target as HTMLInputElement).value)}
        />
      </div>
      <div style={{ height: '10px' }} />
      <Button submit label="Join game" disabled={validated() == null} />
      <div style={{ height: '20px' }} />
      <Error error={props.error} />
    </form>
  )
}
