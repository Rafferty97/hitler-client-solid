import { Component, createEffect, Show } from 'solid-js'
import { Scene } from './Scene'
import { PlayerName } from './PlayerName'
import { useDelay, useSound } from '../../util/hooks'
import { useTimeout } from '../../util/timeout'
import { Party } from '../../dm/role'
import s from './modals.module.css'

interface Props {
  player?: string
  party?: Party
  onDone: () => void
}

export const Confession: Component<Props> = props => {
  createEffect(() => {
    if (props.player != null) {
      useTimeout(props.onDone, 3500)
    }
  })

  return (
    <Scene>
      <h1 class={s.Title}>Confession</h1>
      <Show when={props.player != null && props.party != null}>
        <h1>
          {props.player} is a {props.party}
        </h1>
      </Show>
    </Scene>
  )
}
