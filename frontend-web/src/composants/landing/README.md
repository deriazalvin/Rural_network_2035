# 📄 Landing Page - Documentation

> **Documentation générale du projet :** [README.md](../../../../README.md)

## 📋 Vue d'ensemble

La landing page est constituée d'une collection de composants React modulaires et réutilisables, avec des styles séparés et des icônes lucide-react.

## 🏗️ Structure des fichiers

```
src/
├── composants/
│   ├── LandingPage.jsx                 # Composant principal
│   └── landing/                        # Dossier des sous-composants
│       ├── LogoRN.jsx                  # Logo RN réutilisable
│       ├── Navbar.jsx                  # Barre de navigation
│       ├── HeroSection.jsx             # Section héros
│       ├── MarketingStrip.jsx          # Bande marketing
│       ├── FeaturesSection.jsx         # Fonctionnalités
│       ├── PromoBanner.jsx             # Bannière promotionnelle
│       ├── ShowcaseSection.jsx         # Démo des solutions
│       ├── HowItWorks.jsx              # 4 étapes
│       ├── StatsSection.jsx            # Statistiques
│       ├── MapPreview.jsx              # Aperçu carte
│       ├── TestimonialsSection.jsx     # Témoignages
│       ├── CTASection.jsx              # Appel à l'action
│       ├── Footer.jsx                  # Pied de page
│       ├── Loader.jsx                  # Écran de chargement
│       ├── BackToTop.jsx               # Bouton retour
│       ├── NotificationPopup.jsx       # Popup notifications
│       ├── GlowCursor.jsx              # Effet de lueur
│       ├── AnimatedCounter.jsx         # Compteur animé
│       ├── useScrollAnimation.jsx      # Hook scroll
│       └── index.jsx                   # Centralisateur des exports
├── styles/
│   └── landing.css                     # Tous les styles CSS
```

## 🎯 Composants principaux

### 1. **LogoRN** (Réutilisable)
Logo animé avec gradient et effet de rotation.
- **Tailles**: `sm`, `md`, `lg`
- **Propriétés**: `size`, `showText`
- **Icônes**: Utilisé par Navbar, Footer, Loader

```jsx
<LogoRN size="md" showText={true} />
```

### 2. **Navbar**
Barre de navigation fixe avec toggle thème et bouton connexion.
- Redirection: `/auth` pour connexion
- Scroll smooth vers sections

### 3. **HeroSection**
Section principale avec image 3D, particules animées et statistiques.
- Boutons:
  - "Commencer" → `/app`
  - "Découvrir" → Scroll vers #features

### 4. **FeaturesSection**
Grille de 6 fonctionnalités avec cartes interactives.
- Images réelles
- Tags colorés
- Animations de scroll

### 5. **ShowcaseSection**
3 solutions présentées en alternance avec images et listes.

### 6. **CTASection**
Section d'appel à l'action finale.
- Boutons:
  - "Créer compte" → `/auth?action=signup`
  - "Se connecter" → `/auth`

## 🎨 Styles

Tous les styles sont dans `/src/styles/landing.css`:
- Variables CSS pour couleurs et dégradés
- Animations keyframes (float, pulse, slide, etc.)
- Support du mode sombre
- Responsive à 3 breakpoints: 1024px, 768px

### Palette de couleurs
```css
--primary: #2ecc71 (vert)
--secondary: #f39c12 (orange)
--accent: #e74c3c (rouge)
--text: #1a1a2e (foncé)
```

## ⚙️ Configurations

### Redirections des boutons
- **Connexion**: `/auth`
- **Inscription**: `/auth?action=signup`
- **Commencer**: `/app`

### Paramètres d'animation
- Durée loader: 2000ms
- Durée scroll-animate: 800ms
- Durée compteur: 2000ms

## 🔄 Intégration dans l'application

### 1. PublicPages.jsx
Affiche la LandingPage quand l'utilisateur n'est pas connecté.

```jsx
// Dans PublicPages.jsx
import LandingPage from './LandingPage.jsx';
```

### 2. App.jsx
Vérifie l'authentification et affiche PublicPages si pas de token.

```jsx
if (!token && !utilisateur) {
  return <PublicPages />;
}
```

## 🎭 Thème sombre

Le mode sombre est géré par le `data-theme` attribute:
```jsx
document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
```

Les variables CSS s'ajustent automatiquement via `[data-theme="dark"]`.

## 📱 Responsive

Trois points d'arrêt:
- **Desktop**: 1400px max-width
- **Tablet**: 1024px et plus bas
- **Mobile**: 768px et plus bas

Les composants s'adaptent automatiquement.

## 🚀 Icônes lucide-react

Importations utilisées:
- `Home` (navbar)
- `Menu`, `X` (mobile)
- `Sun`, `Moon` (theme toggle)
- `ChevronUp` (back to top)
- Et d'autres...

## 📝 Commentaires

Tous les commentaires sont en français pour faciliter la maintenance.

## ✅ Checklist de validation

- ✅ Composants séparés et modulaires
- ✅ CSS externalisé dans `landing.css`
- ✅ Logo RN réutilisable
- ✅ Icônes lucide-react (pas Font Awesome)
- ✅ Commentaires en français
- ✅ Les animations respectent les spécifications
- ✅ Redirections configurées
- ✅ Mode sombre supporté
- ✅ Responsive design

## 🔧 Maintenance

Pour ajouter une nouvelle section:
1. Créer un nouveau composant dans `landing/`
2. Ajouter l'export dans `landing/index.jsx`
3. Importer et intégrer dans `LandingPage.jsx`
4. Ajouter les styles dans `styles/landing.css`

## 📞 Support des animations

Toutes les animations utilisées:
- `float`: Élévation fluide
- `pulse-glow`: Effet de lueur pulsante
- `spin-slow`: Rotation lente
- `slideInLeft/Right/Up`: Entrée au scroll
- `fadeIn/scaleIn`: Apparition
- `gradient-shift`: Dégradé animé
- `particle-float`: Particules flottantes
- `shimmer`: Effet de brillance

