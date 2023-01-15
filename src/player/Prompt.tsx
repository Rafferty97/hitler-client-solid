import { Component, Match, Show, Switch } from 'solid-js'
import { PlayerAction } from '../dm/action'
import { ChoosePlayerPrompt, PlayerPrompt } from '../dm/player-prompt'
import { Party, Role } from '../dm/role'
import { PublicPlayer } from '../dm/state'
import { Button } from './Button'
import { CardSelector, Investigate, PolicyPeak } from './CardSelector'
import { NightRound } from './NightRound'
import s from './PlayerApp.module.css'

interface Props {
  prompt: PlayerPrompt
  role: Role
  players: (PublicPlayer & { Role?: Role; Party?: Party })[]
  action: (action: PlayerAction) => void
  startGame: () => void
  endGame: () => void
}

export const Prompt: Component<Props> = props => {
  return (
    <Switch fallback={<pre>{JSON.stringify(props, undefined, 2)}</pre>}>
      <Match when={props.prompt.type === 'Night'}>
        <NightRound
          role={props.role}
          others={props.players}
          next={() => props.action({ type: 'EndNightRound' })}
        />
      </Match>

      <Match when={props.prompt.type === 'ChoosePlayer' ? props.prompt : undefined} keyed>
        {prompt => <ChoosePlayer prompt={prompt} action={props.action} />}
      </Match>

      <Match when={props.prompt.type === 'Vote'}>
        <Vote action={props.action} />
      </Match>

      <Match when={isDiscardPrompt(props.prompt)} keyed>
        {prompt => (
          <CardSelector
            policies={prompt.cards}
            canVeto={prompt.type === 'ChancellorDiscard' && prompt.can_veto}
            onChoose={index => props.action({ type: 'Discard', index })}
            onVeto={() => props.action({ type: 'VetoAgenda' })}
          />
        )}
      </Match>

      <Match when={props.prompt.type === 'ApproveVeto'}>
        <p class={`${s.Message} ${s.padded}`}>Do you approve the veto?</p>
        <Button label="Approve" white onClick={() => props.action({ type: 'AcceptVeto' })} />
        <Button label="Reject" black onClick={() => props.action({ type: 'RejectVeto' })} />
      </Match>

      <Match when={props.prompt.type === 'PolicyPeak' ? props.prompt : undefined} keyed>
        {prompt => (
          <PolicyPeak policies={prompt.cards} onDone={() => props.action({ type: 'EndExecutiveAction' })} />
        )}
      </Match>

      <Match when={props.prompt.type === 'InvestigatePlayer' ? props.prompt : undefined} keyed>
        {prompt => <Investigate {...prompt} onDone={() => props.action({ type: 'EndExecutiveAction' })} />}
      </Match>

      <Match when={props.prompt.type === 'Radicalisation'}>
        {/* FIXME: Needs improvement */}
        <pre>{JSON.stringify(props.prompt, undefined, 2)}</pre>
        <Button label="Done" onClick={() => props.action({ type: 'EndExecutiveAction' })} />
      </Match>

      <Match when={props.prompt.type === 'EndCongress'}>
        <p class={`${s.Message} ${s.padded}`}>
          <strong>Congress</strong>
          <br />
          <br />
          <span style={{ 'text-transform': 'none' }}>
            Take a moment to acknowledge your fellow communist comrades before moving on.
          </span>
        </p>
        <Button yellow label="Done" onClick={() => props.action({ type: 'EndCongress' })} />
      </Match>

      <Match when={props.prompt.type === 'StartElection'}>
        <p class={`${s.Message} ${s.padded}`}>Ready to continue?</p>
        <Button label="Yes" onClick={() => props.action({ type: 'EndCardReveal' })} />
        {/* FIXME: Assassination */}
      </Match>

      <Match when={props.prompt.type === 'HijackElection'}>
        {/* FIXME: Needs improvement */}
        <h4>Hijack election?</h4>
        <button onClick={() => props.action({ type: 'HijackElection' })}>HIJACK</button>
      </Match>

      <Match when={props.prompt.type === 'Dead'}>
        <p class={`${s.Message} ${s.padded} ${s.dead}`}>You are dead</p>
      </Match>

      <Match when={props.prompt.type === 'GameOver' ? props.prompt : undefined} keyed>
        {({ won }) => <Gameover won={won} onRestart={props.startGame} onEnd={props.endGame} />}
      </Match>
    </Switch>
  )
}

type ActionDispatcher = (action: PlayerAction) => void

function isDiscardPrompt(prompt: PlayerPrompt) {
  if (prompt.type === 'PresidentDiscard' || prompt.type == 'ChancellorDiscard') {
    return prompt
  }
}

const ChoosePlayer: Component<{
  prompt: ChoosePlayerPrompt
  action: ActionDispatcher
}> = props => (
  <>
    <p class={s.Message}>{choosePlayerMessage(props.prompt)}</p>
    <div class={s.List}>
      {props.prompt.options.map(name => (
        <Button
          yellow
          small={props.prompt.options.length > 5}
          label={name}
          onClick={() => props.action({ type: 'ChoosePlayer', name })}
        />
      ))}
    </div>
  </>
)

function choosePlayerMessage(prompt: ChoosePlayerPrompt) {
  switch (prompt.kind) {
    case 'NominateChancellor':
    case 'MonarchistFirstChancellor':
    case 'MonarchistSecondChancellor':
      return 'Nominate a chancellor'
    case 'NominatePresident':
      return 'Choose the next president'
    case 'Radicalise':
      return (
        <>
          Choose a player to <strong>radicalise</strong>
        </>
      )
    case 'VoteChancellor':
      return 'Please vote for a chancellor'
    case 'Confession':
      return 'Which player must reveal their party membership?'
    case 'Execute':
      return (
        <>
          Choose a player to <strong>execute</strong>
        </>
      )
    case 'Investigate':
      return (
        <>
          Choose a player to <strong>investigate</strong>
        </>
      )
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

const Gameover: Component<{ won: boolean; onRestart: () => any; onEnd: () => any }> = props => {
  return (
    <>
      <p class={`${s.Message} ${s.padded}`}>
        <strong>Game over</strong>
        <br />
        <br />
        <Show when={props.won}>You have won!</Show>
        <Show when={!props.won}>You have been defeated!</Show>
      </p>
      <Button yellow label="Play again" onClick={props.onRestart} />
      <Button black label="End game" onClick={props.onEnd} />
    </>
  )
}
