import { Motion } from '@motionone/solid'
import { Component, createEffect, createSignal, onCleanup } from 'solid-js'
import { Party } from '../dm/role'
import { useSound } from '../util/hooks'
import { sound } from '../util/sound'
import s from './PolicyTracker.module.css'
import drumrollUrl from '../assets/sound/drum roll final.mp3'
import liberalRevealUrl from '../assets/sound/liberal card.mp3'
import fascistRevealUrl from '../assets/sound/fascist card.mp3'

const drumroll = sound(drumrollUrl, 0.85)
const liberalReveal = sound(liberalRevealUrl, 0.85)
const fascistReveal = sound(fascistRevealUrl, 0.45)

interface PolicyTrackerProps {
  party: Party
  numPlayers: number
  scale: number
}

export const PolicyTracker: Component<PolicyTrackerProps> = props => {
  const tiles = () => getTiles(props.party, props.numPlayers)

  const style = () => ({
    width: props.scale * 27 + 'px',
    height: props.scale * 37 + 'px',
  })

  return (
    <div class={`${s.PolicyTracker} ${s[props.party]}`} style={{ margin: 3 * props.scale + 'px 0' }}>
      {tiles().map(tile => (
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

export const CardReveal: Component<PolicyCardProps & { onDone: () => void }> = props => {
  const [step, setStep] = createSignal(0)

  createEffect(() => {
    setTimeout(() => setStep(1), 300)
    setTimeout(() => setStep(2), 2700)
    setTimeout(() => setStep(3), 4300)
  })

  createEffect(() => {
    if (step() < 3) return
    const int = setInterval(props.onDone, 2000)
    onCleanup(() => clearInterval(int))
  })

  useSound(drumroll, () => step() === 1)
  useSound(liberalReveal, () => step() === 2 && props.party === 'Liberal')
  useSound(fascistReveal, () => step() === 2 && props.party === 'Fascist')
  useSound(fascistReveal, () => step() === 2 && props.party === 'Communist')

  const transform = () => {
    const x = (props.scale * 27 + 2) * props.x
    const y = (props.scale * 43 + 40) * props.y
    return [
      `scale(${0.32 * props.scale}) translate(0, 80vh) rotateY(180deg)`,
      `scale(${0.32 * props.scale}) rotateY(180deg)`,
      `scale(${0.32 * props.scale})`,
      `translate(${x}px, ${y}px) scale(${0.16 * props.scale})`,
    ][step()]
  }

  const duration = () => [0, 0.8, 0.35, 0.6][step()]

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
  | 'bugging'
  | 'radicalisation'
  | 'fiveyearplan'
  | 'congress'
  | 'confession'
  | 'communist-win'

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
  if (party === 'Communist') {
    if (numPlayers < 8) {
      return ['bugging', 'radicalisation', 'fiveyearplan', 'congress', 'communist-win']
    } else {
      return ['bugging', 'radicalisation', 'fiveyearplan', 'congress', 'confession', 'communist-win']
    }
  }
  return []
}
