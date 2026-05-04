import React from 'react';
import { Route } from 'lucide-react';
import { FileText, Home, Brain, TrendingUp } from "lucide-react";
/**
 * Composant HowItWorks - Section expliquant le processus en 4 étapes
 */
const HowItWorks = () => {
  const steps = [
  {
    icon: FileText,
    number: '01',
    title: 'Inscription',
    desc: 'Créez votre compte et configurez votre espace de travail en quelques minutes.'
  },
  {
    icon: Home,
    number: '02',
    title: 'Configuration',
    desc: 'Ajoutez vos villages, vos camions et les routes de votre réseau logistique.'
  },
  {
    icon: Brain,
    number: '03',
    title: 'Optimisation',
    desc: "Optimiser avec sureté."
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Résultats',
    desc: 'Analysez les performances et comparez les différents scénarios.'
  }
];

  return (
    <section className="how-section" id="how">
      {/* En-tête */}
      <div className="section-header scroll-animate" style={{ padding: '0 60px' }}>
        <span className="section-label">
          <Route size={14} style={{ display: 'inline' }} />
          Comment ça marche
        </span>
        <h2 className="section-title">
          4 étapes simples pour<br />
          optimiser votre réseau
        </h2>
        <p className="section-subtitle">
          Un processus simple et intuitif pour transformer votre logistique rurale.
        </p>
      </div>

      {/* Étapes */}
      <div className="how-steps">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="how-step scroll-animate" 
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-icon">
                <step.icon size={24} />
            </div>
            <h4>{step.title}</h4>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
