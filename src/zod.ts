import { z } from 'zod'

export type GameState = z.infer<typeof gameState>

export type Role = z.infer<typeof role>

export type PlayerState = z.infer<typeof playerState>

export type NightPrompt = z.infer<typeof nightPrompt>
export type ChoosePlayerPrompt = z.infer<typeof choosePlayerPrompt>
export type VotePrompt = z.infer<typeof votePrompt>

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

export const nightPrompt = z.object({ type: z.literal('Night') })
export const choosePlayerPrompt = z.object({
  type: z.literal('ChoosePlayer'),
  kind: z.enum(['NominateChancellor']),
  options: z.array(z.string()),
})
export const votePrompt = z.object({
  type: z.literal('Vote'),
})

export const playerPrompt = z
  .discriminatedUnion('type', [nightPrompt, choosePlayerPrompt, votePrompt])
  .nullable()

export const connectingState = z.object({ type: z.literal('connecting') })

export const lobbyState = z.object({
  type: z.literal('lobby'),
  can_start: z.boolean(),
})

export const boardState = z
  .object({
    type: z.literal('board'),
  })
  .passthrough()

export const playerState = z.object({
  type: z.literal('player'),
  name: z.string(),
  role: role,
  prompt: playerPrompt,
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
