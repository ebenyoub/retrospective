# Périmètre MVP

> Le MVP (Minimum Viable Product) est la version minimale qui permet de démontrer la valeur du produit.
> Pour le jury DWWM, le MVP doit couvrir les deux CCP du titre.

## Ce qui est dans le MVP

### Authentification (CCP2)
- [x] Inscription (email + mot de passe hashé bcrypt)
- [x] Connexion (retourne un JWT)
- [x] Déconnexion
- [x] Protection des routes par middleware JWT

### Gestion des sessions (CCP1 + CCP2)
- [x] Créer une session (facilitateur)
- [x] Lister ses sessions
- [x] Rejoindre une session existante

### Rétrospective (CCP1 + CCP2)
- [x] Ajouter une carte dans une colonne
- [x] Voir les cartes des autres participants
- [x] Modifier sa propre carte
- [x] Supprimer sa propre carte

### Votes (CCP1 + CCP2)
- [x] Voter pour une carte (1 vote par carte, limite de 5 votes par session)
- [x] Voir le nombre de votes par carte

### Interface (CCP1)
- [x] Page de connexion / inscription
- [x] Page liste des sessions
- [x] Page tableau de rétrospective (+ vue résultats triée par votes)
- [x] Responsive basique (lisible sur mobile)

## Ce qui est hors MVP (pour une V2)

- Invitations par email
- Anonymat des cartes
- Minuteur de session
- Export des résultats
- Notifications temps réel
- Historique détaillé par session
- Statistiques et tendances

## Critère de validation du MVP

Le MVP est considéré terminé quand :
1. Un facilitateur peut créer une session et la partager — ✅ fait (rejoindre par code)
2. Des participants peuvent rejoindre, ajouter des cartes et voter — ✅ fait
3. Le facilitateur peut voir les résultats triés par votes — ✅ fait
4. L'authentification est fonctionnelle et sécurisée — ✅ fait
5. Le tout est démontrable en direct devant le jury — dépend de la préparation orale, pas un critère de code ; à vérifier : `.env` backend à recréer localement avant toute démo (voir `docs/TODO.md`)

**État au 2026-07-08** : le cœur métier et le responsive basique du MVP sont complets au niveau du code. Il reste à merger les PR après review et à préparer l'environnement de démonstration (`.env` backend à recréer).
