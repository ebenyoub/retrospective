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

> Ajouter une entrée à chaque fois qu'une décision technique importante est prise.
