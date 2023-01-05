import { Component } from 'solid-js'
import { Party } from '../dm/role'
import s from './PolicyTracker.module.css'

interface Props {
  party: Party
  numPlayers: number
  count: number
}

export const PolicyTracker: Component<Props> = props => {
  const tiles: Tile[] = getTiles(props.party, props.numPlayers)

  return (
    <div class={s.PolicyTracker}>
      {tiles.map((tile, index) => (
        <div class={`${s.Tile} ${s[tile]}`}>{props.count > index ? 'CARD' : ''}</div>
      ))}
    </div>
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
