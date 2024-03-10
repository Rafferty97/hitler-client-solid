import { Component, Match, Switch } from 'solid-js'
import { GameOutcome } from '../../dm/game-outcome'
import { Scene } from './Scene'
import liberalParty from '../../assets/liberal_seal2.png'
import fascistParty from '../../assets/fascist_seal2.png'
import { useSound } from '../../util/hooks'
import { sound } from '../../util/sound'
import fascistVictoryUrl from '../../assets/sound/fascist victory.mp3'
import liberalVictoryUrl from '../../assets/sound/liberal victory.mp3'
import fascistsWinUrl from '../../assets/sound/the fascists win.mp3'
import liberalsWinUrl from '../../assets/sound/liberal win.mp3'
import hitlerChancellorUrl from '../../assets/sound/hitler chancellor.mp3'
import hitlerExecutedUrl from '../../assets/sound/hitler executed.mp3'
import s from './modals.module.css'
import { Confetti } from '../../components/Confetti'

const fascistVictory = sound(fascistVictoryUrl, 0.8)
const liberalVictory = sound(liberalVictoryUrl)
const fascistsWin = sound(fascistsWinUrl)
const liberalsWin = sound(liberalsWinUrl)
const hitlerChancellor = sound(hitlerChancellorUrl)
const hitlerExecuted = sound(hitlerExecutedUrl)

interface Props {
  outcome: GameOutcome
  communists: boolean
}

export const GameOver: Component<Props> = props => {
  const Gradient = (props: { color: string }) => (
    <div style={{ 'box-shadow': `0 0 160px ${props.color}`, 'border-radius': '100%' }} />
  )

  const LiberalsWin = () => (
    <>
      <Confetti color="#0093FF" />
      <div class={`${s.PartySeal} ${s.Blue}`}>
        <Gradient color="#0093FF" />
        <img src={liberalParty} />
      </div>
      <h1 class={s.Title}>The liberals win!</h1>
      <Sound audio={liberalVictory} />
    </>
  )

  const FascistsWin = () => (
    <>
      <Confetti color="#FF0046" />
      <div class={`${s.PartySeal} ${s.Red}`}>
        <Gradient color="#FF0046" />
        <img src={fascistParty} />
      </div>
      <h1 class={s.Title}>The fascists win!</h1>
      <Sound audio={fascistVictory} />
    </>
  )

  return (
    <Scene>
      <Switch>
        <Match when={props.outcome === 'LiberalPolicyTrack'}>
          <LiberalsWin />
          <p class={s.Subtitle}>The liberals have completed their policy track</p>
          <Sound audio={liberalsWin} />
        </Match>
        <Match when={props.outcome === 'HitlerExecuted'}>
          <LiberalsWin />
          <p class={s.Subtitle}>Hitler has been executed</p>
          <Sound audio={hitlerExecuted} />
        </Match>
        <Match when={props.outcome === 'FascistPolicyTrack'}>
          <FascistsWin />
          <p class={s.Subtitle}>The fascists have completed their policy track</p>
          <Sound audio={fascistsWin} />
        </Match>
        <Match when={props.outcome === 'HitlerChancellor'}>
          <FascistsWin />
          <p class={s.Subtitle}>Hitler has been elected chancellor</p>
          <Sound audio={hitlerChancellor} />
        </Match>
      </Switch>
    </Scene>
  )
}

const Sound = (props: { audio: HTMLAudioElement }) => {
  useSound(props.audio, () => true)
  return undefined
}
