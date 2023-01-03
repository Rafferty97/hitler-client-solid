import { z } from 'zod'
import { boardPrompt } from './board-prompt'
import { playerPrompt } from './player-prompt'
import { nonzeroInt } from './primative'
import { party, role } from './role'

export type GameState = z.infer<typeof gameState>
export type PlayerState = z.infer<typeof playerState>
export type BoardState = z.infer<typeof boardState>
export type PublicPlayer = z.infer<typeof publicPlayer>
export type ErrorKind = z.infer<typeof errorState>['error']

const connectingState = z.object({ type: z.literal('connecting') })

const lobbyState = z.object({
  type: z.literal('lobby'),
  can_start: z.boolean(),
})

const boardState = z.object({
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

const investigationResult = z.literal('Unknown').or(
  z.object({
    Role: role.optional(),
    Party: party.optional(),
  })
)

const playerState = z.object({
  type: z.literal('player'),
  name: z.string(),
  role: role,
  others: z.array(investigationResult),
  prompt: playerPrompt.nullable(),
})

const endedState = z.object({ type: z.literal('ended') })

const errorState = z.object({
  type: z.literal('error'),
  error: z.enum(['notfound', 'toomanyplayers', 'inprogress']),
})

const publicPlayer = z.object({
  name: z.string(),
  alive: z.boolean(),
  not_hitler: z.boolean(),
})

export const gameState = z.object({
  game_id: z.string(),
  name: z.string().nullable(),
  players: z.array(publicPlayer.passthrough()),
  state: z.discriminatedUnion('type', [
    connectingState,
    lobbyState,
    boardState,
    playerState,
    endedState,
    errorState,
  ]),
})
