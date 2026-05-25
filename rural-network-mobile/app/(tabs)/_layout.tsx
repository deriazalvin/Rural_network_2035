/**
 * Layout des onglets principaux (Bottom Tab Navigation)
 * Tableau de bord, Villages, Routes, Camions, Optimisation, Demo
 */
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useI18n } from '../../src/contextes/ContexteI18n';
import {
  BarChart3,
  MapPin,
  Route,
  Truck,
  Zap,
  Play,
  Cloud,
} from 'lucide-react-native';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.fondCarte,
          borderTopColor: theme.bordure,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primaire,
        tabBarInactiveTintColor: theme.texteTertiaire,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="tableau-bord"
        options={{
          title: t('nav.tableau'),
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="villages"
        options={{
          title: t('nav.villages'),
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: t('nav.routes'),
          tabBarIcon: ({ color, size }) => <Route size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="camions"
        options={{
          title: t('nav.flotte'),
          tabBarIcon: ({ color, size }) => <Truck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meteo"
        options={{
          title: t('nav.meteo'),
          tabBarIcon: ({ color, size }) => <Cloud size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="optimisation"
        options={{
          title: t('nav.calcul'),
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="demo"
        options={{
          title: t('nav.demo'),
          tabBarIcon: ({ color, size }) => <Play size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
