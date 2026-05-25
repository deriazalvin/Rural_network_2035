import { useState, useRef, useCallback } from 'react';
import { Bot, X, Send, ChevronDown } from 'lucide-react';
import { ServiceDonnees } from '../../services/ServiceDonnees';
import './ChatBot.css';

function formaterTexte(texte) {
  const map = {
    '***': '', '**': '', '__': '', '`': '',
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
  };
  let t = texte;
  for (const [k, v] of Object.entries(map)) t = t.split(k).join(v);
  return t
    .split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    .map(p => {
      if (/^-\s/.test(p)) {
        return '<li>' + p.replace(/^-\s+/, '') + '</li>';
      }
      return '<p>' + p + '</p>';
    })
    .join('\n')
    .replace(/(<li>.*?<\/li>(\n|$))+/g, m => '<ul>' + m.replace(/\n/g, '') + '</ul>');
}

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function ChatBot({ utilisateur }) {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState([]);
  const [saisie, setSaisie] = useState('');
  const [charge, setCharge] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - 90, y: window.innerHeight - 100 });
  const [drag, setDrag] = useState(false);
  const msgFin = useRef(null);
  const service = useRef(new ServiceDonnees());

  const envoyer = useCallback(async () => {
    if (!saisie.trim()) return;
    const q = saisie.trim();
    const h = now();
    setSaisie('');
    setMessages(m => [...m, { role: 'user', texte: q, heure: h }]);
    setCharge(true);
    try {
      const rep = await service.current.poserQuestionIA(q);
      setMessages(m => [...m, { role: 'ia', texte: rep.reponse || rep, heure: now() }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'ia', texte: 'Erreur: impossible de contacter l\'assistant.', heure: now() }]);
    }
    setCharge(false);
  }, [saisie]);

  const handleMouseDown = (e) => {
    if (ouvert) return;
    setDrag(true);
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...pos };

    const handleMove = (ev) => {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 60, startPos.x + (ev.clientX - startX))),
        y: Math.max(0, Math.min(window.innerHeight - 60, startPos.y + (ev.clientY - startY)))
      });
    };
    const handleUp = () => {
      setDrag(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  if (!utilisateur) return null;

  return (
    <div className="chatbot-wrapper">
      {ouvert && (
        <div className="chatbot-panel" style={{ bottom: Math.min(80, window.innerHeight - pos.y - 60) + 20 + 'px' }}>
          <div className="chatbot-header">
            <Bot size={20} />
            <span>Assistant RN</span>
            <button className="chatbot-close" onClick={() => setOuvert(false)}><X size={18} /></button>
          </div>
          <div className="chatbot-msgs">
            {messages.length === 0 && (
              <div className="chatbot-msg ia">Bonjour! Posez-moi une question sur vos donnees, la meteo, les routes, etc.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.role}`}>
                <div className="chatbot-msg-texte" dangerouslySetInnerHTML={{ __html: m.role === 'ia' ? formaterTexte(m.texte) : m.texte.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }} />
                <div className="chatbot-msg-heure">{m.heure}</div>
              </div>
            ))}
            {charge && <div className="chatbot-msg ia">Reflexion en cours...</div>}
            <div ref={msgFin} />
          </div>
          <div className="chatbot-input">
            <input
              value={saisie}
              onChange={e => setSaisie(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && envoyer()}
              placeholder="Posez votre question..."
              disabled={charge}
            />
            <button onClick={envoyer} disabled={charge || !saisie.trim()}>
              {charge ? <ChevronDown className="spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
      <button
        className="chatbot-bubble"
        style={{ left: pos.x, top: pos.y }}
        onMouseDown={handleMouseDown}
        onClick={() => { if (!drag) setOuvert(o => !o); }}
        title="Assistant IA"
      >
        <Bot size={28} />
      </button>
    </div>
  );
}
