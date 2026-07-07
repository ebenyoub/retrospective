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
