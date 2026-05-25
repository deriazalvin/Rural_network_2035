import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useAuth } from '../../src/contextes/ContexteAuth';
import { useI18n } from '../../src/contextes/ContexteI18n';
import { Carte, CarteStatistique, BarreProgression, Notification } from '../../src/composants';
import { COULEURS, RAYONS, ESPACEMENTS } from '../../src/styles/couleurs';
import {
  BarChart3, MapPin, Route, Truck, Zap, TrendingUp,
  ChevronRight, RotateCcw, Activity, Package, AlertTriangle,
  Clock, Award, Sun, Moon, LogOut, Cloud, Thermometer, Droplets, Wind, Bot, Layers,
} from 'lucide-react-native';
import type { Notification as NotificationType } from '../../src/types';

type Etape = 'tableau'|'villages'|'routes'|'camions'|'meteo'|'optimisation'|'resultats';

const VILLAGES = [
  { nom:'Fianarantsoa', prod:680, badge:'Élevée' as const },
  { nom:'Ambalavao', prod:450, badge:'Moyenne' as const },
  { nom:'Manakara', prod:320, badge:'Moyenne' as const },
  { nom:'Mananjary', prod:520, badge:'Élevée' as const },
  { nom:'Ikongo', prod:280, badge:'Faible' as const },
  { nom:'Vohipeno', prod:190, badge:'Faible' as const },
];

const METEO_DATA = [
  { ville:'Fianarantsoa', temp:28, ressenti:31, desc:'Ensoleillé', humidite:45, vent:12, icone:'☀️', conseil:'✅ Conditions favorables' },
  { ville:'Manakara', temp:32, ressenti:36, desc:'Pluie légère', humidite:78, vent:8, icone:'🌦️', conseil:'⚠️ Humidité élevée' },
];

