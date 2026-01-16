// ========== USER DATA STRUCTURES ==========

// Kullanıcı veri şeması
const UserSchema = {
    id: 'string',            // Benzersiz kullanıcı ID'si
    name: 'string',          // Kullanıcı adı
    email: 'string',         // E-posta adresi
    password: 'string',      // Şifre (şifrelenmiş olmalı, demo için düz metin)
    avatar: 'string',        // Avatar harfi (örn: "A", "M")
    interests: 'array',      // İlgi alanları listesi
    createdAt: 'date',       // Hesap oluşturulma tarihi
    updatedAt: 'date',       // Son güncelleme tarihi
    settings: 'object',      // Kullanıcı ayarları
    isDemo: 'boolean',       // Demo kullanıcı mı?
    provider: 'string'       // Giriş sağlayıcı (email, google, apple, microsoft)
};

// Plan veri şeması
const PlanSchema = {
    id: 'string',            // Benzersiz plan ID'si
    userId: 'string',        // Kullanıcı ID'si
    title: 'string',         // Plan başlığı
    category: 'string',      // Kategori (ders, spor, yemek, vs.)
    description: 'string',   // Açıklama (opsiyonel)
    start: 'date',           // Başlangıç tarihi ve saati
    end: 'date',             // Bitiş tarihi ve saati
    completed: 'boolean',    // Tamamlandı mı?
    createdAt: 'date',       // Oluşturulma tarihi
    updatedAt: 'date'        // Son güncelleme tarihi
};

// Rutin veri şeması (Haftalık tekrarlanan planlar)
const RoutineSchema = {
    id: 'string',            // Benzersiz rutin ID'si
    userId: 'string',        // Kullanıcı ID'si
    title: 'string',         // Rutin başlığı
    category: 'string',      // Kategori
    description: 'string',   // Açıklama
    dayOfWeek: 'number',     // Haftanın günü (0: Pazar, 1: Pazartesi, ...)
    startTime: 'string',     // Başlangıç saati (HH:MM formatında)
    duration: 'number',      // Süre (dakika)
    active: 'boolean',       // Aktif mi?
    createdAt: 'date'        // Oluşturulma tarihi
};

// İstatistik veri şeması
const StatisticsSchema = {
    userId: 'string',        // Kullanıcı ID'si
    date: 'date',            // İstatistik tarihi
    totalPlans: 'number',    // Toplam plan sayısı
    completedPlans: 'number', // Tamamlanan plan sayısı
    totalDuration: 'number', // Toplam süre (dakika)
    categoryBreakdown: 'object', // Kategoriye göre dağılım
    weeklyStats: 'object',   // Haftalık istatistikler
    monthlyStats: 'object'   // Aylık istatistikler
};

// Kategori tanımları
const Categories = [
    {
        id: 'ders',
        name: 'Ders',
        icon: 'fas fa-graduation-cap',
        color: '#4361ee',
        description: 'Ders çalışma ve öğrenme aktiviteleri'
    },
    {
        id: 'spor',
        name: 'Spor',
        icon: 'fas fa-dumbbell',
        color: '#4ade80',
        description: 'Spor ve fitness aktiviteleri'
    },
    {
        id: 'yemek',
        name: 'Yemek',
        icon: 'fas fa-utensils',
        color: '#f59e0b',
        description: 'Yemek hazırlama ve yeme saatleri'
    },
    {
        id: 'yazılım',
        name: 'Yazılım',
        icon: 'fas fa-code',
        color: '#8b5cf6',
        description: 'Kod yazma ve yazılım geliştirme'
    },
    {
        id: 'oyun',
        name: 'Oyun',
        icon: 'fas fa-gamepad',
        color: '#ec4899',
        description: 'Oyun oynama ve eğlence'
    },
    {
        id: 'kitap',
        name: 'Kitap',
        icon: 'fas fa-book',
        color: '#06b6d4',
        description: 'Kitap okuma aktiviteleri'
    },
    {
        id: 'sanat',
        name: 'Sanat',
        icon: 'fas fa-palette',
        color: '#f97316',
        description: 'Sanatsal ve kreatif aktiviteler'
    },
    {
        id: 'dinlenme',
        name: 'Dinlenme',
        icon: 'fas fa-couch',
        color: '#64748b',
        description: 'Dinlenme ve rahatlama zamanları'
    }
];

// Varsayılan kullanıcı ayarları
const DefaultUserSettings = {
    theme: 'light', // 'light' veya 'dark'
    language: 'tr',
    notifications: {
        email: true,
        push: true,
        reminders: true,
        dailySummary: true
    },
    timeFormat: '24', // '12' veya '24'
    weekStart: 'monday', // 'monday' veya 'sunday'
    autoSync: true,
    privacy: {
        shareStatistics: false,
        showOnlineStatus: true
    }
};

