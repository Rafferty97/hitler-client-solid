import { z } from 'zod'

export type Party = z.infer<typeof party>
export type Role = z.infer<typeof role>

export const party = z.enum(['Liberal', 'Fascist', 'Communist'])

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
