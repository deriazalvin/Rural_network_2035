-- Script d'insertion de données de démonstration pour Rural Network 2035
-- Ce script crée un réseau rural fictif à Madagascar avec 8 villages connectés

-- Insertion des villages
INSERT INTO villages (nom, latitude, longitude, volume_production) VALUES
('Antananarivo', -18.8792, 47.5079, 2000),
('Antsirabe', -19.8658, 47.0344, 1500),
('Ambositra', -20.5261, 47.2464, 1200),
('Fianarantsoa', -21.4533, 47.0867, 1800),
('Ambalavao', -21.8333, 46.9333, 1000),
('Ambohimahasoa', -20.7500, 47.2500, 800),
('Fandriana', -20.2500, 47.3833, 900),
('Betafo', -19.8333, 46.8500, 1100)
ON CONFLICT DO NOTHING;

-- Obtenir les IDs des villages (pour référence)
-- Dans une application réelle, vous utiliseriez les UUIDs générés

-- Insertion des routes (basées sur des distances approximatives)
-- Note: Ces valeurs sont fictives pour la démonstration

-- Routes depuis Antananarivo
INSERT INTO routes (village_depart_id, village_arrivee_id, distance, qualite_route, est_bloquee)
SELECT
  v1.id,
  v2.id,
  CASE
    WHEN v2.nom = 'Antsirabe' THEN 170
    WHEN v2.nom = 'Fandriana' THEN 220
  END as distance,
  CASE
    WHEN v2.nom = 'Antsirabe' THEN 'bonne'
    WHEN v2.nom = 'Fandriana' THEN 'moyenne'
  END as qualite_route,
  false
FROM villages v1, villages v2
WHERE v1.nom = 'Antananarivo'
  AND v2.nom IN ('Antsirabe', 'Fandriana')
ON CONFLICT DO NOTHING;

-- Routes depuis Antsirabe
INSERT INTO routes (village_depart_id, village_arrivee_id, distance, qualite_route, est_bloquee)
SELECT
  v1.id,
  v2.id,
  CASE
    WHEN v2.nom = 'Betafo' THEN 25
    WHEN v2.nom = 'Ambositra' THEN 90
  END as distance,
  CASE
    WHEN v2.nom = 'Betafo' THEN 'bonne'
    WHEN v2.nom = 'Ambositra' THEN 'moyenne'
  END as qualite_route,
  false
FROM villages v1, villages v2
WHERE v1.nom = 'Antsirabe'
  AND v2.nom IN ('Betafo', 'Ambositra')
ON CONFLICT DO NOTHING;

-- Routes depuis Ambositra
INSERT INTO routes (village_depart_id, village_arrivee_id, distance, qualite_route, est_bloquee)
SELECT
  v1.id,
  v2.id,
  CASE
    WHEN v2.nom = 'Ambohimahasoa' THEN 35
    WHEN v2.nom = 'Fandriana' THEN 40
    WHEN v2.nom = 'Fianarantsoa' THEN 95
  END as distance,
  CASE
    WHEN v2.nom = 'Ambohimahasoa' THEN 'moyenne'
    WHEN v2.nom = 'Fandriana' THEN 'bonne'
    WHEN v2.nom = 'Fianarantsoa' THEN 'moyenne'
  END as qualite_route,
  false
FROM villages v1, villages v2
WHERE v1.nom = 'Ambositra'
  AND v2.nom IN ('Ambohimahasoa', 'Fandriana', 'Fianarantsoa')
ON CONFLICT DO NOTHING;

-- Routes depuis Fianarantsoa
INSERT INTO routes (village_depart_id, village_arrivee_id, distance, qualite_route, est_bloquee)
SELECT
  v1.id,
  v2.id,
  CASE
    WHEN v2.nom = 'Ambalavao' THEN 58
    WHEN v2.nom = 'Ambohimahasoa' THEN 60
  END as distance,
  CASE
    WHEN v2.nom = 'Ambalavao' THEN 'bonne'
    WHEN v2.nom = 'Ambohimahasoa' THEN 'mauvaise'
  END as qualite_route,
  false
FROM villages v1, villages v2
WHERE v1.nom = 'Fianarantsoa'
  AND v2.nom IN ('Ambalavao', 'Ambohimahasoa')
ON CONFLICT DO NOTHING;

-- Route depuis Betafo
INSERT INTO routes (village_depart_id, village_arrivee_id, distance, qualite_route, est_bloquee)
SELECT
  v1.id,
  v2.id,
  42 as distance,
  'moyenne' as qualite_route,
  false
FROM villages v1, villages v2
WHERE v1.nom = 'Betafo'
  AND v2.nom = 'Fandriana'
ON CONFLICT DO NOTHING;

-- Route depuis Fandriana
INSERT INTO routes (village_depart_id, village_arrivee_id, distance, qualite_route, est_bloquee)
SELECT
  v1.id,
  v2.id,
  50 as distance,
  'mauvaise' as qualite_route,
  false
FROM villages v1, villages v2
WHERE v1.nom = 'Fandriana'
  AND v2.nom = 'Ambohimahasoa'
ON CONFLICT DO NOTHING;

-- Route depuis Ambohimahasoa
INSERT INTO routes (village_depart_id, village_arrivee_id, distance, qualite_route, est_bloquee)
SELECT
  v1.id,
  v2.id,
  65 as distance,
  'moyenne' as qualite_route,
  false
FROM villages v1, villages v2
WHERE v1.nom = 'Ambohimahasoa'
  AND v2.nom = 'Ambalavao'
ON CONFLICT DO NOTHING;
