# Questions Jury — Préparation à l'oral

> S'entraîner à répondre à ces questions à l'oral. La réponse doit être claire, courte (1-2 minutes) et sans hésitation.

## Questions générales sur le projet

**Pourquoi avez-vous choisi de faire une application de rétrospective ?**
→ Répondre avec le contexte réel (besoin personnel, utilisation en formation, etc.)

**Quelles sont les fonctionnalités principales de votre application ?**
→ Lister 3-4 fonctionnalités clés et les démontrer en direct.

**Qui sont les utilisateurs de votre application ?**
→ Équipes agiles, facilitateurs et participants à une rétrospective.

---

## Questions sur le front-end

**Pourquoi avez-vous choisi React ?**
→ Composants réutilisables, gestion de l'état, écosystème mature, adapté aux interfaces dynamiques.

**Comment gérez-vous l'état global dans votre application ?**
→ Avec le Context API. Expliquer comment `AuthContext` gère l'utilisateur connecté.

**C'est quoi un hook custom ? Pourquoi en avez-vous créé ?**
→ Fonction qui commence par `use`, encapsule de la logique réutilisable. Montrer un exemple concret.

**Comment fonctionne votre authentification côté client ?**
→ Le token JWT est stocké dans le Context (ou localStorage), envoyé dans les headers de chaque requête.

**Comment assurez-vous que les formulaires sont sécurisés ?**
→ Validation côté client (UX) + validation obligatoire côté serveur (sécurité).

---

## Questions sur le back-end

**Pourquoi Node.js avec Express ?**
→ JavaScript full-stack, leger, adapté aux API REST, cohérent avec le frontend.

**Comment fonctionne votre système d'authentification ?**
→ L'utilisateur s'identifie, le serveur génère un JWT signé. Le client l'envoie dans chaque requête. Le middleware vérifie la signature.

**Qu'est-ce que bcrypt et pourquoi l'utilisez-vous ?**
→ Bibliothèque de hachage. Les mots de passe ne sont jamais stockés en clair. bcrypt ajoute un sel et est lent par conception pour résister aux attaques.

**Pourquoi du SQL direct plutôt qu'un ORM ?**
→ Lisibilité, contrôle, pas de magie cachée. Les requêtes sont compréhensibles et vérifiables directement.

**Comment protégez-vous vos routes ?**
→ Middleware `authMiddleware` qui vérifie le JWT avant d'exécuter le contrôleur.

---

## Questions sur la base de données

**Expliquez votre schéma de base de données.**
→ Montrer le schéma. Expliquer les relations entre les tables, les clés étrangères.

**Comment évitez-vous les injections SQL ?**
→ Requêtes paramétrées avec `?`. Jamais de concaténation de strings pour construire une requête.

**Pourquoi avez-vous choisi MySQL ?**
→ Base de données relationnelle, données structurées avec des relations claires, standard en entreprise.

---

## Questions sur la sécurité

**Quelles mesures de sécurité avez-vous mises en place ?**
→ bcrypt, JWT, validation des entrées, requêtes paramétrées, CORS configuré.

**C'est quoi CORS et pourquoi c'est important ?**
→ Cross-Origin Resource Sharing. Limite les domaines qui peuvent appeler l'API. Sans configuration, le navigateur bloque les requêtes cross-origin.

**Où stockez-vous vos secrets (clés JWT, mots de passe BDD) ?**
→ Dans les variables d'environnement (fichier `.env` non versionné).

---

## Questions pièges à éviter

**Vous utilisez TypeScript mais j'ai vu des `any` dans votre code, pourquoi ?**
→ Savoir justifier chaque `any` ou reconnaître que c'est une dette technique.

**Vos tests couvrent combien de % de votre code ?**
→ Être honnête sur le niveau de test, expliquer ce qui est testé et pourquoi.

**Comment déploieriez-vous cette application en production ?**
→ Voir `docs/technical/DEPLOYMENT.md` — avoir une réponse préparée.
