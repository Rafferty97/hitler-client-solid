import { Component, createEffect, onCleanup, Show } from 'solid-js'
import { Scene } from './Scene'
import { PlayerName } from './PlayerName'
import { useDelay, useSound } from '../../util/hooks'
import s from './modals.module.css'

interface Props {
  title: string
  subtitle: string
  player?: string
  noPlayer?: boolean
  introSound?: HTMLAudioElement
  actionSound?: HTMLAudioElement
  timeout?: number
  onDone?: () => void
}

export const ExecutiveAction: Component<Props> = props => {
  createEffect(() => {
    if (!props.onDone) return
    if (props.player == null && props.noPlayer !== true) return
    const int = setInterval(props.onDone, props.timeout ?? 3000)
    onCleanup(() => clearInterval(int))
  })

  if (props.introSound) {
    const playSound = useDelay(() => props.player == null || !props.actionSound, 1000)
    useSound(props.introSound, playSound)
  }

  if (props.actionSound) {
    const playSound = useDelay(() => props.player != null, 750)
    useSound(props.actionSound, playSound)
  }

  return (
    <Scene>
      <h1 class={s.Title}>{props.title}</h1>
      <p class={s.Subtitle}>{props.subtitle}</p>
      <Show when={props.noPlayer !== true}>
        <PlayerName click name={props.player} />
      </Show>
    </Scene>
  )
}
