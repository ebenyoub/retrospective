# Références des Maquettes Figma

Ce document sert de guide de référence pour garantir la fidélité de l'interface utilisateur (UI) avec les maquettes Figma d'origine de l'application **Range ta chambre**.

> [!IMPORTANT]
> Lors de toute modification ou correction de l'interface utilisateur (UI), les développeurs **doivent impérativement comparer** le rendu obtenu avec les captures d'écran ci-dessous pour éviter toute régression visuelle ou d'expérience utilisateur (UX).

---

## 1. Liste des captures d'écran disponibles

Les captures d'écran sont stockées dans le dossier [docs/design/screenshots/](file:///Users/ebenyoub/Developer/retrospective/docs/design/screenshots/).

### A. Maquette Desktop Rétrospective
* **Fichier** : [maquette_desktop_retro.png](file:///Users/ebenyoub/Developer/retrospective/docs/design/screenshots/maquette_desktop_retro.png)
* **Écran React concerné** : `src/pages/private/SessionDashboard.tsx` et ses sous-composants (`RetroColumn`, `RetroCardItem`, `RetroAddCardForm`).
* **Éléments critiques à respecter** :
  * Fond de page global bleu marine foncé (`#0f172a`).
  * En-tête globale (`Header`) : hauteur fixe (56px), couleur de fond `#1e293b`, bordure basse très fine `rgba(255,255,255,0.08)`, et le nom de l'application **« Range ta chambre »** écrit en gras avec la couleur verte `#16a34a`.
  * Disposition en grille 3 colonnes de large sur écran d'ordinateur.
  * Les colonnes de catégories (Positif, Négatif, Idées) doivent arborer leurs couleurs thématiques distinctives (bordures, pastilles, badges).
  * Les cartes de retour doivent posséder une bordure latérale gauche colorée selon leur catégorie.

### B. Maquette Mobile Rétrospective
* **Fichier** : [maquette_mobile_retro.png](file:///Users/ebenyoub/Developer/retrospective/docs/design/screenshots/maquette_mobile_retro.png)
* **Écrans React concernés** : `src/pages/private/SessionDashboard.tsx` (mode responsive), `src/components/Header.tsx` (mode mobile/wrap).
* **Éléments critiques à respecter** :
  * Empilement vertical fluide des colonnes (1 seule colonne visible à la fois sur écran étroit).
  * En-tête qui wrap proprement sans casser la mise en page.
  * Boutons d'action adaptés aux zones tactiles.

---

## 2. Règles pour les futures modifications UI
1. **Comparaison systématique** : Avant de soumettre une Pull Request contenant des modifications visuelles, comparez le résultat avec les captures d'écran Desktop et Mobile.
2. **Accessibilité** : Ne sacrifiez pas l'accessibilité (contraste des couleurs, labels de formulaires explicites, `aria-label` pour les boutons sans texte comme l'œil de mot de passe) pour le design.
3. **Respect des variables de thème** : Utilisez les classes Tailwind ou les variables du thème (`App.css`) plutôt que des valeurs de couleurs codées en dur.
