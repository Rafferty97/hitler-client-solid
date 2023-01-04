import { Motion } from '@motionone/solid'
import { Component, Index, Show } from 'solid-js'
import { BoardState, GameState } from '../dm/state'
import s from './PlayerRail.module.css'

interface Props {
  state: GameState
}

export const PlayerRail: Component<Props> = props => {
  const state = () => (props.state.state.type === 'board' ? props.state.state : undefined)

  return (
    <div class={s.PlayerRail}>
      <Index each={props.state.players}>{player => <div class={s.Player}>{player().name}</div>}</Index>
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
