# Plan de Tests

## Stratégie de test

Pour ce projet DWWM, on adopte une stratégie pragmatique :
- Tests manuels documentés pour toutes les fonctionnalités
- Tests automatisés sur les routes API critiques (si temps disponible)
- Pas de couverture à 100% — focus sur les chemins critiques

## Fonctionnalités à tester

### F01 — Inscription
| Scénario | Entrée | Résultat attendu | Statut |
|---|---|---|---|
| Inscription valide | Email unique + mdp 8 chars | 201, utilisateur créé | ⬜ |
| Email déjà utilisé | Email existant | 400, message d'erreur | ⬜ |
| Mot de passe trop court | mdp < 8 chars | 400, message d'erreur | ⬜ |
| Email invalide | "pasune email" | 400, message d'erreur | ⬜ |
| Champs vides | Corps vide | 400, message d'erreur | ⬜ |

### F02 — Connexion
| Scénario | Entrée | Résultat attendu | Statut |
|---|---|---|---|
| Connexion valide | Email + mdp corrects | 200, token JWT | ⬜ |
| Mot de passe incorrect | Bon email, mauvais mdp | 401, message d'erreur | ⬜ |
| Email inexistant | Email inconnu | 401, message d'erreur | ⬜ |
| Champs vides | Corps vide | 400, message d'erreur | ⬜ |

### F04 — Créer une session
| Scénario | Entrée | Résultat attendu | Statut |
|---|---|---|---|
| Création valide | Nom de session + token | 201, session créée | ⬜ |
| Sans authentification | Pas de token | 401, accès refusé | ⬜ |
| Nom vide | name: "" | 400, message d'erreur | ⬜ |

### F07 — Ajouter une carte
| Scénario | Entrée | Résultat attendu | Statut |
|---|---|---|---|
| Carte valide | Contenu + colonne | 201, carte créée | ⬜ |
| Colonne invalide | column: "blabla" | 400, message d'erreur | ⬜ |
| Contenu vide | content: "" | 400, message d'erreur | ⬜ |
| Sans authentification | Pas de token | 401, accès refusé | ⬜ |

### F08 — Voter
| Scénario | Entrée | Résultat attendu | Statut |
|---|---|---|---|
| Vote valide | Card id + token | 200, vote enregistré | ⬜ |
| Double vote | Même carte, même utilisateur | 400, déjà voté | ⬜ |
| Limite de votes atteinte | Plus de votes disponibles | 400, limite atteinte | ⬜ |

## Tests d'interface (manuels)

Pour chaque page, vérifier :
- [ ] L'affichage est correct sur desktop (1280px)
- [ ] L'affichage est lisible sur mobile (375px)
- [ ] Les formulaires affichent les erreurs de validation
- [ ] Les états de chargement sont présents
- [ ] La navigation fonctionne correctement

## Bugs trouvés et corrigés

> À compléter au cours du développement — précieux pour le jury.

| Date | Bug | Impact | Correction |
|---|---|---|---|
| — | — | — | — |
