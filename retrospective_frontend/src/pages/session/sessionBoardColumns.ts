import type { SessionBoardColumn } from './types/board.types';

export const COLUMNS: Omit<SessionBoardColumn, 'title'>[] = [
  {
    key: 'start',
    emoji: '💡',
    color: '#d97706',
    dotClassName: 'bg-yellow-500',
    accentClassName: 'border-l-yellow-500',
    tabActiveClassName: 'border-yellow-500',
    emptyTitle: 'Aucune carte',
    emptyDescription: 'Ajoutez une première idée dans cette colonne…',
  }, {
    key: 'stop',
    emoji: '🚧',
    color: '#dc2626',
    dotClassName: 'bg-red-500',
    accentClassName: 'border-l-red-500',
    tabActiveClassName: 'border-red-500',
    emptyTitle: 'Aucune carte',
    emptyDescription: 'Ajoutez une première idée dans cette colonne…',
  },
  {
    key: 'continue',
    emoji: '✅',
    color: '#16a34a',
    dotClassName: 'bg-green-500',
    accentClassName: 'border-l-green-500',
    tabActiveClassName: 'border-green-500',
    emptyTitle: 'Aucune carte',
    emptyDescription: 'Ajoutez une première idée dans cette colonne…',
  },
];
