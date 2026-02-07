// ========== UTILITY FUNCTIONS ==========

class Utils {
    constructor() {
        this.debugMode = true;
        this.currentTheme = 'blue';
        this.currentLanguage = 'tr';
        
        // Dil çevirileri
        this.translations = {
            tr: {
                // Genel
                'app.name': 'SmartTime',
                'dashboard': 'Ana Sayfa',
                'calendar': 'Takvim',
                'statistics': 'İstatistikler',
                'interests': 'İlgi Alanları',
                'settings': 'Ayarlar',
                'help': 'Yardım',
                'logout': 'Çıkış Yap',
                'save': 'Kaydet',
                'cancel': 'İptal',
                'add': 'Ekle',
                'edit': 'Düzenle',
                'delete': 'Sil',
                'loading': 'Yükleniyor...',
                'today': 'Bugün',
                'tomorrow': 'Yarın',
                'yesterday': 'Dün',
                
                // Dashboard
                'add.plan': 'Yeni Plan Ekle',
                'today.plans': 'Bugünün Planları',
                'upcoming.plans': 'Yaklaşan Planlar',
                'recent.activities': 'Son Aktiviteler',
                'smart.suggestions': 'Akıllı Öneriler',
                'no.plans': 'Planınız Yok',
                'add.first.plan': 'İlk Planınızı Ekleyin',
                'total.plans': 'Toplam Plan',
                'completed': 'Tamamlanan',
                'pending': 'Bekleyen',
                'total.duration': 'Toplam Süre',
                
                // Auth
                'login': 'Giriş Yap',
                'register': 'Kayıt Ol',
                'email': 'E-posta',
                'password': 'Şifre',
                'remember.me': 'Beni hatırla',
                'forgot.password': 'Şifremi unuttum?',
                'no.account': 'Hesabınız yok mu?',
                'has.account': 'Zaten hesabınız var mı?',
                'name': 'Ad Soyad',
                'confirm.password': 'Şifreyi Onayla',
                'terms': 'Kullanım koşullarını kabul ediyorum',
                
                // Settings
                'theme': 'Tema',
                'language': 'Dil',
                'time.format': 'Saat Formatı',
                'week.start': 'Haftanın İlk Günü',
                'notifications': 'Bildirimler',
                'plan.reminders': 'Plan Hatırlatmaları',
                'daily.summary': 'Günlük Özet',
                'email.notifications': 'E-posta Bildirimleri',
                'data.management': 'Veri Yönetimi',
                'export.data': 'Verileri Dışa Aktar',
                'import.data': 'Verileri İçe Aktar',
                'clear.data': 'Verileri Temizle',
                'about': 'Hakkında',
                'privacy.policy': 'Gizlilik Politikası',
                'terms.conditions': 'Kullanım Koşulları',
                
                // Plan Modal
                'plan.title': 'Plan Başlığı',
                'category': 'Kategori',
                'date': 'Tarih',
                'start.time': 'Başlangıç Saati',
                'end.time': 'Bitiş Saati',
                'description': 'Açıklama',
                'optional': 'Opsiyonel',
                
                // Categories
                'category.ders': 'Ders',
                'category.spor': 'Spor',
                'category.yemek': 'Yemek',
                'category.yazılım': 'Yazılım',
                'category.oyun': 'Oyun',
                'category.kitap': 'Kitap',
                'category.sanat': 'Sanat',
                'category.dinlenme': 'Dinlenme',
                
                // Messages
                'welcome': 'Hoş Geldiniz',
                'good.morning': 'Günaydın',
                'good.afternoon': 'İyi günler',
                'good.evening': 'İyi akşamlar',
                'saved.successfully': 'Başarıyla kaydedildi',
                'deleted.successfully': 'Başarıyla silindi',
                'updated.successfully': 'Başarıyla güncellendi',
                'error.occurred': 'Bir hata oluştu',
                'are.you.sure': 'Emin misiniz?',
                'yes': 'Evet',
                'no': 'Hayır'
            },
            
            en: {
                // General
                'app.name': 'SmartTime',
                'dashboard': 'Dashboard',
                'calendar': 'Calendar',
                'statistics': 'Statistics',
                'interests': 'Interests',
                'settings': 'Settings',
                'help': 'Help',
                'logout': 'Logout',
                'save': 'Save',
                'cancel': 'Cancel',
                'add': 'Add',
                'edit': 'Edit',
                'delete': 'Delete',
                'loading': 'Loading...',
                'today': 'Today',
                'tomorrow': 'Tomorrow',
                'yesterday': 'Yesterday',
                
                // Dashboard
                'add.plan': 'Add New Plan',
                'today.plans': "Today's Plans",
                'upcoming.plans': 'Upcoming Plans',
                'recent.activities': 'Recent Activities',
                'smart.suggestions': 'Smart Suggestions',
                'no.plans': 'No Plans',
                'add.first.plan': 'Add Your First Plan',
                'total.plans': 'Total Plans',
                'completed': 'Completed',
                'pending': 'Pending',
                'total.duration': 'Total Duration',
                
                // Auth
                'login': 'Login',
                'register': 'Register',
                'email': 'Email',
                'password': 'Password',
                'remember.me': 'Remember me',
                'forgot.password': 'Forgot password?',
                'no.account': "Don't have an account?",
                'has.account': 'Already have an account?',
                'name': 'Full Name',
                'confirm.password': 'Confirm Password',
                'terms': 'I accept the terms and conditions',
                
                // Settings
                'theme': 'Theme',
                'language': 'Language',
                'time.format': 'Time Format',
                'week.start': 'Week Start Day',
                'notifications': 'Notifications',
                'plan.reminders': 'Plan Reminders',
                'daily.summary': 'Daily Summary',
                'email.notifications': 'Email Notifications',
                'data.management': 'Data Management',
                'export.data': 'Export Data',
                'import.data': 'Import Data',
                'clear.data': 'Clear Data',
                'about': 'About',
                'privacy.policy': 'Privacy Policy',
                'terms.conditions': 'Terms and Conditions',
                
                // Plan Modal
                'plan.title': 'Plan Title',
                'category': 'Category',
                'date': 'Date',
                'start.time': 'Start Time',
                'end.time': 'End Time',
                'description': 'Description',
                'optional': 'Optional',
                
                // Categories
                'category.ders': 'Study',
                'category.spor': 'Sports',
                'category.yemek': 'Food',
                'category.yazılım': 'Software',
                'category.oyun': 'Game',
                'category.kitap': 'Book',
                'category.sanat': 'Art',
                'category.dinlenme': 'Rest',
                
                // Messages
                'welcome': 'Welcome',
                'good.morning': 'Good Morning',
                'good.afternoon': 'Good Afternoon',
                'good.evening': 'Good Evening',
                'saved.successfully': 'Saved successfully',
                'deleted.successfully': 'Deleted successfully',
                'updated.successfully': 'Updated successfully',
                'error.occurred': 'An error occurred',
                'are.you.sure': 'Are you sure?',
                'yes': 'Yes',
                'no': 'No'
            }
        };
        
        // Temalar
        this.themes = {
            blue: {
                name: 'Mavi Tema',
                primary: '#4361ee',
                secondary: '#4cc9f0',
                accent: '#7209b7',
                background: '#f8f9fa',
                card: '#ffffff',
                text: '#212529'
            },
            red: {
                name: 'Kırmızı Tema',
                primary: '#e63946',
                secondary: '#ff686b',
                accent: '#ff5d8f',
                background: '#fff5f5',
                card: '#ffffff',
                text: '#2d0001'
            },
            neon: {
                name: 'Neon Tema',
                primary: '#8a2be2',
                secondary: '#00ffff',
                accent: '#ff00ff',
                background: '#0a0a0a',
                card: '#1a1a1a',
                text: '#ffffff'
            }
        };
    }

