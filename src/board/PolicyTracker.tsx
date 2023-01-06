import { Motion } from '@motionone/solid'
import { Component, createEffect, createSignal } from 'solid-js'
import { Party } from '../dm/role'
import s from './PolicyTracker.module.css'

interface PolicyTrackerProps {
  party: Party
  numPlayers: number
  scale: number
}

export const PolicyTracker: Component<PolicyTrackerProps> = props => {
  const tiles: Tile[] = getTiles(props.party, props.numPlayers)

  const style = () => ({
    width: props.scale * 27 + 'px',
    height: props.scale * 37 + 'px',
  })

  return (
    <div class={s.PolicyTracker} style={{ margin: 3 * props.scale + 'px 0' }}>
      {tiles.map(tile => (
        <div class={`${s.Tile} ${s[tile]}`} style={style()} />
      ))}
    </div>
  )
}

interface PolicyCardProps {
  party: Party
  scale: number
  x: number
  y: number
}

export const PolicyCard: Component<PolicyCardProps> = props => {
  const style = () => {
    const x = (props.scale * 27 + 2) * props.x
    const y = (props.scale * 43 + 40) * props.y
    return { transform: `translate(${x}px, ${y}px) scale(${0.16 * props.scale})` }
  }
  return (
    <div class={s.PolicyCard} style={style()}>
      <div class={`${s.Front} ${s[props.party]}`} />
    </div>
  )
}

export const CardReveal: Component<PolicyCardProps> = props => {
  const [step, setStep] = createSignal(0)

  createEffect(() => {
    setTimeout(() => setStep(1), 100)
    setTimeout(() => setStep(2), 2250)
    setTimeout(() => setStep(3), 3500)
  })

  const transform = () => {
    const x = (props.scale * 27 + 2) * props.x
    const y = (props.scale * 43 + 40) * props.y
    return [
      `scale(${0.32 * props.scale}) translate(0, ${80 * props.scale}px) rotateY(180deg)`,
      `scale(${0.32 * props.scale}) rotateY(180deg)`,
      `scale(${0.32 * props.scale})`,
      `translate(${x}px, ${y}px) scale(${0.16 * props.scale})`,
    ][step()]
  }

  const duration = () => [0, 0.8, 0.4, 0.6][step()]

  return (
    <Motion.div
      class={s.PolicyCard}
      initial={false}
      animate={{ transform: transform() }}
      transition={{ duration: duration(), easing: 'ease-in-out' }}
    >
      <div class={`${s.Front} ${s[props.party]}`} />
      <div class={s.Back} />
    </Motion.div>
  )
}

export type Tile =
  | 'empty'
  | 'liberal-win'
  | 'policy-peak'
  | 'kill'
  | 'kill-veto'
  | 'election'
  | 'investigate'
  | 'fascist-win'

function getTiles(party: Party, numPlayers: number): Tile[] {
  if (party === 'Liberal') {
    return ['empty', 'empty', 'empty', 'empty', 'liberal-win']
  }
  if (party === 'Fascist') {
    if (numPlayers < 7) {
      return ['empty', 'empty', 'policy-peak', 'kill', 'kill-veto', 'fascist-win']
    }
    if (numPlayers < 9) {
      return ['empty', 'investigate', 'election', 'kill', 'kill-veto', 'fascist-win']
    }
    return ['investigate', 'investigate', 'election', 'kill', 'kill-veto', 'fascist-win']
  }
  return []
}
