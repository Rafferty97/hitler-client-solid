import { A } from '@solidjs/router'
import { Component, Show } from 'solid-js'
import s from './LiveHeader.module.css'

interface Props {
  connected: boolean
  name?: string
  onExit?: () => void
}

export const LiveHeader: Component<Props> = props => {
  return (
    <div class={s.LiveHeader}>
      <div class={`${s.dot} ${props.connected ? s.connected : s.disconnected}`} />
      <span>{props.connected ? 'Connected' : 'Disconnected'}</span>
      <div class="spacer" />
      <Show when={props.name != null}>
        <span class={s.Name}>{props.name}</span>
      </Show>
      <A class={s.Exit} href="/">
        Home
      </A>
    </div>
  )
}
