# Skill : tests-dwwm

## Rôle

Écrire et documenter des tests adaptés au niveau DWWM : simples, ciblés sur l'essentiel, et défendables au jury.

## Quand l'utiliser

- Après avoir développé une fonctionnalité
- Pour valider qu'une route API fonctionne correctement
- Pour documenter les scénarios testés dans `docs/technical/TEST_PLAN.md`
- Quand le jury demande "comment avez-vous testé votre application ?"

## Niveau attendu

Tests manuels documentés obligatoires. Tests automatisés des routes API critiques si le temps le permet. Pas de coverage à 100%.

## Ce qu'on teste en priorité

1. L'authentification (inscription, connexion, routes protégées)
2. Les créations de données (session, carte, vote)
3. Les cas d'erreur principaux (token manquant, données invalides)

## Bonnes pratiques

- Toujours tester le cas nominal ET au moins un cas d'erreur
- Documenter les résultats dans `docs/technical/TEST_PLAN.md`
- Tester dans un environnement propre (BDD de test séparée si possible)
- Les bugs trouvés pendant les tests = preuves précieuses pour le jury

## Format test manuel

```
Fonctionnalité : Connexion
Scénario : Connexion avec un email inexistant
Entrée : POST /api/auth/login { email: "inconnu@test.com", password: "123456" }
Résultat attendu : 401 "Identifiants incorrects"
Résultat obtenu : 401 "Identifiants incorrects" ✅
Date : 2026-06-26
```

## Erreurs à éviter

- Tester uniquement le cas nominal
- Oublier de tester les routes sans token
- Ne pas documenter les bugs trouvés et corrigés
- Mélanger les données de test et les données de production
- Tester depuis le frontend seulement (tester l'API directement avec un client HTTP)

## Checklist de test d'une fonctionnalité

- [ ] Cas nominal testé et documenté
- [ ] Cas sans authentification testé (si route protégée)
- [ ] Cas de données invalides testé
- [ ] Résultats notés dans `docs/technical/TEST_PLAN.md`
- [ ] Bugs trouvés corrigés et documentés
