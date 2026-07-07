# Périmètre MVP

> Le MVP (Minimum Viable Product) est la version minimale qui permet de démontrer la valeur du produit.
> Pour le jury DWWM, le MVP doit couvrir les deux CCP du titre.

## Ce qui est dans le MVP

### Authentification (CCP2)
- [x] Inscription (email + mot de passe hashé bcrypt)
- [x] Connexion (retourne un JWT)
- [x] Déconnexion
- [ ] Protection des routes par middleware JWT

### Gestion des sessions (CCP1 + CCP2)
- [ ] Créer une session (facilitateur)
- [ ] Lister ses sessions
- [ ] Rejoindre une session existante

### Rétrospective (CCP1 + CCP2)
- [ ] Ajouter une carte dans une colonne
- [ ] Voir les cartes des autres participants
- [ ] Supprimer sa propre carte

### Votes (CCP1 + CCP2)
- [ ] Voter pour une carte (1 vote par carte, limite par participant)
- [ ] Voir le nombre de votes par carte

### Interface (CCP1)
- [ ] Page de connexion / inscription
- [ ] Page liste des sessions
- [ ] Page tableau de rétrospective
- [ ] Responsive basique (lisible sur mobile)

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
1. Un facilitateur peut créer une session et la partager
2. Des participants peuvent rejoindre, ajouter des cartes et voter
3. Le facilitateur peut voir les résultats triés par votes
4. L'authentification est fonctionnelle et sécurisée
5. Le tout est démontrable en direct devant le jury
