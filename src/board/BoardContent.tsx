import { Presence, Motion } from '@motionone/solid'
import { Component, createEffect, createSignal, JSX, Match, Show, Switch } from 'solid-js'
import { GameState } from '../dm/state'
import { Lobby } from './Lobby'
import { BoardPrompt } from '../dm/board-prompt'
import { CardReveal, PolicyCard, PolicyTracker } from './PolicyTracker'
import { range } from '../util/range'
import s from './BoardContent.module.css'
import { Party } from '../dm/role'

export const BoardContent: Component<{ state: GameState }> = props => {
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

  return (
    <div class={s.Content} ref={container}>
      <div class={s.Board}>
        <PolicyTracker party="Liberal" numPlayers={numPlayers()} scale={scale()} />
        <PolicyTracker party="Fascist" numPlayers={numPlayers()} scale={scale()} />
        {parties.map(party =>
          range(0, numPolicies(party)).map(i => <PolicyCard {...xy(party, i)} scale={scale()} />)
        )}
        <Show when={cardReveal()}>
          <CardReveal {...cardReveal()!} scale={scale()} />
        </Show>
      </div>

      <Presence>
        <Switch>
          <Match when={props.state.state.type === 'lobby'}>
            <Scene>
              <Lobby gameId={props.state.game_id} />
            </Scene>
          </Match>

          <Match when={isPrompt(props.state, 'Night')}>
            <Scene>
              <h1>Night round</h1>
              <p>You have now been given your secret role</p>
            </Scene>
          </Match>
        </Switch>
      </Presence>

      <Show when={props.state.state.type === 'connecting'}>
        <div class={s.Connecting}>Connecting to game...</div>
      </Show>
    </div>
  )
}

const Scene: Component<{ children: JSX.Element }> = props => (
  <Motion.div
    class={s.Scene}
    initial={{ transform: 'translate(0, 100%)' }}
    animate={{ transform: 'translate(0, 0%)' }}
    exit={{ transform: 'translate(0, -100%)' }}
    transition={{ duration: 1 }}
  >
    {props.children}
  </Motion.div>
)

function isPrompt(state: GameState, prompt: BoardPrompt['type'] | BoardPrompt['type'][]) {
  if (state.state.type !== 'board') return false
  const prompts = Array.isArray(prompt) ? prompt : [prompt]
  return state.state.prompt && prompts.indexOf(state.state.prompt.type) !== -1
}
