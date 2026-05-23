# Guide de Débogage - Analytics & Réseau

## Problème Rapporté
Les graphiques et réseau ne s'affichent pas dans Analytics

## Flux de Données

### 1. **Optimisation lancée**
```
OptimisationTournees.jsx
  ↓ lancerOptimisation()
  ↓ POST /api/optimisations/multi-camions
  ↓ resultatOptimisation = response
  ↓ onOptimiser(resultat)
```

### 2. **Affichage du Tableau de Bord**
```
OptimisationTournees.jsx
  ↓ <TableauBordNew 
      optimisations={optimizations}  ← Du hook useOptimizationStorage
      resultatsOptimisation={resultatOptimisation}
    />
```

### 3. **Traitement des données**
```
TableauBordNew.jsx
  ↓ historyData = optimisations || []
  ↓ useEffect: console.log("📈 TableauBordNew - Data received", historyData)
  ↓ activeView === 'analytics' → affiche ChartSection
```

### 4. **Transformation pour les graphiques**
```
ChartSection.jsx
  ↓ chartData = historyData.map(opt => ({
      date: opt.timestamp || opt.date,
      gain: opt.gainPercentage,
      distance: opt.distanceTotale,
      cout: opt.coutTotal
    }))
  ↓ console.log("📊 ChartSection - Data received", chartData)
  ↓ ResponsiveContainer avec height="100%" et parent height: 250px
```

## Points de Vérification

### ✅ À faire dans la console du navigateur:

```javascript
// 1. Vérifier les données dans localStorage
JSON.parse(localStorage.getItem('optimization_history'))

// 2. Vérifier les logs console (ouvrir DevTools > Console)
// Chercher "📈 TableauBordNew" et "📊 ChartSection"

// 3. Vérifier les heights CSS
document.querySelectorAll('.chart-card-body').forEach(el => {
  console.log('Height:', el.style.height, 'Content:', el.innerHTML.length)
})

// 4. Vérifier si ResponsiveContainer rendu
document.querySelectorAll('.recharts-wrapper').length
```

### 🔍 Logs à chercher:

**OK ✅**
```
📈 TableauBordNew - Data received: {
  historyDataLength: 1,
  historyData: [{timestamp: "...", gainPercentage: 12.5, ...}],
  resultatsOptimisation: {...}
}

📊 ChartSection - Data received: {
  length: 1,
  data: [{date: "23 mai", gain: 12.5, distance: 150, cout: 5000}],
  isEmpty: false
}
```

**ERREUR ❌**
```
📈 TableauBordNew - Data received: {
  historyDataLength: 0,  ← VIDE!
  historyData: [],
  resultatsOptimisation: {...}
}
```

## Solutions Rapides

### Si historyData est vide:
```javascript
// Vérifier que processOptimizationResult a été appelé
// Dans OptimisationTournees.jsx, useEffect de resultatOptimisation

// Vérifier que addOptimization a sauvegardé
localStorage.getItem('optimization_history')
```

### Si ChartSection reçoit des données mais rien ne s'affiche:
1. Vérifier que `height: 250px` est appliqué au `.chart-card-body`
2. Vérifier que ResponsiveContainer a `height="100%"`
3. Ouvrir DevTools > Elements et chercher `.recharts-wrapper` vide

### Si les graphiques sont blancs:
1. Vérifier que les données ont des valeurs numériques (pas NaN)
2. Vérifier qu'au moins 1 donnée existe: `chartData.length > 0`
3. Vérifier les valeurs des données:
```javascript
// Dans ChartSection, avant de renvoyer:
console.table(data)
```

## Architecture de Stockage

**Hook: useOptimizationStorage**
- localStorage key: `optimization_history`
- Format: `[{id, timestamp, gainPercentage, distanceTotale, coutTotal, ...}, ...]`
- Max: 50 dernières optimisations

**Hook: useOptimizationIntegration**
- Transforme résultat API en format de stockage
- Appelle `addOptimization(optimizationRecord)`

**Composant: OptimisationTournees**
- Récupère `optimizations` du hook
- Passe à TableauBordNew

## Prochaines Étapes

1. Ouvrir la console du navigateur (F12)
2. Lancer une optimisation
3. Chercher les logs "📈" et "📊"
4. Partager les logs avec les détails de la structure des données
