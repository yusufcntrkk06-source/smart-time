// ========== UTILITY FUNCTIONS ==========

class Utils {
    constructor() {
        this.debugMode = true;
        this.currentTheme = 'blue';
        this.currentLanguage = 'tr';
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
        
        console.log('Tema değiştirildi:', themeName);
        return true;
    }

    // Tema yükle
    loadTheme() {
        const savedTheme = this.getItem('theme') || 'blue';
        this.changeTheme(savedTheme);
        return savedTheme;
    }

    // Dil desteği (basit)
    changeLanguage(lang) {
        this.currentLanguage = lang;
        this.setItem('language', lang);
        
        // Basit dil değişimi
        if (lang === 'en') {
            // İngilizce metinleri güncelle
            document.querySelectorAll('[data-translate]').forEach(el => {
                const key = el.dataset.translate;
                const translations = {
                    'ana.sayfa': 'Dashboard',
                    'takvim': 'Calendar',
                    'istatistikler': 'Statistics',
                    'ilgi.alanları': 'Interests',
                    'ayarlar': 'Settings',
                    'yardım': 'Help',
                    'çıkış.yap': 'Logout'
                };
                if (translations[key]) {
                    el.textContent = translations[key];
                }
            });
        } else {
            // Türkçe'ye dön
            document.querySelectorAll('[data-translate]').forEach(el => {
                const key = el.dataset.translate;
                const translations = {
                    'ana.sayfa': 'Ana Sayfa',
                    'takvim': 'Takvim',
                    'istatistikler': 'İstatistikler',
                    'ilgi.alanları': 'İlgi Alanları',
                    'ayarlar': 'Ayarlar',
                    'yardım': 'Yardım',
                    'çıkış.yap': 'Çıkış Yap'
                };
                if (translations[key]) {
                    el.textContent = translations[key];
                }
            });
        }
        
        return true;
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
            return `${minutes} dakika`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 
                ? `${hours} saat ${remainingMinutes} dakika`
                : `${hours} saat`;
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
            'ders': '#4361ee',
            'spor': '#4ade80',
            'yemek': '#f59e0b',
            'yazılım': '#8b5cf6',
            'oyun': '#ec4899',
            'kitap': '#06b6d4',
            'sanat': '#f97316',
            'dinlenme': '#64748b'
        };
        return colors[category] || '#4361ee';
    }

    isToday(date) {
        const today = new Date();
        const compareDate = new Date(date);
        return today.toDateString() === compareDate.toDateString();
    }

    isPast(date) {
        const now = new Date();
        const compareDate = new Date(date);
        return compareDate < now;
    }

    isFuture(date) {
        const now = new Date();
        const compareDate = new Date(date);
        return compareDate > now;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            border-left: 4px solid ${this.getToastColor(type)};
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease;
        `;

        const icon = document.createElement('i');
        icon.className = this.getToastIcon(type);
        icon.style.color = this.getToastColor(type);

        const messageEl = document.createElement('span');
        messageEl.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--gray-500);
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            line-height: 1;
        `;
        closeBtn.onclick = () => toast.remove();

        toast.appendChild(icon);
        toast.appendChild(messageEl);
        toast.appendChild(closeBtn);
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-info-circle';
    }

    getToastColor(type) {
        const colors = {
            'success': '#4ade80',
            'error': '#f87171',
            'warning': '#fbbf24',
            'info': '#4361ee'
        };
        return colors[type] || '#4361ee';
    }

    showLoading(container = document.body) {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9998;
        `;

        const spinner = document.createElement('div');
        spinner.className = 'spinner spinner-large';
        loading.appendChild(spinner);

        container.appendChild(loading);
        return loading;
    }

    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }

    navigateTo(url) {
        window.location.href = url;
    }

    goBack() {
        window.history.back();
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });

        return data;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    getRandomColor() {
        const colors = [
            '#4361ee', '#4cc9f0', '#7209b7', '#4ade80',
            '#fbbf24', '#f87171', '#8b5cf6', '#06b6d4',
            '#f97316', '#ec4899', '#64748b', '#22c55e'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Global instance oluştur
window.utils = new Utils();