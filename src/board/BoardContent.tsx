import { Presence, Motion } from '@motionone/solid'
import { Component, JSX, Match, Show, Switch } from 'solid-js'
import { GameState } from '../dm/state'
import { Lobby } from './Lobby'
import s from './BoardContent.module.css'
import { BoardPrompt } from '../dm/board-prompt'
import { PolicyTracker } from './PolicyTracker'

export const BoardContent: Component<{ state: GameState }> = props => {
  const numPlayers = () => props.state.players.length
  const liberals = () => (props.state.state.type === 'board' ? props.state.state.liberal_cards : 0)
  const fascists = () => (props.state.state.type === 'board' ? props.state.state.fascist_cards : 0)

  return (
    <div class={s.Content}>
      <div class={s.Board}>
        <PolicyTracker party="Liberal" numPlayers={numPlayers()} count={liberals()} />
        <PolicyTracker party="Fascist" numPlayers={numPlayers()} count={fascists()} />
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
