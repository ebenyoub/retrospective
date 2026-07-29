---
name: methodologie-agile-uml
description: Méthodologie de gestion de projet (Scrum/Agile) et modélisation UML telles qu'enseignées dans la formation d'Elyas (cours 08-Méthodes agiles SCRUM, 39-UML part 1, 40-UML part 2 - la-plateforme.io). À consulter avant de rédiger un backlog produit, des user stories, d'organiser un sprint, ou de produire un diagramme UML (cas d'utilisation, classes, séquence) pour un projet d'Elyas.
---

# Méthodologie agile & UML

Cours sources : 08-Méthodes agiles SCRUM, 39-UML part 1, 40-UML part 2.

## Scrum (cours 08)
- Triangle des contraintes : Ressources / Délais / Complexité — un projet ne peut garantir les trois à la fois.
- Rôles enseignés (aucun n'est "chef de projet") :
  - **Product Owner** : crée et priorise le Product Backlog et les User Stories, accepte/refuse les livrables.
  - **Scrum Master** : facilite la communication, fait estimer les US, veille au respect des principes Scrum.
  - **Team Member** : sélectionne les US du sprint, estime, découpe en tâches techniques, teste, livre.
- **User Story — format imposé** : `En tant que ... Je veux ... Afin de ...` (toujours expliciter la valeur apportée).
- **Sprint** : itération à durée fixe, définie en début de projet.
- 4 cérémonies :
  1. **Sprint Planning** : choix des US avec le PO (poker planning pour la complexité) puis découpage en tâches techniques SANS le PO.
  2. **Daily Meeting** : debout, max 1 min/personne — hier / aujourd'hui / blocages / humeur. On ne résout pas de problème pendant la réunion.
  3. **Sprint Review** : démo du livrable au client, recueil de feedback.
  4. **Rétrospective** : amélioration du fonctionnement interne de l'équipe.
- Règle importante donnée par la prof : **les points de complexité (poker planning) ne sont pas des charges** — ils sont indépendants du niveau d'expertise du développeur.
- Outil de suivi visuel cité : méthode Kanban (GitHub Project, Trello, Jira).

## UML — règles générales (cours 39/40)
- UML = langage de modélisation visuel (pas de code), pour l'architecture/conception. UML ≠ Merise.
- **Règle constante répétée par la prof** : un diagramme doit rester lisible et synthétique, pas exhaustif — mieux vaut multiplier les diagrammes que d'en surcharger un seul. Ajouter des notes en documentation annexe plutôt que d'alourdir le schéma.
- Outils recommandés : lucidchart.com, mermaid.js.org (diagrammes en markdown — pratique à combiner avec un dépôt Git).

### Diagramme de cas d'utilisation (use case)
- Répond à : à quoi sert le système ? qui interagit avec lui ? quelles sont ses limites ?
- Éléments : acteurs principaux (à gauche), système (rectangle central), acteurs externes (à droite, ex. API, passerelle de paiement).
- Relations : `<<include>>` (extension implicite, toujours) vs `<<extend>>` (extension possible, sous condition).
- Généralisation de rôle : utiliser l'héritage entre acteurs pour éviter la redondance (ex. `Client adhérent` hérite de `Client`) ; pour les cas complexes avec plusieurs héritages partagés, créer un acteur intermédiaire.

### Diagramme de classes
- Notation : nom de la classe en en-tête, attributs en partie supérieure, opérations en partie inférieure.
- Visibilité : `+` public, `-` privé, `#` protégé, `~` package.
- Héritage : flèche à pointe vide. Classe abstraite : nom en italique.
- Association : trait plein + verbe décrivant la relation. Multiplicité aux extrémités (`1`, `0..*`, `1..5`, etc.).
- **Règle donnée par la prof** : UML n'est pas une spécification de code — indiquer les opérations, pas l'implémentation des méthodes ; se concentrer sur la conception, pas les détails d'implémentation.

### Diagramme de séquence
- Prérequis pédagogique : avoir déjà un diagramme de cas d'utilisation ET un diagramme de classes avant de le faire.
- Éléments : acteurs/instances en tête (`nom : Classe`), ligne de vie verticale, appel d'opération (flèche pleine), retour (flèche pointillée), bloc vertical = temps d'exécution.
- Notations avancées : `alt [condition]` (branchement conditionnel), `loop` (répétition).
- Exemple donné en syntaxe **mermaid** (`sequenceDiagram`, `actor`, `participant`, `->>`, `-->>`, `alt/else/end`) — c'est l'outil que la prof utilise concrètement en exemple.

## Checklist avant de produire un livrable méthodo/UML
- [ ] Le backlog est-il écrit en vraies User Stories (`En tant que / Je veux / Afin de`) plutôt qu'en tâches techniques brutes ?
- [ ] Le diagramme UML reste-t-il lisible (pas de surcharge, quitte à en faire plusieurs) ?
- [ ] Pour un diagramme de classes : ai-je évité de spécifier l'implémentation des méthodes (juste la signature/opération) ?
- [ ] Pour un diagramme de séquence : les diagrammes de cas d'utilisation et de classes existent-ils déjà en amont ?
