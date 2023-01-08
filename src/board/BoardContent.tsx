import { Presence } from '@motionone/solid'
import { Component, createEffect, createMemo, createSignal, JSX, Match, Show, Switch } from 'solid-js'
import { GameState } from '../dm/state'
import { Lobby } from './modals/Lobby'
import { BoardPrompt } from '../dm/board-prompt'
import { CardReveal, PolicyCard, PolicyTracker } from './PolicyTracker'
import { range } from '../util/range'
import { Party } from '../dm/role'
import { NightRound } from './modals/NightRound'
import { Election } from './modals/Election'
import { BoardAction } from '../dm/action'
import { LegislativeSession } from './modals/LegislativeSession'
import { useDynamicSound } from '../util/hooks'
import { sound } from '../util/sound'
import { ExecutiveAction } from './modals/ExecutiveAction'
import s from './BoardContent.module.css'
import bkmusicUrl from '../assets/sound/moonlight.mp3'
import tensionUrl from '../assets/sound/tension.mp3'
import investigateUrl from '../assets/sound/investigate player.mp3'
import policyPeekUrl from '../assets/sound/policy peek.mp3'
import specialElectionUrl from '../assets/sound/special election.mp3'
import executionUrl from '../assets/sound/execute player.mp3'
import gunshotUrl from '../assets/sound/player death.mp3'

const bkmusic = sound(bkmusicUrl, 0.8, true)
const tension = sound(tensionUrl, 0.4, true)
const investigate = sound(investigateUrl)
const policyPeek = sound(policyPeekUrl)
const specialElection = sound(specialElectionUrl)
const execution = sound(executionUrl)
const gunshot = sound(gunshotUrl)

interface Props {
  state: GameState
  action: (action: BoardAction) => void
}

export const BoardContent: Component<Props> = props => {
  let container: HTMLDivElement | undefined

  const numPlayers = () => props.state.players.length
  const parties = createMemo<Party[]>(() => {
    if (props.state.state.type === 'board' && props.state.state.communist_cards != null) {
      return ['Liberal', 'Fascist', 'Communist']
    } else {
      return ['Liberal', 'Fascist']
    }
  })

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
    const numCards = trackLength(party, numPlayers())
    const x = index - numCards / 2 + 0.5
    const numTrackers = parties().length
    const y = parties().indexOf(party) - numTrackers / 2 + 0.5
    return { party, x, y }
  }

  const cardReveal = () => {
    if (props.state.state.type !== 'board') return undefined
    if (props.state.state.prompt?.type !== 'CardReveal') return undefined
    const party = props.state.state.prompt.result
    if (party == null) return undefined
    return xy(party, numPolicies(party))
  }

  const [rect, setRect] = createSignal({ width: 1000, height: 500 })
  const observer = new ResizeObserver(entries => setRect(entries[0].contentRect))
  createEffect(() => observer.observe(container!))

  const scale = createMemo(() => {
    const w = 0.005 * (rect().width - 80)
    const h = (0.022 * (rect().height - 120)) / parties().length
    return Math.min(w, h, 8)
  })

  const fadeBoard = () =>
    isPrompt(props.state, [
      'Night',
      'Election',
      'LegislativeSession',
      'PolicyPeak',
      'InvestigatePlayer',
      'SpecialElection',
      'Execution',
    ])

  useDynamicSound(() => {
    if (isPrompt(props.state, 'LegislativeSession')) {
      return tension
    }
    return bkmusic
  })

  return (
    <div class={s.Content} ref={container}>
      <Show when={props.state.state.type === 'board'}>
        <div class={`${s.Board} ${fadeBoard() ? s.fade : ''}`}>
          {parties().map(party => (
            <PolicyTracker party={party} numPlayers={numPlayers()} scale={scale()} />
          ))}
          {parties().map(party =>
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
      </Show>

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

          <Match when={isPrompt(props.state, 'PolicyPeak')}>
            <ExecutiveAction
              title="Policy Peak"
              subtitle="The president must now inspect the top three policy cards"
              introSound={policyPeek}
            />
          </Match>

          <Match when={isPrompt(props.state, 'InvestigatePlayer')}>
            <ExecutiveAction
              title="Investigate Player"
              subtitle="The president must now inspect the loyalty of one player"
              introSound={investigate}
              player={getChosenPlayer(props.state)}
            />
          </Match>

          <Match when={isPrompt(props.state, 'SpecialElection')}>
            <ExecutiveAction
              title="Special Election"
              subtitle="The president must now nomimate their successor"
              introSound={specialElection}
              player={getChosenPlayer(props.state)}
              onDone={() => props.action({ type: 'EndExecutiveAction' })}
            />
          </Match>

          <Match when={isPrompt(props.state, 'Execution')}>
            <ExecutiveAction
              title="Execution"
              subtitle="The president must now execute a player"
              introSound={execution}
              actionSound={gunshot}
              player={getChosenPlayer(props.state)}
              timeout={5500}
              onDone={() => props.action({ type: 'EndExecutiveAction' })}
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

function getChosenPlayer(state: GameState) {
  if (state.state.type !== 'board') return undefined
  let player
  if (state.state.prompt?.type === 'InvestigatePlayer') {
    player = state.state.prompt.chosen_player
  }
  if (state.state.prompt?.type === 'SpecialElection') {
    player = state.state.prompt.chosen_player
  }
  if (state.state.prompt?.type === 'Execution') {
    player = state.state.prompt.chosen_player
  }
  return player != null ? state.players[player].name : undefined
}

function trackLength(party: Party, numPlayers: number): number {
  return party === 'Fascist' || (party === 'Communist' && numPlayers > 7) ? 6 : 5
}
