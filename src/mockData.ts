import { User, GroupEvent } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u_admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    gender: 'other',
    age: 28,
    bio: 'Platform Yöneticisi ve Sistem Sorumlusu.',
    interests: ['Yönetim', 'Güvenlik', 'Sistem'],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    photoRevealed: true,
    harmonyScore: 100,
    createdAt: Date.now() - 864000000
  },
  {
    id: 'u_1',
    username: 'Melis_Rose',
    password: '123',
    role: 'user',
    gender: 'female',
    age: 24,
    bio: 'Akustik müzik, şiir ve gece kahveleri. Yüzeysel sohbetlerden hoşlanmam, ruh eşimi arıyorum.',
    interests: ['Akustik', 'Şiir', 'Kahve', 'Sanat', 'Felsefe'],
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    photoRevealed: false,
    harmonyScore: 88,
    createdAt: Date.now() - 500000000
  },
  {
    id: 'u_2',
    username: 'Kerem_Gold',
    password: '123',
    role: 'user',
    gender: 'male',
    age: 27,
    bio: 'Bağımsız sinema yönetmeni adayı ve gitarist. Derin edebi tartışmalar ve uzun sohbetler favorim.',
    interests: ['Sinema', 'Gitar', 'Edebiyat', 'Lo-Fi', 'Seyahat'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    photoRevealed: false,
    harmonyScore: 92,
    createdAt: Date.now() - 400000000
  },
  {
    id: 'u_3',
    username: 'Deniz_Stellar',
    password: '123',
    role: 'user',
    gender: 'female',
    age: 23,
    bio: 'Dijital illüstratör ve astronomi tutkunu. Uzayın derinlikleri üzerine sabaha kadar konuşabiliriz.',
    interests: ['İllüstrasyon', 'Astronomi', 'Caz', 'Psikoloji', 'Yıldızlar'],
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    photoRevealed: false,
    harmonyScore: 85,
    createdAt: Date.now() - 300000000
  }
];

export const INITIAL_GROUP_EVENTS: GroupEvent[] = [
  {
    id: 'g_1',
    title: 'Rose Gold Akustik Müzik ve Sohbet',
    description: 'En sevdiğiniz YouTube müziklerini paylaşıp aksettirdiğimiz sıcak bir date odası.',
    hostId: 'u_1',
    hostName: 'Melis_Rose',
    category: 'Music Vibe',
    participants: ['Melis_Rose', 'Kerem_Gold'],
    pendingParticipants: [],
    maxParticipants: 8,
    audience: 'karma',
    requiresApproval: true,
    isLive: true,
    createdAt: Date.now() - 3600000,
    messages: [
      { id: 'gm_1', sender: 'Melis_Rose', text: 'Herkese merhaba! Oda müziği akışımız başlamıştır.', time: '12:00' }
    ]
  }
];
