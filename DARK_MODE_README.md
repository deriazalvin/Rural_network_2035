# 🌙 Mode Nuit Global & Logo RN Integration

## 📋 Vue d'ensemble

Le projet Rural Network 2035 a été amélioré avec :
- **Mode Nuit Global** : Bascule entre thème clair et sombre pour toute l'application
- **Logo RN** : Logo animé intégré dans le header de l'application
- **Design Système Complet** : Tous les composants UI supportent maintenant le dark mode

---

## 🎨 Fonctionnalités Principales

### 1. **Mode Nuit Global**

Le mode nuit s'applique à :
- ✅ Tous les composants de l'interface
- ✅ Les formulaires et champs de saisie
- ✅ Les tableaux et cartes de statistiques
- ✅ Les modales et alertes
- ✅ La navigation et le header

**Activation** : Cliquez sur le bouton "Nuit" / "Clair" dans la navbar

### 2. **Logo RN Intégré**

Le logo RN est maintenant affiché dans le header avec :
- Animation de gradient flottant sur les lettres R et N
- Point pulsant au centre
- Anneau rotatif autour du logo
- Année "2035" affichée en dessous
- Responsive (s'adapte à toutes les tailles d'écran)

### 3. **Persistance du Thème**

Le thème préféré de l'utilisateur est :
- Sauvegardé dans le localStorage
- Restauré au prochain chargement de la page
- Clé utilisée : `rn-theme`

---

## 🏗️ Architecture Technique

### Theme Context

```javascript
// Utilisation dans n'importe quel composant
import { useTheme } from './contexts/ThemeContext.jsx';

function MyComponent() {
  const { darkMode, setDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? '☀️ Mode Clair' : '🌙 Mode Nuit'}
    </button>
  );
}
```

### Variables CSS Dark Mode

Les variables de thème sont définies dans :
- `styles.css` : Variables principals (bg, text, borders)
- `globals.css` : Variables Tailwind (avec support data-theme)
- `landing.css` : Variables spécifiques à la LandingPage

**Exemple** :
```css
:root {
  --vert-principal: #2d5016;
  --beige: #f5f1e8;
}

[data-theme='dark'] {
  --vert-principal: #1a2d0a;
  --beige: #0f0f0f;
}
```

### Composants UI Dark Mode

Tous les composants du système de design supportent le dark mode :

| Composant | Variants | Dark Support |
|-----------|----------|-------------|
| Card | default, elevated, glass | ✅ Avec 'dark:' classes |
| Button | primary, secondary, danger, ghost | ✅ Avec gradients inversés |
| Input | text, number, email, etc | ✅ Avec dark backgrounds |
| Select | Dropdown personnalisé | ✅ Dark backgrounds |
| Badge | 7 couleurs | ✅ Dark color variants |
| Alert | 4 types | ✅ Dark severity colors |
| Modal | 3 tailles | ✅ Dark transparencies |
| Table | Rows, headers | ✅ Dark row highlighting |
| StatCard | 5 couleurs | ✅ Dark stat backgrounds |

---

## 📂 Fichiers Modifiés

### Nouvellement Créés
```
src/contexts/ThemeContext.jsx          ← Context global de thème
src/composants/LogoRN.jsx               ← Logo réutilisable
```

### Modifiés Existants
```
src/main.jsx                            ← Wrap avec ThemeProvider
src/App.jsx                             ← Intégration logo + toggle
src/styles/styles.css                   ← CSS dark mode variables
src/styles/globals.css                  ← Support data-theme
src/composants/ui/*.jsx                 ← Dark mode (Card, Button, Input, etc.)
```

---

## 🎯 Utilisation

### Activer/Désactiver le Mode Nuit

1. **Via le bouton navbar** :
   - Cliquez sur "Nuit" ou "Clair" dans la barre de navigation
   - Le thème change instantanément

2. **Via le code** :
```javascript
const { toggleDarkMode } = useTheme();
toggleDarkMode(); // Bascule le thème
```

### Accéder à l'état du thème

```javascript
const { darkMode } = useTheme();

if (darkMode) {
  console.log('Mode nuit actif');
} else {
  console.log('Mode clair actif');
}
```

### Styling Conditionnel

```javascript
// Tailwind dark mode
<div className="bg-white dark:bg-gray-900">
  Contenu
</div>

// CSS variables
<div style={{ color: 'var(--text)' }}>
  Utilise la couleur de texte du thème courant
</div>
```

---

## 🎨 Palette de Couleurs

### Mode Clair
- **Fond** : Blanc (#ffffff)
- **Texte** : Gris foncé (#1d1d1f)
- **Bordures** : Gris clair (#e5e5ea)
- **Accent** : Cyan (#00d4ff)

### Mode Nuit
- **Fond** : Noir (#000000)
- **Texte** : Blanc (#ffffff)
- **Bordures** : Gris semi-transparent
- **Accent** : Cyan lumineux (#00d4ff)

---

## 🔧 Personnalisation

### Ajouter un nouveau composant avec Dark Mode

1. Utiliser les classes Tailwind `dark:` :
```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Votre contenu
</div>
```

2. Ou utiliser les CSS variables :
```jsx
<div style={{ 
  backgroundColor: 'var(--bg)',
  color: 'var(--text)'
}}>
  Votre contenu
</div>
```

### Modifier les couleurs du dark mode

Modifier dans `styles.css` :
```css
[data-theme='dark'] {
  --vert-principal: #1a2d0a;      /* Votre couleur */
  --beige: #0f0f0f;                /* Votre couleur */
  /* ... etc */
}
```

---

## 💡 Bonnes Pratiques

1. **Toujours tester en mode nuit** :
   - Les contrastes doivent rester lisibles
   - Les images doivent être visibles

2. **Utiliser les variables CSS** :
   - Pour les couleurs cohérentes entre thèmes
   - Plutôt que des couleurs en dur

3. **Préférer Tailwind dark mode** :
   - `dark:` classes se mettent à jour automatiquement
   - Plus facile à maintenir

4. **Persister le choix utilisateur** :
   - Le ThemeContext gère déjà localStorage
   - Pas besoin de re-implémenter

---

## 🐛 Dépannage

### Le mode nuit ne s'applique pas

1. Vérifier que ThemeProvider enveloppe l'App :
```jsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

2. Vérifier que les classes Tailwind utilisent le préfixe `dark:` :
```jsx
<div className="bg-white dark:bg-gray-900">
```

3. Vérifier la console pour les erreurs du contexte

### Le logo RN n'apparaît pas

1. Vérifier que LogoRN.jsx est importé :
```jsx
import LogoRN from './composants/LogoRN.jsx';
```

2. Vérifier que landing.css est inclus (pour les animations)

3. Vérifier la taille du logo :
```jsx
<LogoRN size="lg" showText={true} />
```

---

## 📱 Responsive

Le mode nuit et le logo RN s'adaptent à tous les appareils :
- **Desktop** : Logo grande taille (lg), full layout
- **Tablet** : Logo taille moyenne (md)
- **Mobile** : Logo petite taille (sm), layout compact

---

## ✨ Améliorations Futures

- [ ] Préférence système (detect-prefers-color-scheme)
- [ ] Animations de transition plus lisses
- [ ] Palette de thèmes supplémentaires (Sépia, etc.)
- [ ] Contrôles d'accessibilité (contraste minimum)
- [ ] Thème personnalisé par utilisateur

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier la console du navigateur (`F12`)
2. Consulter `/memories/session/dark_mode_integration.md`
3. Vérifier les fichiers modifiés listés ci-dessus

