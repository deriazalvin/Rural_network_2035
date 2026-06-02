/**
 * Modal Paramètres — Langue + Thème (Nuit/Clair)
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { useI18n, type Langue } from '../contextes/ContexteI18n';
import { ESPACEMENTS, RAYONS } from '../styles/espacements';
import { COULEURS } from '../styles/couleurs';
import { X, Sun, Moon, Settings } from 'lucide-react-native';

const FLAGS: Record<Langue, string> = {
  fr: '\u{1F1EB}\u{1F1F7}',
  en: '\u{1F1EC}\u{1F1E7}',
  mg: '\u{1F1F2}\u{1F1EC}',
};

const LANGUES_LABEL: Record<Langue, string> = {
  fr: 'Fran\u00e7ais',
  en: 'English',
  mg: 'Malagasy',
};

const { width: SCREEN_W } = Dimensions.get('window');

interface ModalParametresProps {
  visible: boolean;
  onFermer: () => void;
}

export function ModalParametres({ visible, onFermer }: ModalParametresProps) {
  const { theme, mode, basculerTheme } = useTheme();
  const { langue, definirLangue, t } = useI18n();

  const estSombre = mode === 'sombre';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onFermer}
    >
      <Pressable style={styles.overlay} onPress={onFermer}>
        <Pressable style={[styles.panel, { backgroundColor: theme.fondCarte }]} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Settings size={20} color={theme.texte} />
              <Text style={[styles.headerText, { color: theme.texte }]}>{t('parametres.titre')}</Text>
            </View>
            <Pressable onPress={onFermer} style={[styles.closeBtn, { backgroundColor: theme.carte }]}>
              <X size={18} color={theme.texteSecondaire} />
            </Pressable>
          </View>

          {/* Langue */}
          <Text style={[styles.sectionTitle, { color: theme.texteTertiaire }]}>{t('parametres.langue')}</Text>
          <View style={styles.languesContainer}>
            {(Object.keys(FLAGS) as Langue[]).map((code) => (
              <Pressable
                key={code}
                style={[
                  styles.langBtn,
                  {
                    backgroundColor: langue === code ? theme.primaire + '18' : theme.carte,
                    borderColor: langue === code ? theme.primaire : theme.bordure,
                  },
                ]}
                onPress={() => { definirLangue(code); onFermer(); }}
              >
                <Text style={styles.langFlag}>{FLAGS[code]}</Text>
                <Text
                  style={[
                    styles.langName,
                    {
                      color: langue === code ? theme.primaire : theme.texte,
                      fontWeight: langue === code ? '700' : '500',
                    },
                  ]}
                >
                  {LANGUES_LABEL[code]}
                </Text>
                {langue === code && <View style={[styles.langDot, { backgroundColor: theme.primaire }]} />}
              </Pressable>
            ))}
          </View>

          {/* Thème */}
          <Text style={[styles.sectionTitle, { color: theme.texteTertiaire }]}>{t('parametres.theme')}</Text>
          <View style={[styles.themeRow, { backgroundColor: theme.carte }]}>
            <View style={styles.themeRowLeft}>
              {estSombre ? (
                <Moon size={20} color={theme.texte} />
              ) : (
                <Sun size={20} color={theme.texte} />
              )}
              <Text style={[styles.themeLabel, { color: theme.texte }]}>
                {estSombre ? t('parametres.modeNuit') : t('parametres.modeClair')}
              </Text>
            </View>
            <Switch
              value={estSombre}
              onValueChange={basculerTheme}
              trackColor={{ false: COULEURS.bordure, true: theme.primaire + '60' }}
              thumbColor={estSombre ? theme.primaire : COULEURS.texteTertiaire}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: RAYONS.xl,
    borderTopRightRadius: RAYONS.xl,
    paddingHorizontal: ESPACEMENTS.lg,
    paddingTop: ESPACEMENTS.lg,
    paddingBottom: ESPACEMENTS['3xl'] || 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ESPACEMENTS.lg,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RAYONS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: ESPACEMENTS.sm,
    marginTop: ESPACEMENTS.sm,
  },
  languesContainer: {
    gap: ESPACEMENTS.sm,
    marginBottom: ESPACEMENTS.md,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACEMENTS.md,
    borderRadius: RAYONS.md,
    borderWidth: 1.5,
  },
  langFlag: {
    fontSize: 24,
    marginRight: ESPACEMENTS.md,
  },
  langName: {
    fontSize: 16,
    flex: 1,
  },
  langDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ESPACEMENTS.md,
    borderRadius: RAYONS.md,
    marginBottom: ESPACEMENTS.lg,
  },
  themeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
