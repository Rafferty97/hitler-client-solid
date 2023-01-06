import { Component, createEffect, Match, Switch } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { BoardAction } from '../dm/action'
import { BoardState, GameState } from '../dm/state'
import { createWs } from '../ws'
import { PlayerApp } from '../player/PlayerApp'
import { validateGameId } from '../validate'
import { PrefetchImages } from '../components/Prefetch'
import { BoardApp } from '../board/BoardApp'

/*
  TODO: Anarchist, interaction with special election, etc.
  TODO: Consistent spacing in ".Message"

  Centrist = 7 or more
  Monarchist (if you do it) = 8 or more
  Capitalist & Anarchist = 9 or more
*/

const ConsolePage: Component = () => {
  const [params, setParams] = useSearchParams()
  const gameId = () => params.game ?? ''
  const setGameId = (game: string) => setParams({ game })
  const ws = createWs()

  createEffect(() => {
    const gameId_ = validateGameId(gameId())
    if (gameId_) {
      ws.joinAsBoard(gameId_)
    } else {
      ws.leave()
    }
  })

  createEffect(() => {
    const gameId_ = ws.gameId()
    if (gameId_) setGameId(gameId_)
  })

  const players = [
    'ALEX',
    'BOB',
    'CHARLIE',
    'DAVID',
    'EDDY',
    // 'FRED',
    // 'GEORGE',
    // 'IJ',
    // 'JACK',
    // 'KAREN',
    // 'LILLY',
  ]

  const noop = () => {}

  return (
    <div>
      <PrefetchImages />
      <div style={{ position: 'relative', background: '#222', height: '650px', margin: '0 0 40px' }}>
        <BoardApp gameId={gameId()} onJoin={setGameId} />
      </div>
      <button onClick={() => ws.boardAction({ type: 'EndVoting' })}>End voting</button>
      <button onClick={() => ws.boardAction({ type: 'EndCardReveal' })}>End card reveal</button>
      <button onClick={() => ws.boardAction({ type: 'EndLegislativeSession' })}>
        End legislative session
      </button>
      <button onClick={() => ws.boardAction({ type: 'EndExecutiveAction' })}>End action</button>
      <div style={{ display: 'flex', 'flex-wrap': 'wrap', margin: '40px 0' }}>
        {players.map(player => (
          <div
            style={{
              flex: '1 0 280px',
              height: '520px',
              border: '2px solid white',
              background: '#222',
              overflow: 'hidden',
            }}
          >
            <PlayerApp name={player} gameId={gameId()} onJoin={noop} />
          </div>
        ))}
      </div>
    </div>
  )
}

