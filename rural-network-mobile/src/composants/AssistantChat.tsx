import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  FlatList, StyleSheet, Dimensions, Animated, PanResponder, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { serviceDonnees } from '../services/ServiceDonnees';
import { useTheme } from '../contextes/ContexteTheme';
import { useI18n } from '../contextes/ContexteI18n';

const { width: ECRAN_L, height: ECRAN_H } = Dimensions.get('window');
const TAILLE_BULLE = 56;
const BULLE_INIT = { x: ECRAN_L - TAILLE_BULLE - 20, y: ECRAN_H - TAILLE_BULLE - 120 };

interface Message {
  role: 'user' | 'ia';
  texte: string;
  heure: string;
}

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function nettoyerTexte(texte: string): string {
  return texte
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

export default function AssistantChat({ visible }: { visible: boolean }) {
  const { mode, theme } = useTheme();
  const { t } = useI18n();
  const estSombre = mode === 'sombre';
  const posDepart = useRef({ x: 0, y: 0 });
  const ouvertRef = useRef(false);
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState('');
  const [charge, setCharge] = useState(false);
  const pan = useRef(new Animated.ValueXY(BULLE_INIT)).current;

  useEffect(() => { ouvertRef.current = ouvert; }, [ouvert]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => {
        if (ouvertRef.current) return false;
        return Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5;
      },
      onPanResponderGrant: () => {
        posDepart.current = (pan as any).__getValue();
      },
      onPanResponderMove: (_, gs) => {
        const newX = Math.max(0, Math.min(ECRAN_L - TAILLE_BULLE, posDepart.current.x + gs.dx));
        const newY = Math.max(0, Math.min(ECRAN_H - TAILLE_BULLE - 120, posDepart.current.y + gs.dy));
        pan.setValue({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  const envoyer = useCallback(async () => {
    if (!saisie.trim()) return;
    const q = saisie.trim();
    setSaisie('');
    setMessages(m => [...m, { role: 'user', texte: q, heure: now() }]);
    setCharge(true);
    try {
      const rep = await serviceDonnees.poserQuestionIA(q);
      setMessages(m => [...m, { role: 'ia', texte: rep.reponse || rep, heure: now() }]);
    } catch {
      setMessages(m => [...m, { role: 'ia', texte: t('chat.erreur'), heure: now() }]);
    }
    setCharge(false);
  }, [saisie]);

  if (!visible) return null;

  const s = stylesDynamic(estSombre);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {ouvert && (
        <Modal transparent animationType="slide" visible={ouvert} onRequestClose={() => setOuvert(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
            <View style={[s.panel, { maxHeight: ECRAN_H * 0.6 }]}>
              <View style={s.header}>
                  <Text style={s.headerTitre}>{t('chat.titre')}</Text>
                <TouchableOpacity onPress={() => setOuvert(false)} style={s.btnFermer}>
                  <Text style={s.btnFermerTexte}>{t('chat.fermer')}</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={messages}
                keyExtractor={(_, i) => String(i)}
                style={s.liste}
                contentContainerStyle={s.listeContenu}
                renderItem={({ item }) => (
                    <View style={[s.msg, item.role === 'user' ? s.msgUser : s.msgIA]}>
                      <Text style={item.role === 'user' ? s.msgUserTexte : s.msgIATexte}>{item.role === 'ia' ? nettoyerTexte(item.texte) : item.texte}</Text>
                    <Text style={s.msgHeure}>{item.heure}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={[s.msg, s.msgIA]}>
                    <Text style={s.msgIATexte}>{t('chat.bienvenue')}</Text>
                  </View>
                }
              />
              {charge && (
                <View style={[s.msg, s.msgIA]}>
                  <ActivityIndicator size="small" color="#22c55e" />
                  <Text style={s.msgIATexte}> {t('chat.chargement')}</Text>
                </View>
              )}
              <View style={s.inputCont}>
                <TextInput
                  style={s.input}
                  value={saisie}
                  onChangeText={setSaisie}
                  placeholder={t('chat.placeholder')}
                  placeholderTextColor={estSombre ? '#6b7280' : '#9ca3af'}
                  onSubmitEditing={envoyer}
                  editable={!charge}
                />
                <TouchableOpacity onPress={envoyer} disabled={charge || !saisie.trim()} style={s.btnEnvoyer}>
                  <Text style={s.btnEnvoyerTexte}>{t('chat.envoyer')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
      <Animated.View
        style={[styles.bulle, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.bulleBtn}
          onPress={() => setOuvert(o => !o)}
          activeOpacity={0.7}
        >
          <Text style={styles.bulleIcone}>IA</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bulle: {
    position: 'absolute',
    width: TAILLE_BULLE,
    height: TAILLE_BULLE,
    borderRadius: TAILLE_BULLE / 2,
    backgroundColor: '#22c55e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bulleBtn: {
    width: TAILLE_BULLE,
    height: TAILLE_BULLE,
    borderRadius: TAILLE_BULLE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulleIcone: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
});

const stylesDynamic = (estSombre: boolean) => StyleSheet.create({
  panel: {
    backgroundColor: estSombre ? '#1f2937' : '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: estSombre ? '#374151' : '#e5e7eb',
  },
  headerTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: estSombre ? '#34d399' : '#16a34a',
  },
  btnFermer: {
    padding: 4,
  },
  btnFermerTexte: {
    color: estSombre ? '#9ca3af' : '#6b7280',
    fontWeight: '600',
  },
  liste: {
    maxHeight: 300,
  },
  listeContenu: {
    padding: 12,
  },
  msg: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    maxWidth: '85%',
  },
  msgUser: {
    backgroundColor: '#22c55e',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  msgIA: {
    backgroundColor: estSombre ? '#374151' : '#f3f4f6',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgUserTexte: { color: '#fff', fontSize: 14 },
  msgIATexte: { color: estSombre ? '#f3f4f6' : '#1f2937', fontSize: 14, flexShrink: 1 },
  msgHeure: { fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' },
  inputCont: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: estSombre ? '#374151' : '#e5e7eb',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: estSombre ? '#4b5563' : '#d1d5db',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: estSombre ? '#f3f4f6' : '#1f2937',
    backgroundColor: estSombre ? '#374151' : '#fff',
  },
  btnEnvoyer: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  btnEnvoyerTexte: {
    color: '#fff',
    fontWeight: '600',
  },
});
