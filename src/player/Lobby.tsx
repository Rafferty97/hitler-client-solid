import { Component } from 'solid-js'
import { Button } from './Button'
import s from './PlayerApp.module.css'

interface Props {
  gameId: string
  name: string
  numPlayers: number
  canStart: boolean
  start: () => void
}

export const Lobby: Component<Props> = props => {
  return (
    <>
      <p class={s.Message}>
        {props.numPlayers}{' '}
        {props.numPlayers === 1 ? 'player has joined' : 'players have joined'}
      </p>
      {props.canStart && <Button label="Start" onClick={props.start} />}
    </>
  )
}
