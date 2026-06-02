import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { useI18n } from '../contextes/ContexteI18n';
import { Carte } from './Carte';
import { COULEURS } from '../styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../styles/espacements';
import {
  AlertTriangle,
  MapPin,
  ArrowRight,
  Clock,
  Route,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import type { RouteBloqueeDetectee } from '../types';

interface DeviationProposalProps {
  deviation: RouteBloqueeDetectee;
  onAccepter?: () => void;
  onRefuser?: () => void;
  actions?: boolean;
}

export function DeviationProposal({ deviation, onAccepter, onRefuser, actions = false }: DeviationProposalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isPossible = deviation.status === 'DEVIATION_POSSIBLE';

  const borderStyle = {
    borderLeftColor: isPossible ? COULEURS.ambre : COULEURS.rouge,
    borderLeftWidth: 3,
  } as const;

  return (
    <Carte
      style={[styles.card, borderStyle] as any}
      ombre="sm"
    >
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isPossible ? (
            <AlertTriangle size={16} color={COULEURS.ambre} />
          ) : (
            <XCircle size={16} color={COULEURS.rouge} />
          )}
          <Text style={[styles.titre, { color: theme.texte }]}>
            {deviation.fromVillageNom} → {deviation.toVillageNom}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: isPossible ? COULEURS.ambre + '18' : COULEURS.rouge + '18' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isPossible ? COULEURS.ambre : COULEURS.rouge },
            ]}
          >
            {isPossible ? t('deviation.possible') : t('deviation.isole')}
          </Text>
        </View>
      </View>

      {/* Message utilisateur */}
      {deviation.messageUtilisateur && (
        <Text style={[styles.message, { color: theme.texteSecondaire }]}>
          {deviation.messageUtilisateur}
        </Text>
      )}

      {/* Raison du blocage */}
      {deviation.raison && (
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.texteTertiaire }]}>{t('deviation.raison')}</Text>
          <Text style={[styles.infoValue, { color: theme.texte }]}>{deviation.raison}</Text>
        </View>
      )}

      {/* Chemin de déviation */}
      {(() => {
        const chemin = deviation.deviationProposee;
        if (!isPossible || !chemin || chemin.length === 0) return null;
        return (
        <View style={styles.deviationSection}>
          <View style={styles.deviationHeader}>
            <Route size={14} color={theme.primaire} />
            <Text style={[styles.deviationTitle, { color: theme.texte }]}>
              {t('deviation.proposee')}
            </Text>
          </View>
          <View style={styles.cheminContainer}>
            {chemin.map((village, idx) => (
              <React.Fragment key={idx}>
                <View style={styles.cheminEtape}>
                  <View style={[styles.cheminDot, { backgroundColor: theme.primaire }]}>
                    <Text style={styles.cheminDotText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.cheminText, { color: theme.texte }]}>{village}</Text>
                </View>
                {idx < chemin.length - 1 && (
                  <View style={[styles.cheminLine, { backgroundColor: theme.bordure }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
        );
      })()}

      {/* Statistiques */}
      {isPossible && (
        <View style={[styles.statsContainer, { backgroundColor: theme.carte }]}>
          {deviation.distanceDirecte != null && (
            <View style={styles.statItem}>
              <MapPin size={14} color={theme.texteTertiaire} />
              <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('deviation.direct')}</Text>
              <Text style={[styles.statValue, { color: theme.texte }]}>
                {deviation.distanceDirecte.toFixed(1)} km
              </Text>
            </View>
          )}
          {deviation.distanceDeviation != null && (
            <View style={styles.statItem}>
              <ArrowRight size={14} color={COULEURS.ambre} />
              <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('deviation.deviation')}</Text>
              <Text style={[styles.statValue, { color: theme.texte }]}>
                {deviation.distanceDeviation.toFixed(1)} km
              </Text>
            </View>
          )}
          {deviation.surcout != null && deviation.surcout > 0 && (
            <View style={styles.statItem}>
              <Clock size={14} color={COULEURS.rouge} />
              <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('deviation.surcout')}</Text>
              <Text style={[styles.statValue, { color: COULEURS.rouge }]}>
                {deviation.surcout.toFixed(0)} Ar
              </Text>
            </View>
          )}
          {deviation.tempsSupplementaire != null && deviation.tempsSupplementaire > 0 && (
            <View style={styles.statItem}>
              <Clock size={14} color={COULEURS.ambre} />
              <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('deviation.temps')}</Text>
              <Text style={[styles.statValue, { color: COULEURS.ambre }]}>
                +{deviation.tempsSupplementaire.toFixed(0)} min
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      {actions && isPossible && (
        <View style={styles.actionsRow}>
          <Pressable
            onPress={onRefuser}
            style={[styles.btn, styles.btnRefuser, { borderColor: theme.bordure }]}
          >
            <XCircle size={16} color={COULEURS.rouge} />
            <Text style={[styles.btnText, { color: COULEURS.rouge }]}>{t('deviation.refuser')}</Text>
          </Pressable>
          <Pressable
            onPress={onAccepter}
            style={[styles.btn, styles.btnAccepter, { backgroundColor: COULEURS.succes }]}
          >
            <CheckCircle size={16} color={COULEURS.blanc} />
            <Text style={[styles.btnText, { color: COULEURS.blanc }]}>{t('deviation.accepter')}</Text>
          </Pressable>
        </View>
      )}

      {!isPossible && (
        <View style={[styles.isoleBanner, { backgroundColor: COULEURS.rouge + '10' }]}>
          <XCircle size={14} color={COULEURS.rouge} />
          <Text style={[styles.isoleText, { color: COULEURS.rouge }]}>
            {t('deviation.nonDesservi')}
          </Text>
        </View>
      )}
    </Carte>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: ESPACEMENTS.md,
    padding: ESPACEMENTS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: ESPACEMENTS.sm,
    gap: ESPACEMENTS.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
    flex: 1,
  },
  titre: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RAYONS.rond,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  message: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: ESPACEMENTS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.xs,
    marginBottom: ESPACEMENTS.sm,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  deviationSection: {
    marginBottom: ESPACEMENTS.sm,
  },
  deviationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.xs,
    marginBottom: ESPACEMENTS.sm,
  },
  deviationTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  cheminContainer: {
    paddingLeft: ESPACEMENTS.sm,
  },
  cheminEtape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
  },
  cheminDot: {
    width: 22,
    height: 22,
    borderRadius: RAYONS.rond,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cheminDotText: {
    color: COULEURS.blanc,
    fontSize: 10,
    fontWeight: '700',
  },
  cheminText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cheminLine: {
    width: 2,
    height: 12,
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: RAYONS.md,
    padding: ESPACEMENTS.sm,
    gap: ESPACEMENTS.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.xs,
    minWidth: '45%',
    paddingVertical: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: ESPACEMENTS.sm,
    marginTop: ESPACEMENTS.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACEMENTS.xs,
    paddingVertical: 10,
    borderRadius: RAYONS.md,
  },
  btnRefuser: {
    borderWidth: 1.5,
  },
  btnAccepter: {
    borderWidth: 0,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  isoleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.xs,
    padding: ESPACEMENTS.sm,
    borderRadius: RAYONS.md,
    marginTop: ESPACEMENTS.sm,
  },
  isoleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
