// ========== UTILITY FUNCTIONS ==========

class Utils {
    constructor() {
        this.debugMode = true;
    }

    // Log fonksiyonu (debug mod açıkken çalışır)
    log(message, data = null) {
        if (this.debugMode) {
            if (data) {
                console.log(`[SmartTime] ${message}:`, data);
            } else {
                console.log(`[SmartTime] ${message}`);
            }
        }
    }

    // Error log fonksiyonu
    logError(message, error = null) {
        console.error(`[SmartTime Error] ${message}`, error);
    }

    // LocalStorage yardımcı fonksiyonları
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

    // Kullanıcı verilerini temizle
    clearUserData() {
        const keysToKeep = ['debug_mode', 'language'];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('smarttime_') && !keysToKeep.includes(key.replace('smarttime_', ''))) {
                localStorage.removeItem(key);
            }
        });
    }

    // Tarih formatlama
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

    // Zaman dilimi formatlama
    formatTimeRange(start, end) {
        const startTime = this.formatDate(start, 'time');
        const endTime = this.formatDate(end, 'time');
        return `${startTime} - ${endTime}`;
    }

    // Süre hesaplama (dakika)
    calculateDuration(start, end) {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return Math.round((endTime - startTime) / (1000 * 60));
    }

    // Süreyi okunabilir formata çevirme
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

    // UUID oluşturma
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Kategori ikonu getirme
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

    // Kategori rengi getirme
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

    // Tarih karşılaştırma (bugün mü?)
    isToday(date) {
        const today = new Date();
        const compareDate = new Date(date);
        return today.toDateString() === compareDate.toDateString();
    }

    // Geçmiş tarih kontrolü
    isPast(date) {
        const now = new Date();
        const compareDate = new Date(date);
        return compareDate < now;
    }

    // Gelecek tarih kontrolü
    isFuture(date) {
        const now = new Date();
        const compareDate = new Date(date);
        return compareDate > now;
    }

    // Input validasyonu
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    // Modal göster/gizle
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

    // Toast mesajı göster
    showToast(message, type = 'info', duration = 3000) {
        // Toast container oluştur
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

        // Toast oluştur
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

        // Icon
        const icon = document.createElement('i');
        icon.className = this.getToastIcon(type);
        icon.style.color = this.getToastColor(type);

        // Message
        const messageEl = document.createElement('span');
        messageEl.textContent = message;

        // Close button
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

        // Otomatik kapanma
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);

        // Animasyonlar
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

    // Loading göster/gizle
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

    // Sayfa yönlendirme
    navigateTo(url) {
        window.location.href = url;
    }

    // Back butonu
    goBack() {
        window.history.back();
    }

    // Form verilerini al
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

    // Safe HTML (XSS koruması)
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Kısaltılmış metin
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Rastgele renk oluştur
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