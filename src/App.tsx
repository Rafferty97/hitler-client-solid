import { Component, createEffect, Match, Switch } from 'solid-js'
import { PlayerAction } from './action'
import styles from './App.module.css'
import { createWs } from './ws'
import {
  ChoosePlayerPrompt,
  choosePlayerPrompt,
  GameState,
  PlayerState,
} from './zod'

const App: Component = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const gameId = urlParams.get('game')?.toUpperCase() ?? ''
  const init = gameId.match(/[A-Z]{4}/) ? { gameId, name: null } : undefined
  const ws = createWs(init)

  const players = ['ALEX', 'BOB', 'CHARLIE', 'DAVID', 'ED'].map((name) => ({
    name,
    ws: createWs(),
  }))
  createEffect(() => {
    const gameId = ws.gameId()
    if (!gameId) return
    window.history.replaceState({}, '', gameId ? `/?game=${gameId}` : '/')
    players.forEach((p) => p.ws.joinAsPlayer(gameId, p.name))
  })

  return (
    <div class={styles.App}>
      <h1>Hello world</h1>
      <p>Connected: {ws.connected() ? 'YES' : 'NO'}</p>
      <p>Game ID: {ws.gameId() ?? '-- none --'}</p>
      <button onClick={ws.createGame}>CREATE GAME</button>
      {canStart(ws.state()) && (
        <button onClick={() => ws.startGame()}>START GAME</button>
      )}
      <h3>BOARD</h3>
      <pre style={{ color: '#aaa' }}>{JSON.stringify(ws.state())}</pre>
      <hr />
      {players.map((player) => (
        <>
          <h3>{player.name}</h3>
          <p>Connected: {player.ws.connected() ? 'YES' : 'NO'}</p>
          <PlayerPrompt
            state={player.ws.state()}
            action={player.ws.playerAction}
          />
          <pre style={{ color: '#aaa' }}>
            {JSON.stringify(player.ws.state())}
          </pre>
          <hr />
        </>
      ))}
    </div>
  )
}

const PlayerPrompt: Component<{
  state: GameState | undefined
  action: (action: PlayerAction) => void
}> = (props) => {
  const state = () => {
    const state = props.state?.state
    return state?.type === 'player' ? state : undefined
  }

  return (
    <Switch>
      <Match when={state()?.prompt?.type === 'Night'}>
        <p>Night round</p>
        <button onClick={() => props.action({ type: 'EndNightRound' })}>
          Okay
        </button>
      </Match>
      <Match when={isChoosePlayer(state())} keyed>
        {(state) => (
          <>
            <p>Choose a player</p>
            <p>{state.type}</p>
            {state.options.map((name) => (
              <button
                onClick={() => props.action({ type: 'ChoosePlayer', name })}
              >
                {name}
              </button>
            ))}
          </>
        )}
      </Match>
      <Match when={state()?.prompt?.type === 'Vote'}>
        <p>Vote</p>
        <button onClick={() => props.action({ type: 'CastVote', vote: true })}>
          JA!
        </button>
        <button onClick={() => props.action({ type: 'CastVote', vote: false })}>
          NEIN!
        </button>
      </Match>
    </Switch>
  )
}

function canStart(state: GameState | undefined): boolean {
  return state?.state.type == 'lobby' && state.state.can_start
}

function isChoosePlayer(state?: PlayerState): ChoosePlayerPrompt | undefined {
  return state?.prompt?.type === 'ChoosePlayer' ? state.prompt : undefined
}

export default App
