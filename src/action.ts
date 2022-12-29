export type PlayerAction =
  | {
      type:
        | 'EndNightRound'
        | 'EndCardReveal'
        | 'EndExecutiveAction'
        | 'VetoAgenda'
        | 'AcceptVeto'
        | 'RejectVeto'
    }
  | {
      type: 'ChoosePlayer'
      name: string
    }
  | {
      type: 'CastVote'
      vote: boolean
    }
  | {
      type: 'Discard'
      index: number
    }
