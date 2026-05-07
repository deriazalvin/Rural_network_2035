import React, { useState, useEffect } from 'react';
import { Truck, Trash2, Edit2, Plus, AlertCircle } from 'lucide-react';
import '../styles/gestion-camions.css';

/**
 * Composant GestionCamions - Refactorisé et modulaire
 * Gère l'ajout, la modification et la suppression de camions
 */
export default function GestionCamions({ camions = [], onModifierCamions }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formulaire, setFormulaire] = useState({ nom: '', capaciteKg: '', couleurHex: '#00d4ff' });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [camionEnEdition, setCamionEnEdition] = useState(null);

  const couleursDisponibles = [
    { label: 'Cyan', valeur: '#00d4ff' },
    { label: 'Purple', valeur: '#7c3aed' },
    { label: 'Green', valeur: '#4ade80' },
    { label: 'Orange', valeur: '#fb923c' },
    { label: 'Red', valeur: '#ef4444' }
  ];

  // Fonction pour obtenir les couleurs disponibles (non utilisées par d'autres camions)
  const obtenirCouleursDisponibles = () => {
    const couleursUtilisees = camions.map(c => c.couleurHex);
    return couleursDisponibles.filter(couleur => !couleursUtilisees.includes(couleur.valeur));
  };

  // Fonction pour trouver la première couleur disponible
  const obtenirPremiereCouleurDisponible = () => {
    const couleursDispo = obtenirCouleursDisponibles();
    return couleursDispo.length > 0 ? couleursDispo[0].valeur : '#2d5016';
  };

  // Mettre à jour la couleur du formulaire si elle n'est plus disponible
  useEffect(() => {
    const couleursUtilisees = camions.map(c => c.couleurHex);
    if (couleursUtilisees.includes(formulaire.couleurHex)) {
      setFormulaire(prev => ({
        ...prev,
        couleurHex: obtenirPremiereCouleurDisponible()
      }));
    }
  }, [camions]);

  const obtenirHeadersAuthentifies = (headersSupplementaires = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...headersSupplementaires
    };

    const token = localStorage.getItem('rn_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    setErreur('');

    const capacite = parseFloat(formulaire.capaciteKg);
    if (!formulaire.nom || isNaN(capacite) || capacite <= 0) {
      setErreur('Nom et capacité (kg) requis.');
      return;
    }

    setChargement(true);
    try {
      const reponse = await fetch('/api/camions', {
        method: 'POST',
        headers: obtenirHeadersAuthentifies(),
        body: JSON.stringify({
          nom: formulaire.nom,
          capaciteKg: capacite,
          couleurHex: formulaire.couleurHex
        })
      });

      if (reponse.ok) {
        const nouveauCamion = await reponse.json();
        setFormulaire({ nom: '', capaciteKg: '', couleurHex: '#2d5016' });
        onModifierCamions([...camions, nouveauCamion]);
        setErreur('');
      } else {
        setErreur('Erreur lors de la création du camion.');
      }
    } catch (err) {
      setErreur('Erreur de connexion au serveur. Vérifiez que le backend est actif.');
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const gererSuppression = async (id) => {
    if (!window.confirm('Supprimer ce camion ?')) return;
    
    try {
      const reponse = await fetch(`/api/camions/${id}`, {
        method: 'DELETE',
        headers: obtenirHeadersAuthentifies()
      });
      if (reponse.ok) {
        onModifierCamions(camions.filter(c => c.id !== id));
        setErreur('');
      } else {
        setErreur('Erreur lors de la suppression.');
      }
    } catch (err) {
      setErreur('Erreur de connexion.');
    }
  };

  const gererChangementEtat = async (id, nouvelEtat) => {
    try {
      const reponse = await fetch(`/api/camions/${id}/etat`, {
        method: 'PUT',
        headers: obtenirHeadersAuthentifies(),
        body: JSON.stringify({ etat: nouvelEtat })
      });

      if (reponse.ok) {
        const camionMaj = await reponse.json();
        onModifierCamions(camions.map(c => c.id === id ? camionMaj : c));
      }
    } catch (err) {
      setErreur('Erreur lors de la mise à jour de l\'état.');
    }
  };

  const getEtatStyle = (etat) => {
    const styles = {
      DISPONIBLE: '#6b9d4a',
      OCCUPE: '#d97706',
      EN_PANNE: '#dc2626'
    };
    return styles[etat] || '#6b7280';
  };

  const getEtiquetteEtat = (etat) => {
    const etiquettes = {
      DISPONIBLE: '✓ Disponible',
      OCCUPE: '⊗ Occupé',
      EN_PANNE: '✕ En panne'
    };
    return etiquettes[etat] || etat;
  };

  return (
    <div className="gestion-camions-container section-carte">
      <h2 className="gestion-camions-title">
        <Truck size={26} />
        Gestion de la Flotte
      </h2>

      {/* === MINI STATISTIQUES === */}
      <div className="camions-stats">
        <div className="stat-card">
          <div className="stat-label">Total Camions</div>
          <div className="stat-value">{camions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Disponibles</div>
          <div className="stat-value">{camions.filter(c => c.etat === 'DISPONIBLE').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Capacité Totale</div>
          <div className="stat-value">{(camions.reduce((sum, c) => sum + (c.capaciteKg || 0), 0) / 1000).toFixed(1)}<span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}> t</span></div>
        </div>
      </div>

      {/* === FORMULAIRE === */}
      <form onSubmit={gererSoumission} className="formulaire">
        {erreur && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{erreur}</span>
          </div>
        )}

        <div className="grille-formulaire">
          <input
            type="text"
            placeholder="Nom du camion"
            value={formulaire.nom}
            onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
            className="champ-saisie"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Capacité (kg)"
            value={formulaire.capaciteKg}
            onChange={(e) => setFormulaire({ ...formulaire, capaciteKg: e.target.value })}
            className="champ-saisie"
          />
          <select
            value={formulaire.couleurHex}
            onChange={(e) => setFormulaire({ ...formulaire, couleurHex: e.target.value })}
            className="champ-saisie"
            disabled={obtenirCouleursDisponibles().length === 0}
          >
            {obtenirCouleursDisponibles().length === 0 ? (
              <option value="">Toutes les couleurs sont utilisées</option>
            ) : (
              obtenirCouleursDisponibles().map(c => (
                <option key={c.valeur} value={c.valeur}>{c.label}</option>
              ))
            )}
          </select>
        </div>
        <button type="submit" disabled={chargement} className="btn btn-primary">
          {chargement ? 'Ajout en cours...' : 'Ajouter un Camion'}
        </button>
      </form>

      {/* === LISTE DES CAMIONS === */}
      <h3 style={{ marginTop: '32px' }}>Camions Enregistrés</h3>
      <div className="grille-cartes" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {camions.map((camion) => (
          <div key={camion.id} className="carte-village">
            <div className="carte-entete" style={{ marginBottom: '12px' }}>
              <h4>{camion.nom}</h4>
              <button
                onClick={() => gererSuppression(camion.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#dc2626',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="detail-village">
              Capacité: <strong>{(camion.capaciteKg || 0).toLocaleString('fr-FR')}</strong> kg
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid #e8dfc8',
                  backgroundColor: camion.couleurHex || '#2d5016'
                }}
              />
              <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Couleur: {camion.couleurHex}</span>
            </div>

            <select
              value={camion.etat || 'DISPONIBLE'}
              onChange={(e) => gererChangementEtat(camion.id, e.target.value)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                border: `2px solid ${getEtatStyle(camion.etat)}`,
                borderRadius: '6px',
                background: '#f3f4f6',
                color: getEtatStyle(camion.etat),
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCCUPE">Occupé</option>
              <option value="EN_PANNE">En panne</option>
            </select>

            <div style={{
              marginTop: '12px',
              padding: '8px',
              background: '#f9fafb',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: getEtatStyle(camion.etat)
            }}>
              {getEtiquetteEtat(camion.etat)}
            </div>
          </div>
        ))}
      </div>

      {camions.length === 0 && (
        <p className="texte-vide">Aucun camion enregistré. Additionnez un camion pour commencer.</p>
      )}
    </div>
  );
}