export default function DemoScreen() {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion } = useAuth();
  const { t, langue, definirLangue } = useI18n();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [etape, setEtape] = useState(0);
  const [progres, setProgres] = useState(0);
  const [toast, setToast] = useState<NotificationType | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const ETAPES: { id:Etape; label:string; icone:React.ReactNode; couleur:string }[] = [
    { id:'tableau', label:'Dashboard', icone:<Layers size={16} color={COULEURS.bleuClair} />, couleur:COULEURS.bleuClair },
    { id:'villages', label:'Villages', icone:<MapPin size={16} color={COULEURS.emeraude} />, couleur:COULEURS.emeraude },
    { id:'routes', label:'Routes', icone:<Route size={16} color={COULEURS.bleu} />, couleur:COULEURS.bleu },
    { id:'camions', label:'Camions', icone:<Truck size={16} color={COULEURS.orange} />, couleur:COULEURS.orange },
    { id:'meteo', label:'Météo', icone:<Cloud size={16} color={COULEURS.bleuClair} />, couleur:COULEURS.bleuClair },
    { id:'optimisation', label:'Calcul', icone:<Zap size={16} color={COULEURS.ambre} />, couleur:COULEURS.ambre },
    { id:'resultats', label:'Résultats', icone:<TrendingUp size={16} color={COULEURS.rouge} />, couleur:COULEURS.rouge },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => { setEtape(1); showToast('Création village Ikongo (280 kg)','info'); }, 4000));
    t.push(setTimeout(() => { setEtape(2); showToast('Route Ambalavao → Ikongo ajoutée','succes'); }, 8000));
    t.push(setTimeout(() => { setEtape(3); showToast('Camion C en panne','avertissement'); }, 12000));
    t.push(setTimeout(() => { setEtape(4); showToast('Météo chargée pour 6 villages','info'); }, 16000));
    t.push(setTimeout(() => { setEtape(5); runProgress(); showToast('Optimisation multi-camions...','info'); }, 20000));
    t.push(setTimeout(() => { setEtape(6); showToast('Gain 32,1% ! Résultats disponibles','succes'); }, 26000));
    return () => t.forEach(clearTimeout);
  }, [autoPlay]);

  const showToast = (message: string, type: NotificationType['type']) => {
    setToast({ type, titre: type==='succes'?t('commun.succes'):type==='avertissement'?'Avertissement':t('commun.info'), message });
    setTimeout(() => setToast(null), 3000);
  };

  const runProgress = () => {
    setProgres(0);
    let p = 0;
    const iv = setInterval(() => { p+=3; setProgres(p); if (p>=100) clearInterval(iv); }, 80);
  };

  const restart = () => { setEtape(0); setProgres(0); setAutoPlay(false); setTimeout(()=>setAutoPlay(true),100); };

  const handleDeconnexion = async () => { await deconnexion(); router.replace('/accueil'); };

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <View style={[styles.iconBadge, { backgroundColor: COULEURS.ambre+'18' }]}>
              <Layers size={18} color={COULEURS.ambre} />
            </View>
            <View>
              <Text style={[styles.headerTitre, { color: theme.texte }]}>{t('demo.titre')}</Text>
              <Text style={[styles.headerSousTitre, { color: theme.texteTertiaire }]}>{t('demo.sousTitre')}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={()=>definirLangue(langue==='fr'?'en':langue==='en'?'mg':'fr')} style={[styles.iconBtn,{backgroundColor:theme.carte}]}>
              <Text style={{fontSize:11,fontWeight:'800',color:theme.primaire}}>{langue.toUpperCase()}</Text>
            </Pressable>
            <Pressable onPress={restart} style={styles.btnRestart}><RotateCcw size={18} color={COULEURS.bleu} /></Pressable>
            <Pressable onPress={basculerTheme} style={[styles.iconBtn,{backgroundColor:theme.carte}]}>
              {mode==='sombre'?<Sun size={18} color={theme.primaire} />:<Moon size={18} color={theme.primaire} />}
            </Pressable>
            <Pressable onPress={handleDeconnexion} style={[styles.iconBtn,{backgroundColor:theme.carte}]}>
              <LogOut size={18} color={theme.texteTertiaire} />
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pipeline}>
          {ETAPES.map((e,i)=>(
            <Pressable key={e.id} onPress={()=>setEtape(i)} style={styles.pipelineItem}>
              <View style={[styles.pipelineDot, { backgroundColor: i<=etape ? e.couleur : theme.bordure, borderColor: i===etape ? e.couleur : theme.bordure }]}>
                {i<etape && <Text style={{color:COULEURS.blanc,fontSize:10,fontWeight:'800'}}>✓</Text>}
                {i===etape && <View style={[styles.pipelineActive,{backgroundColor:e.couleur}]} />}
              </View>
              <Text style={[styles.pipelineLabel,{color:i===etape?e.couleur:theme.texteTertiaire}]}>{e.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* DASHBOARD */}
        {etape===0 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}><CarteStatistique label="Villages" valeur={6} icone={<MapPin size={16} color={COULEURS.emeraude}/>} couleur={COULEURS.emeraude} tendance="+2 ce mois" /></View>
              <View style={styles.metricHalf}><CarteStatistique label="Routes" valeur={5} icone={<Route size={16} color={COULEURS.bleu}/>} couleur={COULEURS.bleu} tendance="80% actives" /></View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}><CarteStatistique label="Production" valeur={2440} unite="kg" icone={<Package size={16} color={COULEURS.bleuClair}/>} couleur={COULEURS.bleuClair} tendance="+12%" /></View>
              <View style={styles.metricHalf}><CarteStatistique label="Efficacité" valeur={87} unite="%" icone={<Zap size={16} color={COULEURS.ambre}/>} couleur={COULEURS.ambre} tendance="Record" /></View>
            </View>
            <Carte style={styles.chartCard} ombre="sm">
              <Text style={[styles.chartTitle,{color:theme.texte}]}>Historique des Optimisations</Text>
              <View style={styles.miniBars}>
                {[18,24,29,35].map((h,i)=>(
                  <View key={i} style={styles.miniBarCol}>
                    <View style={[styles.miniBarWrapper,{height:100}]}>
                      <View style={[styles.miniBar,{height:h*3,backgroundColor:COULEURS.emeraude,opacity:0.5+i*0.1}]} />
                    </View>
                    <Text style={[styles.miniBarLabel,{color:theme.texteTertiaire}]}>{['Jan','Fév','Mar','Avr'][i]}</Text>
                  </View>
                ))}
              </View>
            </Carte>
          </Animated.View>
        )}

        {/* VILLAGES */}
        {etape===1 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre,{color:theme.texte}]}>Gestion des Villages ({VILLAGES.length})</Text>
            {VILLAGES.map((v,i)=>(
              <Carte key={i} style={styles.demoCard} ombre="sm">
                <View style={styles.demoCardRow}>
                  <Text style={[styles.demoNom,{color:theme.texte}]}>{v.nom}</Text>
                  <Text style={[styles.demoBadge,{
                    backgroundColor: v.badge==='Élevée' ? COULEURS.emeraude+'20' : v.badge==='Moyenne' ? COULEURS.bleu+'20' : COULEURS.grisClair,
                    color: v.badge==='Élevée' ? COULEURS.emeraude : v.badge==='Moyenne' ? COULEURS.bleu : theme.texteTertiaire,
                  }]}>{v.prod} kg</Text>
                </View>
              </Carte>
            ))}
          </Animated.View>
        )}

        {/* ROUTES */}
        {etape===2 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre,{color:theme.texte}]}>Gestion des Routes (5)</Text>
            {[
              {d:'Fianarantsoa',a:'Ambalavao',dist:75,qual:'BONNE'},
              {d:'Fianarantsoa',a:'Mananjary',dist:95,qual:'MOYENNE'},
              {d:'Fianarantsoa',a:'Manakara',dist:85,qual:'BONNE'},
              {d:'Manakara',a:'Vohipeno',dist:45,qual:'MAUVAISE',bloc:true},
              {d:'Ambalavao',a:'Ikongo',dist:55,qual:'MOYENNE'},
            ].map((r,i)=>(
              <Carte key={i} style={[styles.demoCard, r.bloc?{borderColor:COULEURS.danger}:{}]} ombre="sm">
                <View style={styles.demoCardRow}>
                  <Text style={[styles.demoNom,{color:theme.texte,flex:1}]}>{r.d} → {r.a}</Text>
                  <Text style={{fontSize:12,fontWeight:'600',color:r.qual==='BONNE'?COULEURS.emeraude:r.qual==='MOYENNE'?COULEURS.ambre:COULEURS.danger}}>{r.dist} km</Text>
                </View>
                <View style={styles.demoCardRow}>
                  <Text style={[styles.demoMeta,{color:theme.texteTertiaire}]}>Qualité: {r.qual}</Text>
                  {r.bloc && <Text style={{fontSize:11,fontWeight:'700',color:COULEURS.danger}}>BLOQUÉE</Text>}
                </View>
              </Carte>
            ))}
          </Animated.View>
        )}

        {/* CAMIONS */}
        {etape===3 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre,{color:theme.texte}]}>Gestion des Camions</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}><CarteStatistique label="Total" valeur={3} icone={<Truck size={16} color={COULEURS.bleu}/>} couleur={COULEURS.bleu} /></View>
              <View style={styles.metricHalf}><CarteStatistique label="Disponibles" valeur={2} icone={<CheckMark />} couleur={COULEURS.emeraude} /></View>
            </View>
            {[
              {nom:'Camion A',cap:5000,etat:'DISPONIBLE',coul:COULEURS.emeraude},
              {nom:'Camion B',cap:3000,etat:'DISPONIBLE',coul:COULEURS.bleu},
              {nom:'Camion C',cap:2000,etat:'EN_PANNE',coul:COULEURS.danger},
            ].map((c,i)=>(
              <Carte key={i} style={styles.demoCard} ombre="sm">
                <View style={styles.demoCardRow}>
                  <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                    <View style={{width:12,height:12,borderRadius:6,backgroundColor:c.coul}} />
                    <Text style={[styles.demoNom,{color:theme.texte}]}>{c.nom}</Text>
                  </View>
                  <Text style={[styles.demoBadge,{
                    backgroundColor: c.etat==='DISPONIBLE'?COULEURS.emeraude+'20':c.etat==='EN_PANNE'?COULEURS.danger+'20':COULEURS.ambre+'20',
                    color: c.etat==='DISPONIBLE'?COULEURS.emeraude:c.etat==='EN_PANNE'?COULEURS.danger:COULEURS.ambre,
                  }]}>{c.etat}</Text>
                </View>
                <Text style={[styles.demoMeta,{color:theme.texteTertiaire}]}>Capacité: {(c.cap/1000).toFixed(1)} tonne</Text>
              </Carte>
            ))}
          </Animated.View>
        )}

        {/* MÉTÉO */}
        {etape===4 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre,{color:theme.texte}]}>Météo des Villages</Text>
            {METEO_DATA.map((m,i)=>(
              <Carte key={i} style={styles.demoCard} ombre="sm">
                <View style={styles.demoCardRow}>
                  <Text style={[styles.demoNom,{color:theme.texte}]}>{m.icone} {m.ville}</Text>
                  <Text style={{fontSize:24,fontWeight:'800',color:theme.texte}}>{m.temp}°</Text>
                </View>
                <Text style={[styles.demoMeta,{color:theme.texteTertiaire}]}>{m.desc} · Ressenti {m.ressenti}°</Text>
                <View style={styles.meteoDetails}>
                  <View><Droplets size={14} color={COULEURS.bleuClair} /><Text style={[styles.meteoDetailText,{color:theme.texteTertiaire}]}>{m.humidite}%</Text></View>
                  <View><Wind size={14} color={COULEURS.cyan} /><Text style={[styles.meteoDetailText,{color:theme.texteTertiaire}]}>{m.vent} km/h</Text></View>
                </View>
                <View style={[styles.conseilBox,{backgroundColor:m.humidite>70?COULEURS.ambre+'15':COULEURS.emeraude+'15'}]}>
                  <Text style={{fontSize:12,color:m.humidite>70?COULEURS.ambre:COULEURS.emeraude}}>{m.conseil}</Text>
                </View>
              </Carte>
            ))}
          </Animated.View>
        )}

        {/* OPTIMISATION */}
        {etape===5 && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.centerCol}>
            <Text style={[styles.etapeTitre,{color:theme.texte}]}>Optimisation Multi-Camions</Text>
            <Carte style={styles.demoCard} ombre="sm">
              <Text style={[styles.demoNom,{color:theme.texte,marginBottom:8}]}>Dépôt: Fianarantsoa</Text>
              <Text style={[styles.demoMeta,{color:theme.texteTertiaire}]}>Camions: Camion A (5t) · Camion B (3t)</Text>
            </Carte>
            <Animated.View style={styles.spinnerWrapper}><Zap size={48} color={COULEURS.ambre} /></Animated.View>
            <BarreProgression progres={progres} couleur={COULEURS.ambre} etiquette="Greedy Nearest-Neighbor" />
            <View style={styles.stepsList}>
              {['Dijkstra distances','Capacités vérifiées','Tournées optimisées','Comparaison météo'].map((s,i)=>(
                <View key={s} style={styles.stepRow}>
                  <View style={[styles.stepDot,{backgroundColor:progres>i*25?COULEURS.ambre:theme.bordure}]} />
                  <Text style={[styles.stepText,{color:progres>i*25?theme.texte:theme.texteTertiaire}]}>{s}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* RÉSULTATS */}
        {etape===6 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre,{color:theme.texte}]}>Résultats Comparatifs</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}><CarteStatistique label="Distance" valeur={285} unite="km" icone={<Route size={16} color={COULEURS.bleu}/>} couleur={COULEURS.bleu} /></View>
              <View style={styles.metricHalf}><CarteStatistique label="Gain" valeur={32.1} unite="%" icone={<TrendingUp size={16} color={COULEURS.emeraude}/>} couleur={COULEURS.emeraude} /></View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}><CarteStatistique label="Carburant" valeur={228} unite="L" icone={<Package size={16} color={COULEURS.bleuClair}/>} couleur={COULEURS.bleuClair} /></View>
              <View style={styles.metricHalf}><CarteStatistique label="Camions" valeur={2} unite="" icone={<Truck size={16} color={COULEURS.vertClair}/>} couleur={COULEURS.vertClair} /></View>
            </View>

            <Carte style={styles.resultCard} ombre="sm">
              <Text style={[styles.resultTitle,{color:theme.texte}]}>Standard vs Ajusté Météo</Text>
              <View style={styles.compareRow}>
                <View style={[styles.compareBox,{backgroundColor:theme.carte}]}>
                  <Text style={[styles.compareLabel,{color:theme.texteTertiaire}]}>Standard</Text>
                  <Text style={[styles.compareValue,{color:COULEURS.emeraude}]}>285 km</Text>
                  <Text style={[styles.compareLabel,{color:theme.texteTertiaire}]}>+32,1%</Text>
                </View>
                <ChevronRight size={20} color={COULEURS.emeraude} />
                <View style={[styles.compareBox,{backgroundColor:COULEURS.bleu+'10',borderColor:COULEURS.bleu}]}>
                  <Text style={[styles.compareLabel,{color:COULEURS.bleu}]}>Avec Météo</Text>
                  <Text style={[styles.compareValue,{color:COULEURS.bleu}]}>312 km</Text>
                  <Text style={[styles.compareLabel,{color:theme.texteTertiaire}]}>+27,4%</Text>
                </View>
              </View>
            </Carte>

            <Carte style={styles.resultCard} ombre="sm">
              <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12}}>
                <Bot size={20} color={COULEURS.emeraude} />
                <Text style={[styles.resultTitle,{color:theme.texte,flex:1,marginBottom:0}]}>Assistant IA</Text>
              </View>
              <View style={[styles.iaMsg,{backgroundColor:theme.carte}]}>
                <Text style={{fontSize:13,color:theme.texte}}>Plan optimal : Camion A → Ambalavao (450 kg), Camion B → Mananjary + Manakara (840 kg). Gain 32,1% !</Text>
              </View>
            </Carte>
          </Animated.View>
        )}
      </ScrollView>

      {toast && <Notification notification={toast} onFermer={()=>setToast(null)} />}
    </SafeAreaView>
  );
}

