---
name: sql-bases-de-donnees
description: Conventions SQL/MySQL et méthode de modélisation de base de données (Merise) telles qu'enseignées dans la formation d'Elyas (cours 25-SQL Intro, 26-SQL Avancé, 27-SQL Modélisation DB - la-plateforme.io). À consulter systématiquement avant d'écrire une requête SQL, de créer un schéma de base de données, ou de modéliser des relations entre tables pour un projet d'Elyas.
---

# SQL & Bases de données

Cours sources : 25-SQL Intro, 26-SQL Avancé, 27-SQL Modélisation DB. SGBD enseigné : **MySQL**.

## Vocabulaire
Table, champ/colonne/attribut, ligne/tuple, clé primaire (identifiant unique).

## Requêtes de base
```sql
CREATE DATABASE nom_projet;
CREATE TABLE student (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  firstname VARCHAR(100),
  lastname VARCHAR(150),
  birthday DATE,
  address TEXT
);
INSERT INTO student (firstname, lastname, birthday) VALUES ('Arthur', 'Pendragon', '1984-01-22');
SELECT firstname, lastname FROM student WHERE firstname = 'Arthur';
UPDATE school SET capacity = 24 WHERE city = 'Orléans';
DELETE FROM student WHERE firstname = 'Perceval';
```
- **Règle explicite de la prof** : dans un `UPDATE`/`DELETE`, privilégier un filtre sur l'`id` pour cibler une ligne unique de façon sûre.
- `TRUNCATE TABLE` (vide les données) vs `DROP TABLE` (supprime la table entière).
- `ALTER TABLE table DROP/ADD/MODIFY colonne` pour modifier le schéma après création.
- Administration : `CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';`, `GRANT ... ON db(.table) TO 'user'@'localhost';`. **Règle explicite : ne jamais utiliser le user `root` en production.**

## WHERE avancé et fonctions (cours 26)
- `LIKE '%motif%'` (le `%` est un joker ; MySQL est insensible à la casse), `BETWEEN x AND y`, `IN (...)`, `IS NULL` / `IS NOT NULL`.
- **Requêtes imbriquées déconseillées par la prof** : préférer les jointures.
- `SELECT DISTINCT(champ)` pour éliminer les doublons.
- Fonctions chaînes : `CONCAT()`, `LENGTH()`, `REPLACE()`, `SUBSTRING()`, `TRIM()`. Alias : `AS` — un champ généré par `AS` ne peut pas être réutilisé dans un `WHERE` (il faut réécrire la fonction).
- Fonctions math/dates : `ROUND()`, `RAND()`, `NOW()`, `YEAR()`, `MONTH()`, `DAY()`, `DATEDIFF()`.
- Agrégation : `COUNT()`, `SUM()`, `MAX()`, `MIN()`, `AVG()`.
- `GROUP BY champ` pour regrouper + agréger ; `HAVING` pour filtrer après un `GROUP BY` (le `WHERE` ne peut pas filtrer sur un agrégat).

## Jointures
```sql
SELECT st.firstname, st.lastname, sc.city
FROM student AS st
JOIN school AS sc ON sc.id = st.school_id
WHERE sc.city = 'Bordeaux';
```
- `(INNER) JOIN` : la plus utilisée, ne renvoie que les correspondances communes.
- `LEFT JOIN` : tout de la table de gauche même sans correspondance (`NULL` sinon).
- `RIGHT JOIN` : tout de la table de droite même sans correspondance.
- **`FULL OUTER JOIN` n'existe pas en MySQL** (précision explicite de la prof).
- `UNION` : cumule les résultats de deux requêtes, élimine les doublons par défaut (`UNION ALL` pour les garder).

## Modélisation — méthode Merise (cours 27)
1. **MCD** (Modèle Conceptuel de Données) : entités, propriétés, associations nommées par un verbe, cardinalités (min,max) de chaque côté — valeurs typiques `0`, `1`, `n`.
2. **MLD** (Modèle Logique) : on ne garde que les entités ; on compare les cardinalités max des deux côtés :
   - **One To One** (1,1)
   - **Many To One** (1,n) → ajouter une **clé étrangère côté "1"** référençant l'id de la table côté "n".
   - **Many To Many** (n,m) → créer une **table de jointure** contenant les deux clés étrangères (leur couple peut servir de clé primaire composite).
3. **MPD** (Modèle Physique) : types concrets (`INT`, `VARCHAR`, `BOOL`...) et contraintes (`unique`, `nullable`, auto-incrémentation) propres au SGBD.

### Contraintes d'intégrité (règle importante)
```sql
FOREIGN KEY (school_id) REFERENCES school(id)
  ON DELETE CASCADE
  ON UPDATE NO ACTION;
```
Sans contrainte, supprimer un parent laisse des enfants orphelins. Sans option, la suppression est refusée si des enfants existent. `CASCADE` supprime automatiquement les enfants associés.

### Outils de modélisation cités
Papier/crayon (premier jet), MySQL Workbench, PhpMyAdmin, dbdiagram.io, drawsql.app, quickdatabasediagrams.com.

## Checklist avant d'écrire du SQL ou de modéliser une BDD
- [ ] Le schéma est-il passé par les 3 étapes Merise (MCD → MLD → MPD) avant d'écrire le `CREATE TABLE` ?
- [ ] Les relations Many-to-Many passent-elles bien par une table de jointure ?
- [ ] Les `UPDATE`/`DELETE` filtrent-ils sur un `id` plutôt qu'un champ ambigu ?
- [ ] Les contraintes `FOREIGN KEY` avec `ON DELETE`/`ON UPDATE` sont-elles définies explicitement ?
- [ ] Aucune requête n'utilise le user `root` en production ?
