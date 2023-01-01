import { Component, createSignal } from 'solid-js'
import { validateGameIdAndName } from '../validate'
import s from './JoinGame.module.css'

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
      <input
        type="text"
        value={gameId() ?? ''}
        maxLength={4}
        style={{ 'text-transform': 'uppercase' }}
        onInput={ev => setGameId((ev.target as HTMLInputElement).value)}
      />
      <input
        type="text"
        value={name() ?? ''}
        maxLength={15}
        style={{ 'text-transform': 'uppercase' }}
        onInput={ev => setName((ev.target as HTMLInputElement).value)}
      />
      <input type="submit" value="JOIN" disabled={validated() == null} />
      {props.error && <p>{props.error}</p>}
    </form>
  )
}
