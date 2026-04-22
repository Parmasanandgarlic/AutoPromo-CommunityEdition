import React, { useState, useEffect } from 'react';
import { Activity, Users, MessageSquare, Settings, Play, Square, Database, Key, Hash, Phone, Minus, Maximize2, X, Twitter, HelpCircle, TreePine, TreeDeciduous, Trees, Palmtree, Leaf, Sprout, Flower, Flower2, Squirrel, Rabbit, Bird, Cat, Dog, Fish, Snail, PawPrint, Bug, Clover, Sun, Cloud, Moon, Star, Zap, Flame, Droplets, Wind, Shell, RefreshCw, Target, Plus, Search, Shield, Globe, Cpu, Lock, Heart, Bot, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeActions, setActiveActions] = useState({
    scraper: false,
    listener: false,
    operator: false,
    engagement: false,
    twitter: false
  });
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      addToast('App is already installed or your browser does not support installation.', 'success');
    }
  };

  const handleDownloadWindows = () => {
    addToast('To run on Windows: 1. Export to ZIP (AI Studio menu) 2. Extract 3. Run "build_installer.bat" inside.', 'success');
  };
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [toasts, setToasts] = useState<{id: string | number, message: string, type: 'success' | 'error'}[]>([]);
  const [twitterStatus, setTwitterStatus] = useState<any>(null);
  const [twitterAccounts, setTwitterAccounts] = useState<any[]>([]);
  const [scheduledTwitterActions, setScheduledTwitterActions] = useState<any[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString() + Math.random().toString());
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Forms
  const [newSession, setNewSession] = useState({ name: '', apiId: '', apiHash: '', phoneNumber: '' });
  const [authCode, setAuthCode] = useState({ sessionId: null, code: '', password: '' });
  const [newKeyword, setNewKeyword] = useState('');
  const [newGroup, setNewGroup] = useState({ groupId: '', name: '' });
  const [newTwitterAccount, setNewTwitterAccount] = useState({ name: '', authToken: '', ct0: '' });
  const [operatorConfig, setOperatorConfig] = useState(() => {
    const saved = localStorage.getItem('operatorConfig');
    return saved ? JSON.parse(saved) : { sessionId: '', template: '{Hey|Hi|Hello}, saw you in the airdrop group. {Are you farming|Have you checked out} farmdash.one?', maxPerDay: 15 };
  });
  const [scrapeConfig, setScrapeConfig] = useState(() => {
    const saved = localStorage.getItem('scrapeConfig');
    return saved ? JSON.parse(saved) : { sessionId: '', groupId: '' };
  });
  const [listenerConfig, setListenerConfig] = useState(() => {
    const saved = localStorage.getItem('listenerConfig');
    return saved ? JSON.parse(saved) : { sessionId: '' };
  });
  const [engagementConfig, setEngagementConfig] = useState(() => {
    const saved = localStorage.getItem('engagementConfig');
    return saved ? JSON.parse(saved) : { sessionId: '', target: '', action: 'react', emoji: '👍' };
  });
  const [twitterConfig, setTwitterConfig] = useState(() => {
    const saved = localStorage.getItem('twitterConfig');
    return saved ? JSON.parse(saved) : { account: '', target: '', action: 'like', content: '' };
  });
  const [newScheduledTwitterAction, setNewScheduledTwitterAction] = useState({ 
    account: '', 
    target: '', 
    action: 'like', 
    scheduledAt: '', 
    content: '' 
  });
  const [advancedConfig, setAdvancedConfig] = useState(() => {
    const saved = localStorage.getItem('advancedConfig');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      multiAccount: false,
      maxAccounts: 5,
      proxyEnabled: false,
      proxyHost: '',
      proxyPort: '',
      proxyUser: '',
      proxyPass: '',
      proxyType: 'socks5',
      twitterProxyEnabled: false,
      twitterProxyHost: '',
      twitterProxyPort: '',
      twitterProxyUser: '',
      twitterProxyPass: '',
      twitterProxyType: 'socks5',
      twitterUARotation: false,
      twitterCustomUAs: '',
      antiDetection: true,
      randomDelays: true,
      minDelay: 30,
      maxDelay: 120,
      maxScrapePerGroup: 500,
      blacklistEnabled: true,
      warmupEnabled: false,
      scheduleEnabled: false,
      startTime: '09:00',
      endTime: '18:00',
      twitterRateLimitResetLike: 15,
      twitterRateLimitResetRetweet: 15,
      twitterRateLimitResetFollow: 15,
      twitterRateLimitResetReply: 15,
      aiProvider: 'gemini',
      aiModel: 'gemini-2.5-flash',
      aiApiKey: '',
      aiPrompt: 'Write a casual, friendly 1-sentence reply to this tweet subtly hinting at our software. Do not sound like a bot. Keep it 100% human.',
      ...parsed
    };
  });

  // Auto-save effects
  useEffect(() => { localStorage.setItem('operatorConfig', JSON.stringify(operatorConfig)); }, [operatorConfig]);
  useEffect(() => { localStorage.setItem('scrapeConfig', JSON.stringify(scrapeConfig)); }, [scrapeConfig]);
  useEffect(() => { localStorage.setItem('listenerConfig', JSON.stringify(listenerConfig)); }, [listenerConfig]);
  useEffect(() => { localStorage.setItem('engagementConfig', JSON.stringify(engagementConfig)); }, [engagementConfig]);
  useEffect(() => { localStorage.setItem('twitterConfig', JSON.stringify(twitterConfig)); }, [twitterConfig]);
  useEffect(() => { localStorage.setItem('advancedConfig', JSON.stringify(advancedConfig)); }, [advancedConfig]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [twitterConfig.account]);

  const fetchData = async () => {
    try {
      const fetchWithTimeout = (url: string) => {
        return Promise.race([
          fetch(url).then(r => r.ok ? r.json() : null).catch(() => null),
          new Promise(resolve => setTimeout(() => resolve(null), 8000))
        ]);
      };

      const [logsRes, sessionsRes, keywordsRes, groupsRes, usersRes, twitterAccountsRes, scheduledActionsRes, allTwitterStatusesRes] = await Promise.all([
        fetchWithTimeout('/api/logs'),
        fetchWithTimeout('/api/sessions'),
        fetchWithTimeout('/api/keywords'),
        fetchWithTimeout('/api/groups'),
        fetchWithTimeout('/api/users'),
        fetchWithTimeout('/api/twitter/accounts'),
        fetchWithTimeout('/api/twitter/scheduled'),
        fetchWithTimeout('/api/twitter/status')
      ]);
      setLogs(Array.isArray(logsRes) ? logsRes : []);
      setSessions(Array.isArray(sessionsRes) ? sessionsRes : []);
      setKeywords(Array.isArray(keywordsRes) ? keywordsRes : []);
      setGroups(Array.isArray(groupsRes) ? groupsRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setTwitterAccounts(Array.isArray(twitterAccountsRes) ? twitterAccountsRes : []);
      setScheduledTwitterActions(Array.isArray(scheduledActionsRes) ? scheduledActionsRes : []);
      setTwitterStatus(allTwitterStatusesRes || {});
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    const fallbackTimeout = setTimeout(() => setIsInitialLoading(false), 10000);
    return () => clearTimeout(fallbackTimeout);
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSession, apiId: Number(newSession.apiId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create session');
      if (data.id) {
        setAuthCode({ ...authCode, sessionId: data.id });
        setNewSession({ name: '', apiId: '', apiHash: '', phoneNumber: '' });
        addToast('Session created, awaiting auth code.', 'success');
      }
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sessions/${authCode.sessionId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneCode: authCode.code, password: authCode.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify session');
      setAuthCode({ sessionId: null, code: '', password: '' });
      addToast('Session authenticated successfully!', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (id: number) => {
    setModal({
      isOpen: true,
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session? This action cannot be undone.',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete session');
          addToast('Session deleted', 'success');
          fetchData();
        } catch (err: any) {
          addToast(err.message, 'error');
        } finally {
          setIsLoading(false);
          setModal(null);
        }
      }
    });
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add keyword');
      setNewKeyword('');
      addToast('Keyword added', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add group');
      setNewGroup({ groupId: '', name: '' });
      addToast('Group added', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTwitterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/twitter/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTwitterAccount)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add Twitter account');
      setNewTwitterAccount({ name: '', authToken: '', ct0: '' });
      addToast('Twitter account added', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTwitterAccount = (id: number) => {
    setModal({
      isOpen: true,
      title: 'Delete Twitter Account',
      message: 'Are you sure you want to delete this Twitter account?',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/twitter/accounts/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete Twitter account');
          addToast('Twitter account deleted', 'success');
          fetchData();
        } catch (err: any) {
          addToast(err.message, 'error');
        } finally {
          setIsLoading(false);
          setModal(null);
        }
      }
    });
  };

  const handleStartScraper = async () => {
    if (!scrapeConfig.sessionId || !scrapeConfig.groupId) {
      addToast('Please select a session and a group', 'error');
      return;
    }
    setActiveActions(prev => ({ ...prev, scraper: true }));
    try {
      const res = await fetch('/api/actions/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: Number(scrapeConfig.sessionId), groupId: scrapeConfig.groupId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start scraper');
      addToast('Scraper started successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setActiveActions(prev => ({ ...prev, scraper: false }));
    }
  };

  const handleStartListener = async () => {
    if (!listenerConfig.sessionId) {
      addToast('Please select a session', 'error');
      return;
    }
    setActiveActions(prev => ({ ...prev, listener: true }));
    try {
      const res = await fetch('/api/actions/start-listener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: Number(listenerConfig.sessionId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start listener');
      addToast('Listener started successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
      setActiveActions(prev => ({ ...prev, listener: false }));
    }
  };

  const handleStopListener = async () => {
    try {
      const res = await fetch('/api/actions/stop-listener', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to stop listener');
      addToast('Listener stopped', 'success');
      setActiveActions(prev => ({ ...prev, listener: false }));
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleStartOperator = async () => {
    if (!operatorConfig.sessionId || !operatorConfig.template) {
      addToast('Please select a session and enter a template', 'error');
      return;
    }
    setActiveActions(prev => ({ ...prev, operator: true }));
    try {
      const res = await fetch('/api/actions/start-operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: Number(operatorConfig.sessionId), 
          template: operatorConfig.template, 
          maxPerDay: Number(operatorConfig.maxPerDay) 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start operator');
      addToast('Operator started successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
      setActiveActions(prev => ({ ...prev, operator: false }));
    }
  };

  const handleStopOperator = async () => {
    try {
      const res = await fetch('/api/actions/stop-operator', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to stop operator');
      addToast('Operator stopped', 'success');
      setActiveActions(prev => ({ ...prev, operator: false }));
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleRunEngagement = async () => {
    if (!engagementConfig.sessionId || !engagementConfig.target) {
      addToast('Please select a session and a target', 'error');
      return;
    }
    setActiveActions(prev => ({ ...prev, engagement: true }));
    try {
      const res = await fetch('/api/actions/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: Number(engagementConfig.sessionId), 
          target: engagementConfig.target,
          action: engagementConfig.action,
          emoji: engagementConfig.emoji
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run engagement');
      addToast(`Successfully executed ${engagementConfig.action} on ${engagementConfig.target}`, 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setActiveActions(prev => ({ ...prev, engagement: false }));
    }
  };

  const handleTwitterAction = async () => {
    if (!twitterConfig.account || !twitterConfig.target) {
      addToast('Please select an account and enter a target', 'error');
      return;
    }
    if (twitterConfig.action === 'reply' && !twitterConfig.useAi && (!twitterConfig.content || twitterConfig.content.length > 280)) {
      addToast('Reply content must be between 1 and 280 characters', 'error');
      return;
    }
    setActiveActions(prev => ({ ...prev, twitter: true }));
    try {
      const payload = {
        ...twitterConfig,
        aiConfig: twitterConfig.useAi ? {
          enabled: true,
          provider: advancedConfig.aiProvider,
          model: advancedConfig.aiModel,
          apiKey: advancedConfig.aiApiKey,
          prompt: advancedConfig.aiPrompt
        } : undefined,
        rateLimitResets: {
          like: advancedConfig.twitterRateLimitResetLike || 15,
          retweet: advancedConfig.twitterRateLimitResetRetweet || 15,
          follow: advancedConfig.twitterRateLimitResetFollow || 15,
          reply: advancedConfig.twitterRateLimitResetReply || 15
        },
        proxy: advancedConfig.twitterProxyEnabled ? {
          host: advancedConfig.twitterProxyHost,
          port: advancedConfig.twitterProxyPort,
          user: advancedConfig.twitterProxyUser,
          pass: advancedConfig.twitterProxyPass,
          type: advancedConfig.twitterProxyType
        } : undefined,
        userAgentConfig: advancedConfig.twitterUARotation ? {
          enabled: true,
          customUAs: advancedConfig.twitterCustomUAs ? advancedConfig.twitterCustomUAs.split('\n').filter(ua => ua.trim()) : []
        } : undefined
      };
      const res = await fetch('/api/twitter/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute Twitter action');
      addToast(data.message || `Successfully executed ${twitterConfig.action}`, 'success');
      fetchData(); // Refresh status
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setActiveActions(prev => ({ ...prev, twitter: false }));
    }
  };

  const handleScheduleTwitterAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduledTwitterAction.account || !newScheduledTwitterAction.target || !newScheduledTwitterAction.scheduledAt) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    if (newScheduledTwitterAction.action === 'reply' && !(newScheduledTwitterAction as any).useAi && (!newScheduledTwitterAction.content || newScheduledTwitterAction.content.length > 280)) {
      addToast('Reply content must be between 1 and 280 characters', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...newScheduledTwitterAction,
        aiConfig: (newScheduledTwitterAction as any).useAi ? {
          enabled: true,
          provider: advancedConfig.aiProvider,
          model: advancedConfig.aiModel,
          apiKey: advancedConfig.aiApiKey,
          prompt: advancedConfig.aiPrompt
        } : undefined,
        rateLimitResets: {
          like: advancedConfig.twitterRateLimitResetLike || 15,
          retweet: advancedConfig.twitterRateLimitResetRetweet || 15,
          follow: advancedConfig.twitterRateLimitResetFollow || 15,
          reply: advancedConfig.twitterRateLimitResetReply || 15
        },
        proxy: advancedConfig.twitterProxyEnabled ? {
          host: advancedConfig.twitterProxyHost,
          port: advancedConfig.twitterProxyPort,
          user: advancedConfig.twitterProxyUser,
          pass: advancedConfig.twitterProxyPass,
          type: advancedConfig.twitterProxyType
        } : undefined,
        userAgentConfig: advancedConfig.twitterUARotation ? {
          enabled: true,
          customUAs: advancedConfig.twitterCustomUAs ? advancedConfig.twitterCustomUAs.split('\n').filter((ua: string) => ua.trim()) : []
        } : undefined
      };
      const res = await fetch('/api/twitter/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule action');
      setNewScheduledTwitterAction({ account: '', target: '', action: 'like', scheduledAt: '', content: '' });
      addToast('Action scheduled successfully', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScheduledTwitterAction = async (id: number) => {
    try {
      const res = await fetch(`/api/twitter/scheduled/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete scheduled action');
      addToast('Scheduled action deleted', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono text-[#52b788] crt">
        <div className="mb-8 flex flex-col items-center">
          <div className="text-4xl font-bold mb-2 animate-pulse tracking-tighter">AUTOPROMO_AGENT</div>
          <div className="text-xs uppercase tracking-[0.5em] opacity-50">Initializing System Core</div>
        </div>
        <div className="w-64 h-1 bg-[#1b4332] rounded-full overflow-hidden">
          <div className="h-full bg-[#52b788] animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }} />
        </div>
        <div className="mt-4 text-[10px] uppercase tracking-widest animate-pulse">Establishing Secure Connection...</div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-[#d8f3dc] font-mono flex flex-col selection:bg-[#52b788] selection:text-black crt">
      {/* Desktop Title Bar */}
      <div className="h-10 bg-[#06140f] border-b-4 border-[#95d5b2] flex items-center px-4 drag-region shrink-0 justify-between">
        <div className="flex space-x-2 no-drag">
          <button className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center group">
            <X size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 flex items-center justify-center group">
            <Minus size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 flex items-center justify-center group">
            <Maximize2 size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center space-x-3 px-8 overflow-hidden text-[#95d5b2] opacity-80">
          <TreePine size={14} />
          <Bug size={14} />
          <Flower size={14} />
          <Squirrel size={14} />
          <Leaf size={14} />
          <Clover size={14} />
          <TreeDeciduous size={14} />
          <Flower2 size={14} />
          <Rabbit size={14} />
          <Sprout size={14} />
          <Bird size={14} />
          <Trees size={14} />
          <Cat size={14} />
          <Palmtree size={14} />
          <Dog size={14} />
          <Fish size={14} />
          <Snail size={14} />
          <PawPrint size={14} />
          <Sun size={14} />
          <Cloud size={14} />
          <Moon size={14} />
          <Star size={14} />
          <Zap size={14} />
          <Flame size={14} />
          <Droplets size={14} />
          <Wind size={14} />
          <Shell size={14} />
          <Clover size={14} />
          <Flower size={14} />
          <Bug size={14} />
        </div>
        <div className="flex items-center space-x-2 no-drag">
          <button 
            onClick={fetchData}
            className="p-2 hover:bg-[#1b4332] rounded-lg transition-colors text-[#95d5b2] hover:text-[#d8f3dc]"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="p-2 hover:bg-[#1b4332] rounded-lg transition-colors text-[#95d5b2] hover:text-[#d8f3dc]">
            <Settings size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Modal Overlay */}
        {modal && modal.isOpen && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#95d5b2]">
              <div className="flex items-center space-x-3 mb-4 text-[#d8f3dc]">
                <HelpCircle size={24} className="text-[#52b788]" />
                <h3 className="text-xl font-bold">{modal.title}</h3>
              </div>
              <p className="text-[#95d5b2] mb-8 leading-relaxed">{modal.message}</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setModal(null)}
                  className="flex-1 bg-black border-4 border-[#95d5b2] text-[#d8f3dc] font-bold py-2 rounded-lg hover:bg-[#1b4332]/30 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={modal.onConfirm}
                  className="flex-1 bg-rose-500 border-4 border-[#95d5b2] text-black font-bold py-2 rounded-lg hover:bg-rose-600 transition-colors shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[1px] active:shadow-none"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-auto">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#52b788] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(82,183,136,0.3)]"></div>
              <span className="text-[#52b788] font-bold tracking-widest uppercase text-xs animate-pulse">Processing...</span>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <div className="absolute top-12 right-4 z-50 flex flex-col gap-2 no-drag">
          {toasts.map(toast => (
            <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-[4px_4px_0px_0px_#95d5b2] border-4 flex items-center gap-3 transition-all ${toast.type === 'error' ? 'bg-rose-950/80 border-[#95d5b2] text-rose-400' : 'bg-[#06140f] border-[#95d5b2] text-[#52b788]'}`}>
              <div className="text-sm font-medium">{toast.message}</div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="opacity-50 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-[#06140f] border-r-4 border-[#95d5b2] flex flex-col shrink-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[#d8f3dc] tracking-tight">
              AutoPROMO
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#74c69d] font-medium">Automation Suite</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-black text-[#95d5b2] border border-[#1b4332]">Community</span>
              <a href="https://autopromo.xyz" target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-[#52b788] text-black shadow-[2px_2px_0px_0px_#1b4332] hover:bg-[#74c69d] transition-transform active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1b4332] ml-1 flex items-center">
                Get Pro <Zap size={8} className="ml-1" />
              </a>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Activity size={18} />
              <span className="font-medium">Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('sessions')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'sessions' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Key size={18} />
              <span className="font-medium">Sessions</span>
            </button>
            <button onClick={() => setActiveTab('targets')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'targets' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Hash size={18} />
              <span className="font-medium">Targets & Keywords</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Users size={18} />
              <span className="font-medium">Scraped Users</span>
            </button>
            <button onClick={() => setActiveTab('operator')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'operator' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <MessageSquare size={18} />
              <span className="font-medium">Operator (Auto-DM)</span>
            </button>
            <button onClick={() => setActiveTab('engagement')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'engagement' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Play size={18} />
              <span className="font-medium">TG Engagement</span>
            </button>
            <button onClick={() => setActiveTab('twitter')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'twitter' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Twitter size={18} />
              <span className="font-medium">Twitter (X) Auto</span>
            </button>
            <button onClick={() => setActiveTab('advanced')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'advanced' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Shield size={18} />
              <span className="font-medium">Advanced Mode</span>
            </button>
            <button onClick={() => setActiveTab('instructions')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'instructions' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <HelpCircle size={18} />
              <span className="font-medium">Instructions</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-[#1b4332] text-[#d8f3dc]' : 'text-[#95d5b2] hover:bg-[#1b4332]/50 hover:text-[#d8f3dc]'}`}>
              <Settings size={18} />
              <span className="font-medium">App Settings</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-black p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users size={80} />
                  </div>
                  <h3 className="text-[#95d5b2] text-sm font-bold uppercase tracking-widest mb-2">Active Sessions</h3>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-bold text-[#d8f3dc]">{sessions.filter(s => s.status === 'active').length}</p>
                    <span className="text-xs text-[#52b788] font-mono">/ {sessions.length} TOTAL</span>
                  </div>
                  <div className="mt-4 h-1 bg-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#52b788] transition-all duration-1000" 
                      style={{ width: `${sessions.length ? (sessions.filter(s => s.status === 'active').length / sessions.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={80} />
                  </div>
                  <h3 className="text-[#95d5b2] text-sm font-bold uppercase tracking-widest mb-2">Scraped Users</h3>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-bold text-[#d8f3dc]">{users.length}</p>
                    <span className="text-xs text-[#52b788] font-mono">+{Math.floor(users.length * 0.1)} NEW</span>
                  </div>
                  <p className="text-[10px] text-[#74c69d] mt-4 font-mono uppercase">Ready for engagement</p>
                </div>

                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageSquare size={80} />
                  </div>
                  <h3 className="text-[#95d5b2] text-sm font-bold uppercase tracking-widest mb-2">Total Outreach</h3>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-bold text-[#d8f3dc]">{users.filter(u => u.contacted).length}</p>
                    <span className="text-xs text-[#52b788] font-mono">
                      {users.length ? Math.round((users.filter(u => u.contacted).length / users.length) * 100) : 0}% RATE
                    </span>
                  </div>
                  <div className="mt-4 flex space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < (users.length && users.filter(u => u.contacted).length / users.length * 10) ? 'bg-[#52b788]' : 'bg-black'}`}></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                  <h3 className="text-lg font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <Activity size={18} className="mr-2 text-[#52b788]" /> Recent Activity
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {logs.length > 0 ? logs.slice(0, 10).map((log, i) => (
                      <div key={i} className="flex items-start space-x-3 text-xs border-l-2 border-[#1b4332] pl-3 py-1">
                        <span className="text-[#74c69d] font-mono shrink-0">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                        <span className="text-[#95d5b2]">{log.message}</span>
                      </div>
                    )) : (
                      <p className="text-[#74c69d] text-sm italic">No recent activity logs found.</p>
                    )}
                  </div>
                </div>

                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                  <h3 className="text-lg font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <Zap size={18} className="mr-2 text-[#52b788]" /> Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('sessions')} className="p-4 bg-black border-2 border-[#1b4332] rounded-lg hover:border-[#52b788] transition-all group text-left">
                      <Plus size={20} className="text-[#52b788] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[#d8f3dc] font-bold block text-sm">Add Session</span>
                      <span className="text-[#95d5b2] text-[10px] uppercase">Connect Telegram</span>
                    </button>
                    <button onClick={() => setActiveTab('targets')} className="p-4 bg-black border-2 border-[#1b4332] rounded-lg hover:border-[#52b788] transition-all group text-left">
                      <Search size={20} className="text-[#52b788] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[#d8f3dc] font-bold block text-sm">Find Users</span>
                      <span className="text-[#95d5b2] text-[10px] uppercase">Scrape Groups</span>
                    </button>
                    <button onClick={() => setActiveTab('operator')} className="p-4 bg-black border-2 border-[#1b4332] rounded-lg hover:border-[#52b788] transition-all group text-left">
                      <Play size={20} className="text-[#52b788] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[#d8f3dc] font-bold block text-sm">Run Operator</span>
                      <span className="text-[#95d5b2] text-[10px] uppercase">Auto-DM Campaign</span>
                    </button>
                    <button onClick={() => setActiveTab('twitter')} className="p-4 bg-black border-2 border-[#1b4332] rounded-lg hover:border-[#52b788] transition-all group text-left">
                      <Twitter size={20} className="text-[#52b788] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[#d8f3dc] font-bold block text-sm">Twitter Auto</span>
                      <span className="text-[#95d5b2] text-[10px] uppercase">Social Engagement</span>
                    </button>
                  </div>
                  <div className="mt-8 p-4 bg-gradient-to-br from-[#1b4332] to-[#04100c] border-2 border-[#52b788] rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#52b788] opacity-10 blur-xl group-hover:opacity-20 transition-opacity"></div>
                    <h4 className="text-[#d8f3dc] font-bold text-sm mb-1 relative z-10 flex items-center">
                      <Zap size={14} className="mr-1 text-[#52b788]" /> Scale Your Growth
                    </h4>
                    <p className="text-[#95d5b2] text-[10px] mb-3 relative z-10 leading-relaxed">Unlock advanced AI personas, unlimited threading, and VPS cloud hosting.</p>
                    <a href="https://autopromo.xyz" target="_blank" rel="noreferrer" className="block w-full text-center bg-[#52b788] hover:bg-[#40916c] text-black text-xs font-bold py-2 rounded transition-colors relative z-10 shadow-[2px_2px_0px_0px_#1b4332]">
                      Upgrade to Premium
                    </a>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-[#1b4332] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#52b788] flex items-center justify-center text-black font-bold text-xs">PG</div>
                      <div>
                        <p className="text-[10px] text-[#d8f3dc] font-bold">Creator</p>
                        <p className="text-[8px] text-[#95d5b2] uppercase tracking-widest">
                          <a href="https://github.com/Parmasanandgarlic" target="_blank" rel="noreferrer" className="hover:text-[#52b788] underline">Parmasanandgarlic</a>
                        </p>
                      </div>
                    </div>
                    <span className="font-['Indie_Flower'] text-sm text-[#52b788]">I made this =)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-[#d8f3dc] flex items-center">
                    <Activity size={32} className="mr-4 text-[#52b788]" />
                    Sessions & Accounts
                  </h2>
                  <p className="text-[#95d5b2] mt-2">Manage your Telegram and Twitter automation identities.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Telegram Session Creation */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-6 flex items-center">
                    <MessageSquare size={20} className="mr-3 text-[#52b788]" />
                    Add Telegram Session
                  </h3>
                  {authCode.sessionId ? (
                    <form onSubmit={handleVerifySession} className="space-y-4">
                      <div className="p-4 bg-[#1b4332]/20 border-2 border-[#1b4332] rounded-lg mb-4">
                        <p className="text-[#d8f3dc] text-sm font-bold mb-1">Verification Required</p>
                        <p className="text-[#95d5b2] text-[10px]">Enter the code sent to your Telegram app.</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Auth Code</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 text-[#52b788]" size={18} />
                            <input 
                              type="text" 
                              value={authCode.code} 
                              onChange={(e) => setAuthCode({ ...authCode, code: e.target.value })}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg py-3 pl-10 pr-4 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                              placeholder="12345"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">2FA Password (Optional)</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 text-[#52b788]" size={18} />
                            <input 
                              type="password" 
                              value={authCode.password} 
                              onChange={(e) => setAuthCode({ ...authCode, password: e.target.value })}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg py-3 pl-10 pr-4 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                              placeholder="Your 2FA password"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-[#52b788] hover:bg-[#74c69d] text-black font-bold py-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center justify-center uppercase tracking-widest text-sm"
                        >
                          {isLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Play className="mr-2" size={18} />}
                          Verify & Activate
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleCreateSession} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Session Name</label>
                          <input 
                            type="text" 
                            value={newSession.name} 
                            onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                            className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            placeholder="Main Account"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 text-[#52b788]" size={18} />
                            <input 
                              type="text" 
                              value={newSession.phoneNumber} 
                              onChange={(e) => setNewSession({ ...newSession, phoneNumber: e.target.value })}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg py-3 pl-10 pr-4 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                              placeholder="+1234567890"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">API ID</label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-3 text-[#52b788]" size={18} />
                            <input 
                              type="text" 
                              value={newSession.apiId} 
                              onChange={(e) => setNewSession({ ...newSession, apiId: e.target.value })}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg py-3 pl-10 pr-4 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                              placeholder="123456"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">API Hash</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 text-[#52b788]" size={18} />
                            <input 
                              type="text" 
                              value={newSession.apiHash} 
                              onChange={(e) => setNewSession({ ...newSession, apiHash: e.target.value })}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg py-3 pl-10 pr-4 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                              placeholder="abcdef123456..."
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#52b788] hover:bg-[#74c69d] text-black font-bold py-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center justify-center uppercase tracking-widest text-sm"
                      >
                        {isLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
                        Create Session
                      </button>
                    </form>
                  )}
                </div>

                {/* Twitter Account Creation */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-6 flex items-center">
                    <Twitter size={20} className="mr-3 text-[#52b788]" />
                    Add Twitter Account
                  </h3>
                  <form onSubmit={handleCreateTwitterAccount} className="space-y-4">
                    <div>
                      <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Account Name</label>
                      <input 
                        type="text" 
                        value={newTwitterAccount.name} 
                        onChange={(e) => setNewTwitterAccount({ ...newTwitterAccount, name: e.target.value })}
                        className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                        placeholder="@username or Label"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Auth Token</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-[#52b788]" size={18} />
                          <input 
                            type="password" 
                            value={newTwitterAccount.authToken} 
                            onChange={(e) => setNewTwitterAccount({ ...newTwitterAccount, authToken: e.target.value })}
                            className="w-full bg-black border-2 border-[#1b4332] rounded-lg py-3 pl-10 pr-4 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            placeholder="auth_token cookie"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">ct0 (CSRF Token)</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-[#52b788]" size={18} />
                          <input 
                            type="password" 
                            value={newTwitterAccount.ct0} 
                            onChange={(e) => setNewTwitterAccount({ ...newTwitterAccount, ct0: e.target.value })}
                            className="w-full bg-black border-2 border-[#1b4332] rounded-lg py-3 pl-10 pr-4 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            placeholder="ct0 cookie"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-[#52b788] hover:bg-[#74c69d] text-black font-bold py-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center justify-center uppercase tracking-widest text-sm"
                    >
                      {isLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
                      Add Twitter Account
                    </button>
                  </form>
                </div>
              </div>

              {/* Active Sessions & Accounts List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Telegram Sessions */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl overflow-hidden shadow-lg shadow-black/80">
                  <div className="bg-black/40 px-6 py-4 border-b-2 border-[#1b4332] flex justify-between items-center">
                    <h3 className="font-bold text-[#d8f3dc] flex items-center">
                      <MessageSquare size={16} className="mr-2 text-[#52b788]" />
                      Active Telegram Sessions
                    </h3>
                    <span className="text-[10px] font-bold text-[#52b788] bg-[#52b788]/10 px-2 py-1 rounded border border-[#52b788]/30 uppercase tracking-widest">
                      {sessions.length} Total
                    </span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black text-[#74c69d] text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3 font-bold">Name</th>
                        <th className="px-6 py-3 font-bold">Phone</th>
                        <th className="px-6 py-3 font-bold">Status</th>
                        <th className="px-6 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b4332]">
                      {sessions.map(session => (
                        <tr key={session.id} className="hover:bg-[#1b4332]/20 transition-colors">
                          <td className="px-6 py-4 text-[#d8f3dc] font-medium">{session.name}</td>
                          <td className="px-6 py-4 text-[#95d5b2] font-mono">{session.phone_number}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                              session.status === 'active' 
                                ? 'bg-[#52b788]/20 text-[#52b788] border-[#52b788]/50' 
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleDeleteSession(session.id)} 
                              className="text-rose-400/90 hover:text-rose-300 font-medium flex items-center space-x-1"
                            >
                              <X size={14} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Twitter Accounts */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl overflow-hidden shadow-lg shadow-black/80">
                  <div className="bg-black/40 px-6 py-4 border-b-2 border-[#1b4332] flex justify-between items-center">
                    <h3 className="font-bold text-[#d8f3dc] flex items-center">
                      <Twitter size={16} className="mr-2 text-[#52b788]" />
                      Active Twitter Accounts
                    </h3>
                    <span className="text-[10px] font-bold text-[#52b788] bg-[#52b788]/10 px-2 py-1 rounded border border-[#52b788]/30 uppercase tracking-widest">
                      {twitterAccounts.length} Total
                    </span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black text-[#74c69d] text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3 font-bold">Name</th>
                        <th className="px-6 py-3 font-bold">Status</th>
                        <th className="px-6 py-3 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b4332]">
                      {twitterAccounts.map(account => (
                        <tr key={account.id} className="hover:bg-[#1b4332]/20 transition-colors">
                          <td className="px-6 py-4 text-[#d8f3dc] font-medium">{account.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border bg-[#52b788]/20 text-[#52b788] border-[#52b788]/50">
                              {account.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleDeleteTwitterAccount(account.id)} 
                              className="text-rose-400/90 hover:text-rose-300 font-medium flex items-center space-x-1"
                            >
                              <X size={14} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'targets' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-[#d8f3dc]">Targets & Keywords</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Keywords */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                  <h3 className="text-lg font-medium text-[#d8f3dc] mb-4">Listener Keywords</h3>
                  <form onSubmit={handleAddKeyword} className="flex space-x-2 mb-6">
                    <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} className="flex-1 bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors" placeholder="e.g. airdrop" required />
                    <button type="submit" className="bg-[#52b788] hover:bg-[#40916c] text-black px-4 py-2 rounded-lg font-bold transition-all border-4 border-[#95d5b2] shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none">Add</button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map(k => (
                      <span key={k.id} className="bg-[#1b4332] text-[#b7e4c7] px-3 py-1 rounded-full text-sm flex items-center font-medium">
                        {k.keyword}
                        <button onClick={() => fetch(`/api/keywords/${k.id}`, { method: 'DELETE' }).then(fetchData)} className="ml-2 text-[#74c69d] hover:text-rose-400/90">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Groups */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                  <h3 className="text-lg font-medium text-[#d8f3dc] mb-4">Target Groups</h3>
                  <form onSubmit={handleAddGroup} className="flex space-x-2 mb-6">
                    <input type="text" value={newGroup.groupId} onChange={e => setNewGroup({...newGroup, groupId: e.target.value})} className="flex-1 bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors" placeholder="Group ID or Username" required />
                    <button type="submit" className="bg-[#52b788] hover:bg-[#40916c] text-black px-4 py-2 rounded-lg font-bold transition-all border-4 border-[#95d5b2] shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none">Add</button>
                  </form>
                  <div className="space-y-2">
                    {groups.map(g => (
                      <div key={g.id} className="flex justify-between items-center bg-black p-3 rounded-lg border-4 border-[#95d5b2]">
                        <span className="text-[#b7e4c7] font-medium">{g.group_id}</span>
                        <button onClick={() => fetch(`/api/groups/${g.id}`, { method: 'DELETE' }).then(fetchData)} className="text-rose-400/90 hover:text-rose-300 text-sm font-medium">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scraper Control */}
              <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                <h3 className="text-lg font-medium text-[#d8f3dc] mb-4">Manual Scraper</h3>
                <div className="flex space-x-4">
                  <select value={scrapeConfig.sessionId} onChange={e => setScrapeConfig({...scrapeConfig, sessionId: e.target.value})} className="bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors">
                    <option value="">Select Session</option>
                    {sessions.filter(s => s.status === 'active').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <select value={scrapeConfig.groupId} onChange={e => setScrapeConfig({...scrapeConfig, groupId: e.target.value})} className="bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors">
                    <option value="">Select Group</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.group_id}>{g.group_id}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleStartScraper} 
                    disabled={activeActions.scraper}
                    className={`bg-[#74c69d] hover:bg-[#52b788] text-black px-6 py-2 rounded-lg font-bold transition-all border-4 border-[#95d5b2] shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center ${activeActions.scraper ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <Database size={18} className={`mr-2 ${activeActions.scraper ? 'animate-bounce' : ''}`} /> 
                    {activeActions.scraper ? 'Scraping...' : 'Scrape Now'}
                  </button>
                </div>
              </div>

              {/* Listener Control */}
              <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                <h3 className="text-lg font-medium text-[#d8f3dc] mb-4">Keyword Listener</h3>
                <div className="flex space-x-4">
                  <select value={listenerConfig.sessionId} onChange={e => setListenerConfig({...listenerConfig, sessionId: e.target.value})} className="bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors">
                    <option value="">Select Session</option>
                    {sessions.filter(s => s.status === 'active').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleStartListener} 
                    disabled={activeActions.listener}
                    className={`bg-[#52b788] hover:bg-[#40916c] text-black px-6 py-2 rounded-lg font-bold transition-all border-4 border-[#95d5b2] shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center ${activeActions.listener ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <Play size={18} className={`mr-2 ${activeActions.listener ? 'animate-pulse' : ''}`} /> 
                    {activeActions.listener ? 'Listening...' : 'Start Listener'}
                  </button>
                  <button 
                    onClick={handleStopListener} 
                    className="bg-rose-400 hover:bg-rose-500 text-black px-6 py-2 rounded-lg font-bold transition-all border-4 border-[#95d5b2] shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center"
                  >
                    <Square size={18} className="mr-2" /> Stop Listener
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-[#d8f3dc]">Scraped Users</h2>
              <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl overflow-x-auto shadow-lg shadow-black/80">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-black text-[#74c69d]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Username / ID</th>
                      <th className="px-6 py-4 font-medium">Source</th>
                      <th className="px-6 py-4 font-medium">Last Seen</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-[#1b4332]/30">
                        <td className="px-6 py-4 text-[#d8f3dc] font-medium">{user.username ? `@${user.username}` : user.user_id}</td>
                        <td className="px-6 py-4 text-[#95d5b2]">{user.source_group}</td>
                        <td className="px-6 py-4 text-[#95d5b2]">{new Date(user.last_seen).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.contacted ? 'bg-[#52b788]/20 text-[#52b788]' : 'bg-[#1b4332] text-[#95d5b2]'}`}>
                            {user.contacted ? 'Contacted' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-[#d8f3dc]">Telegram Mass Engagement</h2>
              
              <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                <h3 className="text-lg font-medium text-[#d8f3dc] mb-4">Run Engagement Action</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#95d5b2] mb-1">Select Session</label>
                    <select 
                      value={engagementConfig.sessionId} 
                      onChange={e => setEngagementConfig({...engagementConfig, sessionId: e.target.value})}
                      className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                    >
                      <option value="">Select Session...</option>
                      {sessions.filter(s => s.status === 'active').map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.phone_number})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#95d5b2] mb-1">Target (Username or Group ID)</label>
                    <input 
                      type="text" 
                      value={engagementConfig.target} 
                      onChange={e => setEngagementConfig({...engagementConfig, target: e.target.value})}
                      className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                      placeholder="@username or -100123456"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#95d5b2] mb-1">Action</label>
                    <select 
                      value={engagementConfig.action} 
                      onChange={e => setEngagementConfig({...engagementConfig, action: e.target.value})}
                      className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                    >
                      <option value="react">Auto-React (Like)</option>
                      <option value="join">Auto-Join Group/Channel</option>
                      <option value="forward">Auto-Forward (Retweet)</option>
                    </select>
                  </div>
                  {engagementConfig.action === 'react' && (
                    <div>
                      <label className="block text-xs font-medium text-[#95d5b2] mb-1">Emoji</label>
                      <input 
                        type="text" 
                        value={engagementConfig.emoji} 
                        onChange={e => setEngagementConfig({...engagementConfig, emoji: e.target.value})}
                        className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                        placeholder="👍"
                      />
                    </div>
                  )}
                  <button 
                    onClick={handleRunEngagement}
                    disabled={activeActions.engagement}
                    className={`w-full bg-[#52b788] hover:bg-[#74c69d] text-black font-bold py-3 px-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center justify-center ${activeActions.engagement ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {activeActions.engagement ? (
                      <>
                        <RefreshCw size={18} className="mr-2 animate-spin" />
                        Executing {engagementConfig.action}...
                      </>
                    ) : (
                      <>
                        <Zap size={18} className="mr-2" />
                        Execute Action
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'twitter' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-[#d8f3dc]">Twitter (X) Automation</h2>
                  <p className="text-[#95d5b2]">AutoPROMO-style mass engagement tools for X.</p>
                </div>
                <div className="flex items-center space-x-2 bg-black/40 border border-[#1b4332] rounded-lg px-3 py-1.5">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${activeActions.twitter ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`} />
                  <span className="text-[10px] font-bold text-[#95d5b2] uppercase tracking-widest">System Ready</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#d8f3dc]">Run Twitter Action</h3>
                      {advancedConfig.twitterProxyEnabled && (
                        <span className="bg-[#1b4332] text-[#52b788] text-[10px] px-2 py-1 rounded border border-[#52b788] font-bold uppercase tracking-widest flex items-center">
                          <Globe size={10} className="mr-1" /> Proxy Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#95d5b2] mb-1">Select Account</label>
                        <select 
                          value={twitterConfig.account} 
                          onChange={e => setTwitterConfig({...twitterConfig, account: e.target.value})}
                          className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                        >
                          <option value="">Select Account...</option>
                          {twitterAccounts.map(a => (
                            <option key={a.id} value={a.name}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#95d5b2] mb-1">Target (Tweet URL, @username, or keywords)</label>
                        <input 
                          type="text" 
                          value={twitterConfig.target} 
                          onChange={e => setTwitterConfig({...twitterConfig, target: e.target.value})}
                          className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                          placeholder="https://x.com/... or @username or keywords"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#95d5b2] mb-1">Action</label>
                        <select 
                          value={twitterConfig.action} 
                          onChange={e => setTwitterConfig({...twitterConfig, action: e.target.value})}
                          className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                        >
                          <option value="like">Auto-Like</option>
                          <option value="retweet">Auto-Retweet</option>
                          <option value="follow">Auto-Follow</option>
                          <option value="reply">Auto-Reply</option>
                        </select>
                      </div>
                      {twitterConfig.action === 'reply' && (
                        <div className="space-y-4">
                          <label className="flex items-center space-x-2 text-[#95d5b2] text-sm border-2 border-[#1b4332] p-2 rounded-lg bg-[#06140f] transition-colors cursor-pointer hover:border-[#52b788]">
                            <input 
                              type="checkbox" 
                              checked={(twitterConfig as any).useAi || false}
                              onChange={e => setTwitterConfig({...twitterConfig, useAi: e.target.checked} as any)}
                              className="w-4 h-4 rounded text-[#52b788] bg-black border-[#52b788] focus:ring-[#52b788] focus:ring-offset-black"
                            />
                            <div className="flex items-center justify-between w-full">
                              <span>Use AI to generate contextual reply</span>
                            </div>
                          </label>
                          {!(twitterConfig as any).useAi && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-[#95d5b2]">Reply Content</label>
                                <span className={`text-[10px] font-bold ${twitterConfig.content.length > 280 ? 'text-rose-400' : 'text-[#95d5b2]'}`}>
                                  {twitterConfig.content.length} / 280
                                </span>
                              </div>
                              <textarea 
                                value={twitterConfig.content} 
                                onChange={e => setTwitterConfig({...twitterConfig, content: e.target.value})}
                                className={`w-full bg-black border-4 rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none h-24 transition-colors ${twitterConfig.content.length > 280 ? 'border-rose-400' : 'border-[#95d5b2] focus:border-[#52b788]'}`}
                                placeholder="Type your reply here..."
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={handleTwitterAction}
                          disabled={
                            !twitterConfig.account || 
                            activeActions.twitter || 
                            (twitterStatus && twitterStatus[twitterConfig.account]?.[twitterConfig.action]?.isHit) ||
                            (twitterConfig.action === 'reply' && !(twitterConfig as any).useAi && (!twitterConfig.content || twitterConfig.content.length > 280))
                          }
                          className={`flex-1 bg-[#52b788] hover:bg-[#40916c] text-black font-bold py-3 px-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center justify-center ${
                            !twitterConfig.account || 
                            activeActions.twitter || 
                            (twitterStatus && twitterStatus[twitterConfig.account]?.[twitterConfig.action]?.isHit) ||
                            (twitterConfig.action === 'reply' && !(twitterConfig as any).useAi && (!twitterConfig.content || twitterConfig.content.length > 280))
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                        >
                          {activeActions.twitter ? (
                            <>
                              <RefreshCw size={18} className="mr-2 animate-spin" />
                              Executing...
                            </>
                          ) : (
                            <>
                              <Twitter size={18} className="mr-2" />
                              {!twitterConfig.account ? 'Select Account First' : (twitterStatus && twitterStatus[twitterConfig.account]?.[twitterConfig.action]?.isHit ? 'Rate Limit Hit' : 'Execute Action')}
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => {
                            setTwitterConfig(prev => ({ ...prev, action: 'like' }));
                            setTimeout(() => handleTwitterAction(), 0);
                          }}
                          disabled={
                            !twitterConfig.account || 
                            activeActions.twitter || 
                            (twitterStatus && twitterStatus[twitterConfig.account]?.['like']?.isHit)
                          }
                          className={`bg-[#1b4332] hover:bg-[#2d6a4f] text-[#d8f3dc] font-bold py-3 px-4 rounded-lg transition-all border-4 border-[#52b788] shadow-[4px_4px_0px_0px_#52b788] active:translate-y-[2px] active:shadow-none flex items-center justify-center ${
                            !twitterConfig.account || 
                            activeActions.twitter || 
                            (twitterStatus && twitterStatus[twitterConfig.account]?.['like']?.isHit)
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                          title="Quick Auto-Like"
                        >
                          <Heart size={18} className="mr-2" />
                          Quick Auto-Like
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#d8f3dc]">Schedule Twitter Action</h3>
                      {advancedConfig.twitterProxyEnabled && (
                        <span className="bg-[#1b4332] text-[#52b788] text-[10px] px-2 py-1 rounded border border-[#52b788] font-bold uppercase tracking-widest flex items-center">
                          <Globe size={10} className="mr-1" /> Proxy Active
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleScheduleTwitterAction} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#95d5b2] mb-1">Select Account</label>
                          <select 
                            value={newScheduledTwitterAction.account} 
                            onChange={e => setNewScheduledTwitterAction({...newScheduledTwitterAction, account: e.target.value})}
                            className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                            required
                          >
                            <option value="">Select Account...</option>
                            {twitterAccounts.map(a => (
                              <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#95d5b2] mb-1">Execution Time</label>
                          <input 
                            type="datetime-local" 
                            value={newScheduledTwitterAction.scheduledAt} 
                            onChange={e => setNewScheduledTwitterAction({...newScheduledTwitterAction, scheduledAt: e.target.value})}
                            className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#95d5b2] mb-1">Target</label>
                          <input 
                            type="text" 
                            value={newScheduledTwitterAction.target} 
                            onChange={e => setNewScheduledTwitterAction({...newScheduledTwitterAction, target: e.target.value})}
                            className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                            placeholder="Tweet URL or @username"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#95d5b2] mb-1">Action</label>
                          <select 
                            value={newScheduledTwitterAction.action} 
                            onChange={e => setNewScheduledTwitterAction({...newScheduledTwitterAction, action: e.target.value})}
                            className="w-full bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                          >
                            <option value="like">Auto-Like</option>
                            <option value="retweet">Auto-Retweet</option>
                            <option value="follow">Auto-Follow</option>
                            <option value="reply">Auto-Reply</option>
                          </select>
                        </div>
                      </div>
                      {newScheduledTwitterAction.action === 'reply' && (
                        <div className="space-y-4">
                          <label className="flex items-center space-x-2 text-[#95d5b2] text-sm border-2 border-[#1b4332] p-2 rounded-lg bg-[#06140f] transition-colors cursor-pointer hover:border-[#52b788]">
                            <input 
                              type="checkbox" 
                              checked={(newScheduledTwitterAction as any).useAi || false}
                              onChange={e => setNewScheduledTwitterAction({...newScheduledTwitterAction, useAi: e.target.checked} as any)}
                              className="w-4 h-4 rounded text-[#52b788] bg-black border-[#52b788] focus:ring-[#52b788] focus:ring-offset-black"
                            />
                            <div className="flex items-center justify-between w-full">
                              <span>Use AI to generate contextual reply</span>
                            </div>
                          </label>
                          {!(newScheduledTwitterAction as any).useAi && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-[#95d5b2]">Reply Content</label>
                                <span className={`text-[10px] font-bold ${newScheduledTwitterAction.content.length > 280 ? 'text-rose-400' : 'text-[#95d5b2]'}`}>
                                  {newScheduledTwitterAction.content.length} / 280
                                </span>
                              </div>
                              <textarea 
                                value={newScheduledTwitterAction.content} 
                                onChange={e => setNewScheduledTwitterAction({...newScheduledTwitterAction, content: e.target.value})}
                                className={`w-full bg-black border-4 rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none h-20 transition-colors ${newScheduledTwitterAction.content.length > 280 ? 'border-rose-400' : 'border-[#95d5b2] focus:border-[#52b788]'}`}
                                placeholder="Type your reply here..."
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <button 
                        type="submit"
                        disabled={
                          isLoading || 
                          (newScheduledTwitterAction.action === 'reply' && !(newScheduledTwitterAction as any).useAi && (!newScheduledTwitterAction.content || newScheduledTwitterAction.content.length > 280))
                        }
                        className={`w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-[#d8f3dc] font-bold py-3 px-4 rounded-lg transition-all border-4 border-[#52b788] shadow-[4px_4px_0px_0px_#52b788] active:translate-y-[2px] active:shadow-none mt-2 ${
                          isLoading || 
                          (newScheduledTwitterAction.action === 'reply' && !(newScheduledTwitterAction as any).useAi && (!newScheduledTwitterAction.content || newScheduledTwitterAction.content.length > 280))
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {isLoading ? 'Scheduling...' : 'Schedule Action'}
                      </button>
                    </form>
                  </div>

                  {/* Scheduled Actions List */}
                  <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                    <h3 className="text-lg font-medium text-[#d8f3dc] mb-4">Pending Scheduled Actions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-[#1b4332]">
                            <th className="py-3 px-4 text-[#95d5b2] text-[10px] uppercase tracking-widest">Account</th>
                            <th className="py-3 px-4 text-[#95d5b2] text-[10px] uppercase tracking-widest">Action</th>
                            <th className="py-3 px-4 text-[#95d5b2] text-[10px] uppercase tracking-widest">Target</th>
                            <th className="py-3 px-4 text-[#95d5b2] text-[10px] uppercase tracking-widest">Scheduled For</th>
                            <th className="py-3 px-4 text-[#95d5b2] text-[10px] uppercase tracking-widest">Status</th>
                            <th className="py-3 px-4 text-[#95d5b2] text-[10px] uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduledTwitterActions.filter(a => a.status === 'pending').map(a => (
                            <tr key={a.id} className="border-b border-[#1b4332] hover:bg-[#1b4332]/10 transition-colors">
                              <td className="py-3 px-4 text-[#d8f3dc] text-xs">{a.account}</td>
                              <td className="py-3 px-4 text-[#d8f3dc] text-xs capitalize">
                                {a.action}
                                {a.proxy && <Globe size={10} className="inline ml-1 text-[#52b788]" title="Proxy Active" />}
                              </td>
                              <td className="py-3 px-4 text-[#b7e4c7] text-[10px] truncate max-w-[150px]">{a.target}</td>
                              <td className="py-3 px-4 text-[#95d5b2] text-xs">{new Date(a.scheduled_at).toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className="text-[8px] bg-[#52b788]/20 text-[#52b788] border border-[#52b788]/50 px-1.5 py-0.5 rounded font-bold uppercase">Pending</span>
                              </td>
                              <td className="py-3 px-4">
                                <button onClick={() => handleDeleteScheduledTwitterAction(a.id)} className="text-rose-400/90 hover:text-rose-300 text-[10px] font-bold uppercase">Cancel</button>
                              </td>
                            </tr>
                          ))}
                          {scheduledTwitterActions.filter(a => a.status === 'pending').length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-[#1b4332] text-xs italic">No pending actions scheduled.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                    <h3 className="text-lg font-medium text-[#d8f3dc] mb-4 flex items-center">
                      <Shield size={18} className="mr-2 text-[#52b788]" />
                      Rate Limits
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {!twitterStatus || Object.keys(twitterStatus).length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-[#1b4332] rounded-lg">
                          <Twitter size={32} className="mx-auto mb-2 text-[#1b4332]" />
                          <p className="text-[10px] uppercase tracking-widest text-[#95d5b2]">No accounts configured</p>
                        </div>
                      ) : twitterStatus.error ? (
                        <div className="text-center py-8 text-rose-400 text-xs italic">Error: {twitterStatus.error}</div>
                      ) : (
                        Object.entries(twitterStatus).map(([accountName, accountStatus]: [string, any]) => (
                          <div key={accountName} className="mb-6 last:mb-0">
                            <h4 className="text-[#52b788] font-bold text-xs mb-3 border-b border-[#1b4332] pb-1">{accountName}</h4>
                            <div className="space-y-3">
                              {Object.entries(accountStatus).map(([action, status]: [string, any]) => (
                                <div key={action} className="p-3 bg-black border-2 border-[#1b4332] rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#95d5b2]">{action}</span>
                                    {status.isHit ? (
                                      <span className="text-[8px] bg-rose-500/20 text-rose-400 border border-rose-500/50 px-1.5 py-0.5 rounded font-bold uppercase">Limit Hit</span>
                                    ) : status.isApproaching ? (
                                      <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/50 px-1.5 py-0.5 rounded font-bold uppercase">Approaching</span>
                                    ) : (
                                      <span className="text-[8px] bg-[#52b788]/20 text-[#52b788] border border-[#52b788]/50 px-1.5 py-0.5 rounded font-bold uppercase">Healthy</span>
                                    )}
                                  </div>
                                  <div className="h-1.5 w-full bg-[#1b4332] rounded-full overflow-hidden mb-1">
                                    <div 
                                      className={`h-full transition-all duration-500 ${status.isHit ? 'bg-rose-500' : status.isApproaching ? 'bg-amber-500' : 'bg-[#52b788]'}`}
                                      style={{ width: `${(status.count / status.limit) * 100}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-[#95d5b2]">{status.count} / {status.limit}</span>
                                    {status.isHit && (
                                      <span className="text-[10px] text-rose-400 font-mono">
                                        Resets: {new Date(status.resetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-[#1b4332]/20 border-4 border-[#1b4332] rounded-xl p-6">
                    <h4 className="text-[#d8f3dc] font-bold text-sm mb-2 flex items-center">
                      <Lock size={14} className="mr-2 text-[#52b788]" />
                      Safety Note
                    </h4>
                    <p className="text-[10px] text-[#95d5b2] leading-relaxed">
                      Rate limits are enforced per account to prevent temporary bans. If you hit a limit, switch to another account or wait for the reset.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Mode Tab */}
          {activeTab === 'advanced' && (
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-[#d8f3dc] flex items-center">
                    <Shield size={32} className="mr-4 text-[#52b788]" />
                    Advanced Mode
                  </h2>
                  <p className="text-[#95d5b2] mt-2">Industry-standard multi-account and proxy management.</p>
                </div>
                <div className="bg-[#1b4332] border-2 border-[#52b788] px-4 py-2 rounded-full flex items-center space-x-2">
                  <Lock size={14} className="text-[#52b788]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d8f3dc]">Enterprise Ready</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Multi-Account Management */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-6 flex items-center">
                    <Users size={20} className="mr-3 text-[#52b788]" />
                    Multi-Account Management
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                      <div>
                        <p className="text-[#d8f3dc] font-bold">Enable Multi-Account Rotation</p>
                        <p className="text-[10px] text-[#95d5b2]">Switch between accounts to avoid rate limits</p>
                      </div>
                      <button 
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, multiAccount: !prev.multiAccount }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.multiAccount ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.multiAccount ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Max Concurrent Accounts</label>
                      <input 
                        type="number"
                        value={advancedConfig.maxAccounts}
                        onChange={(e) => setAdvancedConfig(prev => ({ ...prev, maxAccounts: Number(e.target.value) }))}
                        className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Telegram Proxy Settings */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-6 flex items-center">
                    <Globe size={20} className="mr-3 text-[#52b788]" />
                    Telegram Proxy Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg mb-4">
                      <div>
                        <p className="text-[#d8f3dc] font-bold">Use Telegram Proxies</p>
                        <p className="text-[10px] text-[#95d5b2]">Highly recommended for large scale operations</p>
                      </div>
                      <button 
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, proxyEnabled: !prev.proxyEnabled }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.proxyEnabled ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.proxyEnabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {advancedConfig.proxyEnabled && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Proxy Host</label>
                            <input 
                              type="text"
                              placeholder="p.proxyrack.com"
                              value={advancedConfig.proxyHost}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, proxyHost: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Proxy Type</label>
                            <select 
                              value={advancedConfig.proxyType}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, proxyType: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            >
                              <option value="socks5">SOCKS5</option>
                              <option value="http">HTTP</option>
                              <option value="https">HTTPS</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Proxy Port</label>
                            <input 
                              type="text"
                              placeholder="10000"
                              value={advancedConfig.proxyPort}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, proxyPort: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Auth Required</label>
                            <div className="flex items-center space-x-2 h-[52px]">
                              <span className="text-[10px] text-[#95d5b2]">User/Pass Auth</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Username</label>
                            <input 
                              type="text"
                              value={advancedConfig.proxyUser}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, proxyUser: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Password</label>
                            <input 
                              type="password"
                              value={advancedConfig.proxyPass}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, proxyPass: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Twitter Proxy Settings */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-6 flex items-center">
                    <Globe size={20} className="mr-3 text-[#52b788]" />
                    Twitter Proxy Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg mb-4">
                      <div>
                        <p className="text-[#d8f3dc] font-bold">Enable Twitter Proxy</p>
                        <p className="text-[10px] text-[#95d5b2]">Toggle to enable/disable Twitter proxy usage</p>
                      </div>
                      <button 
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, twitterProxyEnabled: !prev.twitterProxyEnabled }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.twitterProxyEnabled ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.twitterProxyEnabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {advancedConfig.twitterProxyEnabled && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Twitter Proxy Host</label>
                            <input 
                              type="text"
                              placeholder="p.proxyrack.com"
                              value={advancedConfig.twitterProxyHost}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterProxyHost: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Proxy Type</label>
                            <select 
                              value={advancedConfig.twitterProxyType}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterProxyType: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            >
                              <option value="socks5">SOCKS5</option>
                              <option value="http">HTTP</option>
                              <option value="https">HTTPS</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Twitter Proxy Port</label>
                            <input 
                              type="text"
                              placeholder="10000"
                              value={advancedConfig.twitterProxyPort}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterProxyPort: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Auth Required</label>
                            <div className="flex items-center space-x-2 h-[52px]">
                              <span className="text-[10px] text-[#95d5b2]">User/Pass Auth</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Twitter Proxy Username</label>
                            <input 
                              type="text"
                              value={advancedConfig.twitterProxyUser}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterProxyUser: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Twitter Proxy Password</label>
                            <input 
                              type="password"
                              value={advancedConfig.twitterProxyPass}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterProxyPass: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anti-Detection & Security */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-6 flex items-center">
                    <Cpu size={20} className="mr-3 text-[#52b788]" />
                    Anti-Detection & Security
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                        <div>
                          <p className="text-[#d8f3dc] font-bold">Twitter User-Agent Rotation</p>
                          <p className="text-[10px] text-[#95d5b2]">Rotate browser user-agents per Twitter action</p>
                        </div>
                        <button 
                          onClick={() => setAdvancedConfig(prev => ({ ...prev, twitterUARotation: !prev.twitterUARotation }))}
                          className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.twitterUARotation ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.twitterUARotation ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      {advancedConfig.twitterUARotation && (
                        <div className="p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Custom User Agents (One per line)</label>
                          <textarea 
                            value={advancedConfig.twitterCustomUAs}
                            onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterCustomUAs: e.target.value }))}
                            placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36&#10;Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/119.0.0.0 Safari/537.36"
                            className="w-full bg-[#06140f] border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors h-32 custom-scrollbar"
                          />
                          <p className="text-[10px] text-[#52b788] mt-2 italic">* Leave empty to use system default rotating pool</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                      <div>
                        <p className="text-[#d8f3dc] font-bold">Browser Fingerprint Spoofing (Global)</p>
                        <p className="text-[10px] text-[#95d5b2]">Randomize user-agents and hardware IDs</p>
                      </div>
                      <button 
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, antiDetection: !prev.antiDetection }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.antiDetection ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.antiDetection ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                      <div>
                        <p className="text-[#d8f3dc] font-bold">Global Blacklist Sync</p>
                        <p className="text-[10px] text-[#95d5b2]">Never message the same user twice across accounts</p>
                      </div>
                      <button 
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, blacklistEnabled: !prev.blacklistEnabled }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.blacklistEnabled ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.blacklistEnabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                      <div>
                        <p className="text-[#d8f3dc] font-bold">Account Warmup Mode</p>
                        <p className="text-[10px] text-[#95d5b2]">Simulate activity before starting campaigns</p>
                      </div>
                      <button 
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, warmupEnabled: !prev.warmupEnabled }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.warmupEnabled ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.warmupEnabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                      <div>
                        <p className="text-[#d8f3dc] font-bold">Randomized Human Delays</p>
                        <p className="text-[10px] text-[#95d5b2]">Simulate human typing and scrolling</p>
                      </div>
                      <button 
                        onClick={() => setAdvancedConfig(prev => ({ ...prev, randomDelays: !prev.randomDelays }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.randomDelays ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.randomDelays ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Min Delay (s)</label>
                        <input 
                          type="number"
                          value={advancedConfig.minDelay}
                          onChange={(e) => setAdvancedConfig(prev => ({ ...prev, minDelay: Number(e.target.value) }))}
                          className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Max Delay (s)</label>
                        <input 
                          type="number"
                          value={advancedConfig.maxDelay}
                          onChange={(e) => setAdvancedConfig(prev => ({ ...prev, maxDelay: Number(e.target.value) }))}
                          className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance & Scaling */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-6 flex items-center">
                    <Activity size={20} className="mr-3 text-[#52b788]" />
                    Performance & Scaling
                  </h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[#d8f3dc] font-bold">Operational Schedule</p>
                          <p className="text-[10px] text-[#95d5b2]">Only run during specific hours</p>
                        </div>
                        <button 
                          onClick={() => setAdvancedConfig(prev => ({ ...prev, scheduleEnabled: !prev.scheduleEnabled }))}
                          className={`w-12 h-6 rounded-full transition-colors relative ${advancedConfig.scheduleEnabled ? 'bg-[#52b788]' : 'bg-[#1b4332]'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${advancedConfig.scheduleEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                      {advancedConfig.scheduleEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Start Time</label>
                            <input 
                              type="time"
                              value={advancedConfig.startTime}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, startTime: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-2 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">End Time</label>
                            <input 
                              type="time"
                              value={advancedConfig.endTime}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, endTime: e.target.value }))}
                              className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-2 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-black border-2 border-[#52b788] rounded-lg opacity-90 relative">
                      <div className="mb-4">
                        <p className="text-[#52b788] font-bold text-lg flex items-center"><Bot size={18} className="mr-2" /> AI Configuration (Bring Your Own Key)</p>
                        <p className="text-[10px] text-[#95d5b2]">Wire in a generic AI provider to handle contextual, smart responses like Auto-Replies and Auto-DMs.</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Provider</label>
                            <select 
                              value={advancedConfig.aiProvider || 'gemini'}
                              onChange={(e) => setAdvancedConfig(prev => ({ 
                                ...prev, 
                                aiProvider: e.target.value,
                                aiModel: e.target.value === 'gemini' ? 'gemini-2.5-flash' : (e.target.value === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet-20241022')
                              }))}
                              className="w-full bg-[#06140f] border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            >
                              <option value="gemini">Google Gemini (Recommended)</option>
                              <option value="openai">OpenAI (ChatGPT)</option>
                              <option value="anthropic">Anthropic (Claude)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Model</label>
                            <select 
                              value={advancedConfig.aiModel || 'gemini-2.5-flash'}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, aiModel: e.target.value }))}
                              className="w-full bg-[#06140f] border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            >
                              {advancedConfig.aiProvider === 'gemini' && (
                                <>
                                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                </>
                              )}
                              {advancedConfig.aiProvider === 'openai' && (
                                <>
                                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                                  <option value="gpt-4o">GPT-4o</option>
                                </>
                              )}
                              {advancedConfig.aiProvider === 'anthropic' && (
                                <>
                                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">API Key</label>
                            <input 
                              type="password"
                              value={advancedConfig.aiApiKey || ''}
                              onChange={(e) => setAdvancedConfig(prev => ({ ...prev, aiApiKey: e.target.value }))}
                              placeholder="sk-..."
                              className="w-full bg-[#06140f] border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">System Prompt (Persona)</label>
                          <textarea 
                            value={advancedConfig.aiPrompt}
                            onChange={(e) => setAdvancedConfig(prev => ({ ...prev, aiPrompt: e.target.value }))}
                            className="w-full bg-[#06140f] border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors h-24 custom-scrollbar"
                            placeholder="Write a casual, friendly 1-sentence reply to this tweet subtly hinting at our software. Do not sound like a bot."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-black border-2 border-[#1b4332] rounded-lg">
                      <div className="mb-4">
                        <p className="text-[#d8f3dc] font-bold">Twitter Rate Limit Reset Times (Minutes)</p>
                        <p className="text-[10px] text-[#95d5b2]">Customize how long to wait before resetting rate limits for each action type.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Like Reset</label>
                          <input 
                            type="number"
                            value={advancedConfig.twitterRateLimitResetLike || 15}
                            onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterRateLimitResetLike: Number(e.target.value) }))}
                            className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-2 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Retweet Reset</label>
                          <input 
                            type="number"
                            value={advancedConfig.twitterRateLimitResetRetweet || 15}
                            onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterRateLimitResetRetweet: Number(e.target.value) }))}
                            className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-2 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Follow Reset</label>
                          <input 
                            type="number"
                            value={advancedConfig.twitterRateLimitResetFollow || 15}
                            onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterRateLimitResetFollow: Number(e.target.value) }))}
                            className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-2 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest">Reply Reset</label>
                          <input 
                            type="number"
                            value={advancedConfig.twitterRateLimitResetReply || 15}
                            onChange={(e) => setAdvancedConfig(prev => ({ ...prev, twitterRateLimitResetReply: Number(e.target.value) }))}
                            className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-2 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#95d5b2] text-[10px] uppercase font-bold mb-2 tracking-widest flex items-center justify-between">
                        <span>Max Scrape Per Group</span>
                        <a href="https://autopromo.xyz" target="_blank" rel="noreferrer" className="text-[#52b788] hover:text-[#74c69d] flex items-center">
                          <Lock size={10} className="mr-1" /> Need unlimited scraping?
                        </a>
                      </label>
                      <input 
                        type="number"
                        value={advancedConfig.maxScrapePerGroup}
                        onChange={(e) => setAdvancedConfig(prev => ({ ...prev, maxScrapePerGroup: Number(e.target.value) }))}
                        className="w-full bg-black border-2 border-[#1b4332] rounded-lg p-3 text-[#d8f3dc] focus:border-[#52b788] outline-none transition-colors"
                      />
                      <p className="text-[10px] text-[#95d5b2] mt-2 italic">Higher values increase risk of session ban.</p>
                    </div>

                    <button 
                      onClick={() => addToast('Advanced settings saved successfully', 'success')}
                      className="w-full bg-[#52b788] hover:bg-[#74c69d] text-black font-bold py-4 px-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center justify-center uppercase tracking-widest text-sm"
                    >
                      <Database size={18} className="mr-2" />
                      Save Advanced Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-8 max-w-4xl mx-auto pb-12">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-[#1b4332] rounded-xl border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2]">
                  <HelpCircle size={32} className="text-[#52b788]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#d8f3dc]">User Manual</h2>
                  <p className="text-[#95d5b2]">Master the AutoPROMO Automation Suite</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Section 1: Sessions */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80 relative">
                  <div className="absolute top-4 right-4">
                    {sessions.some(s => s.status === 'active') ? (
                      <span className="bg-[#52b788]/20 text-[#52b788] text-[10px] px-2 py-1 rounded border border-[#52b788] font-bold uppercase tracking-widest">Completed</span>
                    ) : (
                      <span className="bg-amber-950/30 text-amber-400 text-[10px] px-2 py-1 rounded border border-amber-400/50 font-bold uppercase tracking-widest">Pending</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#52b788] text-black rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                    Setting Up Sessions
                  </h3>
                  <div className="space-y-4 text-[#95d5b2] text-sm leading-relaxed">
                    <p>To start automating, you need to connect your Telegram accounts. Go to the <span className="text-[#d8f3dc] font-bold">Sessions</span> tab:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Get your <span className="text-[#d8f3dc]">API ID</span> and <span className="text-[#d8f3dc]">API Hash</span> from <a href="https://my.telegram.org" target="_blank" className="underline hover:text-[#52b788]">my.telegram.org</a>.</li>
                      <li>Enter your phone number in international format (e.g., <span className="font-mono">+1234567890</span>).</li>
                      <li>Wait for the Telegram login code and enter it in the app.</li>
                      <li>Once "Active", your account is ready for automation.</li>
                    </ul>
                  </div>
                </div>

                {/* Section 2: Targets */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80 relative">
                  <div className="absolute top-4 right-4">
                    {groups.length > 0 && keywords.length > 0 ? (
                      <span className="bg-[#52b788]/20 text-[#52b788] text-[10px] px-2 py-1 rounded border border-[#52b788] font-bold uppercase tracking-widest">Completed</span>
                    ) : (
                      <span className="bg-amber-950/30 text-amber-400 text-[10px] px-2 py-1 rounded border border-amber-400/50 font-bold uppercase tracking-widest">Pending</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#52b788] text-black rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                    Finding Your Audience
                  </h3>
                  <div className="space-y-4 text-[#95d5b2] text-sm leading-relaxed">
                    <p>Use the <span className="text-[#d8f3dc] font-bold">Targets & Keywords</span> tab to define where to find users:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><span className="text-[#d8f3dc] font-bold">Target Groups:</span> Add public group usernames (e.g., <span className="font-mono">@crypto_group</span>).</li>
                      <li><span className="text-[#d8f3dc] font-bold">Keywords:</span> Add words you want to listen for in real-time.</li>
                      <li><span className="text-[#d8f3dc] font-bold">Scraper:</span> Run the scraper on a target group to build a list of active users in the <span className="text-[#d8f3dc] font-bold">Scraped Users</span> tab.</li>
                    </ul>
                  </div>
                </div>

                {/* Section 3: Operator */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80 relative">
                  <div className="absolute top-4 right-4">
                    {users.length > 0 ? (
                      <span className="bg-[#52b788]/20 text-[#52b788] text-[10px] px-2 py-1 rounded border border-[#52b788] font-bold uppercase tracking-widest">Ready</span>
                    ) : (
                      <span className="bg-amber-950/30 text-amber-400 text-[10px] px-2 py-1 rounded border border-amber-400/50 font-bold uppercase tracking-widest">Needs Leads</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#52b788] text-black rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                    The Operator (Auto-DM)
                  </h3>
                  <div className="space-y-4 text-[#95d5b2] text-sm leading-relaxed">
                    <p>The <span className="text-[#d8f3dc] font-bold">Operator</span> is your main outreach tool:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><span className="text-[#d8f3dc] font-bold">Spintax:</span> Use <span className="font-mono">{"{Hi|Hello|Hey}"}</span> to randomize your messages. This is CRITICAL to avoid being flagged as spam.</li>
                      <li><span className="text-[#d8f3dc] font-bold">Daily Limits:</span> Keep your daily limits low (10-20 per account) to stay under Telegram's radar.</li>
                      <li>The Operator will automatically message users from your <span className="text-[#d8f3dc]">Scraped Users</span> list.</li>
                    </ul>
                  </div>
                </div>

                {/* Section 4: Twitter */}
                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-8 shadow-lg shadow-black/80">
                  <h3 className="text-xl font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#52b788] text-black rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                    Twitter (X) Automation
                  </h3>
                  <div className="space-y-4 text-[#95d5b2] text-sm leading-relaxed">
                    <p>Automate your X presence in the <span className="text-[#d8f3dc] font-bold">Twitter Auto</span> tab:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Enter a target tweet URL or a username.</li>
                      <li>Select an action: <span className="text-[#d8f3dc]">Like, Retweet, Follow, or Reply</span>.</li>
                      <li>The app uses your connected X accounts to execute these actions automatically.</li>
                    </ul>
                  </div>
                </div>

                {/* Section 5: Safety */}
                <div className="bg-rose-950/30 border-4 border-rose-500/50 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center">
                    <X size={20} className="mr-3" />
                    Safety & Best Practices
                  </h3>
                  <div className="space-y-4 text-rose-200/70 text-sm leading-relaxed">
                    <p>Automation carries risks. Follow these rules to protect your accounts:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><span className="text-rose-400 font-bold">Warm-up:</span> Start with 2-5 messages per day on new accounts.</li>
                      <li><span className="text-rose-400 font-bold">Variety:</span> Never send the exact same message twice. Use heavy spintax.</li>
                      <li><span className="text-rose-400 font-bold">Proxies:</span> If running more than 3 accounts, use a proxy for each session.</li>
                      <li><span className="text-rose-400 font-bold">Respect Limits:</span> If an account gets "Limited", stop all automation for 48 hours.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-[#d8f3dc]">Application Settings</h2>
              <p className="text-[#95d5b2] mb-6">Manage your desktop app experience and installation.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#1b4332] to-[#04100c] border-4 border-[#52b788] rounded-xl p-6 shadow-[0_0_15px_rgba(82,183,136,0.3)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 py-1 px-4 bg-[#52b788] text-black font-black text-[10px] uppercase tracking-widest rounded-bl-lg">Recommended</div>
                  <h3 className="text-lg font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <Zap size={18} className="mr-2 text-[#52b788]" /> AutoPROMO Premium
                  </h3>
                  <p className="text-sm text-[#95d5b2] mb-6">
                    Scale your automation with multi-account support, unmetered AI responses, and done-for-you cloud hosting.
                  </p>
                  <a 
                    href="https://autopromo.xyz"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center w-full bg-[#52b788] hover:bg-[#40916c] text-black font-bold py-3 px-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none"
                  >
                    Upgrade to Premium Plan
                  </a>
                </div>

                <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80 flex flex-col">
                  <h3 className="text-lg font-bold text-[#d8f3dc] mb-4 flex items-center">
                    <X size={18} className="mr-2 text-rose-400" /> Windows Download
                  </h3>
                  <p className="text-sm text-[#95d5b2] mb-6 flex-grow">
                    Download the source code to run locally on your Windows machine or export it to a ZIP file.
                  </p>
                  <button 
                    onClick={handleDownloadWindows}
                    className="w-full bg-black hover:bg-[#1b4332]/30 text-[#d8f3dc] font-bold py-3 px-4 rounded-lg transition-all border-4 border-[#95d5b2] shadow-[4px_4px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none mt-auto"
                  >
                    Download for Windows
                  </button>
                </div>
              </div>

              <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                <h3 className="text-lg font-bold text-[#d8f3dc] mb-4">App Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b-4 border-black pb-2">
                    <span className="text-[#95d5b2]">Version</span>
                    <span className="text-[#d8f3dc] font-mono">1.0.0-stable</span>
                  </div>
                  <div className="flex justify-between border-b-4 border-black pb-2">
                    <span className="text-[#95d5b2]">Build Date</span>
                    <span className="text-[#d8f3dc] font-mono">April 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#95d5b2]">Platform</span>
                    <span className="text-[#d8f3dc] font-mono">Windows / Web (PWA)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operator' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-[#d8f3dc]">Operator (Auto-DM)</h2>
              
              <div className="bg-[#06140f] border-4 border-[#95d5b2] rounded-xl p-6 shadow-lg shadow-black/80">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#95d5b2] mb-2">Select Session</label>
                    <select value={operatorConfig.sessionId} onChange={e => setOperatorConfig({...operatorConfig, sessionId: e.target.value})} className="w-full md:w-1/2 bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors">
                      <option value="">Select Session</option>
                      {sessions.filter(s => s.status === 'active').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#95d5b2] mb-2">Message Template (Spintax Supported)</label>
                    <textarea 
                      value={operatorConfig.template} 
                      onChange={e => setOperatorConfig({...operatorConfig, template: e.target.value})} 
                      className="w-full h-32 bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-3 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] font-mono text-sm leading-relaxed transition-colors"
                      placeholder="{Hey|Hi}, saw you in {group}. {Check out|Look at} farmdash.one!"
                    />
                    <p className="text-xs text-[#74c69d] mt-2">Use {'{option1|option2}'} syntax to randomize messages and avoid spam filters.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#95d5b2] mb-2">Daily Limit (per account)</label>
                    <input 
                      type="number" 
                      value={operatorConfig.maxPerDay} 
                      onChange={e => setOperatorConfig({...operatorConfig, maxPerDay: Number(e.target.value)})} 
                      className="w-32 bg-black border-4 border-[#95d5b2] rounded-lg px-4 py-2 text-[#d8f3dc] focus:outline-none focus:border-[#52b788] transition-colors"
                    />
                  </div>

                  <div className="flex space-x-4 pt-6 border-t-4 border-[#95d5b2]">
                    <button 
                      onClick={handleStartOperator} 
                      disabled={activeActions.operator}
                      className={`bg-[#52b788] hover:bg-[#40916c] text-black px-6 py-2 rounded-lg font-bold transition-all border-4 border-[#95d5b2] shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center ${activeActions.operator ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <Play size={18} className={`mr-2 ${activeActions.operator ? 'animate-spin-slow' : ''}`} /> 
                      {activeActions.operator ? 'Operator Running...' : 'Start Operator'}
                    </button>
                    <button 
                      onClick={handleStopOperator} 
                      className="bg-rose-400 hover:bg-rose-500 text-black px-6 py-2 rounded-lg font-bold transition-all border-4 border-[#95d5b2] shadow-[2px_2px_0px_0px_#95d5b2] active:translate-y-[2px] active:shadow-none flex items-center"
                    >
                      <Square size={18} className="mr-2" /> Stop Operator
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Status Bar */}
      <div className="h-8 bg-[#06140f] border-t-4 border-[#95d5b2] flex items-center px-4 justify-between text-[10px] uppercase tracking-widest font-bold shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${sessions.some(s => s.status === 'active') ? 'bg-[#52b788] animate-pulse' : 'bg-rose-500'}`}></div>
            <span className="text-[#95d5b2]">System: {sessions.some(s => s.status === 'active') ? 'Online' : 'Standby'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${activeActions.listener ? 'bg-[#52b788] animate-pulse' : 'bg-[#1b4332]'}`}></div>
            <span className="text-[#95d5b2]">Listener: {activeActions.listener ? 'Active' : 'Idle'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${activeActions.operator ? 'bg-[#52b788] animate-pulse' : 'bg-[#1b4332]'}`}></div>
            <span className="text-[#95d5b2]">Operator: {activeActions.operator ? 'Active' : 'Idle'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[#52b788]">v1.0.0-stable</span>
          <span className="text-[#95d5b2]">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

