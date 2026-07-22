# Skill : mysql-dwwm

## Rôle

Écrire des requêtes SQL lisibles et sécurisées, concevoir un schéma de base de données adapté au niveau DWWM.

## Quand l'utiliser

- Lors de la création d'une nouvelle table
- Lors de l'écriture d'une requête SQL
- Pour déboguer un problème de données
- Pour valider la sécurité des requêtes (injection SQL)

## Niveau attendu

SQL standard : SELECT, INSERT, UPDATE, DELETE, JOIN simple, clés étrangères. Pas de procédures stockées ni de triggers.

## Bonnes pratiques

- Toujours utiliser des paramètres préparés avec `?`
- Nommer les tables au pluriel en snake_case
- Toutes les tables ont `id`, `created_at`
- Indexer les clés étrangères
- Requêtes simples : un SELECT lisible vaut mieux qu'un sous-SELECT obscur

## Pattern de requête standard

```typescript
// Lecture
const [rows] = await db.execute(
  'SELECT id, name, status FROM sessions WHERE user_id = ?',
  [userId]
)

// Insertion
const [result] = await db.execute(
  'INSERT INTO retro_cards (content, column_type, session_id, user_id) VALUES (?, ?, ?, ?)',
  [content, columnType, sessionId, userId]
)
const newId = (result as ResultSetHeader).insertId

// Mise à jour
await db.execute(
  'UPDATE sessions SET status = ? WHERE id = ?',
  [status, sessionId]
)

// Suppression
await db.execute('DELETE FROM votes WHERE card_id = ? AND user_id = ?', [cardId, userId])
```

## Erreurs à éviter

- Construire des requêtes par concaténation de strings → injection SQL garantie
- Faire des SELECT * en production → sélectionner les colonnes nécessaires
- Oublier les clés étrangères → incohérence des données
- Jointures à 4+ tables → revoir le schéma ou découper la requête
- Oublier les index sur les colonnes de recherche fréquente

## Checklist avant de committer une requête

- [ ] Paramètres préparés utilisés (pas de concaténation)
- [ ] Colonnes explicitement listées dans le SELECT (pas de *)
- [ ] La requête est testée manuellement avec des données réelles
- [ ] Le cas "aucun résultat" est géré dans le contrôleur
- [ ] Pas de données sensibles exposées dans le résultat
