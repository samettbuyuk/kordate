/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageSquare, Shield, Users, Radio, Music, Film, Sparkles, 
  Lock, Unlock, Star, AlertTriangle, UserCheck, UserX, LogOut, Settings, 
  Sliders, Send, Play, Pause, Plus, Check, Eye, EyeOff, Flame, Compass, 
  HelpCircle, AlertOctagon, CheckCircle2, RefreshCw, Volume2, Link as LinkIcon, Sun, Moon, Smile, Meh, Frown, Gamepad2, RotateCcw, User as UserIcon, Edit3, ArrowLeft
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { User, Message, Match, GroupEvent, SharedRoom, Report } from './types';
import { INITIAL_USERS, INITIAL_GROUP_EVENTS } from './mockData';

export default function App() {
  // --- Persistent State ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('kordate_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kordate_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('kordate_matches');
    return saved ? JSON.parse(saved) : [
      {
        id: 'm_1',
        userId1: currentUser?.id || 'u_1',
        userId2: 'u_2',
        harmonyScore: 84,
        messageCount: 12,
        photosUnlocked: false,
        user1RequestedUnlock: false,
        user2RequestedUnlock: false,
        status: 'active',
        createdAt: Date.now() - 3600000,
        harmonyHistory: [
          { time: '12:00', score: 70 },
          { time: '12:15', score: 75 },
          { time: '12:30', score: 80 },
          { time: '12:45', score: 84 }
        ]
      }
    ];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('kordate_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'msg_1',
        senderId: 'u_2',
        receiverId: currentUser?.id || 'u_1',
        matchId: 'm_1',
        text: 'Merhaba! Profilindeki akustik müzik ve şiir ilgisini görünce yazmak istedim. Gece kahvelerini sever misin?',
        timestamp: Date.now() - 3500000,
        wordCount: 16
      },
      {
        id: 'msg_2',
        senderId: currentUser?.id || 'u_1',
        receiverId: 'u_2',
        matchId: 'm_1',
        text: 'Kesinlikle! Sessiz bir akşamüstü kahve eşliğinde derin sohbetler etmek en büyük huzurum.',
        timestamp: Date.now() - 3000000,
        wordCount: 14
      }
    ];
  });

  const [groupEvents, setGroupEvents] = useState<GroupEvent[]>(() => {
    const saved = localStorage.getItem('kordate_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUP_EVENTS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('kordate_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Theme Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kordate_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'chat' | 'spaces' | 'events' | 'profile' | 'admin'>('discover');
  const [activeMatchId, setActiveMatchId] = useState<string | null>('m_1');
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [signupGender, setSignupGender] = useState<'female' | 'male' | 'other'>('female');
  const [signupAge, setSignupAge] = useState(25);
  const [signupBio, setSignupBio] = useState('');
  const [signupInterests, setSignupInterests] = useState('Akustik, Kahve, Şiir');
  const [signupPhotoUrl, setSignupPhotoUrl] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80');

  // Profile Edit State
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editInterests, setEditInterests] = useState(currentUser?.interests.join(', ') || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState(currentUser?.photoUrl || '');

  // Chat Input
  const [chatInput, setChatInput] = useState('');
  const [shortMessageWarning, setShortMessageWarning] = useState<string | null>(null);

  // Shared Spaces State
  const [activeSharedRoom, setActiveSharedRoom] = useState<SharedRoom | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [sharedRoomChatInput, setSharedRoomChatInput] = useState('');
  const [mediaLinkInput, setMediaLinkInput] = useState('');

  // Group Rooms
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomChatInput, setRoomChatInput] = useState('');

  // Modals
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Yetersiz / Sahte Profil');
  const [reportDetails, setReportDetails] = useState('');

  // Celebration State
  const [celebrationData, setCelebrationData] = useState<{ show: boolean; title: string } | null>(null);

  const triggerCelebration = (title: string) => {
    setCelebrationData({ show: true, title });
    setTimeout(() => {
      setCelebrationData(null);
    }, 4000);
  };

  // Helper to compress uploaded image to low MB (base64 string)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.5 quality (very low MB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        callback(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Helper YouTube Embed
  const convertToEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // AI Emotional Tone Analyzer Helper
  const analyzeEmotionalTone = (messagesList: Message[]) => {
    if (!messagesList || messagesList.length === 0) return { label: 'Sakin / Nötr', icon: Meh, color: 'text-amber-500' };
    const textCombined = messagesList.map(m => m.text.toLowerCase()).join(' ');
    const positiveWords = ['harika', 'mutlu', 'güzel', 'seviyorum', 'sevgi', 'huzur', 'enerji', 'mükemmel', 'kahve', 'teşekkür'];
    const negativeWords = ['kötü', 'nefret', 'sıkıcı', 'üzgün', 'sinir', 'boş', 'saçma'];

    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach(w => { if (textCombined.includes(w)) posCount++; });
    negativeWords.forEach(w => { if (textCombined.includes(w)) negCount++; });

    if (posCount >= negCount) {
      return { label: 'Pozitif & Neşeli ✨', icon: Smile, color: 'text-emerald-500' };
    } else {
      return { label: 'Düşünceli / Derin 🌿', icon: Meh, color: 'text-amber-500' };
    }
  };

  // Shared Room XOX Logic
  const handleRoomXoxClick = (index: number) => {
    if (!activeSharedRoom || activeSharedRoom.xoxBoard[index] || activeSharedRoom.xoxWinner) return;
    const newBoard = [...activeSharedRoom.xoxBoard];
    newBoard[index] = activeSharedRoom.xoxIsXNext ? 'X' : 'O';
    
    let winner = null;
    const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        winner = newBoard[a];
        break;
      }
    }

    setActiveSharedRoom({
      ...activeSharedRoom,
      xoxBoard: newBoard,
      xoxIsXNext: !activeSharedRoom.xoxIsXNext,
      xoxWinner: winner
    });
  };

  const resetRoomXox = () => {
    if (!activeSharedRoom) return;
    setActiveSharedRoom({
      ...activeSharedRoom,
      xoxBoard: Array(9).fill(null),
      xoxIsXNext: true,
      xoxWinner: null
    });
  };

  // Persistence
  useEffect(() => { localStorage.setItem('kordate_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { 
    if (currentUser) {
      localStorage.setItem('kordate_current_user', JSON.stringify(currentUser));
      setEditBio(currentUser.bio);
      setEditInterests(currentUser.interests.join(', '));
      setEditPhotoUrl(currentUser.photoUrl);
    } else {
      localStorage.removeItem('kordate_current_user');
    }
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('kordate_matches', JSON.stringify(matches)); }, [matches]);
  useEffect(() => { localStorage.setItem('kordate_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('kordate_groups', JSON.stringify(groupEvents)); }, [groupEvents]);
  useEffect(() => { localStorage.setItem('kordate_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('kordate_dark_mode', JSON.stringify(isDarkMode)); }, [isDarkMode]);

  // Auth Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) return;

    if (authMode === 'login') {
      const found = users.find(u => u.username.toLowerCase() === usernameInput.trim().toLowerCase() && u.password === passwordInput);
      if (found) {
        if (found.isBanned) { alert('Bu hesap askıya alınmıştır.'); return; }
        setCurrentUser(found);
        setShowAuthModal(false);
        setUsernameInput('');
        setPasswordInput('');
        if (found.role === 'admin') setActiveTab('admin');
      } else {
        alert('Kullanıcı adı veya şifre hatalı!');
      }
    } else {
      const exists = users.some(u => u.username.toLowerCase() === usernameInput.trim().toLowerCase());
      if (exists) { alert('Bu kullanıcı adı zaten alınmış!'); return; }
      const newUser: User = {
        id: `u_${Date.now()}`,
        username: usernameInput.trim(),
        password: passwordInput,
        role: usernameInput.trim() === 'admin' ? 'admin' : 'user',
        gender: signupGender,
        age: Number(signupAge),
        bio: signupBio || 'Yeni bir hikaye...',
        interests: signupInterests.split(',').map(s => s.trim()).filter(Boolean),
        photoUrl: signupPhotoUrl,
        photoRevealed: false,
        harmonyScore: 80,
        createdAt: Date.now()
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setShowAuthModal(false);
      setUsernameInput('');
      setPasswordInput('');
      setSignupBio('');
    }
  };

  const handleLogout = () => { setCurrentUser(null); setActiveTab('discover'); };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      bio: editBio,
      interests: editInterests.split(',').map(s => s.trim()).filter(Boolean),
      photoUrl: editPhotoUrl
    };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    alert('Profiliniz başarıyla güncellendi!');
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser || !activeMatchId) return;

    const currentMatch = matches.find(m => m.id === activeMatchId);
    if (!currentMatch) return;

    const receiverId = currentMatch.userId1 === currentUser.id ? currentMatch.userId2 : currentMatch.userId1;
    const words = chatInput.trim().split(/\s+/);
    const wordCount = words.length;

    let isWarning = false;
    if (wordCount < 3) {
      isWarning = true;
      setShortMessageWarning('Çok kısa mesaj! Sohbet uyumunu korumak ve fotoğraf kilidini açmak için en az 3 kelimelik anlamlı cümleler kurun.');
      setTimeout(() => setShortMessageWarning(null), 5000);
    } else {
      setShortMessageWarning(null);
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      matchId: activeMatchId,
      text: chatInput.trim(),
      timestamp: Date.now(),
      wordCount,
      isWarning
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    const newMsgCount = currentMatch.messageCount + 1;
    const harmonyDelta = isWarning ? -3 : (wordCount > 6 ? 4 : 2);
    const newHarmony = Math.min(100, Math.max(20, currentMatch.harmonyScore + harmonyDelta));
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedHistory = [...(currentMatch.harmonyHistory || []), { time: timeLabel, score: newHarmony }];

    setMatches(matches.map(m => m.id === activeMatchId ? {
      ...m,
      messageCount: newMsgCount,
      harmonyScore: newHarmony,
      harmonyHistory: updatedHistory
    } : m));

    if (receiverId.startsWith('u_')) {
      setTimeout(() => {
        const botReplies = [
          'Kesinlikle katılıyorum, bu konu hakkında derinlemesine düşünmek gerçekten büyüleyici.',
          'Bunu söylediğin iyi oldu, benim de bu konuda benzer bir bakış açım var.',
          'Gelecekte insanların birbirini anlaması üzerine ne düşünüyorsun peki?',
          'Bu oldukça anlamlı bir yaklaşım. Seninle konuşurken zamanın nasıl geçtiğini fark etmiyorum.'
        ];
        const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
        const botMsg: Message = {
          id: `msg_bot_${Date.now()}`,
          senderId: receiverId,
          receiverId: currentUser.id,
          matchId: activeMatchId,
          text: randomReply,
          timestamp: Date.now(),
          wordCount: randomReply.split(/\s+/).length
        };
        setMessages(prev => [...prev, botMsg]);
      }, 2000);
    }
  };

  const requestPhotoUnlock = () => {
    if (!currentUser || !activeMatchId) return;
    const match = matches.find(m => m.id === activeMatchId);
    if (!match) return;

    const isUser1 = match.userId1 === currentUser.id;
    const updatedUser1Req = isUser1 ? true : match.user1RequestedUnlock;
    const updatedUser2Req = !isUser1 ? true : match.user2RequestedUnlock;
    const unlocked = updatedUser1Req && updatedUser2Req && match.messageCount >= 10 && match.harmonyScore >= 75;

    if (unlocked && !match.photosUnlocked) {
      triggerCelebration("Fotoğraf Kilidi Başarıyla Açıldı! 💖");
    } else {
      triggerCelebration("Fotoğraf açma talebiniz karşı tarafa iletildi!");
    }

    setMatches(matches.map(m => m.id === activeMatchId ? {
      ...m,
      user1RequestedUnlock: updatedUser1Req,
      user2RequestedUnlock: updatedUser2Req,
      photosUnlocked: unlocked
    } : m));
  };

  const activeMatch = matches.find(m => m.id === activeMatchId);
  const otherUserId = activeMatch ? (activeMatch.userId1 === currentUser?.id ? activeMatch.userId2 : activeMatch.userId1) : null;
  const otherUser = users.find(u => u.id === otherUserId);
  const activeMessages = messages.filter(m => m.matchId === activeMatchId);
  const currentTone = analyzeEmotionalTone(activeMessages);

  // Group events
  const handleCreateGroupEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const titleInput = (document.getElementById('group_title') as HTMLInputElement)?.value;
    const descInput = (document.getElementById('group_desc') as HTMLInputElement)?.value;
    const catInput = (document.getElementById('group_cat') as HTMLSelectElement)?.value as any;
    const audienceInput = (document.getElementById('group_audience') as HTMLSelectElement)?.value as any;
    const approvalInput = (document.getElementById('group_approval') as HTMLInputElement)?.checked;

    if (!titleInput) return;

    const newEvent: GroupEvent = {
      id: `g_${Date.now()}`,
      title: titleInput,
      description: descInput || 'Toplu date buluşması.',
      hostId: currentUser.id,
      hostName: currentUser.username,
      category: catInput || 'Cyber Talk',
      participants: [currentUser.username],
      pendingParticipants: [],
      maxParticipants: 10,
      audience: audienceInput || 'karma',
      requiresApproval: !!approvalInput,
      isLive: true,
      createdAt: Date.now(),
      messages: [{ id: `gm_${Date.now()}`, sender: currentUser.username, text: 'Oda oluşturuldu! Hoş geldiniz.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    };

    setGroupEvents([newEvent, ...groupEvents]);
    alert('Toplu Date Odası başarıyla oluşturuldu!');
  };

  const joinGroupEvent = (event: GroupEvent) => {
    if (!currentUser) { setShowAuthModal(true); return; }

    if (event.audience === 'female_only' && currentUser.gender !== 'female') {
      alert('Bu oda yalnızca kızlara özeldir!');
      return;
    }
    if (event.audience === 'male_only' && currentUser.gender !== 'male') {
      alert('Bu oda yalnızca erkeklere özeldir!');
      return;
    }

    if (event.requiresApproval && event.hostId !== currentUser.id) {
      setGroupEvents(groupEvents.map(g => {
        if (g.id === event.id && !g.pendingParticipants?.includes(currentUser.username) && !g.participants.includes(currentUser.username)) {
          return { ...g, pendingParticipants: [...(g.pendingParticipants || []), currentUser.username] };
        }
        return g;
      }));
      alert('Odaya katılım talebiniz yönetici onayına gönderildi.');
    } else {
      setGroupEvents(groupEvents.map(g => {
        if (g.id === event.id && !g.participants.includes(currentUser.username)) {
          return { ...g, participants: [...g.participants, currentUser.username] };
        }
        return g;
      }));
      setActiveRoomId(event.id);
    }
  };

  const handleApproveUser = (eventId: string, username: string, approve: boolean) => {
    setGroupEvents(groupEvents.map(g => {
      if (g.id === eventId) {
        const newPending = g.pendingParticipants?.filter(u => u !== username) || [];
        const newParticipants = approve ? [...g.participants, username] : g.participants;
        return { ...g, pendingParticipants: newPending, participants: newParticipants };
      }
      return g;
    }));
  };

  const sendRoomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomChatInput.trim() || !currentUser || !activeRoomId) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: `gm_${Date.now()}`, sender: currentUser.username, text: roomChatInput.trim(), time: timeStr };

    setGroupEvents(groupEvents.map(g => {
      if (g.id === activeRoomId) {
        return { ...g, messages: [...(g.messages || []), newMsg] };
      }
      return g;
    }));
    setRoomChatInput('');
  };

  const submitReport = () => {
    if (!currentUser || !otherUser) return;
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reportedUserId: otherUser.id,
      reason: reportReason,
      details: reportDetails,
      timestamp: Date.now(),
      status: 'pending'
    };
    setReports([...reports, newReport]);
    setShowReportModal(false);
    setReportDetails('');
    alert('Şikayetiniz güvenlik ekibimize iletildi.');
  };

  const activeGroupRoom = groupEvents.find(g => g.id === activeRoomId);

  // Staggered Fade-In Variants for Keşfet Cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-rose-500 selection:text-white pb-28 md:pb-8 relative overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#08070b] text-[#fce7f3]' : 'bg-[#fff1f2] text-[#381d2a]'}`}>
      
      {/* Ambient Glows */}
      <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${isDarkMode ? 'bg-rose-600/10' : 'bg-rose-400/20'}`} />
      <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${isDarkMode ? 'bg-amber-600/10' : 'bg-amber-400/20'}`} />

      {/* Top Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-2xl border-b px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-lg transition-colors duration-500 ${isDarkMode ? 'bg-[#0f0d13]/85 border-rose-500/25 shadow-rose-950/20' : 'bg-white/90 border-rose-200 shadow-rose-100'}`}>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('discover')}>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              KÖRDATE
            </h1>
            <p className={`text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold ${isDarkMode ? 'text-rose-400/80' : 'text-rose-600'}`}>Gizli Fotoğraf Date</p>
          </div>
        </div>

        {/* Live Stats Ticker */}
        <div className={`hidden lg:flex items-center space-x-4 border px-4 py-1.5 rounded-full text-xs ${isDarkMode ? 'bg-slate-900/80 border-rose-500/20 text-slate-300' : 'bg-rose-50 border-rose-200 text-slate-700'}`}>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-500 font-semibold">1,420 Aktif Date</span>
          </div>
          <span className="opacity-40">|</span>
          <span>Toplam Üye: <strong className="text-rose-500">8,950</strong></span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-2xl border transition shadow-md ${isDarkMode ? 'bg-slate-900 border-rose-500/30 text-amber-400 hover:bg-slate-800' : 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'}`}
            title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <div className={`flex items-center space-x-2 sm:space-x-3 border px-3 py-1.5 rounded-full shadow-md ${isDarkMode ? 'bg-slate-900/90 border-rose-500/30 text-rose-200' : 'bg-white border-rose-300 text-rose-900'}`}>
              <img src={currentUser.photoUrl} alt="avatar" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-rose-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold hidden md:inline">{currentUser.username}</span>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`text-[10px] sm:text-xs border px-2 py-0.5 rounded transition ${activeTab === 'profile' ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-600/20 border-rose-500 text-rose-400 hover:bg-rose-600/40'}`}
              >
                Profilim
              </button>
              {currentUser.role === 'admin' && (
                <button onClick={() => setActiveTab('admin')} className="text-[10px] sm:text-xs bg-rose-600/30 border border-rose-500 px-1.5 py-0.5 rounded text-rose-400">Admin</button>
              )}
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition p-1" title="Çıkış Yap">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white font-bold px-4 py-2 rounded-2xl text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:scale-105 transition"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className={`hidden md:flex border-b px-4 py-2 items-center justify-center space-x-3 backdrop-blur-md transition-colors duration-500 ${isDarkMode ? 'bg-[#0f0d13]/70 border-rose-500/10' : 'bg-white/70 border-rose-200'}`}>
        <button onClick={() => setActiveTab('discover')} className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition ${activeTab === 'discover' ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-md' : 'text-slate-500 hover:text-rose-600'}`}>
          <Compass className="w-4 h-4" /><span>Keşfet</span>
        </button>
        <button onClick={() => setActiveTab('matches')} className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition ${activeTab === 'matches' ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-md' : 'text-slate-500 hover:text-rose-600'}`}>
          <Heart className="w-4 h-4" /><span>Eşleşmelerim</span>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition ${activeTab === 'chat' ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-md' : 'text-slate-500 hover:text-rose-600'}`}>
          <MessageSquare className="w-4 h-4" /><span>Derin Sohbet & Uyum</span>
        </button>
        <button onClick={() => setActiveTab('spaces')} className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition ${activeTab === 'spaces' ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-md' : 'text-slate-500 hover:text-rose-600'}`}>
          <Sparkles className="w-4 h-4" /><span>Birlikte Alanı</span>
        </button>
        <button onClick={() => setActiveTab('events')} className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition ${activeTab === 'events' ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-md' : 'text-slate-500 hover:text-rose-600'}`}>
          <Radio className="w-4 h-4" /><span>Toplu Date Odaları</span>
        </button>
        {currentUser && (
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition ${activeTab === 'profile' ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-md' : 'text-slate-500 hover:text-rose-600'}`}>
            <UserIcon className="w-4 h-4" /><span>Profilim</span>
          </button>
        )}
        {currentUser?.role === 'admin' && (
          <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition ${activeTab === 'admin' ? 'bg-rose-500/20 border border-rose-500/50 text-rose-500 shadow-md' : 'text-slate-500 hover:text-rose-600'}`}>
            <Shield className="w-4 h-4" /><span>Admin Paneli</span>
          </button>
        )}
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-2xl px-2 py-2 flex items-center justify-around transition-colors duration-500 ${isDarkMode ? 'bg-[#0f0d13]/95 border-rose-500/30' : 'bg-white/95 border-rose-200 shadow-lg'}`}>
        <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center p-2 rounded-2xl text-[10px] font-semibold transition ${activeTab === 'discover' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500'}`}><Compass className="w-5 h-5 mb-0.5" /><span>Keşfet</span></button>
        <button onClick={() => setActiveTab('matches')} className={`flex flex-col items-center p-2 rounded-2xl text-[10px] font-semibold transition ${activeTab === 'matches' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500'}`}><Heart className="w-5 h-5 mb-0.5" /><span>Eşleşme</span></button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center p-2 rounded-2xl text-[10px] font-semibold transition ${activeTab === 'chat' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500'}`}><MessageSquare className="w-5 h-5 mb-0.5" /><span>Sohbet</span></button>
        <button onClick={() => setActiveTab('spaces')} className={`flex flex-col items-center p-2 rounded-2xl text-[10px] font-semibold transition ${activeTab === 'spaces' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500'}`}><Sparkles className="w-5 h-5 mb-0.5" /><span>Birlikte</span></button>
        {currentUser && (
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 rounded-2xl text-[10px] font-semibold transition ${activeTab === 'profile' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500'}`}><UserIcon className="w-5 h-5 mb-0.5" /><span>Profil</span></button>
        )}
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* ================= 1. DISCOVER TAB WITH STAGGERED FADE-IN ENTRY & 3D TILT + SHIMMER GLOW ================= */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto py-4 sm:py-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-2 sm:mb-3">
                Kördate Keşif Alanı
              </h2>
              <p className={`text-xs sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Instagram profili önizlemeli gizli eşleşmeleri keşfedin.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {users.filter(u => u.id !== currentUser?.id && !u.isBanned).map(user => {
                const igAvatar = user.photoUrl;
                return (
                  <motion.div 
                    key={user.id}
                    variants={cardVariants}
                    whileHover={{ 
                      scale: 1.03, 
                      rotateX: 4, 
                      rotateY: -4, 
                      z: 40,
                      boxShadow: isDarkMode ? "0 0 35px rgba(244, 63, 94, 0.45)" : "0 0 30px rgba(244, 63, 94, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                    style={{ perspective: 1000 }}
                    className={`rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col justify-between group border transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-rose-500/30' : 'bg-white border-rose-200 shadow-xl'}`}
                  >
                    {/* Shimmer Glow Sweep on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                    <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition duration-500" />
                    
                    <div>
                      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden mb-4 border border-rose-500/30 shadow-inner">
                        <img 
                          src={igAvatar} 
                          alt={user.username} 
                          className={`w-full h-full object-cover transition duration-700 ${user.photoRevealed ? 'filter-none' : 'filter blur-2xl scale-110 group-hover:scale-125'}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                              <span>{user.username}</span>
                              <span className="text-xs bg-rose-500/30 text-rose-200 border border-rose-500/50 px-2.5 py-0.5 rounded-full">{user.age}</span>
                            </h3>
                            <div className="flex items-center space-x-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-xs font-bold text-amber-300">Uyum %{user.harmonyScore}</span>
                            </div>
                          </div>
                        </div>
                        
                        {!user.photoRevealed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                            <div className="bg-slate-950/90 border border-rose-500/40 px-3.5 py-2 rounded-2xl flex items-center space-x-2 text-xs text-rose-300 shadow-xl">
                              <Lock className="w-4 h-4 text-rose-400 animate-pulse" />
                              <span>Instagram Kör Önizleme</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 rounded-2xl mb-4 transition-all duration-300 border ${isDarkMode ? 'bg-slate-950/60 border-rose-500/20 group-hover:border-rose-500/50' : 'bg-rose-50/60 border-rose-200 group-hover:border-rose-400'}`}
                      >
                        <p className={`text-xs sm:text-sm italic font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          "{user.bio}"
                        </p>
                      </motion.div>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {user.interests.map((interest, idx) => (
                          <span key={idx} className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-rose-500/20 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                            #{interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!currentUser) { setShowAuthModal(true); return; }
                        const existing = matches.find(m => (m.userId1 === currentUser.id && m.userId2 === user.id) || (m.userId1 === user.id && m.userId2 === currentUser.id));
                        if (existing) {
                          setActiveMatchId(existing.id);
                          setActiveTab('chat');
                        } else {
                          const newMatch: Match = {
                            id: `m_${Date.now()}`,
                            userId1: currentUser.id,
                            userId2: user.id,
                            harmonyScore: 78,
                            messageCount: 0,
                            photosUnlocked: false,
                            user1RequestedUnlock: false,
                            user2RequestedUnlock: false,
                            status: 'active',
                            createdAt: Date.now(),
                            harmonyHistory: [{ time: 'Şimdi', score: 78 }]
                          };
                          setMatches([newMatch, ...matches]);
                          setActiveMatchId(newMatch.id);
                          setActiveTab('chat');
                          triggerCelebration(`Yeni Eşleşme Gerçekleşti: @${user.username} ✨`);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 transition flex items-center justify-center space-x-2"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Derin Sohbet Başlat</span>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* ================= 2. MATCHES TAB ================= */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              Eşleşmelerim & Duygu Durum Analizi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.filter(m => currentUser && (m.userId1 === currentUser.id || m.userId2 === currentUser.id)).map(match => {
                const partnerId = match.userId1 === currentUser?.id ? match.userId2 : match.userId1;
                const partner = users.find(u => u.id === partnerId);
                if (!partner) return null;

                const igAvatar = partner.photoUrl;
                const matchMsgs = messages.filter(msg => msg.matchId === match.id);
                const tone = analyzeEmotionalTone(matchMsgs);
                const ToneIcon = tone.icon;

                return (
                  <div key={match.id} className={`border rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xl backdrop-blur-xl transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-rose-500/25' : 'bg-white border-rose-200'}`}>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-rose-500/40 shrink-0">
                        <img src={igAvatar} alt={partner.username} className={`w-full h-full object-cover ${match.photosUnlocked ? '' : 'filter blur-md'}`} />
                        {!match.photosUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Lock className="w-4 h-4 text-rose-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{partner.username}</h3>
                        <p className="text-xs text-rose-500 font-semibold">Uyum Puanı: %{match.harmonyScore}</p>
                        <div className="flex items-center space-x-1 mt-1 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-lg w-fit">
                          <ToneIcon className={`w-3 h-3 ${tone.color}`} />
                          <span className="text-[10px] font-semibold text-rose-400">Duygu Durum: {tone.label}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setActiveMatchId(match.id); setActiveTab('chat'); }}
                      className="bg-rose-500/20 border border-rose-500/50 text-rose-500 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-rose-500/30 transition flex items-center space-x-1 shadow-md shrink-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Sohbet</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 3. CHAT TAB ================= */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-150px)]">
            
            <div className={`hidden lg:block lg:col-span-1 border rounded-3xl p-4 overflow-y-auto transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-rose-500/25' : 'bg-white border-rose-200'}`}>
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">Aktif Date Sohbetleri</h3>
              <div className="space-y-2">
                {matches.filter(m => currentUser && (m.userId1 === currentUser.id || m.userId2 === currentUser.id)).map(match => {
                  const partnerId = match.userId1 === currentUser?.id ? match.userId2 : match.userId1;
                  const partner = users.find(u => u.id === partnerId);
                  if (!partner) return null;
                  const isActive = match.id === activeMatchId;
                  const igAvatar = partner.photoUrl;

                  return (
                    <div 
                      key={match.id}
                      onClick={() => setActiveMatchId(match.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition flex items-center space-x-3 border ${isActive ? 'bg-rose-500/20 border-rose-500/60 text-rose-500 shadow-md' : isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/50' : 'bg-rose-50/50 border-rose-100 text-slate-700 hover:bg-rose-100/50'}`}
                    >
                      <img src={igAvatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-sm truncate">{partner.username}</h4>
                        <p className="text-[11px] text-rose-500 font-semibold">Uyum: %{match.harmonyScore}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`col-span-1 lg:col-span-3 border rounded-3xl flex flex-col overflow-hidden shadow-2xl relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-rose-500/25' : 'bg-white border-rose-200'}`}>
              
              {otherUser && activeMatch && (
                <div className={`border-b p-3 sm:p-4 flex items-center justify-between ${isDarkMode ? 'bg-slate-950/90 border-rose-500/20' : 'bg-rose-50/80 border-rose-200'}`}>
                  <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border border-rose-500/40 shrink-0">
                      <img src={otherUser.photoUrl} alt="partner" className={`w-full h-full object-cover ${activeMatch.photosUnlocked ? '' : 'filter blur-md'}`} />
                      {!activeMatch.photosUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className={`font-bold text-sm sm:text-base flex items-center space-x-2 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <span className="truncate">{otherUser.username}</span>
                        <span className="text-[10px] sm:text-xs bg-rose-500/20 text-rose-500 border border-rose-500/40 px-2 py-0.5 rounded-full font-semibold shrink-0">
                          %{activeMatch.harmonyScore}
                        </span>
                      </h3>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <currentTone.icon className={`w-3 h-3 ${currentTone.color}`} />
                        <span className="text-[10px] font-semibold text-rose-400">Duygu Durum: {currentTone.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                    <button
                      onClick={requestPhotoUnlock}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-2xl text-[11px] sm:text-xs font-semibold border flex items-center space-x-1 transition ${activeMatch.photosUnlocked ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300' : 'bg-rose-600/20 border-rose-500 text-rose-500 hover:bg-rose-600/30'}`}
                    >
                      {activeMatch.photosUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{activeMatch.photosUnlocked ? 'Açık' : 'Fotoğraf Aç'}</span>
                    </button>
                    <button onClick={() => setShowReportModal(true)} className="p-2 rounded-2xl bg-slate-200 dark:bg-slate-800 border text-slate-600 dark:text-slate-300 hover:text-red-500 transition">
                      <AlertOctagon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowRatingModal(true)} className="p-2 rounded-2xl bg-slate-200 dark:bg-slate-800 border text-rose-500 hover:bg-slate-700 transition">
                      <Star className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Recharts Harmony Trend Chart */}
              {activeMatch && activeMatch.harmonyHistory && activeMatch.harmonyHistory.length > 0 && (
                <div className={`border-b p-2 sm:p-3 ${isDarkMode ? 'bg-slate-950/60 border-rose-500/10' : 'bg-rose-50/40 border-rose-200'}`}>
                  <div className="flex items-center justify-between mb-1 px-2">
                    <span className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>Uyum Eğrisi (Recharts)</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Skor: <strong className="text-rose-500">%{activeMatch.harmonyScore}</strong></span>
                  </div>
                  <div className="h-24 sm:h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeMatch.harmonyHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#fbcfe8'} />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis domain={[20, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderColor: '#f43f5e', borderRadius: '12px', color: isDarkMode ? '#fff' : '#000', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#fb7185', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {shortMessageWarning && (
                <div className="bg-amber-500/20 border-b border-amber-500/50 p-2.5 text-xs text-amber-600 dark:text-amber-300 flex items-center space-x-2 animate-bounce">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>{shortMessageWarning}</span>
                </div>
              )}

              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
                {activeMessages.map(msg => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-md rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm shadow-xl ${isMe ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white font-medium' : isDarkMode ? 'bg-slate-800 border border-rose-500/20 text-slate-200' : 'bg-rose-100 border border-rose-200 text-slate-800'}`}>
                        <p>{msg.text}</p>
                        <div className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <span>• {msg.wordCount} kelime</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className={`border-t p-2.5 sm:p-3 flex items-center space-x-2 ${isDarkMode ? 'bg-slate-950 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Derin mesaj yazın (en az 3 kelime)..."
                  className={`flex-1 border rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none transition ${isDarkMode ? 'bg-slate-900 border-rose-500/30 text-white focus:border-rose-400' : 'bg-white border-rose-300 text-slate-900 focus:border-rose-500'}`}
                />
                <button type="submit" className="bg-gradient-to-r from-rose-500 to-amber-600 text-white p-2.5 sm:p-3 rounded-2xl font-bold hover:scale-105 transition shadow-lg shadow-rose-500/25 shrink-0">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= 4. SPACES TAB ================= */}
        {activeTab === 'spaces' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center max-w-xl mx-auto py-2 sm:py-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-2">
                Birlikte Alanı (YouTube & İki Kişilik XOX Oyunu)
              </h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Birlikte müzik dinleyin, video izleyin veya eğlenceli XOX (Tic-Tac-Toe) oynayın.
              </p>
            </div>

            {!activeSharedRoom ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className={`border rounded-3xl p-6 shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Yeni Oda Kur</h3>
                  <input
                    type="text"
                    value={roomNameInput}
                    onChange={e => setRoomNameInput(e.target.value)}
                    placeholder="Oda Adı (örn: Akustik Gece)"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                  />
                  <button
                    onClick={() => {
                      if (!roomNameInput.trim()) return;
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setActiveSharedRoom({
                        roomCode: code,
                        roomName: roomNameInput.trim(),
                        hostUsername: currentUser?.username || 'Misafir',
                        activeMediaUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
                        mediaType: 'music',
                        messages: [{ id: `sm_${Date.now()}`, sender: 'Sistem', text: `Oda kuruldu! Oda Numaranız: ${code}`, time: 'Şimdi' }],
                        xoxBoard: Array(9).fill(null),
                        xoxIsXNext: true,
                        xoxWinner: null
                      });
                      setRoomNameInput('');
                    }}
                    className="w-full bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold py-3 rounded-2xl text-sm shadow-md"
                  >
                    Oda Kur ve Başlat
                  </button>
                </div>

                <div className={`border rounded-3xl p-6 shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Oda Numarası ile Gir</h3>
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={e => setRoomCodeInput(e.target.value)}
                    placeholder="6 Haneli Oda Kodu..."
                    className={`w-full border rounded-2xl px-4 py-3 text-sm ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                  />
                  <button
                    onClick={() => {
                      if (roomCodeInput.trim().length < 4) { alert('Geçerli bir oda numarası girin!'); return; }
                      setActiveSharedRoom({
                        roomCode: roomCodeInput.trim(),
                        roomName: `Oda #${roomCodeInput.trim()}`,
                        hostUsername: 'Oda Üyesi',
                        activeMediaUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
                        mediaType: 'music',
                        messages: [{ id: `sm_${Date.now()}`, sender: 'Sistem', text: `Odaya başarıyla katıldınız!`, time: 'Şimdi' }],
                        xoxBoard: Array(9).fill(null),
                        xoxIsXNext: true,
                        xoxWinner: null
                      });
                      setRoomCodeInput('');
                    }}
                    className="w-full bg-slate-800 text-rose-300 border border-rose-500/50 font-bold py-3 rounded-2xl text-sm shadow-md"
                  >
                    Odaya Bağlan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`border rounded-3xl p-4 flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeSharedRoom.roomName}</h3>
                    <p className="text-xs text-rose-500 font-semibold">Oda Numarası / Kodu: <strong className="text-white bg-rose-600 px-2 py-0.5 rounded">{activeSharedRoom.roomCode}</strong></p>
                  </div>
                  <button onClick={() => setActiveSharedRoom(null)} className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-2 rounded-2xl text-xs font-bold">Odadan Ayrıl</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`border rounded-3xl p-5 flex flex-col h-[400px] shadow-xl ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                    <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Oda İçi Canlı Sohbet</h4>
                    <div className={`flex-1 overflow-y-auto space-y-2 p-3 rounded-2xl mb-3 border ${isDarkMode ? 'bg-slate-950 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                      {activeSharedRoom.messages.map(m => (
                        <div key={m.id} className="text-xs">
                          <strong className="text-rose-500">{m.sender}: </strong>
                          <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{m.text}</span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={e => {
                      e.preventDefault();
                      if (!sharedRoomChatInput.trim()) return;
                      const newMsg = { id: `sm_${Date.now()}`, sender: currentUser?.username || 'Misafir', text: sharedRoomChatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                      setActiveSharedRoom({ ...activeSharedRoom, messages: [...activeSharedRoom.messages, newMsg] });
                      setSharedRoomChatInput('');
                    }} className="flex space-x-2">
                      <input
                        type="text"
                        value={sharedRoomChatInput}
                        onChange={e => setSharedRoomChatInput(e.target.value)}
                        placeholder="Mesaj yazın..."
                        className={`flex-1 border rounded-2xl px-3 py-2 text-xs ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                      />
                      <button type="submit" className="bg-rose-500 text-white px-4 py-2 rounded-2xl text-xs font-bold">Gönder</button>
                    </form>
                  </div>

                  <div className={`border rounded-3xl p-5 flex flex-col items-center justify-between shadow-xl ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                    <div className="flex items-center justify-between w-full mb-3">
                      <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>İki Kişilik XOX</h4>
                      <button onClick={resetRoomXox} className="p-1.5 rounded-xl bg-slate-800 text-slate-300"><RotateCcw className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="text-center mb-2">
                      {activeSharedRoom.xoxWinner ? (
                        <p className="text-xs font-bold text-emerald-400">Kazanan: {activeSharedRoom.xoxWinner} 🎉</p>
                      ) : (
                        <p className="text-[11px] text-rose-400">Sıra: {activeSharedRoom.xoxIsXNext ? 'X' : 'O'}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-48 h-48 mx-auto">
                      {activeSharedRoom.xoxBoard.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRoomXoxClick(idx)}
                          className={`rounded-2xl border text-xl font-black flex items-center justify-center transition ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                        >
                          {cell}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`border rounded-3xl p-5 shadow-xl space-y-4 ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                    <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Medya (Müzik / Video)</h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={mediaLinkInput}
                        onChange={e => setMediaLinkInput(e.target.value)}
                        placeholder="YouTube Linki..."
                        className={`flex-1 border rounded-2xl px-3 py-1.5 text-xs ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                      />
                      <button
                        onClick={() => {
                          if (mediaLinkInput) {
                            setActiveSharedRoom({ ...activeSharedRoom, activeMediaUrl: convertToEmbedUrl(mediaLinkInput) });
                            setMediaLinkInput('');
                          }
                        }}
                        className="bg-rose-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold"
                      >
                        Aç
                      </button>
                    </div>
                    <div className="w-full h-40 rounded-2xl overflow-hidden border border-rose-500/30 bg-black">
                      <iframe src={activeSharedRoom.activeMediaUrl} title="Shared Media" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 5. TOPLU DATE ODALARI ================= */}
        {activeTab === 'events' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Toplu Date Etkinlikleri & Odalar
                </h2>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sadece kızlara, sadece erkeklere veya karma oda kurup yönetici onayı ekleyin.</p>
              </div>

              {currentUser && (
                <div className={`border p-3 sm:p-4 rounded-3xl w-full md:w-auto flex flex-col sm:flex-row gap-2 shadow-xl ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                  <input id="group_title" type="text" placeholder="Oda Adı..." className={`border px-3 py-2 rounded-2xl text-xs sm:text-sm ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`} />
                  <select id="group_cat" className={`border px-3 py-2 rounded-2xl text-xs sm:text-sm ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    <option value="Cyber Talk">Genel Sohbet</option>
                    <option value="Music Vibe">Müzik Vibe</option>
                    <option value="Deep Philosophy">Derin Felsefe</option>
                  </select>
                  <select id="group_audience" className={`border px-3 py-2 rounded-2xl text-xs sm:text-sm ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    <option value="karma">Karma (Herkes)</option>
                    <option value="female_only">Sadece Kızlara Özel</option>
                    <option value="male_only">Sadece Erkeklere Özel</option>
                  </select>
                  <label className="flex items-center space-x-1.5 text-xs text-rose-500 px-2 font-semibold">
                    <input type="checkbox" id="group_approval" className="rounded border-rose-500" />
                    <span>Yönetici Onayı</span>
                  </label>
                  <button onClick={handleCreateGroupEvent} className="bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold px-4 py-2 rounded-2xl text-xs sm:text-sm shadow-md">
                    Oda Kur
                  </button>
                </div>
              )}
            </div>

            {activeRoomId && activeGroupRoom && (
              <div className={`border rounded-3xl p-4 sm:p-6 shadow-2xl mb-8 space-y-4 ${isDarkMode ? 'bg-slate-900 border-rose-500/40' : 'bg-white border-rose-200'}`}>
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
                  <div>
                    <h3 className={`text-base sm:text-xl font-bold flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <span>{activeGroupRoom.title}</span>
                      <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">CANLI</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Üye: {activeGroupRoom.participants.join(', ')}</p>
                  </div>
                  <button onClick={() => setActiveRoomId(null)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-2xl text-xs font-semibold">Ayrıl</button>
                </div>

                {activeGroupRoom.hostId === currentUser?.id && activeGroupRoom.pendingParticipants && activeGroupRoom.pendingParticipants.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-300 mb-2">Bekleyen Katılım Talepleri:</h4>
                    <div className="space-y-2">
                      {activeGroupRoom.pendingParticipants.map(username => (
                        <div key={username} className={`flex items-center justify-between p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-950' : 'bg-rose-50'}`}>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{username}</span>
                          <div className="flex space-x-2">
                            <button onClick={() => handleApproveUser(activeGroupRoom.id, username, true)} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Onayla</button>
                            <button onClick={() => handleApproveUser(activeGroupRoom.id, username, false)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Reddet</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`h-56 sm:h-64 overflow-y-auto space-y-3 p-3 sm:p-4 rounded-2xl border border-rose-500/20 ${isDarkMode ? 'bg-slate-950/80' : 'bg-rose-50/50'}`}>
                  {activeGroupRoom.messages?.map(m => (
                    <div key={m.id} className="text-xs sm:text-sm">
                      <strong className="text-rose-500">{m.sender}: </strong>
                      <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{m.text}</span>
                      <span className="text-[10px] text-slate-500 ml-2">{m.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendRoomMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={roomChatInput}
                    onChange={e => setRoomChatInput(e.target.value)}
                    placeholder="Oda sohbetine yazın..."
                    className={`flex-1 border rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-white border-rose-300 text-slate-900'}`}
                  />
                  <button type="submit" className="bg-rose-500 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm">Gönder</button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {groupEvents.map(event => (
                <div key={event.id} className={`border rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <span className="text-xs bg-rose-500/20 text-rose-500 border border-rose-500/40 px-3 py-1 rounded-full font-semibold">
                        {event.audience === 'female_only' ? 'Sadece Kızlar' : event.audience === 'male_only' ? 'Sadece Erkekler' : 'Karma'}
                      </span>
                      {event.requiresApproval && (
                        <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full font-semibold">Yönetici Onaylı</span>
                      )}
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{event.title}</h3>
                    <p className={`text-xs sm:text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{event.description}</p>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Kurucu: <strong className="text-rose-500">{event.hostName}</strong> ({event.participants.length} katılımcı)
                    </div>
                  </div>

                  <button
                    onClick={() => joinGroupEvent(event)}
                    className="w-full bg-rose-500/20 border border-rose-500/50 text-rose-500 py-2.5 rounded-2xl font-semibold hover:bg-rose-500/30 transition flex items-center justify-center space-x-2 text-xs sm:text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Odaya Katıl / Gir</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 6. PROFILIM TAB ================= */}
        {activeTab === 'profile' && currentUser && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${isDarkMode ? 'bg-slate-900/90 border-rose-500/30' : 'bg-white border-rose-200'}`}>
              <div className="flex items-center space-x-4 border-b border-rose-500/20 pb-6">
                <img src={currentUser.photoUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-rose-500 shadow-lg" />
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser.username}</h3>
                  <p className="text-xs text-slate-400 mt-1">Yaş: {currentUser.age} • Cinsiyet: {currentUser.gender}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Profil Fotoğrafı Yükle (Düşük MB / Sıkıştırılmış)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, (base64) => setEditPhotoUrl(base64))}
                    className={`w-full border rounded-2xl px-4 py-2.5 text-xs ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                  />
                  {editPhotoUrl && (
                    <img src={editPhotoUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover mt-2 border border-rose-500/40" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">İlgi Alanları (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={editInterests}
                    onChange={e => setEditInterests(e.target.value)}
                    className={`w-full border rounded-2xl px-4 py-3 text-sm ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Biyografi</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    rows={3}
                    className={`w-full border rounded-2xl px-4 py-3 text-sm resize-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                  />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold py-3 rounded-2xl text-sm shadow-md">
                  Profili Güncelle
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= 7. ADMIN PANEL ================= */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              Admin & Moderasyon Paneli
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`border p-6 rounded-3xl shadow-lg ${isDarkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'}`}>
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Toplam Üye</h3>
                <p className="text-3xl font-black text-rose-500">{users.length}</p>
              </div>
              <div className={`border p-6 rounded-3xl shadow-lg ${isDarkMode ? 'bg-slate-900 border-amber-500/30' : 'bg-white border-rose-200'}`}>
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Aktif Eşleşmeler</h3>
                <p className="text-3xl font-black text-amber-500">{matches.length}</p>
              </div>
              <div className={`border p-6 rounded-3xl shadow-lg ${isDarkMode ? 'bg-slate-900 border-pink-500/30' : 'bg-white border-rose-200'}`}>
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Bekleyen Raporlar</h3>
                <p className="text-3xl font-black text-pink-500">{reports.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-rose-500/40 text-white' : 'bg-white border-rose-300 text-slate-900'}`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black">{authMode === 'login' ? 'Kördate Giriş' : 'Yeni Kördate Profili'}</h3>
                  <p className="text-xs text-rose-500 mt-1">Instagram entegre gizli date profili.</p>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="flex items-center space-x-1 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl hover:bg-slate-700 transition">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Geri Çık</span>
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="örn: Melis_Rose"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white focus:border-rose-400' : 'bg-rose-50 border-rose-200 text-slate-900 focus:border-rose-500'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Şifre</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white focus:border-rose-400' : 'bg-rose-50 border-rose-200 text-slate-900 focus:border-rose-500'}`}
                  />
                </div>

                {authMode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Cinsiyet</label>
                        <select 
                          value={signupGender} 
                          onChange={(e: any) => setSignupGender(e.target.value)}
                          className={`w-full border rounded-2xl px-3 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                        >
                          <option value="female">Kadın</option>
                          <option value="male">Erkek</option>
                          <option value="other">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Yaş</label>
                        <input
                          type="number"
                          value={signupAge}
                          onChange={(e) => setSignupAge(Number(e.target.value))}
                          className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Profil Fotoğrafı Yükle (Düşük MB)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, (base64) => setSignupPhotoUrl(base64))}
                        className={`w-full border rounded-2xl px-4 py-2.5 text-xs ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                      />
                      {signupPhotoUrl && (
                        <img src={signupPhotoUrl} alt="Preview" className="w-14 h-14 rounded-xl object-cover mt-2 border border-rose-500/40" />
                      )}
                      <p className="text-[10px] text-rose-500 mt-1">Fotoğraf otomatik olarak sıkıştırılarak düşük boyutlu (MB) saklanır.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">İlgi Alanları (virgülle)</label>
                      <input
                        type="text"
                        value={signupInterests}
                        onChange={(e) => setSignupInterests(e.target.value)}
                        placeholder="Akustik, Kahve, Şiir"
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Biyografi</label>
                      <textarea
                        value={signupBio}
                        onChange={(e) => setSignupBio(e.target.value)}
                        placeholder="Kendinizden bahsedin..."
                        rows={2}
                        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none ${isDarkMode ? 'bg-slate-950 border-rose-500/30 text-white' : 'bg-rose-50 border-rose-200 text-slate-900'}`}
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="w-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-rose-500/25 hover:opacity-95 transition mt-2">
                  {authMode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
                </button>

                <div className="flex items-center justify-between mt-4">
                  <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-xs text-rose-500 hover:underline font-semibold">
                    {authMode === 'login' ? 'Hesabınız yok mu? Kayıt olun.' : 'Zaten hesabınız var mı? Giriş yapın.'}
                  </button>
                  <button type="button" onClick={() => setShowAuthModal(false)} className="text-xs text-slate-400 hover:text-slate-200 underline">
                    İptal / Vazgeç
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className={`border rounded-3xl p-6 max-w-sm w-full text-center space-y-4 ${isDarkMode ? 'bg-slate-900 border-rose-500/40 text-white' : 'bg-white border-rose-300 text-slate-900'}`}>
            <h3 className="text-lg font-bold">Sohbet Puanı Ver</h3>
            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRatingValue(star)} className="p-1">
                  <Star className={`w-8 h-8 ${star <= ratingValue ? 'text-rose-500 fill-rose-500' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              ))}
            </div>
            <button onClick={() => { setShowRatingModal(false); alert('Değerlendirmeniz kaydedildi!'); }} className="w-full bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold py-3 rounded-2xl text-sm shadow-md">
              Kaydet ve Gönder
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className={`border rounded-3xl p-6 max-w-md w-full space-y-4 ${isDarkMode ? 'bg-slate-900 border-red-500/40 text-white' : 'bg-white border-red-300 text-slate-900'}`}>
            <h3 className="text-lg font-bold text-red-500">Rapor Et ve Engelle</h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Rapor Sebebi</label>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)} className={`w-full border rounded-2xl p-3 text-sm ${isDarkMode ? 'bg-slate-950 border-red-500/30 text-white' : 'bg-rose-50 border-red-200 text-slate-900'}`}>
                <option value="Yetersiz / Sahte Profil">Sahte veya Yetersiz Profil</option>
                <option value="Kötü Niyetli Dil">Kötü Niyetli Dil</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setShowReportModal(false)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-2xl text-sm font-semibold">Vazgeç</button>
              <button onClick={submitReport} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-2xl text-sm shadow-md">Rapor Et</button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Confetti & Glowing Particles Animation (Framer Motion) */}
      <AnimatePresence>
        {celebrationData?.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-md"
          >
            <div className="absolute inset-0">
              {[...Array(40)].map((_, i) => {
                const randomX = (Math.random() - 0.5) * window.innerWidth * 1.3;
                const randomY = (Math.random() - 0.5) * window.innerHeight * 1.3;
                const size = Math.random() * 14 + 6;
                const duration = Math.random() * 2 + 1;
                const delay = Math.random() * 0.3;
                const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#fb7185', '#ffffff', '#e11d48'];
                const color = colors[i % colors.length];

                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ 
                      x: randomX, 
                      y: randomY, 
                      scale: [0, 1.6, 1], 
                      opacity: [1, 1, 0],
                      rotate: Math.random() * 360 
                    }}
                    transition={{ duration, delay, ease: "easeOut" }}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: size,
                      height: size,
                      backgroundColor: color,
                      borderRadius: i % 2 === 0 ? '50%' : '25%',
                      boxShadow: `0 0 20px ${color}`
                    }}
                  />
                );
              })}
            </div>

            <motion.div
              initial={{ scale: 0.4, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-r from-rose-950/95 via-slate-900/98 to-amber-950/95 border-2 border-rose-500 p-8 rounded-3xl shadow-2xl shadow-rose-500/60 text-center max-w-sm mx-4 pointer-events-auto"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-rose-500/50 animate-bounce">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent mb-2">
                Kutlama! 🎉
              </h3>
              <p className="text-white text-sm sm:text-base font-semibold">
                {celebrationData.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
