import { Motion } from '@motionone/solid'
import { Component, Index, Show } from 'solid-js'
import { BoardState, GameState } from '../dm/state'
import { filterSignal, usePersist } from '../util/hooks'
import s from './PlayerRail.module.css'

interface Props {
  state: GameState
}

export const PlayerRail: Component<Props> = props => {
  const state = () => (props.state.state.type === 'board' ? props.state.state : undefined)

  const votes = () => getVotes(props.state)
  const cachedVotes = filterSignal(votes, v => v != null)
  const showVotes = usePersist(() => !!votes(), 4000)

  const gov = () => getGovernment(props.state)

  return (
    <div class={s.PlayerRail}>
      <Index each={props.state.players}>
        {(player, index) => {
          const vote = () => cachedVotes()?.[index] ?? null
          return (
            <div class={`${s.Player} ${player().alive ? '' : s.dead}`}>
              {player().name}
              {index === gov()?.president ? ' (P)' : ''}
              {index === gov()?.chancellor ? ' (C)' : ''}
              <Show when={player().not_hitler}>
                <div class={s.NotHitler}>Not hitler!</div>
              </Show>
              <div class={voteClass(vote(), showVotes())}>{vote() ? 'JA!' : 'NEIN!'}</div>
            </div>
          )
        }}
      </Index>
      <div class={s.Spacer} />
      <Show when={state()}>
        <h2>Cards in deck</h2>
        {/* FIXME: Animate card count */}
        <p class={s.Deck}>{state()!.draw_pile}</p>
        <h2>Election tracker</h2>
        <div class={s.ElectionTracker}>
          <div class={s.Line} />
          {[0, 1, 2, 3].map(() => (
            <div class={s.Dot} />
          ))}
          <Motion.div
            class={s.Token}
            initial={false}
            animate={{ left: `${25 * (electionTracker(state()!) + 0.5)}%` }}
          />
        </div>
      </Show>
    </div>
  )
}

function electionTracker(state: BoardState) {
  let tracker = state.election_tracker

  const prompt = state.prompt
  if (prompt?.type === 'Election' && prompt.outcome === false) {
    // && showResult
    tracker++
  }
  if (prompt?.type === 'LegislativeSession' && prompt.phase === 'VetoApproved') {
    tracker++
  }

  return tracker
}

function getVotes(state: GameState) {
  if (state.state.type !== 'board') return undefined
  if (state.state.prompt?.type !== 'Election') return undefined
  if (state.state.prompt.outcome == null) return undefined
  return state.state.prompt.votes
}

function voteClass(vote: boolean | null, showVotes: boolean) {
  return [s.Vote, showVotes && vote != null ? '' : s.hidden, vote ? s.ja : s.nein].join(' ')
}

function getGovernment(state: GameState) {
  if (state.state.type !== 'board') return null
  return state.state.last_government
}
