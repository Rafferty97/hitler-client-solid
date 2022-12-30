import { z } from 'zod'

export type GameState = z.infer<typeof gameState>
export type Role = z.infer<typeof role>
export type PlayerState = z.infer<typeof playerState>
export type BoardState = z.infer<typeof boardState>

export const role = z.enum([
  'Liberal',
  'Fascist',
  'Hitler',
  'Monarchist',
  'Capitalist',
  'Centrist',
  'Communist',
  'Anarchist',
])

export const party = z.enum(['Liberal', 'Fascist', 'Communist'])

export const nightPrompt = z.object({ type: z.literal('Night') })

export const choosePlayerPrompt = z.object({
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

export const votePrompt = z.object({
  type: z.literal('Vote'),
})

export const presidentDiscardPrompt = z.object({
  type: z.literal('PresidentDiscard'),
  cards: z.array(party).length(3),
})

export const chancellorDiscardPrompt = z.object({
  type: z.literal('ChancellorDiscard'),
  cards: z.array(party).length(2),
  can_veto: z.boolean(),
})

export const approveVetoPrompt = z.object({ type: z.literal('ApproveVeto') })

export const startElectionPrompt = z.object({
  type: z.literal('StartElection'),
  can_assassinate: z.boolean(),
})

export const endCongressPrompt = z.object({ type: z.literal('EndCongress') })

export const investigatePlayerPrompt = z.object({
  type: z.literal('InvestigatePlayer'),
  name: z.string(),
  party: party,
})

export const policyPeakPrompt = z.object({
  type: z.literal('PolicyPeak'),
  cards: z.array(party).length(3),
})

export const endExecutivePowerPrompt = z.object({
  type: z.literal('EndExecutivePower'),
})

export const deadPrompt = z.object({ type: z.literal('Dead') })

export const gameOverPrompt = z.object({
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
  endExecutivePowerPrompt,
  deadPrompt,
  gameOverPrompt,
])

export const electionPrompt = z.object({
  type: z.literal('Election'),
  president: nonzeroInt(),
  chancellor: nonzeroInt().nullable(),
  votes: z.array(z.boolean().nullable()),
  outcome: z.boolean().nullable(),
})

export const legislativeSessionPrompt = z.object({
  type: z.literal('LegislativeSession'),
  president: nonzeroInt(),
  chancellor: nonzeroInt(),
  phase: z.enum([
    'President',
    'Chancellor',
    'VetoRequested',
    'VetoApproved',
    'VetoRejected',
  ]),
})

export const cardRevealPrompt = z.object({
  type: z.literal('CardReveal'),
  result: party,
  chaos: z.boolean(),
  can_end: z.boolean(),
})

export const executionPrompt = z.object({
  type: z.literal('Execution'),
  chosen_player: nonzeroInt().nullable(),
})

export const assassinationPrompt = z.object({
  type: z.literal('Assassination'),
  anarchist: nonzeroInt(),
  chosen_player: nonzeroInt().nullable(),
})

export const policyPeakBoardPrompt = z.object({ type: z.literal('PolicyPeak') })

export const boardPrompt = z.discriminatedUnion('type', [
  nightPrompt,
  electionPrompt,
  legislativeSessionPrompt,
  cardRevealPrompt,
  executionPrompt,
  assassinationPrompt,
  policyPeakBoardPrompt,
  gameOverPrompt,
])

export const connectingState = z.object({ type: z.literal('connecting') })

export const lobbyState = z.object({
  type: z.literal('lobby'),
  can_start: z.boolean(),
})

export const boardState = z
  .object({
    type: z.literal('board'),
    election_tracker: nonzeroInt(),
    liberal_cards: nonzeroInt(),
    fascist_cards: nonzeroInt(),
    communist_cards: nonzeroInt().nullable(),
    draw_pile: nonzeroInt(),
    presidential_turn: nonzeroInt(),
    last_government: z
      .object({
        president: nonzeroInt(),
        chancellor: nonzeroInt(),
      })
      .nullable(),
    prompt: boardPrompt.nullable(),
  })
  .passthrough()

export const playerState = z.object({
  type: z.literal('player'),
  name: z.string(),
  role: role,
  prompt: playerPrompt.nullable(),
})

export const endedState = z.object({ type: z.literal('ended') })

export const gameState = z.object({
  game_id: z.string(),
  name: z.string().nullable(),
  players: z.array(
    z.object({
      name: z.string(),
    })
  ),
  state: z.discriminatedUnion('type', [
    connectingState,
    lobbyState,
    boardState,
    playerState,
    endedState,
  ]),
})

export const serverMsg = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('update'),
    state: gameState,
  }),
  z.object({
    type: z.literal('error'),
    error: z.string(),
  }),
])

function nonzeroInt() {
  return z.number().int().min(0)
}
