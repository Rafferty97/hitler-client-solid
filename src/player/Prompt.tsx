import { Component, Match, Switch } from 'solid-js'
import { PlayerAction } from '../dm/action'
import { ChoosePlayerPrompt, PlayerPrompt } from '../dm/player-prompt'
import { Party, Role } from '../dm/role'
import { PublicPlayer } from '../dm/state'
import { Button } from './Button'
import { CardSelector } from './CardSelector'
import s from './PlayerApp.module.css'

interface Props {
  prompt: PlayerPrompt
  role: Role
  players: (PublicPlayer & { Role?: Role; Party?: Party })[]
  action: (action: PlayerAction) => void
}

export const Prompt: Component<Props> = props => {
  const makeAction = (action: PlayerAction) => () => props.action(action)

  return (
    <Switch fallback={<pre>{JSON.stringify(props, undefined, 2)}</pre>}>
      <Match when={props.prompt.type === 'Night'}>
        <h3>Night round</h3>
        {props.players
          .filter(p => p.Party || p.Role)
          .map(player => (
            <p>
              {player.name} {player.Role ?? player.Party}
            </p>
          ))}
        <Button label="Okay" onClick={makeAction({ type: 'EndNightRound' })} />
      </Match>

      <Match when={isChoosePlayerPrompt(props.prompt)} keyed>
        {prompt => <ChoosePlayer prompt={prompt} action={props.action} />}
      </Match>

      <Match when={props.prompt.type === 'Vote'}>
        <Vote action={props.action} />
      </Match>

      <Match when={isDiscardPrompt(props.prompt)} keyed>
        {prompt => (
          <CardSelector
            policies={prompt.cards}
            veto={prompt.type === 'ChancellorDiscard' && prompt.can_veto}
            onChoose={index => props.action({ type: 'Discard', index })}
            onVeto={makeAction({ type: 'VetoAgenda' })}
          />
        )}
      </Match>

      <Match when={props.prompt.type === 'StartElection'}>
        <p class={`${s.Message} ${s.padded}`}>Ready to continue?</p>
        <Button label="Yes" onClick={makeAction({ type: 'EndCardReveal' })} />
      </Match>
    </Switch>
  )
}

type ActionDispatcher = (action: PlayerAction) => void

function isChoosePlayerPrompt(prompt: PlayerPrompt) {
  return prompt.type === 'ChoosePlayer' ? prompt : undefined
}

function isDiscardPrompt(prompt: PlayerPrompt) {
  if (
    prompt.type === 'PresidentDiscard' ||
    prompt.type == 'ChancellorDiscard'
  ) {
    return prompt
  }
}

const ChoosePlayer: Component<{
  prompt: ChoosePlayerPrompt
  action: ActionDispatcher
}> = props => (
  <>
    <p class={s.Message}>{choosePlayerMessage(props.prompt)}</p>
    {props.prompt.options.map(name => (
      <Button
        yellow
        small={props.prompt.options.length > 5}
        label={name}
        onClick={() => props.action({ type: 'ChoosePlayer', name })}
      />
    ))}
  </>
)

function choosePlayerMessage(prompt: ChoosePlayerPrompt): string {
  switch (prompt.kind) {
    case 'NominateChancellor':
    case 'MonarchistFirstChancellor':
    case 'MonarchistSecondChancellor':
      return 'Nominate a chancellor'
    case 'NominatePresident':
      return 'Choose the next president'
    case 'Radicalise':
      return 'Choose a player to radicalise'
    case 'VoteChancellor':
      return 'Please vote for a chancellor'
    case 'Confession':
      return 'Which player must reveal their party membership?'
    case 'Execute':
      return 'Choose a player to execute'
    case 'Investigate':
      return 'Choose a player to investigate'
  }
  return 'Choose a player'
}

const Vote: Component<{ action: (action: PlayerAction) => void }> = props => {
  const vote = (vote: boolean) => () => props.action({ type: 'CastVote', vote })
  return (
    <>
      <p class={`${s.Message} ${s.padded}`}>Cast your vote</p>
      <Button large white label="Ja!" onClick={vote(true)} />
      <Button large black label="Nein!" onClick={vote(false)} />
    </>
  )
}
