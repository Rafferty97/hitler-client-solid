import { z } from 'zod'
import { executiveAction } from './executive-action'
import { nonzeroInt } from './primative'
import { party } from './role'

export type BoardPrompt = z.infer<typeof boardPrompt>

const nightPrompt = z.object({ type: z.literal('Night') })

const electionPrompt = z.object({
  type: z.literal('Election'),
  president: nonzeroInt(),
  chancellor: nonzeroInt().nullable(),
  votes: z.array(z.boolean().nullable()),
  outcome: z.boolean().nullable(),
})

const legislativeSessionPrompt = z.object({
  type: z.literal('LegislativeSession'),
  president: nonzeroInt(),
  chancellor: nonzeroInt(),
  phase: z.enum(['President', 'Chancellor', 'VetoRequested', 'VetoApproved', 'VetoRejected']),
})

const cardRevealPrompt = z.object({
  type: z.literal('CardReveal'),
  result: party,
  chaos: z.boolean(),
  can_end: z.boolean(),
})

const executionPrompt = z.object({
  type: z.literal('Execution'),
  chosen_player: nonzeroInt().nullable(),
})

const investigatePlayerPrompt = z.object({
  type: z.literal('InvestigatePlayer'),
  chosen_player: nonzeroInt().nullable(),
})

const specialElectionPrompt = z.object({
  type: z.literal('SpecialElection'),
  can_hijack: z.boolean(),
  hijacked_by: nonzeroInt().nullable(),
  chosen_player: nonzeroInt().nullable(),
})

const assassinationPrompt = z.object({
  type: z.literal('Assassination'),
  anarchist: nonzeroInt(),
  chosen_player: nonzeroInt().nullable(),
})

const communistSessionPrompt = z.object({
  type: z.literal('CommunistSession'),
  action: executiveAction,
  phase: z.enum(['Entering', 'InProgress', 'Leaving', 'Reveal']),
})

const policyPeakPrompt = z.object({ type: z.literal('PolicyPeak') })

const fiveYearPlanPrompt = z.object({ type: z.literal('FiveYearPlan') })

const monarchistElectionPrompt = z.object({
  type: z.literal('MonarchistElection'),
  monarchist: nonzeroInt(),
  president: nonzeroInt(),
  monarchist_chancellor: nonzeroInt().nullable(),
  president_chancellor: nonzeroInt().nullable(),
  votes: z.array(z.boolean().nullable()),
  outcome: z.boolean().nullable(),
})

const gameOverPrompt = z.object({
  type: z.literal('GameOver'),
  outcome: z.enum([
    'LiberalPolicyTrack',
    'FascistPolicyTrack',
    'CommunistPolicyTrack',
    'HitlerChancellor',
    'HitlerExecuted',
    'CapitalistExecuted',
  ]),
})

export const boardPrompt = z.discriminatedUnion('type', [
  nightPrompt,
  electionPrompt,
  legislativeSessionPrompt,
  cardRevealPrompt,
  executionPrompt,
  investigatePlayerPrompt,
  specialElectionPrompt,
  assassinationPrompt,
  communistSessionPrompt,
  policyPeakPrompt,
  fiveYearPlanPrompt,
  monarchistElectionPrompt,
  gameOverPrompt,
])