function CheckMark() {
  return <Text style={{fontSize:16,color:COULEURS.emeraude,fontWeight:'800'}}>✓</Text>;
}

const styles = StyleSheet.create({
  conteneur: { flex: 1 },
  header: { paddingHorizontal: ESPACEMENTS.lg, paddingTop: ESPACEMENTS.xl, paddingBottom: ESPACEMENTS.lg, borderBottomWidth: 1 },
  headerTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: ESPACEMENTS.md },
  headerTitle: { flexDirection:'row', alignItems:'center', gap: ESPACEMENTS.sm },
  headerActions: { flexDirection:'row', alignItems:'center', gap: ESPACEMENTS.sm },
  iconBtn: { width:36, height:36, borderRadius:RAYONS.md, alignItems:'center', justifyContent:'center' },
  iconBadge: { width:36, height:36, borderRadius:RAYONS.md, alignItems:'center', justifyContent:'center' },
  headerTitre: { fontSize:16, fontWeight:'800' },
  headerSousTitre: { fontSize:11, color:'#94a3b8' },
  btnRestart: { padding: ESPACEMENTS.sm },
  pipeline: { flexDirection:'row', gap: ESPACEMENTS.lg, paddingVertical: ESPACEMENTS.sm },
  pipelineItem: { alignItems:'center', gap: ESPACEMENTS.xs },
  pipelineDot: { width:24, height:24, borderRadius:RAYONS.rond, borderWidth:2, alignItems:'center', justifyContent:'center' },
  pipelineActive: { width:10, height:10, borderRadius:RAYONS.rond },
  pipelineLabel: { fontSize:10, fontWeight:'600' },
  scroll: { padding: ESPACEMENTS.lg, paddingBottom: ESPACEMENTS.xxl },
  metricsRow: { flexDirection:'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  metricHalf: { flex: 1 },
  chartCard: { padding: ESPACEMENTS.lg, marginTop: ESPACEMENTS.md },
  chartTitle: { fontSize:14, fontWeight:'700', marginBottom: ESPACEMENTS.md },
  miniBars: { flexDirection:'row', justifyContent:'space-around', height:120 },
  miniBarCol: { flex:1, alignItems:'center' },
  miniBarWrapper: { width:'50%', justifyContent:'flex-end' },
  miniBar: { width:'100%', borderRadius:RAYONS.sm },
  miniBarLabel: { fontSize:10, marginTop: ESPACEMENTS.xs },
  etapeTitre: { fontSize:18, fontWeight:'800', marginBottom: ESPACEMENTS.lg },
  demoCard: { marginBottom: ESPACEMENTS.md, padding: ESPACEMENTS.md },
  demoCardRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: ESPACEMENTS.xs },
  demoNom: { fontSize:15, fontWeight:'700' },
  demoMeta: { fontSize:12, marginTop: ESPACEMENTS.xs },
  demoBadge: { fontSize:11, fontWeight:'700', paddingHorizontal:8, paddingVertical:2, borderRadius:RAYONS.sm, overflow:'hidden' },
  meteoDetails: { flexDirection:'row', gap: ESPACEMENTS.lg, marginTop: ESPACEMENTS.sm },
  meteoDetailText: { fontSize:12, fontWeight:'600' },
  conseilBox: { marginTop: ESPACEMENTS.sm, padding: ESPACEMENTS.sm, borderRadius:RAYONS.sm },
  centerCol: { alignItems:'center', paddingVertical: ESPACEMENTS.xl },
  spinnerWrapper: { marginBottom: ESPACEMENTS.xl },
  stepsList: { width:'100%', marginTop: ESPACEMENTS.lg },
  stepRow: { flexDirection:'row', alignItems:'center', gap: ESPACEMENTS.sm, paddingVertical: ESPACEMENTS.sm },
  stepDot: { width:8, height:8, borderRadius:RAYONS.rond },
  stepText: { fontSize:13, fontWeight:'500' },
  resultCard: { padding: ESPACEMENTS.lg, marginTop: ESPACEMENTS.md },
  resultTitle: { fontSize:15, fontWeight:'700', marginBottom: ESPACEMENTS.md },
  compareRow: { flexDirection:'row', alignItems:'center', gap: ESPACEMENTS.md },
  compareBox: { flex:1, padding: ESPACEMENTS.md, borderRadius:RAYONS.md, borderWidth:1, alignItems:'center', borderColor:'transparent' },
  compareLabel: { fontSize:11, fontWeight:'600', marginBottom: ESPACEMENTS.xs },
  compareValue: { fontSize:18, fontWeight:'800' },
  iaMsg: { padding: ESPACEMENTS.md, borderRadius:RAYONS.lg },
});
