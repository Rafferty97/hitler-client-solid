import { Component, createSignal } from 'solid-js'
import { Error } from '../components/Error'
import { Button } from '../player/Button'
import { validateGameId } from '../validate'

interface Props {
  gameId?: string
  join: (gameId: string) => void
  createGame: () => void
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

  return (
    <>
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
      <Button label="Create game" onClick={props.createGame} />
    </>
  )
}
