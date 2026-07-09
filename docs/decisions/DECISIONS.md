# Journal des Décisions Techniques

> Chaque choix technique important est documenté ici avec sa justification.
> Format : Date — Décision — Pourquoi — Alternatives considérées

---

## 2026-06-26 — Stack technique

**Décision** : React + TypeScript + Vite pour le frontend, Node.js + Express + TypeScript pour le backend, MySQL pour la base de données.

**Pourquoi** : Stack moderne, couvrant les deux CCP du titre DWWM. TypeScript ajoute la sécurité du typage sans complexité excessive. MySQL est un SGBD relationnel standard en entreprise.

**Alternatives considérées** :
- Next.js → rejeté (trop opinionné, complexité SSR inutile pour ce projet)
- PostgreSQL → possible mais MySQL est plus courant en formation DWWM
- MongoDB → rejeté (données relationnelles, SQL est plus pertinent pour le jury)

---

## 2026-06-26 — Authentification JWT

**Décision** : Authentification stateless par JWT, sans refresh token pour la V1.

**Pourquoi** : Simple à implémenter et à expliquer. Le JWT contient l'identité de l'utilisateur, pas besoin de vérifier la BDD à chaque requête. Expiration à 24h acceptable pour un usage interne.

**Alternatives considérées** :
- Sessions en base de données → plus complexe, besoin de table de sessions
- Refresh tokens → trop complexe pour le MVP, peut être ajouté en V2

---

## 2026-06-26 — Pas d'ORM

**Décision** : Requêtes SQL directes avec le driver MySQL2, pas d'ORM.

**Pourquoi** : Les requêtes SQL sont lisibles, compréhensibles, et explicables à l'oral. Un ORM ajoute une couche d'abstraction que le jury pourrait questionner sans que le candidat maîtrise le SQL sous-jacent.

**Alternatives considérées** :
- Prisma → rejeté (génération de code, migrations complexes, difficile à expliquer)
- Sequelize → rejeté (API verbeuse, concepts ORM à maîtriser en plus)

---

## 2026-06-26 — Context API (pas de Redux)

**Décision** : Utiliser le Context API natif de React pour l'état global.

**Pourquoi** : Suffisant pour l'échelle de ce projet. Natif React, sans dépendance supplémentaire, compréhensible sans connaissance de Redux.

**Alternatives considérées** :
- Redux → trop complexe, boilerplate excessif pour ce projet
- Zustand → possible mais ajoute une dépendance sans valeur ajoutée significative

---

## 2026-07-09 — Syntaxe Zod v4 pour les validateurs

**Décision** : Migrer les validateurs backend (`src/validators/`) de la syntaxe Zod v3 (`required_error`, `errorMap`) vers le paramètre unifié `error` de Zod v4.

**Pourquoi** : Le projet installe Zod 4.4.3 mais les validateurs utilisaient la syntaxe v3, ce qui provoquait 17 erreurs `npx tsc --noEmit`. La syntaxe v4 est plus simple (un seul paramètre `error`) et supprime toute la dette TypeScript backend. Les messages en français sont conservés à l'identique et couverts par des tests.

**Alternatives considérées** :
- Rétrograder vers Zod 3 → rejeté (retour en arrière, dépendance vieillissante)
- Ignorer les erreurs tsc → rejeté (dette potentiellement bloquante pour la soutenance, tsc doit rester une vérification fiable)

---

## 2026-07-09 — Protection des routes privées avec un composant `RequireAuth`

**Décision** : Les routes privées (`/profile`, `/sessions`, `/session`, `/session/:id`) sont enveloppées dans un composant `RequireAuth` qui redirige vers `/login` si l'utilisateur n'est pas connecté.

**Pourquoi** : Les tests manuels du 2026-07-09 ont montré que `/profile` restait accessible (vide) après déconnexion. Un composant de garde unique est la solution React Router standard, simple à expliquer au jury : « si pas connecté, on redirige ».

**Alternatives considérées** :
- Redirection dans un `useEffect` de chaque page (existant sur `SessionDashboard`) → rejeté comme solution générale (duplication sur chaque page, la page s'affiche brièvement avant la redirection)
- Layout route parent avec `<Outlet />` → équivalent, mais le wrapper par route est plus explicite à l'oral

---

> Ajouter une entrée à chaque fois qu'une décision technique importante est prise.
