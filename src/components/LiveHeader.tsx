import { Component } from 'solid-js'
import s from './LiveHeader.module.css'

interface Props {
  connected: boolean
  name: string
}

export const LiveHeader: Component<Props> = props => {
  return (
    <div class={s.LiveHeader}>
      <div
        class={`${s.dot} ${props.connected ? s.connected : s.disconnected}`}
      />
      <span>{props.connected ? 'Connected' : 'Disconnected'}</span>
      <div class="spacer" />
      <span>{props.name}</span>
    </div>
  )
}
