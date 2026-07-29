# Conventions du Projet

## Nommage

### Fichiers
- Composants React : `PascalCase.tsx` → `LoginForm.tsx`, `SessionCard.tsx`
- Hooks : `camelCase.ts` → `useAuth.ts`, `useSession.ts`
- Contrôleurs backend : `camelCase.controller.ts` → `auth.controller.ts`
- Routes backend : `camelCase.routes.ts` → `session.routes.ts`
- Fichiers utilitaires : `camelCase.ts` → `hashPassword.ts`

### Variables et fonctions
- `camelCase` pour les variables et fonctions
- `PascalCase` pour les composants React et les types/interfaces TypeScript
- `UPPER_SNAKE_CASE` pour les constantes globales

### Base de données
- Tables : `snake_case` au pluriel → `users`, `sessions`, `retro_cards`
- Colonnes : `snake_case` → `user_id`, `created_at`, `is_active`

## Structure des commits

Format simple et lisible :
```
feat: ajout du formulaire de connexion
fix: correction du bug de validation du token JWT
docs: mise à jour du schéma de base de données
style: formatage du composant SessionCard
refactor: simplification du contrôleur auth
test: ajout des tests de la route login
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`

## Workflow Git

```
main
└── production — jamais de développement direct, ne reçoit que des PR depuis dev

dev
└── intégration — toutes les fonctionnalités terminées y sont fusionnées

feature/nom-fonctionnalité
└── développement d'une seule fonctionnalité, part de dev

fix/nom-du-bug
└── correction d'un bug, part de dev (ou de main pour un hotfix urgent)

chore/nom-de-la-tache
└── outillage, config, dépendances, nettoyage — pas de code métier
```

### Règles

- Aucun commit direct sur `main` ni `dev` — tout passe par une branche `feature/*`, `fix/*` ou `chore/*`.
- Une branche = une fonctionnalité ou un correctif, cohérent avec la règle "un sujet à la fois" du projet.
- Toutes les fusions se font via **Pull Request**, jamais de merge local poussé directement.
- `main` ne reçoit que des Pull Requests provenant de `dev` (jamais directement depuis une `feature/*`).
- Le déploiement se déclenche uniquement depuis `main` (voir `docs/technical/DEPLOYMENT.md`).
- Le nom de la branche annonce le type de commit qu'elle contiendra (`feature/*` → commits `feat:`, `fix/*` → commits `fix:`, `chore/*` → commits `chore:`/`docs:`/`refactor:`).

### Checklist avant d'ouvrir une Pull Request

- [ ] La branche cible est la bonne (`feature/*`/`fix/*` → `dev`, jamais `main`)
- [ ] `npm run test` passe (frontend et/ou backend selon ce qui a été touché)
- [ ] `npm run build` passe côté frontend
- [ ] `docs/PROJECT_STATE.md` mis à jour si la fonctionnalité change l'état du projet

## Organisation du code

### Frontend — ordre dans un composant
1. Imports
2. Interface des props (si besoin)
3. Déclaration du composant
4. useState et useContext
5. useEffect
6. Fonctions internes
7. Return JSX

### Backend — ordre dans un contrôleur
1. Imports
2. Validation des entrées
3. Logique métier (appel BDD, vérifications)
4. Réponse HTTP

## Langue

- Code : anglais (variables, fonctions, types)
- Commentaires : français si nécessaires
- Messages d'erreur API : français
- Documentation : français

## Ce qu'on ne fait pas

- Pas de `console.log` laissés en production
- Pas de `any` TypeScript sans commentaire justificatif
- Pas de `TODO` laissés sans ticket associé
- Pas de secrets dans le code (utiliser les variables d'environnement)
