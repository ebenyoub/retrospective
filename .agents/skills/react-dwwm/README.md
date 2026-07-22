# Skill : react-dwwm

## Rôle

Développer des composants React + TypeScript simples, lisibles et adaptés au niveau DWWM.

## Quand l'utiliser

- Lors de la création d'un nouveau composant
- Lors de la création d'un hook custom
- Pour valider qu'un composant est assez simple
- Pour déboguer un problème de rendu ou d'état

## Niveau attendu

Composants fonctionnels React avec hooks natifs (useState, useEffect, useContext). TypeScript avec interfaces simples. Context API pour l'état global.

## Bonnes pratiques

- Un composant = un seul rôle visuel ou logique
- Props typées avec une interface TypeScript explicite
- useEffect avec ses dépendances correctement listées
- Gérer les états de chargement et d'erreur dans chaque composant
- Nommer les handlers `handleNomDeLAction` → `handleSubmit`, `handleChange`

## Structure d'un composant

```tsx
interface Props {
  title: string
  onAction: (id: number) => void
}

const MonComposant = ({ title, onAction }: Props) => {
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    onAction(1)
  }

  return (
    <div>
      <h2>{title}</h2>
      <button onClick={handleClick}>Agir</button>
    </div>
  )
}

export default MonComposant
```

## Erreurs à éviter

- Trop de `useState` dans un seul composant → extraire en hook custom
- Appels API directement dans le composant → aller dans un hook
- Props drilling à 3+ niveaux → utiliser un Context
- Oublier les dépendances dans useEffect
- Utiliser `any` TypeScript sans raison

## Checklist avant de committer un composant

- [ ] Le composant a un seul rôle
- [ ] Les props sont typées
- [ ] Les états de chargement et d'erreur sont gérés
- [ ] Pas d'appel API direct dans le return JSX
- [ ] Le composant est lisible sans commentaire
