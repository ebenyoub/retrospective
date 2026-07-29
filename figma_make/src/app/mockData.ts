import { Card, Comment, Message, Participant, ActionItem } from "./types";

export const PARTICIPANTS: Participant[] = [
  { id: 1, name: "Elyas B.", avatarColor: "#6366f1", status: "online", isAdmin: true },
  { id: 2, name: "Nesrine A.", avatarColor: "#ec4899", status: "online", isAdmin: false },
  { id: 3, name: "Ressane K.", avatarColor: "#14b8a6", status: "away", isAdmin: false },
  { id: 4, name: "Lesli M.", avatarColor: "#f59e0b", status: "online", isAdmin: false },
  { id: 5, name: "Ihsan K.", avatarColor: "#8b5cf6", status: "away", isAdmin: false },
  { id: 6, name: "Sangeet P.", avatarColor: "#10b981", status: "online", isAdmin: false },
  { id: 7, name: "Fatima Z.", avatarColor: "#ef4444", status: "online", isAdmin: false },
];

export const INITIAL_CARDS: Card[] = [
  { id: 1, author: "Elyas B.", content: "Bonne ambiance dans l'équipe, communication fluide tout au long du sprint", votes: 7, category: "positif", votedByMe: false, commentCount: 3 },
  { id: 2, author: "Nesrine A.", content: "Les cérémonies agiles sont bien respectées, les rétrospectives sont utiles", votes: 5, category: "positif", votedByMe: false, commentCount: 1 },
  { id: 3, author: "Sangeet P.", content: "La revue technique de vendredi a permis de débloquer 3 tickets critiques", votes: 4, category: "positif", votedByMe: false, commentCount: 2 },
  { id: 4, author: "Ressane K.", content: "Trop de réunions imprévues viennent perturber la concentration en milieu de sprint", votes: 8, category: "negatif", votedByMe: false, commentCount: 5 },
  { id: 5, author: "Ihsan K.", content: "La documentation technique est systématiquement mise à jour trop tard", votes: 6, category: "negatif", votedByMe: false, commentCount: 2 },
  { id: 6, author: "Lesli M.", content: "Les critères d'acceptance ne sont pas toujours clairs lors du sprint planning", votes: 4, category: "negatif", votedByMe: false, commentCount: 4 },
  { id: 7, author: "Fatima Z.", content: "Mettre en place un kanban Notion partagé pour la visibilité temps réel", votes: 9, category: "idee", votedByMe: false, commentCount: 3 },
  { id: 8, author: "Elyas B.", content: "Organiser des sessions de pair-programming hebdomadaires de 45 minutes", votes: 6, category: "idee", votedByMe: false, commentCount: 1 },
  { id: 9, author: "Nesrine A.", content: "Ajouter un time-boxing strict de 15 min pour les daily standups", votes: 5, category: "idee", votedByMe: false, commentCount: 2 },
];

export const INITIAL_COMMENTS: Comment[] = [
  { id: 1, cardId: 1, author: "Nesrine A.", text: "Complètement d'accord, l'esprit d'équipe s'est vraiment amélioré ce sprint.", time: "14:30" },
  { id: 2, cardId: 1, author: "Sangeet P.", text: "Oui notamment lors du hackathon interne 🙌", time: "14:32" },
  { id: 3, cardId: 1, author: "Lesli M.", text: "+1 sur la communication, c'était fluide et sans friction.", time: "14:35" },
  { id: 4, cardId: 4, author: "Ressane K.", text: "La semaine dernière j'avais 4h de réunions le mardi, impossible de coder.", time: "14:40" },
  { id: 5, cardId: 4, author: "Elyas B.", text: "On devrait bloquer des créneaux « focus time » dans les agendas.", time: "14:42" },
  { id: 6, cardId: 4, author: "Ihsan K.", text: "Je propose qu'on instaure une règle : pas de réunion le matin avant 10h30.", time: "14:43" },
  { id: 7, cardId: 4, author: "Fatima Z.", text: "Bonne idée ! Et limiter les réunions à 30 min max.", time: "14:45" },
  { id: 8, cardId: 4, author: "Nesrine A.", text: "On peut utiliser un agenda partagé pour visualiser les créneaux dispo.", time: "14:46" },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 1, me: false, author: "Elyas B.", text: "Bonjour tout le monde, bienvenue dans cette rétrospective du Sprint 42 !", time: "14:00" },
  { id: 2, me: false, author: "Nesrine A.", text: "Contente d'être là 😊 On avait des sujets importants à discuter.", time: "14:01" },
  { id: 3, me: true, author: "Moi", text: "Bonjour ! Hâte de faire le bilan de ce sprint.", time: "14:02" },
  { id: 4, me: false, author: "Sangeet P.", text: "Est-ce que la rétro va commencer automatiquement quand tout le monde sera connecté ?", time: "14:05" },
  { id: 5, me: true, author: "Moi", text: "Oui, l'admin peut lancer manuellement aussi.", time: "14:06" },
];

export const INITIAL_ACTIONS: ActionItem[] = [
  { id: 1, description: "Bloquer des créneaux « focus time » de 2h le matin dans les agendas partagés", owner: "Elyas B.", deadline: "2026-06-13", priority: "high" },
  { id: 2, description: "Mettre en place un kanban Notion partagé avec les statuts en temps réel", owner: "Fatima Z.", deadline: "2026-06-20", priority: "high" },
  { id: 3, description: "Rédiger les ADR dès la fin de chaque sprint, avant la rétrospective", owner: "Ihsan K.", deadline: "2026-06-27", priority: "medium" },
  { id: 4, description: "Time-boxer les daily standups à 15 min avec un facilitateur tournant", owner: "Nesrine A.", deadline: "2026-06-13", priority: "medium" },
  { id: 5, description: "Organiser une session pair-programming hebdomadaire le jeudi 14h–15h", owner: "Sangeet P.", deadline: "2026-07-04", priority: "low" },
];
