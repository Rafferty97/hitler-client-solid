import { z } from 'zod'
import { gameOutcome } from './game-outcome'
import { party } from './role'

const nightPrompt = z.object({ type: z.literal('Night') })

const choosePlayerPrompt = z.object({
  type: z.literal('ChoosePlayer'),
  kind: z.enum([
    'NominateChancellor',
    'NominatePresident',
    'MonarchistFirstChancellor',
    'MonarchistSecondChancellor',
    'VoteChancellor',
    'Investigate',
    'Execute',
    'Radicalise',
    'Confession',
  ]),
  options: z.array(z.string()),
})

const votePrompt = z.object({
  type: z.literal('Vote'),
})

const presidentDiscardPrompt = z.object({
  type: z.literal('PresidentDiscard'),
  cards: z.array(party).length(3),
})

const chancellorDiscardPrompt = z.object({
  type: z.literal('ChancellorDiscard'),
  cards: z.array(party).length(2),
  can_veto: z.boolean(),
})

const approveVetoPrompt = z.object({ type: z.literal('ApproveVeto') })

const startElectionPrompt = z.object({
  type: z.literal('StartElection'),
  can_assassinate: z.boolean(),
})

const endCongressPrompt = z.object({ type: z.literal('EndCongress') })

const investigatePlayerPrompt = z.object({
  type: z.literal('InvestigatePlayer'),
  name: z.string(),
  party: party,
})

const policyPeakPrompt = z.object({
  type: z.literal('PolicyPeak'),
  cards: z.array(party).length(3),
})

const radicalisationResultPrompt = z.object({
  type: z.literal('Radicalisation'),
  result: z.enum(['NoAttempt', 'Fail', 'Success', 'Unchanged', 'Radicalised']),
})

const deadPrompt = z.object({ type: z.literal('Dead') })

const gameOverPrompt = z.object({
  type: z.literal('GameOver'),
  outcome: gameOutcome,
})

export const playerPrompt = z.discriminatedUnion('type', [
  nightPrompt,
  choosePlayerPrompt,
  votePrompt,
  presidentDiscardPrompt,
  chancellorDiscardPrompt,
  approveVetoPrompt,
  startElectionPrompt,
  endCongressPrompt,
  investigatePlayerPrompt,
  policyPeakPrompt,
  radicalisationResultPrompt,
  deadPrompt,
  gameOverPrompt,
])
