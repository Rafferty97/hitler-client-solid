import { Component, createEffect, onCleanup } from 'solid-js'
import { Scene } from './Scene'
import { PlayerName } from './PlayerName'
import { useDelay, useSound } from '../../util/hooks'
import s from './modals.module.css'
import { BoardState, GameState } from '../../dm/state'
import { useTimeout } from '../../util/timeout'

interface Props {
  state: GameState
  onEntered: () => void
  onExited: () => void
}

export const CommunistSession: Component<Props> = props => {
  createEffect(() => {
    const state = props.state
    if (state.state.type !== 'board') return
    const prompt = state.state.prompt
    if (prompt?.type !== 'CommunistSession') return
    if (prompt.phase === 'Entering') {
      useTimeout(props.onEntered, 1000)
    }
    if (prompt.phase === 'Leaving') {
      useTimeout(props.onExited, 1000)
    }
  })

  return (
    <Scene>
      <pre style={{ background: 'black', padding: '40px' }}>
        {JSON.stringify((props.state.state as BoardState).prompt)}
      </pre>
    </Scene>
  )
}
