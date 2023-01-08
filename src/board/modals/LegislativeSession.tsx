import { Component, createEffect, For, onCleanup, Show } from 'solid-js'
import { Scene } from './Scene'
import { useSound } from '../../util/hooks'
import { PlayerName } from './PlayerName'
import { Motion, Presence } from '@motionone/solid'
import { LegislativeSessionPhase } from '../../dm/board-prompt'
import { AnimatedSubtitle } from './AnimatedSubtitle'
import { sound } from '../../util/sound'
import s from './modals.module.css'
import president from '../../assets/president.png'
import chancellor from '../../assets/chancellor.png'
import remainSilentUrl from '../../assets/sound/remain silent.mp3'
import vetoRequestUrl from '../../assets/sound/veto call.mp3'
import vetoApprovedUrl from '../../assets/sound/veto pass.mp3'
import vetoRejectedUrl from '../../assets/sound/veto rejected.mp3'

const remainSilent = sound(remainSilentUrl)
const vetoRequest = sound(vetoRequestUrl)
const vetoApproved = sound(vetoApprovedUrl)
const vetoRejected = sound(vetoRejectedUrl)

interface Props {
  president: string
  chancellor: string
  phase: LegislativeSessionPhase
  onDone: () => void
}

export const LegislativeSession: Component<Props> = props => {
  const turn = () => {
    if (props.phase === 'President') return 'President'
    if (props.phase === 'Chancellor') return 'Chancellor'
    if (props.phase === 'VetoRequested') return 'President'
    if (props.phase === 'VetoApproved') return ''
    if (props.phase === 'VetoRejected') return 'Chancellor'
  }

  createEffect(() => {
    if (props.phase === 'VetoApproved') {
      const int = setInterval(props.onDone, 3500)
      onCleanup(() => clearInterval(int))
    }
  })

  useSound(remainSilent, () => props.phase === 'President' || props.phase === 'Chancellor')
  useSound(vetoRequest, () => props.phase === 'VetoRequested')
  useSound(vetoApproved, () => props.phase === 'VetoApproved')
  useSound(vetoRejected, () => props.phase === 'VetoRejected')

  return (
    <Scene>
      <h1 class={s.Title}>Legislative Session</h1>
      <div class={s.Government}>
        <div class={`${s.StepFade} ${turn() === 'President' ? '' : s.faded}`}>
          <img src={president} />
          <PlayerName class={s.gov} name={props.president} />
        </div>
        <div class={`${s.StepFade} ${turn() === 'Chancellor' ? '' : s.faded}`}>
          <img src={chancellor} />
          <PlayerName class={s.gov} name={props.chancellor} />
        </div>
      </div>
      <VetoResult vetoed={props.phase === 'VetoApproved'} />
      <AnimatedSubtitle text={getDescription(props.phase)} />
    </Scene>
  )
}

const VetoResult: Component<{ vetoed: boolean }> = props => {
  return (
    <div class={s.VoteResult}>
      <Presence>
        <Show when={props.vetoed}>
          <Motion.div
            class={s.veto}
            initial={{ transform: 'rotate(-36deg) scale(6)' }}
            animate={{ transform: `rotate(-4deg) scale(0.8)` }}
            transition={{ duration: 0.15 }}
          >
            VETOED!
          </Motion.div>
        </Show>
      </Presence>
    </div>
  )
}

function getDescription(phase: LegislativeSessionPhase) {
  switch (phase) {
    case 'President':
      return 'The president is discarding a policy.'
    case 'Chancellor':
      return 'The chancellor is discarding a policy.'
    case 'VetoRequested':
      return 'The chancellor has called for a veto!'
    case 'VetoRejected':
      return 'The president has rejected the veto. The chancellor must discard a policy.'
    case 'VetoApproved':
      return 'The agenda has been vetoed!'
  }
}
