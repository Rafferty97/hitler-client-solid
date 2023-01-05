import { Component } from 'solid-js'
import s from './Lobby.module.css'

export const Lobby: Component<{ gameId: string }> = props => {
  return (
    <div class={s.Lobby}>
      <p>
        Go to <strong>secrethitler.live</strong> and enter room code
      </p>
      <p>{props.gameId}</p>
      <p>or scan the QR code</p>
    </div>
  )
}
