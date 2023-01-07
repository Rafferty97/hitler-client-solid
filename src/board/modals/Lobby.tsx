import { Component } from 'solid-js'
import { Scene } from './Scene'
import s from './modals.module.css'

export const Lobby: Component<{ gameId: string }> = props => {
  return (
    <Scene>
      <p>
        Go to <strong>secrethitler.live</strong> and enter room code
      </p>
      <p>{props.gameId}</p>
      <p>or scan the QR code</p>
    </Scene>
  )
}
