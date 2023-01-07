import { Component, createEffect, createMemo, onCleanup, Show } from 'solid-js'
import { Scene } from './Scene'
import { useDelay, useDynamicSound, useSound } from '../../util/hooks'
import { PlayerName } from './PlayerName'
import { Motion, Presence } from '@motionone/solid'
import s from './modals.module.css'
import president from '../../assets/president.png'
import chancellor from '../../assets/chancellor.png'
import jaSound1 from '../../assets/sound/ja1.mp3'
import jaSound2 from '../../assets/sound/ja2.mp3'
import neinSound1 from '../../assets/sound/nein1.mp3'
import neinSound2 from '../../assets/sound/nein2.mp3'
import castVote from '../../assets/sound/cast-vote.mp3'

interface Props {
  president: string
  chancellor?: string
  outcome?: boolean
  onDone: () => void
}

export const Election: Component<Props> = props => {
  const showPresident = useDelay(() => true, 1000)
  const showChancellor = () => showPresident() && props.chancellor != null
  const showChancellorAfter = useDelay(showChancellor, 1000)
  const showVoting = () => showChancellorAfter() && props.outcome == null

  useSound(castVote, showVoting)

  const outcome = createMemo(() => props.outcome)

  createEffect(() => {
    if (outcome() == null) return
    const int = setInterval(props.onDone, 3500)
    onCleanup(() => clearInterval(int))
  })

  return (
    <Scene>
      <h1 class={s.Title}>Election</h1>
      <div class={s.Government}>
        <div>
          <img src={president} />
          <PlayerName class={s.gov} click name={showPresident() ? props.president : undefined} />
        </div>
        <div>
          <img src={chancellor} />
          <PlayerName class={s.gov} click name={showChancellor() ? props.chancellor : undefined} />
        </div>
      </div>
      <div class={`${s.VoteNow} ${showVoting() ? '' : s.hidden}`}>Vote now!</div>
      <VoteResult outcome={outcome()} />
    </Scene>
  )
}

const VoteResult: Component<{ outcome?: boolean }> = props => {
  useDynamicSound(() => getVoteSound(props.outcome))

  return (
    <div class={s.VoteResult}>
      <Presence>
        <Show when={props.outcome != null}>
          <Motion.div
            class={props.outcome ? s.ja : s.nein}
            initial={{ transform: 'rotate(-36deg) scale(6)' }}
            animate={{ transform: `rotate(${props.outcome ? '-12deg' : '8deg'}) scale(1)` }}
            transition={{ duration: 0.15 }}
          >
            {props.outcome ? 'JA!' : 'NEIN!'}
          </Motion.div>
        </Show>
      </Presence>
    </div>
  )
}

function getVoteSound(outcome: boolean | undefined) {
  if (outcome == null) {
    return undefined
  }
  if (outcome) {
    return Math.random() < 0.2 ? jaSound2 : jaSound1
  } else {
    return Math.random() < 0.2 ? neinSound2 : neinSound1
  }
}
