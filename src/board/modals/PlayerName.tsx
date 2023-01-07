import { Component } from 'solid-js'
import { Motion } from '@motionone/solid'
import { useSound } from '../../util/hooks'
import s from './modals.module.css'
import click from '../../assets/sound/click.mp3'

interface Props {
  name?: string
  class?: string
  click?: boolean
}

export const PlayerName: Component<Props> = props => {
  useSound(click, () => props.click === true && props.name != null)

  return (
    <Motion.div
      animate={{
        transform: props.name == null ? 'translate(0, 70%)' : 'translate(0, 0)',
        opacity: props.name == null ? 0 : 1,
      }}
      transition={{ duration: 0.25 }}
      class={`${s.PlayerName} ${props.class}`}
    >
      {props.name ?? '-'}
    </Motion.div>
  )
}
