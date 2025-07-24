import { Component, createEffect, createMemo, Match, onCleanup, Show, Switch } from 'solid-js'
import { PlayerAction } from '../dm/action'
import { ChoosePlayerPrompt, PlayerPrompt } from '../dm/player-prompt'
import { Party, Role } from '../dm/role'
import { PublicPlayer } from '../dm/state'
import { Button } from './Button'
import { CardSelector, Investigate, PolicyPeak, Radicalization } from './CardSelector'
import { NightRound } from './NightRound'
import { chooseIndex, chooseRandom } from '../util/random'
import s from './PlayerApp.module.css'
import { partyForRole } from '../util/party'
import _ from 'lodash'

interface Props {
  prompt: PlayerPrompt
  role: Role
  players: (PublicPlayer & { Role?: Role; Party?: Party })[]
  action: (action: PlayerAction) => void
  startGame: () => void
  endGame: () => void
}

export const Prompt: Component<Props> = props => {
  if (import.meta.env.VITE_AUTOPLAY) {
    createEffect(() => {
      const { prompt, action } = props
      const timer = setTimeout(() => {
        switch (prompt.type) {
          case 'Night':
            return action({ type: 'EndNightRound' })
          case 'StartElection':
            return action({ type: 'EndCardReveal' })
          case 'ChoosePlayer':
            return action({ type: 'ChoosePlayer', name: chooseRandom(prompt.options) })
          case 'Vote':
            return action({ type: 'CastVote', vote: chooseRandom([true, false]) })
          case 'PresidentDiscard':
          case 'ChancellorDiscard':
            return action({ type: 'Discard', index: chooseIndex(prompt.cards.length) })
          case 'PolicyPeak':
          case 'InvestigatePlayer':
            return action({ type: 'EndExecutiveAction' })
        }
      }, 500)
      onCleanup(() => clearTimeout(timer))
    })
  }

  const prompt = createMemo(() => props.prompt, props.prompt, { equals: _.isEqual })

  return (
    <Switch fallback={<pre>{JSON.stringify(props, undefined, 2)}</pre>}>
      <Match when={prompt().type === 'Night'}>
        <NightRound
          role={props.role}
          others={props.players}
          next={() => props.action({ type: 'EndNightRound' })}
        />
      </Match>

      <Match when={prompt().type === 'ChoosePlayer'}>
        <ChoosePlayer prompt={prompt() as ChoosePlayerPrompt} action={props.action} />
      </Match>

      <Match when={prompt().type === 'Vote'}>
        <Vote action={props.action} />
      </Match>

      <Match when={isDiscardPrompt(prompt())} keyed>
        {prompt => (
          <CardSelector
            policies={prompt.cards}
            canVeto={prompt.type === 'ChancellorDiscard' && prompt.can_veto}
            onChoose={index => props.action({ type: 'Discard', index })}
            onVeto={() => props.action({ type: 'VetoAgenda' })}
          />
        )}
      </Match>

      <Match when={prompt().type === 'ApproveVeto'}>
        <p class={`${s.Message} ${s.padded}`}>Do you approve the veto?</p>
        <Button label="Approve" white onClick={() => props.action({ type: 'AcceptVeto' })} />
        <Button label="Reject" black onClick={() => props.action({ type: 'RejectVeto' })} />
      </Match>

      <Match when={prompt().type === 'PolicyPeak'}>
        <PolicyPeak
          policies={(prompt() as Extract<PlayerPrompt, { type: 'PolicyPeak' }>).cards}
          onDone={() => props.action({ type: 'EndExecutiveAction' })}
        />
      </Match>

      <Match when={prompt().type === 'InvestigatePlayer'} keyed>
        <Investigate
          {...(prompt() as Extract<PlayerPrompt, { type: 'InvestigatePlayer' }>)}
          onDone={() => props.action({ type: 'EndExecutiveAction' })}
        />
      </Match>

      <Match when={prompt().type === 'Radicalisation'}>
        <Radicalization
          {...(prompt() as Extract<PlayerPrompt, { type: 'Radicalisation' }>)}
          party={partyForRole(props.role)}
          onDone={() => props.action({ type: 'EndExecutiveAction' })}
        />
      </Match>

      <Match when={prompt().type === 'EndCongress'}>
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

      <Match when={prompt().type === 'StartElection'}>
        <p class={`${s.Message} ${s.padded}`}>Ready to continue?</p>
        <Button label="Yes" onClick={() => props.action({ type: 'EndCardReveal' })} />
        {/* FIXME: Assassination */}
      </Match>

      <Match when={prompt().type === 'HijackElection'}>
        {/* FIXME: Needs improvement */}
        <h4>Hijack election?</h4>
        <button onClick={() => props.action({ type: 'HijackElection' })}>HIJACK</button>
      </Match>

      <Match when={prompt().type === 'Dead'}>
        <p class={`${s.Message} ${s.padded} ${s.dead}`}>You are dead</p>
      </Match>

      <Match when={prompt().type === 'GameOver'}>
        <Gameover
          won={(prompt() as Extract<PlayerPrompt, { type: 'GameOver' }>).won}
          onRestart={props.startGame}
          onEnd={props.endGame}
        />
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
