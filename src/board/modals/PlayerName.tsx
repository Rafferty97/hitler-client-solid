import { Component } from 'solid-js'
import { Motion } from '@motionone/solid'
import { spring } from 'motion'
import { useSound } from '../../util/hooks'
import { sound } from '../../util/sound'
import s from './modals.module.css'
import clickUrl from '../../assets/sound/click.mp3'

const click = sound(clickUrl)

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
        transform: props.name == null ? 'translate(0, 70%)' : 'translate(0, 0%)',
        opacity: props.name == null ? 0 : 1,
      }}
      transition={{ easing: spring() }}
      class={`${s.PlayerName} ${props.class}`}
    >
      {props.name ?? '-'}
    </Motion.div>
  )
}
