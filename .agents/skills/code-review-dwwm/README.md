# Skill : code-review-dwwm

## Rôle

Relire du code avec les critères DWWM : lisibilité, sécurité de base, cohérence avec le projet, explicabilité à l'oral.

## Quand l'utiliser

- Avant chaque commit important
- Quand une fonctionnalité est terminée
- Pour valider qu'un code est défendable au jury
- Après avoir reçu un retour de Claude sur du code

## Niveau attendu

La relecture vise la qualité DWWM, pas la perfection. On cherche les vrais problèmes, pas les micro-optimisations.

## Bonnes pratiques

- Relire le code à voix haute — si c'est difficile à lire, c'est à simplifier
- Vérifier que chaque variable et fonction a un nom clair
- Vérifier que les cas d'erreur sont tous gérés
- Vérifier la sécurité sur les routes et les requêtes

## Ce qu'on vérifie

### Lisibilité
- [ ] Les noms de variables/fonctions sont clairs et explicites
- [ ] Les fonctions font une seule chose
- [ ] Pas de logique cachée ou de one-liners illisibles
- [ ] Pas de commentaires inutiles qui expliquent le "quoi" déjà visible dans le code

### Sécurité
- [ ] Pas de requête SQL par concaténation
- [ ] Mots de passe hashés, jamais en clair
- [ ] Routes sensibles protégées par le middleware auth
- [ ] Données sensibles non exposées dans les réponses API

### Cohérence
- [ ] Le style est cohérent avec le reste du code existant
- [ ] Pas de pattern introduit qui n'existe nulle part ailleurs
- [ ] Les conventions de nommage sont respectées (voir `docs/CONVENTIONS.md`)

### Explicabilité
- [ ] Je peux expliquer chaque ligne en 30 secondes à l'oral
- [ ] Pas de code "copié-collé de Stack Overflow" sans comprendre
- [ ] Pas de dépendance ajoutée sans savoir pourquoi

## Erreurs à éviter dans la revue

- Pinailler sur le style (espaces, guillemets) si un linter est configuré
- Proposer des optimisations prématurées
- Réécrire du code qui fonctionne correctement
- Critiquer des décisions déjà validées et documentées
