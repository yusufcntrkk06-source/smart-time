// ========== SIMPLIFIED AUTHENTICATION ==========

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupEventListeners();
    }

    // Mevcut kullanıcıyı yükle
    loadCurrentUser() {
        this.currentUser = utils.getItem('current_user');
        
        if (this.currentUser) {
            console.log('[Auth] Kullanıcı oturumu bulundu:', this.currentUser.name);
            this.updateUIForLoggedInUser();
        } else {
            console.log('[Auth] Kullanıcı oturumu bulunamadı');
        }
        
        return this.currentUser;
    }

    // Event listener'ları kur
    setupEventListeners() {
        // Giriş formu
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleSimpleLogin(e));
        }

        // Kayıt formu
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleSimpleRegister(e));
        }

        // Sosyal giriş butonları (görsel amaçlı)
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Çıkış butonu
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Dropdown çıkış butonu
        const logoutDropdownBtn = document.getElementById('logout-dropdown-btn');
        if (logoutDropdownBtn) {
            logoutDropdownBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Şifremi unuttum (görsel amaçlı)
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Forgot password form submit
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword(e);
            });
        }
    }

    // BASİT GİRİŞ İŞLEMİ - Email validasyonu yok
    async handleSimpleLogin(e) {
        e.preventDefault();
        
        console.log('[Auth] Basit giriş işlemi başlatıldı');
        
        const formData = utils.getFormData('login-form');
        let { email, password, remember } = formData;

        // Email boşsa demo email kullan
        if (!email || email.trim() === '') {
            email = 'kullanici@smarttime.com';
        }
        
        // Şifre boşsa demo şifre kullan
        if (!password || password.trim() === '') {
            password = 'smarttime123';
        }

        // Loading göster
        const loading = utils.showLoading();

        try {
            // Demo kullanıcı kontrolü
            if (email === 'demo@smarttime.com' && password === 'demo123') {
                await this.loginWithDemoAccount();
            } else {
                // Herhangi bir email ile giriş yap
                await this.loginWithAnyEmail(email, password, remember === 'on');
            }
        } catch (error) {
            console.error('[Auth] Giriş hatası:', error);
            utils.showToast('Giriş sırasında bir hata oluştu', 'error');
        } finally {
            utils.hideLoading(loading);
        }
    }

    // BASİT KAYIT İŞLEMİ - Email validasyonu yok
    async handleSimpleRegister(e) {
        e.preventDefault();
        
        console.log('[Auth] Basit kayıt işlemi başlatıldı');
        
        const formData = utils.getFormData('register-form');
        let { name, email, password, confirm_password, terms } = formData;

        // İsim validasyonu
        if (!name || name.trim().length < 2) {
            utils.showToast('Adınız en az 2 karakter olmalıdır', 'error');
            return;
        }

        // Email boşsa rastgele email oluştur
        if (!email || email.trim() === '') {
            const randomNum = Math.floor(Math.random() * 1000);
            email = `kullanici${randomNum}@smarttime.com`;
        }

        // Şifre kontrolü
        if (!password || password.trim() === '') {
            password = 'smarttime123';
        }

        if (password !== confirm_password) {
            utils.showToast('Şifreler uyuşmuyor', 'error');
            return;
        }

        if (terms !== 'on') {
            utils.showToast('Kullanım koşullarını kabul etmelisiniz', 'error');
            return;
        }

        // Loading göster
        const loading = utils.showLoading();

        try {
            // Kullanıcıyı kaydet
            const users = utils.getItem('users') || [];
            
            // Yeni kullanıcı oluştur
            const newUser = {
                id: utils.generateUUID(),
                name: name.trim(),
                email: email.toLowerCase(),
                password: password,
                avatar: name.charAt(0).toUpperCase(),
                interests: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isDemo: false,
                settings: {
                    theme: 'light',
                    language: 'tr',
                    notifications: true,
                    timeFormat: '24'
                }
            };

            users.push(newUser);
            utils.setItem('users', users);

            // Giriş yap
            await this.loginUser(newUser, false);
            utils.showToast(`Hoş geldiniz ${name}!`, 'success');

        } catch (error) {
            console.error('[Auth] Kayıt hatası:', error);
            utils.showToast('Kayıt sırasında bir hata oluştu', 'error');
        } finally {
            utils.hideLoading(loading);
        }
    }

    // Herhangi bir email ile giriş
    async loginWithAnyEmail(email, password, remember) {
        console.log('[Auth] Email ile giriş yapılıyor:', email);
        
        const users = utils.getItem('users') || [];
        let user = users.find(u => u.email === email && u.password === password);
        
        // Kullanıcı yoksa yeni oluştur
        if (!user) {
            console.log('[Auth] Kullanıcı bulunamadı, yeni oluşturuluyor');
            
            user = {
                id: utils.generateUUID(),
                name: email.split('@')[0],
                email: email,
                password: password,
                avatar: email.charAt(0).toUpperCase(),
                interests: ['ders', 'spor', 'yemek'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isDemo: false,
                settings: {
                    theme: 'light',
                    language: 'tr',
                    notifications: true,
                    timeFormat: '24'
                }
            };
            
            users.push(user);
            utils.setItem('users', users);
        }
        
        await this.loginUser(user, remember);
    }

    // Demo hesap ile giriş
    async loginWithDemoAccount() {
        console.log('[Auth] Demo hesap ile giriş yapılıyor');
        
        const demoUser = {
            id: 'demo-user-123',
            name: 'Demo Kullanıcı',
            email: 'demo@smarttime.com',
            avatar: 'D',
            interests: ['ders', 'spor', 'yemek', 'yazılım', 'dinlenme'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDemo: true,
            settings: {
                theme: 'light',
                language: 'tr',
                notifications: true,
                timeFormat: '24'
            }
        };

        await this.loginUser(demoUser, false);
        utils.showToast('Demo hesabına giriş yapıldı', 'success');
    }

    // Sosyal giriş (görsel amaçlı)
    async handleSocialLogin(e) {
        e.preventDefault();
        
        const provider = e.currentTarget.dataset.provider || 'google';
        console.log('[Auth] Sosyal giriş:', provider);
        
        const loading = utils.showLoading();

        try {
            // Sosyal kullanıcı oluştur
            const socialUser = {
                id: `social-${provider}-${Date.now()}`,
                name: this.getSocialUserName(provider),
                email: `${provider}.user@smarttime.com`,
                avatar: provider.charAt(0).toUpperCase(),
                interests: ['ders', 'spor', 'yemek', 'yazılım'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isDemo: true,
                provider: provider,
                settings: {
                    theme: 'light',
                    language: 'tr',
                    notifications: true,
                    timeFormat: '24'
                }
            };

            await this.loginUser(socialUser, true);
            utils.showToast(`${this.getSocialProviderName(provider)} ile giriş başarılı`, 'success');

        } catch (error) {
            console.error('[Auth] Sosyal giriş hatası:', error);
            utils.showToast('Sosyal giriş sırasında bir hata oluştu', 'error');
        } finally {
            utils.hideLoading(loading);
        }
    }

    // Kullanıcıyı giriş yap
    async loginUser(user, remember) {
        console.log('[Auth] Kullanıcı giriş yapıyor:', user.name);
        
        // Kullanıcı verilerini kaydet
        this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            interests: user.interests || [],
            isDemo: user.isDemo || false,
            provider: user.provider,
            settings: user.settings || {
                theme: 'light',
                language: 'tr',
                notifications: true,
                timeFormat: '24'
            }
        };

        utils.setItem('current_user', this.currentUser);

        // Session/Local storage seçimi
        if (remember) {
            utils.setItem('remember_me', true);
        }

        // UI'ı güncelle
        this.updateUIForLoggedInUser();

        // Demo planları yükle (eğer yoksa)
        if (user.isDemo) {
            this.loadDemoPlans();
        }

        // İlgi alanları seçilmemişse ilgi alanları sayfasına yönlendir
        if (!user.interests || user.interests.length === 0) {
            console.log('[Auth] İlgi alanları seçilmemiş, yönlendiriliyor');
            setTimeout(() => {
                utils.navigateTo('interests.html');
            }, 1000);
        } else {
            // Ana sayfaya yönlendir
            console.log('[Auth] Dashboard\'a yönlendiriliyor');
            setTimeout(() => {
                utils.navigateTo('dashboard.html');
            }, 1000);
        }
    }

    // Çıkış işlemi
    async handleLogout(e) {
        if (e) e.preventDefault();

        const confirmed = confirm('Çıkış yapmak istediğinize emin misiniz?');
        if (!confirmed) return;

        console.log('[Auth] Çıkış yapılıyor');
        
        // Kullanıcı verilerini temizle
        this.currentUser = null;
        utils.removeItem('current_user');
        utils.removeItem('remember_me');

        // Ana sayfaya yönlendir
        utils.showToast('Başarıyla çıkış yapıldı', 'success');
        setTimeout(() => {
            utils.navigateTo('index.html');
        }, 1000);
    }

    // Şifremi unuttum (görsel amaçlı)
    async handleForgotPassword(e) {
        e.preventDefault();
        
        console.log('[Auth] Şifremi unuttum tıklandı');
        
        const emailInput = document.getElementById('forgot-email');
        let email = '';
        
        if (emailInput && emailInput.value) {
            email = emailInput.value;
        } else {
            email = 'kullanici@smarttime.com';
        }
        
        utils.showToast(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi (demo)`, 'info');
    }

    // UI'ı güncelle (giriş yapılmış kullanıcı için)
    updateUIForLoggedInUser() {
        if (!this.currentUser) return;

        console.log('[Auth] UI güncelleniyor:', this.currentUser.name);
        
        // Kullanıcı avatarını güncelle
        const avatarElements = document.querySelectorAll('.user-avatar, .avatar-initial');
        avatarElements.forEach(el => {
            if (el.classList.contains('user-avatar') || el.classList.contains('avatar-initial')) {
                el.textContent = this.currentUser.avatar;
            }
        });

        // Kullanıcı adını güncelle
        const nameElements = document.querySelectorAll('.user-name, .user-fullname');
        nameElements.forEach(el => {
            if (el.classList.contains('user-name') || el.classList.contains('user-fullname')) {
                el.textContent = this.currentUser.name;
            }
        });

        // Kullanıcı email'ini güncelle
        const emailElements = document.querySelectorAll('.user-email');
        emailElements.forEach(el => {
            if (el.classList.contains('user-email')) {
                el.textContent = this.currentUser.email;
            }
        });
    }

    // Demo planları yükle
    loadDemoPlans() {
        const existingPlans = utils.getItem(`plans_${this.currentUser.id}`);
        if (!existingPlans || existingPlans.length === 0) {
            console.log('[Auth] Demo planlar yükleniyor');
            
            const demoPlans = [
                {
                    id: utils.generateUUID(),
                    userId: this.currentUser.id,
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
                    id: utils.generateUUID(),
                    userId: this.currentUser.id,
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
                    id: utils.generateUUID(),
                    userId: this.currentUser.id,
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
                    id: utils.generateUUID(),
                    userId: this.currentUser.id,
                    title: 'Web Projesi',
                    category: 'yazılım',
                    description: 'SmartTime projesini geliştir',
                    start: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
                    end: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
                    completed: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            
            utils.setItem(`plans_${this.currentUser.id}`, demoPlans);
        }
    }

    // Yardımcı fonksiyonlar
    getSocialUserName(provider) {
        const names = {
            'google': 'Google Kullanıcısı',
            'apple': 'Apple Kullanıcısı',
            'microsoft': 'Microsoft Kullanıcısı',
            'email': 'E-posta Kullanıcısı'
        };
        return names[provider] || 'SmartTime Kullanıcısı';
    }

    getSocialProviderName(provider) {
        const names = {
            'google': 'Google',
            'apple': 'Apple',
            'microsoft': 'Microsoft',
            'email': 'E-posta'
        };
        return names[provider] || provider;
    }

    // Kullanıcı giriş kontrolü
    checkAuth() {
        if (!this.currentUser) {
            const user = utils.getItem('current_user');
            if (user) {
                this.currentUser = user;
            } else {
                // Giriş yapılmamış, ana sayfaya yönlendir
                if (!window.location.pathname.includes('index.html')) {
                    console.log('[Auth] Yetkisiz erişim, yönlendiriliyor');
                    utils.navigateTo('index.html');
                }
            }
        }
        return this.currentUser;
    }

    // İlgi alanlarını güncelle
    updateUserInterests(interests) {
        if (!this.currentUser) return;

        console.log('[Auth] İlgi alanları güncelleniyor:', interests);
        
        this.currentUser.interests = interests;
        utils.setItem('current_user', this.currentUser);

        // Kullanıcılar listesini de güncelle
        const users = utils.getItem('users') || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].interests = interests;
            utils.setItem('users', users);
        }
    }

    // Hızlı giriş butonu için (demo)
    quickLogin() {
        console.log('[Auth] Hızlı giriş butonu tıklandı');
        document.getElementById('login-email').value = 'demo@smarttime.com';
        document.getElementById('login-password').value = 'demo123';
        document.getElementById('login-form').dispatchEvent(new Event('submit'));
    }
}

// Global instance oluştur
window.authManager = new AuthManager();

// Sayfa yüklendiğinde hızlı giriş butonu ekle
document.addEventListener('DOMContentLoaded', function() {
    // Hızlı giriş butonu ekle (eğer yoksa)
    setTimeout(() => {
        const loginFooter = document.querySelector('.auth-footer');
        if (loginFooter && !document.getElementById('quick-login-btn')) {
            const quickLoginBtn = document.createElement('button');
            quickLoginBtn.id = 'quick-login-btn';
            quickLoginBtn.className = 'btn btn-outline btn-sm w-100 mt-2';
            quickLoginBtn.innerHTML = '<i class="fas fa-bolt"></i> Hızlı Demo Giriş';
            quickLoginBtn.onclick = () => window.authManager.quickLogin();
            loginFooter.appendChild(quickLoginBtn);
            
            // CSS ekle
            const style = document.createElement('style');
            style.textContent = `
                #quick-login-btn {
                    margin-top: 1rem;
                    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
                    border: none;
                    color: white;
                }
                
                #quick-login-btn:hover {
                    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
                    transform: translateY(-2px);
                }
            `;
            document.head.appendChild(style);
        }
    }, 500);
});