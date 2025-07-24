import { Party, Role } from '../dm/role'

export function partyForRole(role: Role): Party {
  switch (role) {
    case 'Liberal':
      return 'Liberal'
    case 'Fascist':
      return 'Fascist'
    case 'Communist':
      return 'Communist'
    case 'Hitler':
      return 'Fascist'
    case 'Monarchist':
      return 'Fascist'
    case 'Anarchist':
      return 'Communist'
    case 'Capitalist':
      return 'Liberal'
    case 'Centrist':
      return 'Liberal'
  }
}
