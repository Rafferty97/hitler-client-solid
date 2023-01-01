import { Component } from 'solid-js'
import s from './Button.module.css'

interface Props {
  label: string
  onClick: () => void
  white?: boolean
  yellow?: boolean
  red?: boolean
  black?: boolean
  small?: boolean
  large?: boolean
  noPadding?: boolean
}

export const Button: Component<Props> = props => {
  const color = () => {
    if (props.white) return s.white
    if (props.yellow) return s.yellow
    if (props.red) return s.red
    if (props.black) return s.black
    return s.white
  }

  const size = () => {
    if (props.small) return s.small
    if (props.large) return s.large
    return ''
  }

  const padding = () => (!props.noPadding ? s.padding : '')

  return (
    <button
      class={`${s.Button} ${color()} ${size()} ${padding()}`}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  )
}
