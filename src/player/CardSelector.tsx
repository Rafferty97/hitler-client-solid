import { Component, createSignal, Index, Switch, Match, Show, createEffect, createMemo } from 'solid-js'
import { Motion } from 'solid-motionone'
import { Party } from '../dm/role'
import { Button } from './Button'
import ps from './PlayerApp.module.css'
import s from './CardSelector.module.css'
import { RedCross } from '../components/RedCross'

interface CardSelectorProps {
  policies: Party[]
  canVeto: boolean
  onChoose: (index: number) => void
  onVeto: () => void
}

export const CardSelector: Component<CardSelectorProps> = props => {
  const [discarded, setDiscarded] = createSignal<number>()

  return (
    <>
      <p class={ps.Message}>
        {discarded() == null ? (
          <>
            Choose a policy to <strong>discard</strong>
          </>
        ) : props.policies.length > 2 ? (
          'Play these policies?'
        ) : (
          'Play this policy?'
        )}
      </p>
      <CardSet
        policies={props.policies}
        discarded={discarded()}
        onClick={idx => setDiscarded(i => (i == null ? idx : i))}
      />
      <div class={s.Buttons}>
        <Switch>
          <Match when={discarded() == null && props.canVeto}>
            <div class={s.CentreButton}>
              <Button red noPadding label="Veto agenda" onClick={props.onVeto} />
            </div>
          </Match>
          <Match when={discarded() != null}>
            <Button black noPadding label="Undo" onClick={() => setDiscarded(undefined)} />
            <Button yellow noPadding label="Confirm" onClick={() => props.onChoose(discarded()!)} />
          </Match>
        </Switch>
      </div>
    </>
  )
}

interface PolicyPeakProps {
  policies: Party[]
  onDone: () => void
}

export const PolicyPeak: Component<PolicyPeakProps> = props => {
  const [revealed, setRevealed] = createSignal(false)

  return (
    <>
      <p class={ps.Message}>
        Click to reveal the
        <br />
        <strong>top three policy cards</strong>
      </p>
      <div class={s.QuestionMark}>?</div>
      <CardSet policies={revealed() ? props.policies : []} />
      <div class={s.Buttons}>
        <div class={s.CentreButton}>
          <Switch>
            <Match when={revealed()}>
              <Button yellow noPadding label="Done" onClick={props.onDone} />
            </Match>
            <Match when={!revealed()}>
              <Button red noPadding label="Reveal cards" onClick={() => setRevealed(true)} />
            </Match>
          </Switch>
        </div>
      </div>
    </>
  )
}

interface InvestigateProps {
  name: string
  party: Party
  onDone: () => void
}

export const Investigate: Component<InvestigateProps> = props => {
  const [revealed, setRevealed] = createSignal(false)

  return (
    <>
      <Show when={revealed()}>
        <p class={`${ps.Message} ${ps.large} ${ps.fixedHeight}`}>
          <strong>{props.name}</strong> is&nbsp;a <strong>{props.party}</strong>
        </p>
      </Show>
      <Show when={!revealed()}>
        <p class={`${ps.Message} ${ps.fixedHeight}`}>
          Click to investigate
          <br />
          <strong>{props.name}</strong>
        </p>
      </Show>
      <div class={s.QuestionMark}>?</div>
      <div class={s.CardSelector}>
        <Motion.div
          class={`${s.PartyCard} ${s[props.party]}`}
          animate={{
            transform: `translate(0, ${revealed() ? 0 : 160}px)`,
            opacity: revealed() ? 1 : 0,
          }}
          initial={{
            transform: `translate(0, 160px)`,
            opacity: 0,
          }}
          transition={{ duration: 0.35 }}
        />
      </div>
      <div class={s.Buttons}>
        <div class={s.CentreButton}>
          <Switch>
            <Match when={revealed()}>
              <Button yellow noPadding label="Done" onClick={props.onDone} />
            </Match>
            <Match when={!revealed()}>
              <Button red noPadding label="View" onClick={() => setRevealed(true)} />
            </Match>
          </Switch>
        </div>
      </div>
    </>
  )
}

