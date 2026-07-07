# User Stories

Format : **En tant que** [rôle], **je veux** [action], **afin de** [bénéfice].

---

## Authentification

**US-01** — En tant que visiteur, je veux créer un compte avec mon email et un mot de passe, afin d'accéder à l'application.
- Critères d'acceptation :
  - Le formulaire valide l'email et la longueur du mot de passe
  - Un message d'erreur s'affiche si l'email est déjà utilisé
  - L'utilisateur est redirigé vers ses sessions après inscription

**US-02** — En tant qu'utilisateur, je veux me connecter avec mon email et mot de passe, afin d'accéder à mes sessions.
- Critères d'acceptation :
  - Un message d'erreur s'affiche si les identifiants sont incorrects
  - L'utilisateur est redirigé vers ses sessions après connexion
  - Le token est conservé entre les rechargements de page

**US-03** — En tant qu'utilisateur connecté, je veux me déconnecter, afin de sécuriser mon accès.
- Critères d'acceptation :
  - Le token est supprimé
  - L'utilisateur est redirigé vers la page de connexion
  - Les routes protégées ne sont plus accessibles

---

## Sessions

**US-04** — En tant que facilitateur, je veux créer une session de rétrospective, afin de préparer une réunion d'équipe.
- Critères d'acceptation :
  - Je peux saisir un nom pour la session
  - La session apparaît dans ma liste
  - Je suis automatiquement désigné comme facilitateur

**US-05** — En tant qu'utilisateur, je veux voir la liste de mes sessions, afin de savoir où j'en suis.
- Critères d'acceptation :
  - Je vois les sessions dont je suis facilitateur et participant
  - Je vois le statut de chaque session
  - Je peux cliquer pour accéder à une session

**US-06** — En tant que participant, je veux rejoindre une session via un lien ou un code, afin de participer à la rétrospective.
- Critères d'acceptation :
  - Je dois être connecté pour rejoindre
  - Je vois la session dans ma liste après l'avoir rejointe
  - Je ne peux pas rejoindre une session terminée

---

## Tableau de rétrospective

**US-07** — En tant que participant, je veux ajouter une carte dans une colonne, afin de partager mon ressenti sur le sprint.
- Critères d'acceptation :
  - Je choisis la colonne (bien / problème / à améliorer)
  - Ma carte apparaît pour tous les participants
  - Je peux modifier ou supprimer ma propre carte

**US-08** — En tant que participant, je veux voter pour des cartes importantes, afin d'indiquer les sujets prioritaires.
- Critères d'acceptation :
  - J'ai un nombre de votes limité
  - Je ne peux pas voter deux fois pour la même carte
  - Le nombre de votes est visible par tous

**US-09** — En tant que facilitateur, je veux voir les cartes triées par votes, afin de prioriser la discussion.
- Critères d'acceptation :
  - Vue triée par nombre de votes décroissant
  - Les cartes sans votes apparaissent en dernier
  - Accessible en phase de vote et après clôture

---

## Priorités

| Priorité | User Stories |
|---|---|
| Must have (MVP) | US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-08, US-09 |
| Should have | — |
| Could have | Invitations par email, anonymat des cartes |
| Won't have (V1) | Notifications temps réel, exports |