const BoardPrompt: Component<{
  state: GameState | undefined
  action: (action: BoardAction) => void
}> = props => {
  const players = () => {
    return props.state?.players ?? []
  }

  const board = () => {
    const state = props.state?.state
    return state?.type === 'board' ? state : undefined
  }

  const playerName = (idx: number | null) => (idx == null ? '--' : players()[idx].name)

  return (
    <div style={{ height: '300px' }}>
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
          {state => (
            <>
              <h2>Election</h2>
              <p>President: {playerName(state.president)}</p>
              <p>Chancellor: {state.chancellor == null ? '-- none --' : playerName(state.chancellor)}</p>
              {state.outcome != null && <p>Outcome: {state.outcome ? 'JA!' : 'NEIN!'}</p>}
              {state.outcome != null && (
                <button onClick={() => props.action({ type: 'EndVoting' })}>NEXT</button>
              )}
            </>
          )}
        </Match>
        <Match when={isLegislativeSession(board())} keyed>
          {state => (
            <>
              <h2>Legislative Session</h2>
              <p>President: {playerName(state.president)}</p>
              <p>Chancellor: {playerName(state.chancellor)}</p>
              <p>
                <strong>{state.phase}</strong>
              </p>
              {state.phase === 'VetoApproved' && (
                <button onClick={() => props.action({ type: 'EndLegislativeSession' })}>NEXT</button>
              )}
            </>
          )}
        </Match>
        <Match when={isCardReveal(board())} keyed>
          {state => (
            <>
              <h2>Card Reveal</h2>
              <p>
                Outcome: {state.result}
                {state.chaos ? ' (chaos)' : ''}
              </p>
              {state.can_end && <button onClick={() => props.action({ type: 'EndCardReveal' })}>NEXT</button>}
            </>
          )}
        </Match>
        <Match when={isCommunistSession(board())} keyed>
          {state => (
            <>
              <h2>{state.action}</h2>
              {state.phase === 'Entering' && (
                <button onClick={() => props.action({ type: 'EndCommunistStart' })}>NEXT</button>
              )}
              {state.phase === 'Leaving' && (
                <button onClick={() => props.action({ type: 'EndCommunistEnd' })}>NEXT</button>
              )}
            </>
          )}
        </Match>
        <Match when={isExecution(board())} keyed>
          {state => (
            <>
              <h2>Execution</h2>
              <p>Player: {playerName(state.chosen_player)}</p>
              {state.chosen_player == null || (
                <button onClick={() => props.action({ type: 'EndExecutiveAction' })}>NEXT</button>
              )}
            </>
          )}
        </Match>
        <Match when={isInvestigatePlayerBoard(board())} keyed>
          {state => (
            <>
              <h2>Investigate player</h2>
              <p>Player: {playerName(state.chosen_player)}</p>
            </>
          )}
        </Match>
        <Match when={isSpecialElection(board())} keyed>
          {state => (
            <>
              <h2>Special Election</h2>
              <p>Player: {playerName(state.chosen_player)}</p>
              {state.hijacked_by && <p>Hijacked by the Monarchist: {playerName(state.hijacked_by)}</p>}
              {(state.can_hijack || state.hijacked_by) && (
                <button onClick={() => props.action({ type: 'StartSpecialElection' })}>NEXT</button>
              )}
              {state.chosen_player == null || (
                <button onClick={() => props.action({ type: 'EndExecutiveAction' })}>NEXT</button>
              )}
            </>
          )}
        </Match>
        <Match when={isMonarchistElection(board())} keyed>
          {state => (
            <>
              <h2>Monarchist Election</h2>
              <p>Monarchist: {playerName(state.monarchist)}</p>
              <p>President: {playerName(state.president)}</p>
              <p>Chancellor 1: {playerName(state.monarchist_chancellor)}</p>
              <p>Chancellor 2: {playerName(state.president_chancellor)}</p>
              {state.outcome == null || (
                <>
                  <p>
                    Outcome:{' '}
                    {playerName(state.outcome ? state.monarchist_chancellor : state.president_chancellor)}
                  </p>
                  <button onClick={() => props.action({ type: 'EndVoting' })}>NEXT</button>
                </>
              )}
            </>
          )}
        </Match>
        <Match when={isAssassination(board())} keyed>
          {state => (
            <>
              <h2>Assassination</h2>
              <p>Anarchist: {playerName(state.anarchist)}</p>
              <p>Player: {playerName(state.chosen_player)}</p>
              {state.chosen_player == null || (
                <button onClick={() => props.action({ type: 'EndAssassination' })}>NEXT</button>
              )}
            </>
          )}
        </Match>
        <Match when={board()?.prompt?.type === 'PolicyPeak'}>
          <h2>Policy Peak</h2>
        </Match>
        <Match when={board()?.prompt?.type === 'FiveYearPlan'}>
          <h2>Five Year Plan</h2>
          <button onClick={() => props.action({ type: 'EndExecutiveAction' })}>NEXT</button>
        </Match>
        <Match when={isGameOver(board())} keyed>
          {state => (
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
    </div>
  )
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

function isInvestigatePlayerBoard(state?: BoardState) {
  return state?.prompt?.type === 'InvestigatePlayer' ? state.prompt : undefined
}

function isSpecialElection(state?: BoardState) {
  return state?.prompt?.type === 'SpecialElection' ? state.prompt : undefined
}

function isAssassination(state?: BoardState) {
  return state?.prompt?.type === 'Assassination' ? state.prompt : undefined
}

function isMonarchistElection(state?: BoardState) {
  return state?.prompt?.type === 'MonarchistElection' ? state.prompt : undefined
}

function isGameOver(state?: BoardState) {
  return state?.prompt?.type === 'GameOver' ? state.prompt : undefined
}

export default ConsolePage
