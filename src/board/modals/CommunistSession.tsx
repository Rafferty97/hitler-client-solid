import { Component, createEffect, createSignal } from 'solid-js'
import { Scene } from './Scene'
import { useDelay, useSound } from '../../util/hooks'
import { useTimeout } from '../../util/timeout'
import { ExecutiveAction } from '../../dm/executive-action'
import s from './modals.module.css'
import { AnimatedSubtitle } from './AnimatedSubtitle'

type Phase = 'Entering' | 'InProgress' | 'Leaving' | 'Reveal'

interface Props {
  action: ExecutiveAction
  phase: Phase
  onEntered: () => void
  onExited: () => void
}

export const CommunistSession: Component<Props> = props => {
  const [step, setStep] = createSignal(props.phase + '-0')

  createEffect(() => {
    if (!step().startsWith(props.phase)) {
      setStep(props.phase + '-0')
    }
  })

  createEffect(() => {
    if (step() === 'Entering-0') {
      useTimeout(() => setStep('Entering-1'), 3500)
    }
    if (step() === 'Entering-1') {
      useTimeout(props.onEntered, 3500)
    }
    if (step() === 'Leaving-0') {
      useTimeout(() => setStep('Leaving-1'), 3500)
    }
    if (step() === 'Leaving-1') {
      useTimeout(props.onExited, 3500)
    }
  })

  return (
    <Scene>
      <h1 class={s.Title}>{props.action}</h1>
      <AnimatedSubtitle text={getSubtitle(step(), props.action)} />
    </Scene>
  )
}

function getSubtitle(step: string, action: ExecutiveAction) {
  if (step === 'Entering-0') {
    return 'All players close your eyes'
  }
  if (step === 'Entering-1') {
    return 'The communists may now open their eyes'
  }
  if (step === 'InProgress-0') {
    switch (action) {
      case 'Bugging':
        return 'Collectively investigate the loyalty of one player'
      case 'Radicalisation':
        return 'Collectively attempt to radicalise one player'
      case 'Congress':
        return 'If radicalisation failed, you may now attempt to radicalise again'
    }
  }
  if (step === 'Leaving-0') {
    return 'Communists close your eyes'
  }
  if (step === 'Leaving-1') {
    return 'All players may now open their eyes'
  }
  if (step === 'Reveal-0') {
    return 'Check your party membership to see if you have been radicalised'
  }
}