    // Dil değiştirme (TAM ÇALIŞAN)
    changeLanguage(lang) {
        if (!this.translations[lang]) {
            console.error('Dil bulunamadı:', lang);
            return false;
        }
        
        this.currentLanguage = lang;
        this.setItem('language', lang);
        
        // Tüm sayfadaki metinleri güncelle
        this.updatePageTexts();
        
        // Kullanıcı ayarlarını güncelle
        const user = this.getItem('current_user');
        if (user) {
            user.settings = user.settings || {};
            user.settings.language = lang;
            this.setItem('current_user', user);
            
            // Users listesini de güncelle
            const users = this.getItem('users') || [];
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex].settings = user.settings;
                this.setItem('users', users);
            }
        }
        
        console.log('Dil değiştirildi:', lang);
        return true;
    }

    // Sayfa metinlerini güncelle
    updatePageTexts() {
        const lang = this.currentLanguage;
        const t = this.translations[lang];
        
        if (!t) return;
        
        // Dashboard sayfası metinleri
        this.updateElementText('add-plan-btn', t['add.plan']);
        this.updateElementText('today-plans-title', t['today.plans']);
        this.updateElementText('upcoming-plans-title', t['upcoming.plans']);
        this.updateElementText('recent-activities-title', t['recent.activities']);
        this.updateElementText('smart-suggestions-title', t['smart.suggestions']);
        
        // Sidebar metinleri
        this.updateElementText('nav-dashboard', t['dashboard']);
        this.updateElementText('nav-calendar', t['calendar']);
        this.updateElementText('nav-statistics', t['statistics']);
        this.updateElementText('nav-interests', t['interests']);
        this.updateElementText('nav-settings', t['settings']);
        this.updateElementText('nav-help', t['help']);
        this.updateElementText('nav-logout', t['logout']);
        
        // Modal metinleri
        this.updateElementText('modal-title-add', t['add.plan']);
        this.updateElementText('plan-title-label', t['plan.title']);
        this.updateElementText('plan-category-label', t['category']);
        this.updateElementText('plan-date-label', t['date']);
        this.updateElementText('plan-start-label', t['start.time']);
        this.updateElementText('plan-end-label', t['end.time']);
        this.updateElementText('plan-desc-label', t['description'] + ' (' + t['optional'] + ')');
        
        // Settings sayfası metinleri
        this.updateElementText('settings-title', t['settings']);
        this.updateElementText('theme-label', t['theme']);
        this.updateElementText('language-label', t['language']);
        this.updateElementText('time-format-label', t['time.format']);
        this.updateElementText('week-start-label', t['week.start']);
        this.updateElementText('notifications-title', t['notifications']);
        this.updateElementText('reminders-label', t['plan.reminders']);
        this.updateElementText('daily-summary-label', t['daily.summary']);
        this.updateElementText('email-notifications-label', t['email.notifications']);
        this.updateElementText('data-management-title', t['data.management']);
        this.updateElementText('export-data-btn', t['export.data']);
        this.updateElementText('import-data-btn', t['import.data']);
        this.updateElementText('clear-data-btn', t['clear.data']);
        this.updateElementText('about-title', t['about']);
        
        // Toast mesajlarını da güncelle
        this.showToast(`${lang === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English'}`, 'success');
    }

    // Element metnini güncelle
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // Çeviri alma fonksiyonu
    t(key) {
        const lang = this.currentLanguage;
        return this.translations[lang]?.[key] || key;
    }

    // Tema değiştirme
    changeTheme(themeName) {
        if (!this.themes[themeName]) {
            console.error('Tema bulunamadı:', themeName);
            return false;
        }
        
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        
        // CSS değişkenlerini güncelle
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--secondary', theme.secondary);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--light', theme.background);
        root.style.setProperty('--dark', theme.text);
        
        // Body class'ını güncelle
        document.body.className = '';
        document.body.classList.add(`theme-${themeName}`);
        document.body.style.backgroundColor = theme.background;
        document.body.style.color = theme.text;
        
        // LocalStorage'a kaydet
        this.setItem('theme', themeName);
        
        // Kullanıcı ayarlarını güncelle
        const user = this.getItem('current_user');
        if (user) {
            user.settings = user.settings || {};
            user.settings.theme = themeName;
            this.setItem('current_user', user);
            
            // Users listesini de güncelle
            const users = this.getItem('users') || [];
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex].settings = user.settings;
                this.setItem('users', users);
            }
        }
        
        console.log('Tema değiştirildi:', themeName);
        this.showToast(`${theme.name} aktif edildi`, 'success');
        return true;
    }

    // Tema yükle
    loadTheme() {
        const savedTheme = this.getItem('theme') || 'blue';
        this.changeTheme(savedTheme);
        return savedTheme;
    }

    // Tercihleri yükle
    loadPreferences() {
        this.loadTheme();
        
        const savedLang = this.getItem('language') || 'tr';
        this.changeLanguage(savedLang);
        
        console.log('Tercihler yüklendi:', {
            theme: this.currentTheme,
            language: this.currentLanguage
        });
    }

    // Kalan orijinal fonksiyonlar (değişmeden kalacak)
    log(message, data = null) {
        if (this.debugMode) {
            if (data) {
                console.log(`[SmartTime] ${message}:`, data);
            } else {
                console.log(`[SmartTime] ${message}`);
            }
        }
    }

    logError(message, error = null) {
        console.error(`[SmartTime Error] ${message}`, error);
    }

    setItem(key, value) {
        try {
            localStorage.setItem(`smarttime_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            this.logError('LocalStorage kayıt hatası', error);
            return false;
        }
    }

    getItem(key) {
        try {
            const item = localStorage.getItem(`smarttime_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            this.logError('LocalStorage okuma hatası', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(`smarttime_${key}`);
            return true;
        } catch (error) {
            this.logError('LocalStorage silme hatası', error);
            return false;
        }
    }

    clearUserData() {
        const keysToKeep = ['debug_mode', 'language', 'theme'];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('smarttime_') && !keysToKeep.includes(key.replace('smarttime_', ''))) {
                localStorage.removeItem(key);
            }
        });
    }

    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } else if (format === 'long') {
            return d.toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } else if (format === 'time') {
            return d.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (format === 'datetime') {
            return d.toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return d.toISOString();
    }

    formatTimeRange(start, end) {
        const startTime = this.formatDate(start, 'time');
        const endTime = this.formatDate(end, 'time');
        return `${startTime} - ${endTime}`;
    }

    calculateDuration(start, end) {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return Math.round((endTime - startTime) / (1000 * 60));
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} ${this.currentLanguage === 'tr' ? 'dakika' : 'minutes'}`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (this.currentLanguage === 'tr') {
                return remainingMinutes > 0 
                    ? `${hours} saat ${remainingMinutes} dakika`
                    : `${hours} saat`;
            } else {
                return remainingMinutes > 0 
                    ? `${hours} hours ${remainingMinutes} minutes`
                    : `${hours} hours`;
            }
        }
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getCategoryIcon(category) {
        const icons = {
            'ders': 'fas fa-graduation-cap',
            'spor': 'fas fa-dumbbell',
            'yemek': 'fas fa-utensils',
            'yazılım': 'fas fa-code',
            'oyun': 'fas fa-gamepad',
            'kitap': 'fas fa-book',
            'sanat': 'fas fa-palette',
            'dinlenme': 'fas fa-couch'
        };
        return icons[category] || 'fas fa-calendar';
    }

    getCategoryColor(category) {
        const colors = {
 