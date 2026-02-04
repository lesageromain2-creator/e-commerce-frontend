// frontend/pages/mes-messages.js - Messagerie client (chat avec l'équipe)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Send,
  MessageSquare,
  Loader2,
  CheckCheck,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import {
  checkAuth,
  fetchSettings,
  getChatConversations,
  getChatMessages,
  sendChatMessage,
  createChatConversation,
  markChatAsRead,
} from '../utils/api';
import { authClient } from '../lib/auth-client';
import { toast } from 'react-toastify';

export default function MesMessages() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadData();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedConversation) {
      pollingRef.current = setInterval(() => {
        loadMessages(selectedConversation.id, true);
      }, 5000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [selectedConversation]);

  const loadData = async () => {
    try {
      setLoading(true);
      let currentUser = null;

      const betterAuthSession = await authClient.getSession();
      if (betterAuthSession?.data?.user) {
        const u = betterAuthSession.data.user;
        const nameParts = (u.name || '').trim().split(/\s+/);
        const { ensureBackendToken } = await import('../utils/api');
        await ensureBackendToken();
        currentUser = {
          id: u.id,
          email: u.email,
          firstname: nameParts[0] || u.email?.split('@')[0] || 'Utilisateur',
          lastname: nameParts.slice(1).join(' ') || '',
        };
      } else {
        const authData = await checkAuth();
        if (!authData.authenticated) {
          router.push('/login?redirect=/mes-messages');
          return;
        }
        currentUser = authData.user;
      }

      setUser(currentUser);

      const settingsData = await fetchSettings().catch(() => ({}));
      setSettings(settingsData);

      const convData = await getChatConversations();
      let convs = convData.conversations || [];

      if (convs.length === 0) {
        const created = await createChatConversation({
          subject: 'Discussion avec l\'équipe',
          initial_message: 'Bonjour, je souhaite échanger avec l\'équipe.',
        });
        if (created?.conversation) {
          convs = [created.conversation];
        }
      }

      setConversations(convs);
      if (convs.length > 0) {
        setSelectedConversation(convs[0]);
        await loadMessages(convs[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const data = await getChatMessages(conversationId);
      setMessages(data.messages || []);
      await markChatAsRead(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
      );
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      if (!silent) toast.error('Erreur lors du chargement des messages');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    await loadMessages(conv.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedConversation) return;
    try {
      setSending(true);
      const result = await sendChatMessage(selectedConversation.id, newMessage);
      setMessages((prev) => [...prev, result.message]);
      setNewMessage('');
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === selectedConversation.id
              ? { ...c, last_message: newMessage, last_message_at: new Date().toISOString() }
              : c
          )
          .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
      );
    } catch (error) {
      console.error('Erreur envoi:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const currentUserId = user?.id ?? selectedConversation?.user_id;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) {
      return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <>
        <Head><title>Messagerie - LE SAGE DEV</title></Head>
        <Header settings={{}} />
        <div className="messages-page loading">
          <Loader2 className="spin" size={48} />
          <p>Chargement de la messagerie...</p>
        </div>
        <style jsx>{`
          .messages-page.loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0A0E27;
            color: rgba(255,255,255,0.7);
            padding-top: 80px;
          }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Messagerie - {settings.site_name || 'LE SAGE DEV'}</title>
      </Head>
      <Header settings={settings} />

      <div className="messages-page">
        <div className="chat-wrapper">
          <div className="chat-header-bar">
            <h1>Messagerie</h1>
            <p className="subtitle">Échangez avec l&apos;équipe LE SAGE DEV</p>
            {conversations.length > 1 && (
              <select
                className="conversation-select"
                value={selectedConversation?.id ?? ''}
                onChange={(e) => {
                  const conv = conversations.find((c) => c.id === parseInt(e.target.value, 10));
                  if (conv) selectConversation(conv);
                }}
              >
                {conversations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.subject}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedConversation ? (
            <>
              <div className="chat-with">
                <div className="chat-with-avatar">
                  {selectedConversation.admin_firstname ? (
                    <span>{selectedConversation.admin_firstname[0]}{selectedConversation.admin_lastname?.[0]}</span>
                  ) : (
                    <UserIcon size={20} />
                  )}
                </div>
                <div className="chat-with-info">
                  <strong>
                    {selectedConversation.admin_firstname
                      ? `${selectedConversation.admin_firstname} ${selectedConversation.admin_lastname}`
                      : 'Équipe LE SAGE DEV'}
                  </strong>
                  <span>{selectedConversation.subject}</span>
                </div>
              </div>

              <div className="messages-container">
                {loadingMessages ? (
                  <div className="messages-loading">
                    <Loader2 className="spin" size={28} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-messages">
                    <MessageSquare size={48} />
                    <p>Aucun message. Envoyez le premier pour démarrer l&apos;échange.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === currentUserId;
                      const showAvatar = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;
                      return (
                        <div key={msg.id} className={`message ${isOwn ? 'own' : 'other'}`}>
                          {!isOwn && showAvatar && (
                            <div className="message-avatar">
                              {msg.sender_firstname?.[0]}{msg.sender_lastname?.[0]}
                            </div>
                          )}
                          <div className="message-content">
                            {!isOwn && showAvatar && (
                              <span className="message-sender">
                                {msg.sender_firstname} {msg.sender_lastname}
                              </span>
                            )}
                            <div className="message-bubble">
                              <p>{msg.message}</p>
                            </div>
                            <div className="message-meta">
                              <span className="message-time">{formatDate(msg.created_at)}</span>
                              {isOwn && (
                                <span className="message-status">
                                  {msg.is_read ? <CheckCheck size={14} className="read" /> : <Clock size={14} />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form className="message-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={sending}
                />
                <button type="submit" disabled={!newMessage.trim() || sending}>
                  {sending ? <Loader2 className="spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation">
              <MessageSquare size={48} />
              <p>Aucune conversation. Rechargez la page pour en créer une.</p>
            </div>
          )}
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .messages-page {
          min-height: 100vh;
          background: #0A0E27;
          padding-top: 80px;
          padding-bottom: 60px;
        }
        .chat-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }
        .chat-header-bar {
          margin-bottom: 20px;
        }
        .chat-header-bar h1 {
          color: white;
          font-size: 1.75rem;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 0.95rem;
          margin-bottom: 12px;
        }
        .conversation-select {
          width: 100%;
          max-width: 320px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: white;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .chat-with {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 16px;
        }
        .chat-with-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .chat-with-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .chat-with-info strong { color: white; font-size: 1rem; }
        .chat-with-info span { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 280px;
        }
        .messages-loading, .empty-messages {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          min-height: 200px;
        }
        .message { display: flex; gap: 10px; max-width: 78%; }
        .message.own { margin-left: auto; flex-direction: row-reverse; }
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0,102,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00D9FF;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        .message-content { display: flex; flex-direction: column; }
        .message.own .message-content { align-items: flex-end; }
        .message-sender { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .message-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .message.own .message-bubble {
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          border-color: transparent;
        }
        .message-bubble p { color: rgba(255,255,255,0.95); line-height: 1.5; margin: 0; word-break: break-word; }
        .message-meta { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .message-time { font-size: 0.7rem; color: rgba(255,255,255,0.4); }
        .message-status { color: rgba(255,255,255,0.4); }
        .message-status .read { color: #00D9FF; }
        .message-input {
          display: flex;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .message-input input {
          flex: 1;
          padding: 12px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          color: white;
          font-size: 0.95rem;
        }
        .message-input input::placeholder { color: rgba(255,255,255,0.4); }
        .message-input input:focus { outline: none; border-color: #0066FF; }
        .message-input button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .message-input button:disabled { opacity: 0.6; cursor: not-allowed; }
        .no-conversation {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          min-height: 300px;
          text-align: center;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .messages-page { padding-top: 70px; padding-bottom: 40px; }
          .chat-wrapper { margin: 0 12px; padding: 16px; }
          .message { max-width: 90%; }
        }
      `}</style>
    </>
  );
}
