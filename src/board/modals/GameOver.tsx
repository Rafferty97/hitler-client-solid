import { Component } from 'solid-js'
import { GameOutcome } from '../../dm/game-outcome'
import { Party } from '../../dm/role'
import { Scene } from './Scene'
import s from './GameOver.module.css'
import liberalParty from '../../assets/liberal_seal.png'
import fascistParty from '../../assets/fascist_seal.png'
import communistParty from '../../assets/communist_seal.png'

interface Props {
  outcome: GameOutcome
  communists: boolean
}

const PARTY_IMG = {
  Liberal: liberalParty,
  Fascist: fascistParty,
  Communist: communistParty,
}

export const GameOver: Component<Props> = props => {
  // FIXME: Monarchist
  const winners = () => getWinners(props.outcome, props.communists)

  return (
    <Scene>
      <div class={s.Parties}>
        {winners().map(party => (
          <img src={PARTY_IMG[party]} />
        ))}
      </div>
    </Scene>
  )
}

function getWinners(outcome: GameOutcome, communists: boolean): Party[] {
  return ['Liberal', 'Communist', 'Fascist']
  switch (outcome) {
    case 'LiberalPolicyTrack':
      return ['Liberal']
    case 'FascistPolicyTrack':
      return ['Fascist']
    case 'CommunistPolicyTrack':
      return ['Communist']
    case 'HitlerChancellor':
      return ['Fascist']
    case 'HitlerExecuted':
      return communists ? ['Liberal', 'Communist'] : ['Liberal']
    case 'CapitalistExecuted':
      return ['Communist']
  }
}
