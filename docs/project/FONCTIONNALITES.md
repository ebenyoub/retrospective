# Fonctionnalités

> Description détaillée de chaque fonctionnalité. Complémenter avec les User Stories dans `USER_STORIES.md`.

## F01 — Inscription

**Description** : Un nouvel utilisateur peut créer un compte avec son email et son mot de passe.

**Règles métier** :
- L'email doit être unique
- Le mot de passe doit faire au moins 8 caractères
- Le mot de passe est hashé avec bcrypt avant stockage
- L'utilisateur reçoit un message de confirmation

**Écrans concernés** : Page inscription

---

## F02 — Connexion

**Description** : Un utilisateur existant peut se connecter et obtenir un token d'accès.

**Règles métier** :
- Vérification email + mot de passe hashé
- Génération d'un JWT signé (expiration : 24h)
- Token retourné au client et stocké côté frontend

**Écrans concernés** : Page connexion

---

## F03 — Déconnexion

**Description** : Un utilisateur connecté peut se déconnecter.

**Règles métier** :
- Suppression du token côté client
- Redirection vers la page de connexion

---

## F04 — Créer une session

**Description** : Un utilisateur connecté peut créer une nouvelle session de rétrospective.

**Règles métier** :
- La session a un nom obligatoire
- Le créateur devient automatiquement facilitateur
- La session démarre en statut "en attente"

**Écrans concernés** : Page liste des sessions → modal de création

---

## F05 — Lister ses sessions

**Description** : Un utilisateur peut voir toutes les sessions auxquelles il participe.

**Règles métier** :
- Affichage des sessions où l'utilisateur est facilitateur ou participant
- Tri par date de création (plus récent en premier)
- Statut visible (en attente / active / terminée)

**Écrans concernés** : Page liste des sessions

---

## F06 — Rejoindre une session

**Description** : Un participant peut rejoindre une session existante.

**Règles métier** :
- Via un code ou un lien (à préciser)
- L'utilisateur doit être connecté pour rejoindre
- Impossible de rejoindre une session terminée

---

## F07 — Ajouter une carte

**Description** : Un participant peut ajouter une carte dans une des trois colonnes.

**Colonnes disponibles** :
- Ce qui a bien marché (vert)
- Ce qui a posé problème (rouge)
- À améliorer (orange)

**Règles métier** :
- Contenu obligatoire, max 280 caractères
- L'auteur peut modifier et supprimer sa propre carte
- Visible par tous les participants de la session

---

## F08 — Voter pour une carte

**Description** : Un participant peut voter pour les cartes qui lui semblent importantes.

**Règles métier** :
- Chaque participant a un nombre de votes limité (ex: 5 votes)
- Un seul vote par carte par participant
- Les votes sont visibles par tous
- Impossible de voter pour sa propre carte (à décider)

---

## F09 — Vue des résultats

**Description** : Affichage des cartes triées par nombre de votes.

**Règles métier** :
- Accessible quand la session est en phase de vote ou terminée
- Tri décroissant par nombre de votes
- Mise en évidence des cartes les plus votées
