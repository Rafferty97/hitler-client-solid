import { Component, createSignal, For, Match, Switch } from 'solid-js'
import { Party, Role } from '../dm/role'
import { PublicPlayer } from '../dm/state'
import { Button } from './Button'
import s from './PlayerApp.module.css'

interface NightRoundProps {
  role: Role
  others: OtherPlayer[]
  next: () => void
}

type OtherPlayer = PublicPlayer & { Role?: Role; Party?: Party }

export const NightRound: Component<NightRoundProps> = props => {
  const [revealed, setRevealed] = createSignal(false)

  const players = () =>
    props.others.flatMap(player => {
      if (player.Role) return [[player.name, player.Role] as const]
      if (player.Party) return [[player.name, player.Party + ' party'] as const]
      return []
    })

  return (
    <div>
      <Switch>
        <Match when={!revealed()}>
          <p class={`${s.Message}`}>Night round</p>
          <p class={s.Explanation}>Click reveal to uncover your secret role.</p>
          <Button red label="Reveal role" onClick={() => setRevealed(true)} />
        </Match>
        <Match when={revealed()}>
          <p class={s.Message}>Your secret role</p>
          <p class={s.SecretRole}>{props.role}</p>
          <table class={s.PlayerTable}>
            <tbody>
              <For each={players()}>
                {player => (
                  <tr>
                    <td>{player[0]}</td>
                    <td>{player[1]}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
          <p class={s.Explanation}>{getRoleText(props.role, props.others)}</p>
          <Button label="Done" onClick={props.next} />
        </Match>
      </Switch>
    </div>
  )
}

function getRoleText(role: Role, others: OtherPlayer[]) {
  switch (role) {
    case 'Liberal':
      return 'Liberals do not know the identity of any other player'
    case 'Fascist':
      const monarchist = others.find(p => p.Role === 'Monarchist') ? ' and the Monarchist' : ''
      return `Fascists know the identity of their fellow fascists, including Hitler${monarchist}`
    case 'Hitler':
      if (others.find(p => p.Role === 'Fascist')) {
        return 'Hitler knows the identity of the ordinary fascist'
      } else {
        return 'Hitler does not know who their fellow fascists are'
      }
    case 'Communist':
      const anarchist = others.find(p => p.Role === 'Anarchist') ? ', including the Anarchist' : ''
      return `Communists know who their comrades are${anarchist}`
    case 'Centrist':
      return `The centrists know each other's identities`
    case 'Capitalist':
      return `The capitalist knows the party membership of two adjacent players, but not their secret roles`
    case 'Anarchist':
      return `The Anarchist does not know who their fellow communists are`
    case 'Monarchist':
      return `The Monarchist does not know who their fellow fascists are`
  }
}