// Demo verileri (ilk çalıştırma için)
const DemoData = {
    users: [
        {
            id: 'demo-user-123',
            name: 'Demo Kullanıcı',
            email: 'demo@smarttime.com',
            password: 'demo123',
            avatar: 'D',
            interests: ['ders', 'spor', 'yemek', 'yazılım', 'dinlenme'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: DefaultUserSettings,
            isDemo: true,
            provider: 'email'
        }
    ],
    plans: [
        {
            id: 'plan-1',
            userId: 'demo-user-123',
            title: 'Matematik Çalışması',
            category: 'ders',
            description: 'Limit ve türev konularını tekrar et',
            start: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
            completed: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'plan-2',
            userId: 'demo-user-123',
            title: 'Spor Salonu',
            category: 'spor',
            description: 'Kardio ve ağırlık antrenmanı',
            start: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'plan-3',
            userId: 'demo-user-123',
            title: 'Öğle Yemeği',
            category: 'yemek',
            description: 'Sağlıklı öğle yemeği hazırla',
            start: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'plan-4',
            userId: 'demo-user-123',
            title: 'Web Projesi',
            category: 'yazılım',
            description: 'SmartTime projesini geliştir',
            start: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'plan-5',
            userId: 'demo-user-123',
            title: 'Kitap Okuma',
            category: 'kitap',
            description: 'Bilim kurgu romanı oku',
            start: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    routines: [
        {
            id: 'routine-1',
            userId: 'demo-user-123',
            title: 'Sabah Sporu',
            category: 'spor',
            description: 'Her sabah 30 dakika spor',
            dayOfWeek: 1, // Pazartesi
            startTime: '07:00',
            duration: 30,
            active: true,
            createdAt: new Date().toISOString()
        }
    ]
};

// Veri yönetimi fonksiyonları
const DataManager = {
    // Demo verilerini yükle (ilk çalıştırmada)
    loadDemoData() {
        // Kullanıcılar
        const existingUsers = JSON.parse(localStorage.getItem('smarttime_users') || '[]');
        if (existingUsers.length === 0) {
            localStorage.setItem('smarttime_users', JSON.stringify(DemoData.users));
        }
        
        // Demo kullanıcı planları
        const existingPlans = JSON.parse(localStorage.getItem('smarttime_plans_demo-user-123') || '[]');
        if (existingPlans.length === 0) {
            localStorage.setItem('smarttime_plans_demo-user-123', JSON.stringify(DemoData.plans));
        }
        
        // Rutinler
        const existingRoutines = JSON.parse(localStorage.getItem('smarttime_routines_demo-user-123') || '[]');
        if (existingRoutines.length === 0) {
            localStorage.setItem('smarttime_routines_demo-user-123', JSON.stringify(DemoData.routines));
        }
        
        console.log('[SmartTime] Demo veriler yüklendi');
    },
    
    // Kullanıcı verilerini temizle
    clearUserData(userId) {
        const keys = [
            `smarttime_plans_${userId}`,
            `smarttime_routines_${userId}`,
            `smarttime_statistics_${userId}`,
            `smarttime_settings_${userId}`
        ];
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log(`[SmartTime] ${userId} kullanıcısının verileri temizlendi`);
    },
    
    // Tüm verileri temizle
    clearAllData() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('smarttime_'));
        keys.forEach(key => localStorage.removeItem(key));
        
        console.log('[SmartTime] Tüm veriler temizlendi');
    },
    
    // Veri yedekleme
    backupData(userId) {
        const backup = {
            timestamp: new Date().toISOString(),
            userId: userId,
            plans: JSON.parse(localStorage.getItem(`smarttime_plans_${userId}`) || '[]'),
            routines: JSON.parse(localStorage.getItem(`smarttime_routines_${userId}`) || '[]'),
            settings: JSON.parse(localStorage.getItem(`smarttime_settings_${userId}`) || '{}')
        };
        
        return backup;
    },
    
    // Veri geri yükleme
    restoreData(userId, backup) {
        if (backup.userId !== userId) {
            console.error('[SmartTime] Kullanıcı ID eşleşmiyor');
            return false;
        }
        
        localStorage.setItem(`smarttime_plans_${userId}`, JSON.stringify(backup.plans));
        localStorage.setItem(`smarttime_routines_${userId}`, JSON.stringify(backup.routines));
        localStorage.setItem(`smarttime_settings_${userId}`, JSON.stringify(backup.settings));
        
        console.log('[SmartTime] Veriler geri yüklendi');
        return true;
    },
    
    // Veri istatistikleri
    getDataStats(userId) {
        const plans = JSON.parse(localStorage.getItem(`smarttime_plans_${userId}`) || '[]');
        const routines = JSON.parse(localStorage.getItem(`smarttime_routines_${userId}`) || '[]');
        
        return {
            totalPlans: plans.length,
            totalRoutines: routines.length,
            completedPlans: plans.filter(p => p.completed).length,
            upcomingPlans: plans.filter(p => !p.completed && new Date(p.start) > new Date()).length,
            totalCategories: [...new Set(plans.map(p => p.category))].length
        };
    }
};

// Global olarak kullanılabilir yap
window.DataManager = DataManager;
window.Categories = Categories;
window.DefaultUserSettings = DefaultUserSettings;

// Uygulama başladığında demo verileri yükle
document.addEventListener('DOMContentLoaded', () => {
    DataManager.loadDemoData();
});