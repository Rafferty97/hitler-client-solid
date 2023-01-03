import { Component } from 'solid-js'
import s from './Button.module.css'

interface Props {
  label: string
  onClick?: () => void
  white?: boolean
  yellow?: boolean
  red?: boolean
  black?: boolean
  small?: boolean
  large?: boolean
  noPadding?: boolean
  submit?: boolean
  disabled?: boolean
}

export const Button: Component<Props> = props => {
  const color = () => {
    if (props.disabled) return s.disabled
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
  const className = () => `${s.Button} ${color()} ${size()} ${padding()}`

  return props.submit ? (
    <input type="submit" class={className()} value={props.label} />
  ) : (
    <button class={className()} onClick={props.onClick}>
      {props.label}
    </button>
  )
}
