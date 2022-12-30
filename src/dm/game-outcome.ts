import { z } from 'zod'

export type GameOutcome = z.infer<typeof gameOutcome>

export const gameOutcome = z.enum([
  'LiberalPolicyTrack',
  'FascistPolicyTrack',
  'CommunistPolicyTrack',
  'HitlerChancellor',
  'HitlerExecuted',
  'CapitalistExecuted',
])
