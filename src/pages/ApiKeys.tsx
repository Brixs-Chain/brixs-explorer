import React, { useState, useEffect } from 'react';
import { Key, Copy, PlusCircle, LogOut, CheckCircle } from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, githubProvider } from '../firebase';

const ApiKeys: React.FC = () => {
  const [user, setUser] = useState<{ username: string; avatar: string; uid: string } | null>(null);
  const [keys, setKeys] = useState<{ name: string; key: string; created: string }[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [copied, setCopied] = useState('');

  // Listen to real Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          username: currentUser.displayName || currentUser.email || 'GitHub User',
          avatar: currentUser.photoURL || 'https://avatars.githubusercontent.com/u/9919?s=40&v=4',
          uid: currentUser.uid
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load keys from localStorage based on user UID
  useEffect(() => {
    if (user) {
      const savedKeys = localStorage.getItem(`brixs_api_keys_${user.uid}`);
      if (savedKeys) {
        setKeys(JSON.parse(savedKeys));
      } else {
        // If they just logged in and have no keys, we don't automatically generate one,
        // or we could. Let's just leave it empty so they can generate one.
        setKeys([]);
      }
    }
  }, [user]);

  // Save keys to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`brixs_api_keys_${user.uid}`, JSON.stringify(keys));
    }
  }, [keys, user]);

  const loginWithGithub = async () => {
    setIsAuthenticating(true);
    try {
      await signInWithPopup(auth, githubProvider);
      // The onAuthStateChanged listener will handle setting the user
    } catch (error: any) {
      console.error('GitHub Auth Error:', error);
      alert(`Authentication failed: ${error.message}. Ensure Firebase config is valid.`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setKeys([]);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const generate = () => {
    const newKey = { 
      name: `Project ${keys.length + 1}`, 
      key: `brx_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`, 
      created: new Date().toISOString().split('T')[0] 
    };
    setKeys([...keys, newKey]);
  };

  const revoke = (keyToRevoke: string) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setKeys(keys.filter(k => k.key !== keyToRevoke));
    }
  };

  if (!user) {
    return (
      <div className="container page-wrapper" style={{ maxWidth: 800 }}>
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 16, background: 'var(--bg-tertiary)', borderRadius: '50%', marginBottom: 20 }}>
            <Key size={48} color="var(--text-muted)" />
          </div>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>Developer API Keys</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            Sign in securely with your GitHub account to generate and manage real API keys for the Brixs Network.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 24px', fontSize: 16, background: '#24292e', color: '#fff', border: 'none' }}
            onClick={loginWithGithub}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Connecting to GitHub...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> Continue with GitHub (Real Auth)</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ maxWidth: 800 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={22} color="var(--accent)" /> API Keys
          </h1>
          <div className="page-subtitle">Manage your Brixs Explorer API keys</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: 20 }}>
            <img src={user.avatar} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user.username}</span>
            <button className="btn btn-ghost" style={{ padding: 4, marginLeft: 4, border: 'none' }} onClick={logout} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
          <button className="btn btn-primary" onClick={generate}><PlusCircle size={16} /> Generate New Key</button>
        </div>
      </div>
      
      <div className="card">
        {keys.length === 0 ? (
          <div className="empty-state">
            <Key size={40} />
            <p>You haven't generated any API keys yet.</p>
            <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={generate}>Generate Your First Key</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>API Key</th>
                <th>Created On</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{k.name}</td>
                  <td className="mono" style={{ filter: 'blur(4px)', transition: 'filter 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.filter = 'none'} onMouseLeave={e => e.currentTarget.style.filter = 'blur(4px)'} title="Hover to reveal">
                    {k.key}
                  </td>
                  <td className="text-muted">{k.created}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => copy(k.key, k.key)}>
                        {copied === k.key ? <CheckCircle size={14} color="var(--accent-green)" /> : <Copy size={14} />} {copied === k.key ? 'Copied' : 'Copy'}
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--accent-red)' }} onClick={() => revoke(k.key)}>
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: 20, fontSize: 13, color: 'var(--text-secondary)', borderTop: keys.length > 0 ? '1px solid var(--border)' : 'none' }}>
          <p><strong>Security Note:</strong> These API keys provide full access to your Brixs RPC rate limits. Do not expose them in client-side code or public repositories.</p>
        </div>
      </div>
    </div>
  );
};
export default ApiKeys;
