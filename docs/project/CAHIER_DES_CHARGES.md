# Cahier des Charges — Application Rétrospective

## 1. Contexte et besoin

Les équipes agiles pratiquant des sprints ont besoin d'un outil simple pour conduire leurs rétrospectives. Une rétrospective permet à l'équipe de s'exprimer sur ce qui a bien fonctionné, ce qui a posé problème, et ce qu'il faut améliorer.

Aujourd'hui, les équipes utilisent des post-its physiques ou des outils génériques non adaptés. L'objectif est de proposer une application web légère, facile d'accès, sans installation côté participant.

## 2. Objectifs

- Permettre à un facilitateur de créer et gérer des sessions de rétrospective
- Permettre aux participants de rejoindre une session et d'ajouter des cartes
- Permettre aux participants de voter sur les cartes
- Offrir une interface claire et simple d'utilisation

## 3. Utilisateurs cibles

| Rôle | Description |
|---|---|
| **Facilitateur** | Crée la session, la démarre et la clôture. Peut modérer les cartes. |
| **Participant** | Rejoint une session via un lien ou un code. Ajoute des cartes et vote. |

## 4. Fonctionnalités attendues

### Authentification
- Inscription avec email + mot de passe
- Connexion sécurisée (JWT)
- Déconnexion

### Sessions
- Création d'une session par un facilitateur
- Invitation de participants (par lien ou code)
- Démarrage et clôture de session

### Rétrospective
- Ajout de cartes dans 3 colonnes : Ce qui a bien marché / Ce qui a posé problème / À améliorer
- Modification et suppression de ses propres cartes (avant le vote)
- Phase de vote : chaque participant a un nombre limité de votes
- Vue synthèse des résultats

## 5. Contraintes techniques

- Application web accessible sur navigateur moderne (pas d'installation)
- Interface responsive (desktop et mobile)
- Données sécurisées (authentification requise)
- Base de données relationnelle (MySQL)
- API REST côté backend

## 6. Contraintes non fonctionnelles

- L'application doit démarrer en moins de 3 secondes
- Pas de données sensibles dans les logs
- Code versionné sur Git

## 7. Hors périmètre

- Intégration avec des outils tiers (Jira, Slack, etc.)
- Application mobile native
- Fonctionnalités temps réel avancées (WebSocket) — à évaluer
- Exports PDF automatiques
