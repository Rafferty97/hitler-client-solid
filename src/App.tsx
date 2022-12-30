import { Component, createEffect, Match, Switch } from 'solid-js'
import { BoardAction, PlayerAction } from './action'
import styles from './App.module.css'
import { createWs } from './ws'
import { BoardState, GameState, PlayerState } from './dm/state'

const App: Component = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const gameId = urlParams.get('game')?.toUpperCase() ?? ''
  const init = gameId.match(/[A-Z]{4}/) ? { gameId, name: null } : undefined
  const ws = createWs(init)

  const players = [
    'ALEX',
    'BOB',
    'CHARLIE',
    'DAVID',
    'ED',
    'FRED',
    'GEORGE',
  ].map((name) => ({
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
      <h1>BOARD</h1>
      {!ws.connected() && <p>DISCONNECTED...</p>}
      <p>Game ID: {ws.gameId() ?? '-- none --'}</p>
      <button onClick={ws.createGame}>CREATE GAME</button>
      {canStart(ws.state()) && (
        <button onClick={() => ws.startGame()}>START GAME</button>
      )}
      <hr />
      <BoardPrompt state={ws.state()} action={ws.boardAction} />
      <hr />
      <div style={{ display: 'flex' }}>
        {players.map((player) => (
          <div
            style={{
              width: '320px',
              height: '320px',
              border: '1px solid black',
            }}
          >
            <h3>{player.name}</h3>
            {!player.ws.connected() && <p>DISCONNECTED...</p>}
            <PlayerPrompt
              state={player.ws.state()}
              action={player.ws.playerAction}
            />
          </div>
        ))}
      </div>
      <pre style={{ color: '#aaa', 'text-align': 'left' }}>
        {JSON.stringify(ws.state(), undefined, 2)}
      </pre>
    </div>
  )
}

const BoardPrompt: Component<{
  state: GameState | undefined
  action: (action: BoardAction) => void
}> = (props) => {
  const players = () => {
    return props.state?.players ?? []
  }

  const board = () => {
    const state = props.state?.state
    return state?.type === 'board' ? state : undefined
  }

  const playerName = (idx: number | null) =>
    idx == null ? '--' : players()[idx].name

  return (
    <>
      <p>
        <strong>Liberals: </strong>
        {board()?.liberal_cards ?? '--'}
        <span style={{ display: 'inline-block', width: '50px' }}></span>
        <strong>Fascists: </strong>
        {board()?.fascist_cards ?? '--'}
        <span style={{ display: 'inline-block', width: '50px' }}></span>
        <strong>Communists: </strong>
        {board()?.communist_cards ?? '--'}
        <span style={{ display: 'inline-block', width: '50px' }}></span>
        <strong>Deck: </strong>
        {board()?.draw_pile ?? '--'}
      </p>
      <hr />
      <Switch>
        <Match when={board()?.prompt?.type === 'Night'}>
          <h2>Night Round</h2>
        </Match>
        <Match when={isElection(board())} keyed>
          {(state) => (
            <>
              <h2>Election</h2>
              <p>President: {playerName(state.president)}</p>
              <p>
                Chancellor:{' '}
                {state.chancellor == null
                  ? '-- none --'
                  : playerName(state.chancellor)}
              </p>
              {state.outcome != null && (
                <p>Outcome: {state.outcome ? 'JA!' : 'NEIN!'}</p>
              )}
              {state.outcome != null && (
                <button onClick={() => props.action({ type: 'EndVoting' })}>
                  NEXT
                </button>
              )}
            </>
          )}
        </Match>
        <Match when={isLegislativeSession(board())} keyed>
          {(state) => (
            <>
              <h2>Legislative Session</h2>
              <p>President: {playerName(state.president)}</p>
              <p>Chancellor: {playerName(state.chancellor)}</p>
              <p>
                <strong>{state.phase}</strong>
              </p>
            </>
          )}
        </Match>
        <Match when={isCardReveal(board())} keyed>
          {(state) => (
            <>
              <h2>Card Reveal</h2>
              <p>
                Outcome: {state.result}
                {state.chaos ? ' (chaos)' : ''}
              </p>
              {state.can_end && (
                <button onClick={() => props.action({ type: 'EndCardReveal' })}>
                  NEXT
                </button>
              )}
            </>
          )}
        </Match>
        <Match when={isCommunistSession(board())} keyed>
          {(state) => (
            <>
              <h2>{state.action}</h2>
              {state.phase === 'Entering' && (
                <button
                  onClick={() => props.action({ type: 'EndCommunistStart' })}
                >
                  NEXT
                </button>
              )}
              {state.phase === 'Leaving' && (
                <button
                  onClick={() => props.action({ type: 'EndCommunistEnd' })}
                >
                  NEXT
                </button>
              )}
            </>
          )}
        </Match>
        <Match when={isExecution(board())} keyed>
          {(state) => (
            <>
              <h2>Execution</h2>
              <p>Player: {playerName(state.chosen_player)}</p>
              {state.chosen_player == null || (
                <button
                  onClick={() => props.action({ type: 'EndExecutiveAction' })}
                >
                  NEXT
                </button>
              )}
            </>
          )}
        </Match>
        <Match when={isAssassination(board())} keyed>
          {(state) => (
            <>
              <h2>Assassination</h2>
              <p>Anarchist: {playerName(state.anarchist)}</p>
              <p>Player: {playerName(state.chosen_player)}</p>
              {state.chosen_player == null || (
                <button
                  onClick={() => props.action({ type: 'EndAssassination' })}
                >
                  NEXT
                </button>
              )}
            </>
          )}
        </Match>
        <Match when={board()?.prompt?.type === 'PolicyPeak'}>
          <h2>Policy Peak</h2>
        </Match>
        <Match when={board()?.prompt?.type === 'FiveYearPlan'}>
          <h2>Five Year Plan</h2>
          <button onClick={() => props.action({ type: 'EndExecutiveAction' })}>
            NEXT
          </button>
        </Match>
        <Match when={isGameOver(board())} keyed>
          {(state) => (
            <>
              <h2>GAME OVER</h2>
              <p>{state.outcome}</p>
            </>
          )}
        </Match>
        <Match when={board()?.prompt != null}>
          <p>UNKNOWN PROMPT: {board()?.prompt?.type}</p>
        </Match>
      </Switch>
    </>
  )
}

const PlayerPrompt: Component<{
  state: GameState | undefined
  action: (action: PlayerAction) => void
}> = (props) => {
  const player = () => {
    const state = props.state?.state
    return state?.type === 'player' ? state : undefined
  }

  return (
    <>
      <p style={{ 'margin-top': '-15px' }}>{player()?.role}</p>
      <Switch>
        <Match when={player()?.prompt?.type === 'Night'}>
          <p>Night round</p>
          <button onClick={() => props.action({ type: 'EndNightRound' })}>
            Okay
          </button>
        </Match>
        <Match when={isChoosePlayer(player())} keyed>
          {(state) => (
            <>
              <p>Choose a player</p>
              <p>{state.kind}</p>
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
        <Match when={player()?.prompt?.type === 'Vote'}>
          <p>Vote</p>
          <button
            onClick={() => props.action({ type: 'CastVote', vote: true })}
          >
            JA!
          </button>
          <button
            onClick={() => props.action({ type: 'CastVote', vote: false })}
          >
            NEIN!
          </button>
        </Match>
        <Match when={isDiscard(player())} keyed>
          {(state) => (
            <>
              <p>Discard a policy:</p>
              {state.cards.map((policy, index) => (
                <button
                  onClick={() => props.action({ type: 'Discard', index })}
                >
                  {policy.toUpperCase()}
                </button>
              ))}
            </>
          )}
        </Match>
        <Match when={isStartElection(player())} keyed>
          {(state) => (
            <>
              <button onClick={() => props.action({ type: 'EndCardReveal' })}>
                DONE
              </button>
              {state.can_assassinate && (
                <button
                  onClick={() => props.action({ type: 'StartAssassination' })}
                >
                  ASSASSINATE
                </button>
              )}
            </>
          )}
        </Match>
        <Match when={isPolicyPeak(player())} keyed>
          {(state) => (
            <>
              <p>Policy Peak</p>
              <ul>
                {state.cards.map((policy) => (
                  <li>{policy}</li>
                ))}
              </ul>
              <button
                onClick={() => props.action({ type: 'EndExecutiveAction' })}
              >
                OKAY
              </button>
            </>
          )}
        </Match>
        <Match when={player()?.prompt?.type === 'Dead'} keyed>
          <p style={{ color: '#b44', 'font-weight': 'bold' }}>You are dead</p>
        </Match>
        <Match when={isInvestigatePlayer(player())} keyed>
          {(state) => (
            <>
              <p>Investigate Player</p>
              <p>
                {state.name} is a {state.party}
              </p>
              <button
                onClick={() => props.action({ type: 'EndExecutiveAction' })}
              >
                OKAY
              </button>
            </>
          )}
        </Match>
        <Match when={isRadicalisationResult(player())} keyed>
          {(state) => (
            <>
              <h4>Radicalisation Result</h4>
              <p>{state.result}</p>
              <button
                onClick={() => props.action({ type: 'EndExecutiveAction' })}
              >
                OKAY
              </button>
            </>
          )}
        </Match>
        <Match when={isGameOver(player())} keyed>
          {(state) => (
            <>
              <h4>GAME OVER</h4>
              <p>{state.outcome}</p>
            </>
          )}
        </Match>
        <Match when={player()?.prompt?.type === 'EndCongress'}>
          <h4>Congress</h4>
          <button onClick={() => props.action({ type: 'EndCongress' })}>
            DONE
          </button>
        </Match>
        <Match when={player()?.prompt != null}>
          <p>UNKNOWN PROMPT: {player()?.prompt?.type}</p>
        </Match>
      </Switch>
    </>
  )
}

function canStart(state: GameState | undefined): boolean {
  if (state?.state.type == 'lobby') {
    return state.state.can_start
  }
  if (state?.state.type == 'board') {
    return state.state.prompt?.type === 'GameOver'
  }
  return false
}

function isElection(state?: BoardState) {
  return state?.prompt?.type === 'Election' ? state.prompt : undefined
}

function isLegislativeSession(state?: BoardState) {
  return state?.prompt?.type === 'LegislativeSession' ? state.prompt : undefined
}

function isCardReveal(state?: BoardState) {
  return state?.prompt?.type === 'CardReveal' ? state.prompt : undefined
}

function isCommunistSession(state?: BoardState) {
  return state?.prompt?.type === 'CommunistSession' ? state.prompt : undefined
}

function isExecution(state?: BoardState) {
  return state?.prompt?.type === 'Execution' ? state.prompt : undefined
}

function isAssassination(state?: BoardState) {
  return state?.prompt?.type === 'Assassination' ? state.prompt : undefined
}

function isChoosePlayer(state?: PlayerState) {
  return state?.prompt?.type === 'ChoosePlayer' ? state.prompt : undefined
}

function isDiscard(state?: PlayerState) {
  const prompt = state?.prompt
  if (
    prompt?.type === 'PresidentDiscard' ||
    prompt?.type === 'ChancellorDiscard'
  ) {
    return prompt
  }
}

function isStartElection(state?: PlayerState) {
  return state?.prompt?.type === 'StartElection' ? state.prompt : undefined
}

function isPolicyPeak(state?: PlayerState) {
  return state?.prompt?.type === 'PolicyPeak' ? state.prompt : undefined
}

function isInvestigatePlayer(state?: PlayerState) {
  return state?.prompt?.type === 'InvestigatePlayer' ? state.prompt : undefined
}

function isRadicalisationResult(state?: PlayerState) {
  return state?.prompt?.type === 'Radicalisation' ? state.prompt : undefined
}

function isGameOver(state?: BoardState | PlayerState) {
  return state?.prompt?.type === 'GameOver' ? state.prompt : undefined
}

export default App
