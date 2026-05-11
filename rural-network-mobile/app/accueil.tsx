/**
 * Landing Page Mobile — Réseau Rural Madagascar 2035
 * Version immersive avec hero, stats, features, CTA
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  interpolate,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/contextes/ContexteTheme';
import { COULEURS, RAYONS, ESPACEMENTS } from '../src/styles/couleurs';
import { TAILLES } from '../src/styles/espacements';
import {
  Rocket,
  Play,
  MapPin,
  Route,
  Truck,
  BarChart3,
  Zap,
  ChevronRight,
  ArrowRight,
  Leaf,
  Globe,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');

const FEATURES = [
  { icone: 'map', titre: 'Cartographie', desc: 'Géolocalisez vos villages et visualisez votre réseau en temps réel.' },
  { icone: 'route', titre: 'Routes Intelligentes', desc: 'Suivez l\'état des routes et détectez les blocages instantanément.' },
  { icone: 'truck', titre: 'Flotte Connectée', desc: 'Gérez vos camions, leur état et leur capacité de chargement.' },
  { icone: 'zap', titre: 'Optimisation IA', desc: 'Algorithmes avancés pour réduire les distances et les coûts.' },
  { icone: 'chart', titre: 'Analytics', desc: 'Tableaux de bord et statistiques pour piloter vos opérations.' },
  { icone: 'shield', titre: 'Fiabilité', desc: 'Données sécurisées et sauvegardées sur le cloud.' },
];

const STEPS = [
  { num: '01', titre: 'Enregistrez', desc: 'Ajoutez vos villages avec leurs coordonnées et productions.' },
  { num: '02', titre: 'Cartographiez', desc: 'Tracez les routes et identifiez les connexions possibles.' },
  { num: '03', titre: 'Configurez', desc: 'Définissez votre flotte de camions et leurs capacités.' },
  { num: '04', titre: 'Optimisez', desc: 'Lancez l\'algorithme et recevez vos tournées optimales.' },
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const anim = useSharedValue(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    anim.value = withTiming(value, { duration: 2000 });
  }, [value]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(anim.value, [0, value * 0.5, value], [0, 0.5, 1]),
  }));

  return (
    <Animated.Text style={[styles.counterText, textStyle]}>
      {value}{suffix}
    </Animated.Text>
  );
}

function FeatureIcon({ type, color }: { type: string; color: string }) {
  const size = 24;
  switch (type) {
    case 'map': return <MapPin size={size} color={color} />;
    case 'route': return <Route size={size} color={color} />;
    case 'truck': return <Truck size={size} color={color} />;
    case 'zap': return <Zap size={size} color={color} />;
    case 'chart': return <BarChart3 size={size} color={color} />;
    case 'shield': return <Shield size={size} color={color} />;
    default: return <Leaf size={size} color={color} />;
  }
}

export default function AccueilScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.conteneur, { backgroundColor: theme.fond }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== HERO SECTION ===== */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80' }}
        style={styles.heroBg}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          {/* Badge Live */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.heroBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.heroBadgeText}>Version 1.0 — Madagascar</Text>
          </Animated.View>

          {/* Titre */}
          <Animated.View entering={FadeInUp.duration(600).delay(400)}>
            <Text style={styles.heroTitle}>Réseau Rural</Text>
            <Text style={[styles.heroTitle, styles.heroTitleGradient]}>Madagascar 2035</Text>
          </Animated.View>

          {/* Sous-titre */}
          <Animated.View entering={FadeInUp.duration(600).delay(600)}>
            <Text style={styles.heroSubtitle}>
              Optimisez la collecte des productions agricoles. Gérez vos villages, routes, camions et planifiez des tournées intelligentes.
            </Text>
          </Animated.View>

          {/* Boutons */}
          <Animated.View entering={FadeInUp.duration(600).delay(800)} style={styles.heroButtons}>
            <Pressable
              onPress={() => router.push('/inscription')}
              style={styles.btnPrimary}
            >
              <Rocket size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Commencer gratuitement</Text>
            </Pressable>
            <Pressable
              onPress={() => scrollRef.current?.scrollTo({ y: 600, animated: true })}
              style={styles.btnSecondary}
            >
              <Play size={18} color={COULEURS.emeraude} />
              <Text style={styles.btnSecondaryText}>Découvrir</Text>
            </Pressable>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInUp.duration(600).delay(1000)} style={styles.heroStats}>
            <View style={styles.heroStat}>
              <AnimatedCounter value={2500} suffix="+" />
              <Text style={styles.heroStatLabel}>Villages connectés</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <AnimatedCounter value={98} suffix="%" />
              <Text style={styles.heroStatLabel}>Efficacité</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <AnimatedCounter value={35} suffix="%" />
              <Text style={styles.heroStatLabel}>Économie</Text>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>

      {/* ===== FEATURES SECTION ===== */}
      <View style={[styles.section, { backgroundColor: theme.fond }]}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.texte }]}>Fonctionnalités</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.texteSecondaire }]}>
            Tout ce dont vous avez besoin pour gérer votre réseau logistique rural
          </Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuresScroll}
        >
          {FEATURES.map((f, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.duration(400).delay(i * 100)}
              style={[styles.featureCard, { backgroundColor: theme.carte }]}
            >
              <View style={[styles.featureIconBg, { backgroundColor: COULEURS.emeraude + '15' }]}>
                <FeatureIcon type={f.icone} color={COULEURS.emeraude} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.texte }]}>{f.titre}</Text>
              <Text style={[styles.featureDesc, { color: theme.texteSecondaire }]}>{f.desc}</Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* ===== HOW IT WORKS ===== */}
      <View style={[styles.section, { backgroundColor: theme.fondCarte }]}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.texte }]}>Comment ça marche</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.texteSecondaire }]}>
            4 étapes simples pour optimiser votre réseau
          </Text>
        </Animated.View>

        <View style={styles.stepsContainer}>
          {STEPS.map((step, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.duration(400).delay(i * 150)}
              style={[
                styles.stepCard,
                { backgroundColor: theme.carte, borderColor: currentStep === i ? COULEURS.emeraude : theme.bordure },
              ]}
            >
              <Text style={[styles.stepNum, { color: COULEURS.emeraude }]}>{step.num}</Text>
              <Text style={[styles.stepTitle, { color: theme.texte }]}>{step.titre}</Text>
              <Text style={[styles.stepDesc, { color: theme.texteSecondaire }]}>{step.desc}</Text>
              {currentStep === i && (
                <View style={styles.stepIndicator}>
                  <View style={styles.stepDot} />
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ===== STATS SECTION ===== */}
      <View style={[styles.section, { backgroundColor: theme.fond }]}>
        <View style={styles.statsGrid}>
          {[
            [
              { icone: <Globe size={20} color={COULEURS.emeraude} />, valeur: '22', label: 'Régions couvertes', couleur: COULEURS.emeraude },
              { icone: <Users size={20} color={COULEURS.bleu} />, valeur: '150K+', label: 'Agriculteurs', couleur: COULEURS.bleu },
            ],
            [
              { icone: <TrendingUp size={20} color={COULEURS.ambre} />, valeur: '42%', label: 'Gain moyen', couleur: COULEURS.ambre },
              { icone: <Clock size={20} color={COULEURS.rouge} />, valeur: '-30%', label: 'Temps trajet', couleur: COULEURS.rouge },
            ],
          ].map((row, rowIdx) => (
            <View key={rowIdx} style={styles.statsRow}>
              {row.map((stat, i) => (
                <Animated.View
                  key={i}
                  entering={FadeInUp.duration(400).delay((rowIdx * 2 + i) * 100)}
                  style={[styles.statBox, { backgroundColor: theme.carte, borderLeftColor: stat.couleur }]}
                >
                  <View style={[styles.statIconBg, { backgroundColor: stat.couleur + '15' }]}>
                    {stat.icone}
                  </View>
                  <Text style={[styles.statValue, { color: theme.texte }]}>{stat.valeur}</Text>
                  <Text style={[styles.statLabel, { color: theme.texteSecondaire }]}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* ===== CTA SECTION ===== */}
      <View style={[styles.ctaSection, { backgroundColor: COULEURS.vertPrincipal }]}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text style={styles.ctaTitle}>Prêt à transformer votre réseau ?</Text>
          <Text style={styles.ctaSubtitle}>
            Rejoignez les collectivités qui optimisent déjà leurs tournées avec Rural Network.
          </Text>
          <Pressable
            onPress={() => router.push('/inscription')}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>Créer un compte gratuit</Text>
            <ArrowRight size={18} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/connexion')}
            style={styles.ctaLink}
          >
            <Text style={styles.ctaLinkText}>Déjà un compte ? Se connecter</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* ===== FOOTER ===== */}
      <View style={[styles.footer, { backgroundColor: theme.fondCarte, borderTopColor: theme.bordure }]}>
        <Text style={[styles.footerBrand, { color: theme.texte }]}>Rural Network</Text>
        <Text style={[styles.footerCopy, { color: theme.texteTertiaire }]}>
          © 2025 Rural Network Madagascar. Tous droits réservés.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Hero
  heroBg: {
    width: SCREEN_W,
    height: SCREEN_W * 1.4,
    justifyContent: 'flex-end',
  },
  heroImage: { opacity: 0.4 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 28, 8, 0.85)',
  },
  heroContent: {
    padding: ESPACEMENTS.xl,
    paddingBottom: ESPACEMENTS.xxl,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: ESPACEMENTS.xs,
    paddingHorizontal: ESPACEMENTS.md,
    paddingVertical: ESPACEMENTS.xs,
    borderRadius: RAYONS.rond,
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
    marginBottom: ESPACEMENTS.lg,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COULEURS.emeraude,
  },
  heroBadgeText: {
    color: COULEURS.emeraude,
    fontSize: TAILLES.texte.sm,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -1,
  },
  heroTitleGradient: {
    color: COULEURS.emeraude,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginTop: ESPACEMENTS.md,
    marginBottom: ESPACEMENTS.lg,
  },
  heroButtons: {
    gap: ESPACEMENTS.md,
    marginBottom: ESPACEMENTS.xl,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACEMENTS.sm,
    backgroundColor: COULEURS.emeraude,
    paddingVertical: ESPACEMENTS.md,
    paddingHorizontal: ESPACEMENTS.lg,
    borderRadius: RAYONS.lg,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACEMENTS.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: ESPACEMENTS.md,
    paddingHorizontal: ESPACEMENTS.lg,
    borderRadius: RAYONS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnSecondaryText: {
    color: COULEURS.emeraude,
    fontSize: 16,
    fontWeight: '700',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACEMENTS.lg,
  },
  heroStat: { alignItems: 'center' },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  counterText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },

  // Section générale
  section: {
    paddingVertical: ESPACEMENTS.xxl,
    paddingHorizontal: ESPACEMENTS.lg,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: ESPACEMENTS.sm,
  },
  sectionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: ESPACEMENTS.xl,
    paddingHorizontal: ESPACEMENTS.md,
  },

  // Features
  featuresScroll: {
    gap: ESPACEMENTS.md,
    paddingHorizontal: ESPACEMENTS.sm,
  },
  featureCard: {
    width: 200,
    padding: ESPACEMENTS.lg,
    borderRadius: RAYONS.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginRight: ESPACEMENTS.md,
  },
  featureIconBg: {
    width: 48,
    height: 48,
    borderRadius: RAYONS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ESPACEMENTS.md,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: ESPACEMENTS.xs,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Steps
  stepsContainer: {
    gap: ESPACEMENTS.md,
  },
  stepCard: {
    padding: ESPACEMENTS.lg,
    borderRadius: RAYONS.xl,
    borderWidth: 2,
    position: 'relative',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: ESPACEMENTS.xs,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: ESPACEMENTS.xs,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepIndicator: {
    position: 'absolute',
    top: ESPACEMENTS.md,
    right: ESPACEMENTS.md,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COULEURS.emeraude,
  },

  // Stats Grid
  statsGrid: {
    gap: ESPACEMENTS.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: ESPACEMENTS.md,
  },
  statBox: {
    flex: 1,
    padding: ESPACEMENTS.lg,
    borderRadius: RAYONS.xl,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: RAYONS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ESPACEMENTS.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },

  // CTA
  ctaSection: {
    padding: ESPACEMENTS.xxl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: ESPACEMENTS.md,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: ESPACEMENTS.xl,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACEMENTS.sm,
    backgroundColor: COULEURS.emeraude,
    paddingVertical: ESPACEMENTS.md,
    paddingHorizontal: ESPACEMENTS.xl,
    borderRadius: RAYONS.lg,
    marginBottom: ESPACEMENTS.lg,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaLink: { marginTop: ESPACEMENTS.sm },
  ctaLinkText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    padding: ESPACEMENTS.xl,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: ESPACEMENTS.xs,
  },
  footerCopy: {
    fontSize: 12,
    textAlign: 'center',
  },
});
