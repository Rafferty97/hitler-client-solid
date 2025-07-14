import { Component, createSignal } from 'solid-js'
import { makePersisted } from '@solid-primitives/storage'
import { Error } from '../components/Error'
import { Button } from '../player/Button'
import { validateGameId } from '../validate'
import { GameOptions } from '../ws'
import s from './JoinGame.module.css'
import { createStore } from 'solid-js/store'

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

  const createGame = (ev: Event, opts?: GameOptions) => {
    ev.preventDefault()
    props.createGame(opts)
  }

  const [settings, setSettings] = makePersisted(
    createStore({
      communists: false,
      monarchist: false,
      anarchist: false,
      capitalist: false,
      centrists: false,
    }),
    {
      storage: localStorage,
      name: 'xl_options',
    }
  )

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
      <form onSubmit={ev => createGame(ev, settings)}>
        <Button yellow submit label="Create new game" />
        <div style="margin-top: 20px; padding: 20px; background-color: black; border-radius: 8px;">
          <Checkbox
            label="Communists"
            value={settings.communists}
            onChange={communists => setSettings({ communists, anarchist: settings.anarchist && communists })}
          />
          <Checkbox
            label="Monarchist"
            value={settings.monarchist}
            onChange={monarchist => setSettings({ monarchist })}
          />
          <Checkbox
            label="Anarchist"
            value={settings.anarchist}
            onChange={anarchist => setSettings({ anarchist, communists: settings.communists || anarchist })}
            // disabled={!settings.communists}
          />
          <Checkbox
            label="Capitalist"
            value={settings.capitalist}
            onChange={capitalist => setSettings({ capitalist })}
          />
          <Checkbox
            label="Centrists"
            value={settings.centrists}
            onChange={centrists => setSettings({ centrists })}
          />
        </div>
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
