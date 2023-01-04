import { Component, Match, Show, Switch } from 'solid-js'
import { GameState } from '../dm/state'
import s from './BoardContent.module.css'

export const BoardContent: Component<{ state: GameState }> = props => {
  return (
    <div class={s.Content}>
      <Switch>
        {/* FIXME: Better styling */}
        <Match when={props.state.state.type === 'lobby'}>LOBBY</Match>
        <Match when={props.state.state.type === 'connecting'}>Connecting to game...</Match>
        <Match when={props.state.state.type === 'board' ? props.state.state : undefined} keyed>
          {state => (
            <>
              <p>Liberal: {state.liberal_cards}</p>
              <p>Fascist: {state.fascist_cards}</p>
              <p>Communist: {state.communist_cards ?? '--'}</p>
            </>
          )}
        </Match>
      </Switch>
    </div>
  )
}

function isBoard(state: GameState | undefined) {
  return state?.state.type === 'board' ? state.state : undefined
}
