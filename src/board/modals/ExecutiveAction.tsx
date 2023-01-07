import { Component, createEffect, onCleanup } from 'solid-js'
import { Scene } from './Scene'
import { PlayerName } from './PlayerName'
import { useDelay, useSound } from '../../util/hooks'
import s from './modals.module.css'

interface Props {
  title: string
  subtitle: string
  player?: string
  sound?: HTMLAudioElement
  timeout?: number
  onDone?: () => void
}

export const ExecutiveAction: Component<Props> = props => {
  createEffect(() => {
    if (props.player == null || !props.onDone) return
    const int = setInterval(props.onDone, props.timeout ?? 3000)
    onCleanup(() => clearInterval(int))
  })

  if (props.sound) {
    const playSound = useDelay(() => props.player != null, 750)
    useSound(props.sound, playSound)
  }

  return (
    <Scene>
      <h1 class={s.Title}>{props.title}</h1>
      <p class={s.Subtitle}>{props.subtitle}</p>
      <PlayerName click name={props.player} />
    </Scene>
  )
}
