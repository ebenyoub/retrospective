# Skill : simple-architecture

## Rôle

Concevoir et maintenir une architecture technique simple, cohérente et adaptée au niveau DWWM. Résister à la tentation de la sur-ingénierie.

## Quand l'utiliser

- Avant de créer un nouveau fichier ou dossier
- Quand on hésite entre deux approches techniques
- Quand une solution proposée semble trop complexe
- Pour valider qu'une abstraction est vraiment utile

## Niveau attendu

Architecture MVC-like simple : contrôleurs, routes, composants, context. Pas de couches d'abstraction inutiles.

## Bonnes pratiques

- Un fichier = une responsabilité claire
- Un contrôleur par domaine fonctionnel (auth, sessions, cards, votes)
- Un Context par domaine d'état (AuthContext, SessionContext)
- Les hooks customs seulement si la logique est réutilisée 3+ fois
- Noms de fichiers explicites : ce qu'on lit dit ce que ça fait

## Erreurs à éviter

- Créer des dossiers `utils/` fourre-tout impossibles à naviguer
- Abstraire avant d'avoir le problème concret
- Ajouter des patterns (Factory, Strategy, Observer) non demandés
- Dupliquer la logique métier entre frontend et backend
- Mettre de la logique dans les composants React (ça va dans les hooks)

## Test de l'architecture

Poser ces 3 questions à chaque nouvelle structure :
1. Est-ce qu'un développeur qui découvre le projet trouve ce fichier en moins de 30 secondes ?
2. Est-ce que le nom du fichier/dossier dit clairement ce qu'il fait ?
3. Est-ce qu'on peut supprimer ce fichier sans casser autre chose si on n'en a plus besoin ?

## Checklist avant de créer un nouveau fichier

- [ ] Ce fichier a une seule responsabilité bien définie
- [ ] Le nom est explicite et cohérent avec les autres fichiers
- [ ] Il n'existe pas déjà un fichier qui fait la même chose
- [ ] Sa place dans l'arborescence est évidente
