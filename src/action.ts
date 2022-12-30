export type PlayerAction =
  | {
      type:
        | 'EndNightRound'
        | 'EndCardReveal'
        | 'EndExecutiveAction'
        | 'VetoAgenda'
        | 'AcceptVeto'
        | 'RejectVeto'
        | 'StartAssassination'
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

export type BoardAction = {
  type:
    | 'EndVoting'
    | 'EndCardReveal'
    | 'EndExecutiveAction'
    | 'EndLegislativeSession'
    | 'EndAssassination'
}
