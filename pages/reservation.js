// frontend/pages/reservation.js - Page Réservation LE SAGE
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchSettings, createReservation, checkAuth } from '../utils/api';
import { authClient } from '../lib/auth-client';
import { Calendar, Video, MapPin, Clock, CheckCircle, Sparkles, Zap, Target, Gift } from 'lucide-react';

const MEETING_IMG = {
  enLigne: '/image-website/meeting%20en%20ligne.svg',
  presentiel: '/image-website/meeting%20presentiel.svg',
};

export default function Reservation() {
  const router = useRouter();
  const [settings, setSettings] = useState({});
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    reservation_date: '',
    reservation_time: '',
    meeting_type: 'visio',
    project_type: '',
    estimated_budget: '',
    message: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    loadData();
    setTimeout(() => setMounted(true), 50);
  }, []);

  const loadData = async () => {
    try {
      const settingsData = await fetchSettings();
      setSettings(settingsData);

      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, reservation_date: today }));

      const betterAuthSession = await authClient.getSession();
      if (betterAuthSession?.data?.user) {
        const u = betterAuthSession.data.user;
        const nameParts = (u.name || '').trim().split(/\s+/);
        const { ensureBackendToken } = await import('../utils/api');
        await ensureBackendToken();
        setUser({
          id: u.id,
          email: u.email,
          firstname: nameParts[0] || u.email?.split('@')[0] || 'Utilisateur',
          lastname: nameParts.slice(1).join(' ') || '',
        });
        return;
      }

      const authData = await checkAuth();
      if (authData.authenticated) {
        setUser(authData.user);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.reservation_date) {
      newErrors.push('La date est requise');
    }
    
    if (!formData.reservation_time) {
      newErrors.push('L\'heure est requise');
    }

    if (!formData.project_type) {
      newErrors.push('Le type de projet est requis');
    }

    const reservationDateTime = new Date(`${formData.reservation_date}T${formData.reservation_time}`);
    if (reservationDateTime < new Date()) {
      newErrors.push('La date et l\'heure doivent être dans le futur');
    }

    const [hour, minute] = formData.reservation_time.split(':').map(Number);
    const timeInMinutes = hour * 60 + minute;
    
    const workStart = 9 * 60; // 9h00
    const workEnd = 18 * 60; // 18h00

    if (timeInMinutes < workStart || timeInMinutes > workEnd) {
      newErrors.push('Horaires disponibles : 9h00-18h00');
    }

    return newErrors;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login?redirect=/reservation');
      return;
    }

    setErrors([]);
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      await createReservation(formData);
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      setErrors([error.message || 'Une erreur est survenue']);
      setLoading(false);
      triggerShake();
    }
  };

  // Créneaux horaires pour heures de bureau
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  if (success) {
    return (
      <>
        <Head>
          <title>Rendez-vous confirmé - {settings.site_name || 'LE SAGE'}</title>
        </Head>

        <Header settings={settings} />

        <div className="success-page">
          <div className="bg-effects">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
          </div>
          <div className="success-container">
            <div className="success-animation">
              <div className="check-circle">
                <CheckCircle size={120} />
              </div>
            </div>
            
            <h1>Rendez-vous confirmé !</h1>
            <p className="success-subtitle">Nous avons hâte de discuter de votre projet</p>
            
            <div className="reservation-card">
              <div className="card-header">
                <Calendar size={32} />
                <h3>Détails de votre rendez-vous</h3>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <Calendar size={24} />
                  <div className="detail-content">
                    <strong>Date</strong>
                    <p>{new Date(formData.reservation_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <Clock size={24} />
                  <div className="detail-content">
                    <strong>Heure</strong>
                    <p>{formData.reservation_time}</p>
                  </div>
                </div>
                <div className="detail-row">
                  {formData.meeting_type === 'visio' ? <Video size={24} /> : <MapPin size={24} />}
                  <div className="detail-content">
                    <strong>Type</strong>
                    <p>{formData.meeting_type === 'visio' ? 'Visioconférence' : 'Présentiel'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-primary"
              onClick={() => router.push('/dashboard')}
            >
              Voir mes rendez-vous
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <Footer settings={settings} />

        <style jsx>{`
          .success-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            background: #0A0E27;
            position: relative;
            overflow: hidden;
          }

          .bg-effects {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }

          .gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.3;
            animation: float 20s ease-in-out infinite;
          }

          .orb-1 {
            width: 600px;
            height: 600px;
            background: linear-gradient(135deg, #0066FF, #00D9FF);
            top: -300px;
            right: -300px;
          }

          .orb-2 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #FF6B35, #764ba2);
            bottom: -250px;
            left: -250px;
            animation-delay: 10s;
          }

          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(50px, 50px) scale(1.1); }
          }

          .success-container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 60px 40px;
            border-radius: 32px;
            max-width: 600px;
            width: 100%;
            text-align: center;
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
            position: relative;
            z-index: 1;
            animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .success-animation {
            margin-bottom: 30px;
          }

          .check-circle {
            color: #10b981;
            animation: scaleIn 0.5s ease;
          }

          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }

          .success-container h1 {
            font-size: 3em;
            font-weight: 900;
            background: linear-gradient(135deg, #0066FF, #00D9FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
          }

          .success-subtitle {
            font-size: 1.3em;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 40px;
          }

          .reservation-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 24px;
            padding: 30px;
            margin-bottom: 35px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .card-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 25px;
            color: #00D9FF;
          }

          .card-header h3 {
            font-size: 1.5em;
            font-weight: 800;
            color: white;
            margin: 0;
          }

          .card-body {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .detail-row {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            text-align: left;
            transition: all 0.3s;
            color: #00D9FF;
          }

          .detail-row:hover {
            transform: translateX(5px);
            background: rgba(255, 255, 255, 0.06);
          }

          .detail-content strong {
            display: block;
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.6);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }

          .detail-content p {
            font-size: 1.2em;
            font-weight: 700;
            color: white;
            margin: 0;
          }

          .btn-primary {
            width: 100%;
            padding: 20px;
            background: linear-gradient(135deg, #0066FF, #00D9FF);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.2em;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(0, 102, 255, 0.4);
          }

          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0, 102, 255, 0.6);
          }

          @media (max-width: 768px) {
            .success-container {
              padding: 40px 25px;
            }

            .success-container h1 {
              font-size: 2.2em;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Prendre rendez-vous - {settings.site_name || 'LE SAGE'}</title>
        <meta name="description" content="Réservez une consultation gratuite pour discuter de votre projet web" />
      </Head>

      <Header settings={settings} />

      <div className="reservation-page">
        <div className="bg-effects">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
        </div>

        {/* Hero Section */}
        <section className={`hero ${mounted ? 'mounted' : ''}`}>
          <div className="hero-content">
            <div className="hero-badge">
              <Gift size={20} />
              <span>Consultation gratuite</span>
            </div>
            <h1>Discutons de votre projet web</h1>
            <p>Une solution sur-mesure, entièrement customizable et adaptée à vos besoins</p>
          </div>
        </section>

        <div className="container">
          <div className={`main-grid ${mounted ? 'mounted' : ''}`}>
            {/* Sidebar informative */}
            <aside className="sidebar">
              <div className="info-card highlight">
                <div className="info-header">
                  <Sparkles size={32} className="info-icon" />
                  <h3>Pourquoi nous choisir ?</h3>
                </div>
                <div className="info-body">
                  <ul className="benefits-list">
                    <li>
                      <Zap size={20} className="check" />
                      <div>
                        <strong>100% Customizable</strong>
                        <p>Chaque projet est unique et adapté à vos besoins</p>
                      </div>
                    </li>
                    <li>
                      <Gift size={20} className="check" />
                      <div>
                        <strong>Consultation gratuite</strong>
                        <p>Premier rendez-vous offert pour évaluer votre projet</p>
                      </div>
                    </li>
                    <li>
                      <Target size={20} className="check" />
                      <div>
                        <strong>Adaptabilité totale</strong>
                        <p>Votre projet évolue avec vous, sans limite</p>
                      </div>
                    </li>
                    <li>
                      <CheckCircle size={20} className="check" />
                      <div>
                        <strong>Accompagnement complet</strong>
                        <p>De la conception à la mise en ligne</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <Clock size={32} className="info-icon" />
                  <h3>Horaires</h3>
                </div>
                <div className="info-body">
                  <div className="time-slot">
                    <span className="slot-emoji">💼</span>
                    <div>
                      <strong>Lundi - Vendredi</strong>
                      <p>9h00 - 18h00</p>
                    </div>
                  </div>
                  <div className="time-slot closed">
                    <span className="slot-emoji">🚫</span>
                    <div>
                      <strong>Week-end</strong>
                      <p>Sur demande</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <Video size={32} className="info-icon" />
                  <h3>Type de réunion</h3>
                </div>
                <div className="info-body">
                  <div className="meeting-type-info">
                    <div className="meeting-option meeting-option--illustrated">
                      <div className="meeting-option-image">
                        <img src={MEETING_IMG.enLigne} alt="Visioconférence" />
                      </div>
                      <div>
                        <strong>Visioconférence</strong>
                        <p>Rapide et flexible</p>
                      </div>
                    </div>
                    <div className="meeting-option meeting-option--illustrated">
                      <div className="meeting-option-image">
                        <img src={MEETING_IMG.presentiel} alt="Présentiel" />
                      </div>
                      <div>
                        <strong>Présentiel</strong>
                        <p>À Lyon ou en déplacement</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Formulaire principal */}
            <main className="form-section">
              <div className={`form-container ${shake ? 'shake' : ''}`}>
                <div className="form-header">
                  <h2>Prendre rendez-vous</h2>
                  <p>Remplissez le formulaire pour réserver votre consultation gratuite</p>
                </div>

                {!user && (
                  <div className="alert alert-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <div>
                      <strong>Connexion requise</strong>
                      <p>
                        <a href="/login?redirect=/reservation">Connectez-vous</a> pour prendre rendez-vous
                      </p>
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="alert alert-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <div>
                      <strong>Erreur</strong>
                      <ul>
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Date Selection */}
                  <div className="form-group">
                    <label>
                      <Calendar size={20} className="label-icon" />
                      Date du rendez-vous
                      <span className="required">*</span>
                    </label>
                    <div className="input-enhanced">
                      <input
                        type="date"
                        name="reservation_date"
                        value={formData.reservation_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        disabled={loading || !user}
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="form-group">
                    <label>
                      <Clock size={20} className="label-icon" />
                      Heure du rendez-vous
                      <span className="required">*</span>
                    </label>
                    <div className="time-selector">
                      <div className="time-buttons">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            className={`time-btn ${formData.reservation_time === time ? 'active' : ''}`}
                            onClick={() => setFormData({...formData, reservation_time: time})}
                            disabled={loading || !user}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Type de réunion */}
                  <div className="form-group">
                    <label>
                      <Video size={20} className="label-icon" />
                      Type de réunion
                      <span className="required">*</span>
                    </label>
                    <div className="meeting-type-selector">
                      <button
                        type="button"
                        className={`meeting-btn ${formData.meeting_type === 'visio' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, meeting_type: 'visio'})}
                        disabled={loading || !user}
                      >
                        <div className="meeting-btn-image">
                          <img src={MEETING_IMG.enLigne} alt="Visioconférence" />
                        </div>
                        <span>Visioconférence</span>
                        <small>Recommandé</small>
                      </button>
                      <button
                        type="button"
                        className={`meeting-btn ${formData.meeting_type === 'presentiel' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, meeting_type: 'presentiel'})}
                        disabled={loading || !user}
                      >
                        <div className="meeting-btn-image">
                          <img src={MEETING_IMG.presentiel} alt="Présentiel" />
                        </div>
                        <span>Présentiel</span>
                        <small>Lyon</small>
                      </button>
                    </div>
                  </div>

                  {/* Type de projet */}
                  <div className="form-group">
                    <label>
                      <Target size={20} className="label-icon" />
                      Type de projet
                      <span className="required">*</span>
                    </label>
                    <div className="input-enhanced">
                      <select
                        name="project_type"
                        value={formData.project_type}
                        onChange={handleChange}
                        required
                        disabled={loading || !user}
                      >
                        <option value="">Sélectionnez un type de projet</option>
                        <option value="vitrine">Site Vitrine</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="webapp">Application Web</option>
                        <option value="refonte">Refonte & Optimisation</option>
                        <option value="other">Autre projet</option>
                      </select>
                    </div>
                  </div>

                  {/* Budget estimé */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">💰</span>
                      Budget estimé
                    </label>
                    <div className="input-enhanced">
                      <select
                        name="estimated_budget"
                        value={formData.estimated_budget}
                        onChange={handleChange}
                        disabled={loading || !user}
                      >
                        <option value="">Sélectionnez une fourchette</option>
                        <option value="<2000">Moins de 2 000€</option>
                        <option value="2000-5000">2 000€ - 5 000€</option>
                        <option value="5000-10000">5 000€ - 10 000€</option>
                        <option value="10000-20000">10 000€ - 20 000€</option>
                        <option value=">20000">Plus de 20 000€</option>
                        <option value="custom">Sur devis</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label>
                      <span className="label-icon">💬</span>
                      Décrivez votre projet
                    </label>
                    <div className="input-enhanced">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Parlez-nous de votre projet, vos besoins, vos objectifs..."
                        disabled={loading || !user}
                      ></textarea>
                    </div>
                    <p className="form-hint">
                      💡 Plus vous nous en direz, mieux nous pourrons vous conseiller lors de la consultation
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading || !user}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Réservation en cours...
                      </>
                    ) : (
                      <>
                        <Calendar size={24} />
                        Confirmer le rendez-vous
                      </>
                    )}
                  </button>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .reservation-page {
          min-height: 100vh;
          background: #0A0E27;
          padding-top: 80px;
          position: relative;
          overflow-x: hidden;
        }

        .bg-effects {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          top: -300px;
          right: -300px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #FF6B35, #764ba2);
          bottom: -250px;
          left: -250px;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 50px) scale(1.1); }
        }

        /* HERO SECTION */
        .hero {
          min-height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 80px 20px;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
          max-width: 900px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-content.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          font-weight: 700;
          margin-bottom: 25px;
          font-size: 0.95em;
          color: white;
        }

        .hero-content h1 {
          font-size: 4.5em;
          font-weight: 900;
          margin-bottom: 20px;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-content p {
          font-size: 1.5em;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        /* CONTAINER */
        .container {
          max-width: 1400px;
          margin: -80px auto 0;
          padding: 0 20px 80px;
          position: relative;
          z-index: 10;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 35px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .main-grid.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        /* SIDEBAR */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 30px;
          transition: all 0.3s;
        }

        .info-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 102, 255, 0.3);
          box-shadow: 0 10px 30px rgba(0, 102, 255, 0.2);
        }

        .info-card.highlight {
          background: rgba(0, 102, 255, 0.1);
          border-color: rgba(0, 102, 255, 0.3);
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
        }

        .info-icon {
          color: #00D9FF;
          flex-shrink: 0;
        }

        .info-header h3 {
          font-size: 1.4em;
          font-weight: 800;
          color: white;
          margin: 0;
        }

        .info-body {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .benefits-list li {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.3s;
        }

        .benefits-list li:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(5px);
        }

        .benefits-list li .check {
          color: #00D9FF;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .benefits-list li strong {
          display: block;
          color: white;
          font-size: 1.05em;
          margin-bottom: 5px;
        }

        .benefits-list li p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9em;
          margin: 0;
          line-height: 1.5;
        }

        .time-slot,
        .meeting-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .time-slot:hover,
        .meeting-option:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(5px);
        }

        .time-slot.closed {
          opacity: 0.5;
        }

        .slot-emoji {
          font-size: 2em;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .time-slot strong,
        .meeting-option strong {
          display: block;
          font-size: 0.9em;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3px;
        }

        .time-slot p,
        .meeting-option p {
          font-size: 1.1em;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .meeting-type-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meeting-option {
          color: #00D9FF;
        }

        .meeting-option--illustrated {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .meeting-option-image {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 102, 255, 0.1);
          border-radius: 14px;
          padding: 10px;
        }

        .meeting-option-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        /* FORM SECTION */
        .form-section {
          display: flex;
          flex-direction: column;
        }

        .form-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 50px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .form-container.shake {
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-header h2 {
          font-size: 3em;
          font-weight: 900;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .form-header p {
          font-size: 1.2em;
          color: rgba(255, 255, 255, 0.7);
        }

        /* ALERTS */
        .alert {
          display: flex;
          gap: 15px;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 30px;
          animation: slideIn 0.4s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .alert-info {
          background: rgba(59, 130, 246, 0.15);
          border: 2px solid rgba(59, 130, 246, 0.3);
        }

        .alert-info svg {
          stroke: #3b82f6;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid rgba(239, 68, 68, 0.3);
        }

        .alert-error svg {
          stroke: #ef4444;
        }

        .alert strong {
          display: block;
          font-weight: 800;
          margin-bottom: 5px;
          color: white;
        }

        .alert p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .alert a {
          color: #00D9FF;
          font-weight: 700;
          text-decoration: underline;
        }

        .alert ul {
          list-style: none;
          padding: 0;
          margin: 5px 0 0;
        }

        .alert li {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          margin-bottom: 3px;
        }

        /* FORM ELEMENTS */
        .form-group {
          margin-bottom: 35px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          font-size: 1.1em;
          font-weight: 700;
          color: white;
        }

        .label-icon {
          color: #00D9FF;
        }

        .required {
          color: #FF6B35;
        }

        .input-enhanced {
          position: relative;
        }

        .input-enhanced input,
        .input-enhanced textarea,
        .input-enhanced select {
          width: 100%;
          padding: 18px 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          font-size: 1.1em;
          font-family: inherit;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .input-enhanced input::placeholder,
        .input-enhanced textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .input-enhanced input:focus,
        .input-enhanced textarea:focus,
        .input-enhanced select:focus {
          outline: none;
          border-color: #0066FF;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.2);
        }

        .input-enhanced input:disabled,
        .input-enhanced textarea:disabled,
        .input-enhanced select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-enhanced textarea {
          resize: vertical;
          min-height: 120px;
        }

        .input-enhanced select {
          cursor: pointer;
        }

        .input-enhanced select option {
          background: #0A0E27;
          color: white;
        }

        .form-hint {
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9em;
          font-style: italic;
        }

        /* TIME SELECTOR */
        .time-selector {
          padding: 25px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .time-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: 12px;
        }

        .time-btn {
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 1.05em;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.3s;
        }

        .time-btn:hover:not(:disabled) {
          border-color: #0066FF;
          background: rgba(0, 102, 255, 0.1);
          transform: translateY(-3px);
        }

        .time-btn.active {
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          color: white;
          border-color: transparent;
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 102, 255, 0.3);
        }

        .time-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
        }

        /* MEETING TYPE SELECTOR */
        .meeting-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .meeting-btn {
          padding: 24px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .meeting-btn-image {
          width: 80px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .meeting-btn-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          opacity: 0.9;
        }

        .meeting-btn.active .meeting-btn-image img {
          filter: brightness(0) invert(1);
        }

        .meeting-btn:hover:not(:disabled) {
          border-color: #0066FF;
          background: rgba(0, 102, 255, 0.1);
          transform: translateY(-3px);
        }

        .meeting-btn.active {
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          color: white;
          border-color: transparent;
          box-shadow: 0 6px 16px rgba(0, 102, 255, 0.3);
        }

        .meeting-btn span {
          font-weight: 700;
          font-size: 1.05em;
        }

        .meeting-btn small {
          font-size: 0.85em;
          opacity: 0.8;
        }

        .meeting-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* SUBMIT BUTTON */
        .btn-submit {
          width: 100%;
          padding: 24px;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 1.3em;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 12px 35px rgba(0, 102, 255, 0.4);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 0 18px 45px rgba(0, 102, 255, 0.6);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 350px;
            padding: 60px 20px;
          }

          .hero-content h1 {
            font-size: 3em;
          }

          .hero-content p {
            font-size: 1.2em;
          }

          .container {
            margin-top: -60px;
            padding-bottom: 60px;
          }

          .form-container {
            padding: 35px 25px;
          }

          .form-header h2 {
            font-size: 2.2em;
          }

          .time-buttons {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          }

          .meeting-type-selector {
            grid-template-columns: 1fr;
          }

          .btn-submit {
            font-size: 1.15em;
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .hero-content h1 {
            font-size: 2.2em;
          }

          .sidebar {
            grid-template-columns: 1fr;
          }

          .form-header h2 {
            font-size: 1.8em;
          }

          .time-buttons {
            grid-template-columns: repeat(3, 1fr);
          }

          .time-btn {
            padding: 12px;
            font-size: 0.95em;
          }
        }
      `}</style>
    </>
  );
}
