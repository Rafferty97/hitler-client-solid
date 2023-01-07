import { Presence } from '@motionone/solid'
import { Component, createEffect, createSignal, JSX, Match, Show, Switch } from 'solid-js'
import { BoardState, GameState } from '../dm/state'
import { Lobby } from './modals/Lobby'
import { BoardPrompt } from '../dm/board-prompt'
import { CardReveal, PolicyCard, PolicyTracker } from './PolicyTracker'
import { range } from '../util/range'
import { Party } from '../dm/role'
import { NightRound } from './modals/NightRound'
import { Election } from './modals/Election'
import s from './BoardContent.module.css'
import { BoardAction } from '../dm/action'
import { LegislativeSession } from './modals/LegislativeSession'

interface Props {
  state: GameState
  action: (action: BoardAction) => void
}

export const BoardContent: Component<Props> = props => {
  let container: HTMLDivElement | undefined

  const numPlayers = () => props.state.players.length
  const parties: Party[] = ['Liberal', 'Fascist']

  const numPolicies = (party: Party) => {
    if (props.state.state.type !== 'board') return 0
    switch (party) {
      case 'Liberal':
        return props.state.state.liberal_cards
      case 'Fascist':
        return props.state.state.fascist_cards
      case 'Communist':
        return props.state.state.communist_cards ?? 0
    }
  }

  const xy = (party: Party, index: number) => {
    const numCards = party === 'Liberal' ? 5 : 6
    const x = index - numCards / 2 + 0.5
    const y = party === 'Liberal' ? -0.5 : 0.5
    return { party, x, y }
  }

  const cardReveal = () => {
    if (props.state.state.type !== 'board') return undefined
    if (props.state.state.prompt?.type !== 'CardReveal') return undefined
    const party = props.state.state.prompt.result
    if (party == null) return undefined
    return xy(party, numPolicies(party))
  }

  const [scale, setScale] = createSignal(1)
  const observer = new ResizeObserver(entries => {
    const w = 0.005 * (entries[0].contentRect.width - 80)
    const h = 0.012 * (entries[0].contentRect.height - 120)
    setScale(Math.min(w, h, 8))
  })
  createEffect(() => observer.observe(container!))

  const fadeBoard = () => isPrompt(props.state, ['Election', 'LegislativeSession'])

  return (
    <div class={s.Content} ref={container}>
      <div class={`${s.Board} ${fadeBoard() ? s.fade : ''}`}>
        <PolicyTracker party="Liberal" numPlayers={numPlayers()} scale={scale()} />
        <PolicyTracker party="Fascist" numPlayers={numPlayers()} scale={scale()} />
        {parties.map(party =>
          range(0, numPolicies(party)).map(i => <PolicyCard {...xy(party, i)} scale={scale()} />)
        )}
        <Show when={cardReveal()}>
          <CardReveal
            {...cardReveal()!}
            scale={scale()}
            onDone={() => props.action({ type: 'EndCardReveal' })}
          />
        </Show>
      </div>

      <Presence initial={false}>
        <Switch>
          <Match when={props.state.state.type === 'lobby'}>
            <Lobby gameId={props.state.game_id} />
          </Match>

          <Match when={isPrompt(props.state, 'Night')}>
            <NightRound />
          </Match>

          <Match when={getElection(props.state)?.president} keyed>
            <Election {...getElection(props.state)!} onDone={() => props.action({ type: 'EndVoting' })} />
          </Match>

          <Match when={isPrompt(props.state, 'LegislativeSession')}>
            <LegislativeSession
              {...getLegislativeSession(props.state)!}
              onDone={() => props.action({ type: 'EndLegislativeSession' })}
            />
          </Match>
        </Switch>
      </Presence>

      <Show when={props.state.state.type === 'connecting'}>
        <div class={s.Connecting}>Connecting to game...</div>
      </Show>
    </div>
  )
}

function isPrompt(state: GameState, prompt: BoardPrompt['type'] | BoardPrompt['type'][]) {
  if (state.state.type !== 'board') return false
  const prompts = Array.isArray(prompt) ? prompt : [prompt]
  return state.state.prompt && prompts.indexOf(state.state.prompt.type) !== -1
}

function getElection(state: GameState) {
  if (state.state.type !== 'board') return undefined
  if (state.state.prompt?.type !== 'Election') return undefined
  const prompt = state.state.prompt
  return {
    president: state.players[prompt.president].name,
    chancellor: prompt.chancellor != null ? state.players[prompt.chancellor].name : undefined,
    outcome: prompt.outcome ?? undefined,
  }
}

function getLegislativeSession(state: GameState) {
  if (state.state.type !== 'board') return undefined
  if (state.state.prompt?.type !== 'LegislativeSession') return undefined
  const prompt = state.state.prompt
  return {
    president: state.players[prompt.president].name,
    chancellor: state.players[prompt.chancellor].name,
    phase: prompt.phase,
  }
}