interface RadicalizationProps {
  name: string
  result: 'NoAttempt' | 'Fail' | 'Success' | 'Unchanged' | 'Radicalised'
  party: Party
  onDone: () => void
}

export const Radicalization: Component<RadicalizationProps> = props => {
  const [revealed, setRevealed] = createSignal(false)

  const name = createMemo(() => props.name)
  const result = createMemo(() => props.result)
  const party = createMemo(() => props.party)

  return (
    <>
      <Show when={revealed()}>
        <p class={`${ps.Message} ${ps.large} ${ps.fixedHeight}`}>
          <Switch>
            <Match when={props.result === 'Fail'}>
              Your attempt to radicalise <strong>{name()}</strong> has <strong>failed</strong>
            </Match>
            <Match when={props.result === 'Success'}>
              Success! <strong>{name()}</strong> is now a <strong>communist</strong>
            </Match>
            <Match when={props.result === 'Unchanged'}>You are still a {props.party}</Match>
            <Match when={props.result === 'Radicalised'}>
              You have been <strong>radicalised</strong>
            </Match>
          </Switch>
        </p>
      </Show>
      <Show when={!revealed()}>
        <p class={`${ps.Message} ${ps.fixedHeight}`}>
          <Switch>
            <Match when={props.result === 'Success' || props.result === 'Fail'}>
              Has <strong>{name()}</strong> been successfully radicalised?
            </Match>
            <Match when={props.result === 'Unchanged' || props.result === 'Radicalised'}>
              <p class={`${ps.Message} ${ps.fixedHeight}`}>Have you been radicalised?</p>
            </Match>
          </Switch>
        </p>
      </Show>
      <div class={s.QuestionMark}>?</div>
      <div class={s.CardSelector}>
        <Motion.div
          class={`${s.PartyCard} ${s[party()]} ${result() === 'Fail' ? s.Gray : ''}`}
          animate={{
            transform: `translate(0, ${revealed() ? 0 : 160}px)`,
            opacity: revealed() ? 1 : 0,
          }}
          initial={{
            transform: `translate(0, 160px)`,
            opacity: 0,
          }}
          transition={{ duration: 0.35 }}
        >
          <Show when={revealed() && props.result === 'Fail'}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-50px',
                right: '-50px',
                bottom: 0,
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
              }}
            >
              <RedCross />
            </div>
          </Show>
        </Motion.div>
      </div>
      <div class={s.Buttons}>
        <div class={s.CentreButton}>
          <Switch>
            <Match when={revealed()}>
              <Button yellow noPadding label="Done" onClick={props.onDone} />
            </Match>
            <Match when={!revealed()}>
              <Button red noPadding label="Check" onClick={() => setRevealed(true)} />
            </Match>
          </Switch>
        </div>
      </div>
    </>
  )
}

interface CardSetProps {
  policies: Party[]
  discarded?: number
  onClick?: (index: number) => void
}

const CardSet: Component<CardSetProps> = props => {
  const scale = () => [0, 0, 1.2, 1][props.policies.length - (props.discarded == null ? 0 : 1)]
  const offset = () => [0, 0, -0.6, -1][props.policies.length - (props.discarded == null ? 0 : 1)]

  return (
    <div class={s.CardSelector}>
      <Index each={props.policies}>
        {(policy, idx) => (
          <Card
            policy={policy()}
            n={scale() * (idx - (idx > (props.discarded ?? 99) ? 1 : 0)) + offset()}
            hidden={idx === props.discarded}
            choose={() => props.onClick?.(idx)}
          />
        )}
      </Index>
    </div>
  )
}

interface CardProps {
  policy: Party
  n: number
  hidden: boolean
  choose: () => void
}

const Card: Component<CardProps> = props => {
  return (
    <Motion.div
      onClick={props.choose}
      class={`${s.PolicyCard} ${s[props.policy]}`}
      animate={{
        transform: `rotate(${10 * props.n}deg) translate(${80 * props.n}px, ${props.hidden ? 160 : 0}px)`,
        opacity: props.hidden ? 0 : 1,
      }}
      initial={{
        transform: `rotate(${15 * props.n}deg) translate(${80 * props.n}px, 120px)`,
        opacity: 0,
      }}
      transition={{ duration: 0.35 }}
    />
  )
}
