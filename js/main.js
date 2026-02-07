// ========== MAIN APPLICATION CONTROLLER ==========

class SmartTimeApp {
    constructor() {
        this.currentPage = '';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('[SmartTime] Uygulama başlatılıyor...');
        
        // Global değişkenleri tanımla
        window.smartTimeApp = this;
        
        // Tema ve dil tercihlerini yükle (YENİ EKLENDİ)
        if (window.utils && typeof utils.loadPreferences === 'function') {
            utils.loadPreferences();
        }
        
        // Sayfa tipini belirle
        this.detectPageType();
        
        // Auth kontrolü yap
        await this.checkAuthentication();
        
        // Sayfa özel başlatma
        await this.initializePage();
        
        // Event listener'ları kur
        this.setupGlobalEventListeners();
        
        this.isInitialized = true;
        console.log('[SmartTime] Uygulama başlatıldı:', this.currentPage);
    }

    // Sayfa tipini belirle
    detectPageType() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop();
        
        if (pageName.includes('index.html') || pageName === '' || pageName === '/') {
            this.currentPage = 'auth';
        } else if (pageName.includes('dashboard.html')) {
            this.currentPage = 'dashboard';
        } else if (pageName.includes('interests.html')) {
            this.currentPage = 'interests';
        } else if (pageName.includes('statistics.html')) {
            this.currentPage = 'statistics';
        } else if (pageName.includes('calendar.html')) {
            this.currentPage = 'calendar';
        } else if (pageName.includes('settings.html')) {
            this.currentPage = 'settings';
        } else if (pageName.includes('help.html')) {
            this.currentPage = 'help';
        }
        
        console.log('[SmartTime] Sayfa tespit edildi:', this.currentPage);
    }

    // Kimlik doğrulama kontrolü
    async checkAuthentication() {
        // Auth, settings ve help sayfalarında kontrol etme
        if (this.currentPage === 'auth' || 
            this.currentPage === 'settings' || 
            this.currentPage === 'help') return true;
        
        const user = utils.getItem('current_user');
        
        if (!user) {
            console.warn('[SmartTime] Kullanıcı oturumu bulunamadı');
            utils.showToast('Lütfen giriş yapın', 'warning');
            setTimeout(() => utils.navigateTo('index.html'), 1500);
            return false;
        }
        
        // Kullanıcı ilgi alanlarını kontrol et
        if (this.currentPage !== 'interests' && 
            (!user.interests || user.interests.length === 0)) {
            utils.showToast('Lütfen ilgi alanlarınızı seçin', 'info');
            setTimeout(() => utils.navigateTo('interests.html'), 2000);
            return false;
        }
        
        return true;
    }

    // Sayfayı başlat
    async initializePage() {
        switch (this.currentPage) {
            case 'auth':
                await this.initializeAuthPage();
                break;
            case 'dashboard':
                await this.initializeDashboardPage();
                break;
            case 'interests':
                await this.initializeInterestsPage();
                break;
            case 'statistics':
                await this.initializeStatisticsPage();
                break;
            case 'calendar':
                await this.initializeCalendarPage();
                break;
            case 'settings':
                await this.initializeSettingsPage();
                break;
            case 'help':
                await this.initializeHelpPage();
                break;
        }
    }

    // Auth sayfası başlatma
    async initializeAuthPage() {
        // Onboarding kontrolü
        const isFirstVisit = !utils.getItem('onboarding_completed');
        
        if (isFirstVisit && !window.location.hash.includes('#login')) {
            this.showOnboarding();
        } else {
            this.setupAuthForms();
        }
    }

    // Dashboard sayfası başlatma
    async initializeDashboardPage() {
        // Kullanıcı kontrolü
        if (!authManager.currentUser) {
            authManager.loadCurrentUser();
        }
        
        // Dashboard bileşenlerini başlat
        if (window.dashboardManager) {
            dashboardManager.init();
        }
        
        // Plan yöneticisini başlat
        if (window.planManager) {
            planManager.refreshPlanList();
        }
        
        // İstatistikleri güncelle
        if (window.statisticsManager) {
            statisticsManager.updateDashboardStats();
        }
        
        // Sidebar toggle
        this.setupSidebarToggle();
        
        // Bugünün tarihini güncelle
        this.updateTodayDate();
    }

    // İlgi alanları sayfası başlatma
    async initializeInterestsPage() {
        this.setupInterestSelection();
    }

    // İstatistikler sayfası başlatma
    async initializeStatisticsPage() {
        if (window.statisticsManager) {
            statisticsManager.init();
        }
    }

    // Takvim sayfası başlatma
    async initializeCalendarPage() {
        if (window.calendarManager) {
            calendarManager.init();
        }
    }

    // Ayarlar sayfası başlatma
    async initializeSettingsPage() {
        // Settings page doesn't need special initialization
        console.log('[SmartTime] Ayarlar sayfası başlatıldı');
    }

    // Yardım sayfası başlatma
    async initializeHelpPage() {
        // Help page doesn't need special initialization
        console.log('[SmartTime] Yardım sayfası başlatıldı');
    }

    // Onboarding göster
    showOnboarding() {
        console.log('[SmartTime] Onboarding gösteriliyor');
        
        const onboardingHTML = `
            <div class="onboarding">
                <div class="onboarding-header">
                    <h1>SmartTime'a Hoş Geldiniz</h1>
                    <p>Zamanınızı akıllıca yönetin</p>
                </div>
                
                <div class="onboarding-content">
                    <div class="onboarding-slide active" id="slide-1">
                        <div class="onboarding-card">
                            <div class="onboarding-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h2>Akıllı Planlama</h2>
                            <p>Günlük aktivitelerinizi kolayca planlayın ve takip edin</p>
                        </div>
                    </div>
                    
                    <div class="onboarding-slide" id="slide-2">
                        <div class="onboarding-card">
                            <div class="onboarding-icon">
                                <i class="fas fa-chart-pie"></i>
                            </div>
                            <h2>Detaylı İstatistikler</h2>
                            <p>Zamanınızı nasıl kullandığınızı görsel raporlarla analiz edin</p>
                        </div>
                    </div>
                    
                    <div class="onboarding-slide" id="slide-3">
                        <div class="onboarding-card">
                            <div class="onboarding-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h2>Akıllı Öneriler</h2>
                            <p>Uygulama size özel öneriler ve hatırlatmalar sunar</p>
                        </div>
                    </div>
                </div>
                
                <div class="onboarding-footer">
                    <button class="skip-btn" id="skip-onboarding">Atla</button>
                    <div class="dots">
                        <span class="dot active" data-slide="1"></span>
                        <span class="dot" data-slide="2"></span>
                        <span class="dot" data-slide="3"></span>
                    </div>
                    <button class="btn btn-primary" id="next-slide">İleri <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        `;

        // Ana içeriği onboarding ile değiştir
        const mainContent = document.querySelector('.auth-container') || document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = onboardingHTML;
            this.setupOnboardingEvents();
        }
    }

    // Onboarding event'leri
    setupOnboardingEvents() {
        let currentSlide = 1;
        const totalSlides = 3;
        
        const nextBtn = document.getElementById('next-slide');
        const skipBtn = document.getElementById('skip-onboarding');
        const dots = document.querySelectorAll('.dot');
        
        // İleri butonu
        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides) {
                currentSlide++;
                this.updateOnboardingSlide(currentSlide);
            } else {
                this.completeOnboarding();
            }
        });
        
        // Atla butonu
        skipBtn.addEventListener('click', () => {
            this.completeOnboarding();
        });
        
        // Dots tıklama
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideNum = parseInt(dot.dataset.slide);
                currentSlide = slideNum;
                this.updateOnboardingSlide(currentSlide);
            });
        });
        
        console.log('[SmartTime] Onboarding event\'leri kuruldu');
    }

    // Onboarding slide güncelle
    updateOnboardingSlide(slideNum) {
        // Aktif slide'ı değiştir
        document.querySelectorAll('.onboarding-slide').forEach(slide => {
            slide.classList.remove('active');
        });
        document.getElementById(`slide-${slideNum}`).classList.add('active');
        
        // Dots'ları güncelle
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.dataset.slide) === slideNum) {
                dot.classList.add('active');
            }
        });
        
        // Buton metnini güncelle
        const nextBtn = document.getElementById('next-slide');
        if (slideNum === 3) {
            nextBtn.innerHTML = 'Başlayalım <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = 'İleri <i class="fas fa-arrow-right"></i>';
        }
    }

    // Onboarding tamamla
    completeOnboarding() {
        console.log('[SmartTime] Onboarding tamamlandı');
        utils.setItem('onboarding_completed', true);
        
        // Login formunu göster
        window.location.href = 'index.html#login';
    }

    // Auth formlarını kur
    setupAuthForms() {
        console.log('[SmartTime] Auth formları kuruluyor');
        
        // Form switching
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });
        
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });
        
        document.getElementById('forgot-password-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('forgot-password');
        });
        
        document.getElementById('cancel-forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });
        
        // Demo credentials auto-fill
        document.querySelector('.demo-credentials')?.addEventListener('click', () => {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            
            if (emailInput && passwordInput) {
                emailInput.value = 'demo@smarttime.com';
                passwordInput.value = 'demo123';
                utils.showToast('Demo bilgileri dolduruldu', 'info');
            }
        });
    }

    // Form göster/gizle
    showForm(formType) {
        // Hide all forms
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const forgotSection = document.getElementById('forgot-password-section');
        
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'none';
        if (forgotSection) forgotSection.style.display = 'none';
        
        // Show selected form
        if (formType === 'login' && loginSection) {
            loginSection.style.display = 'block';
        } else if (formType === 'register' && registerSection) {
            registerSection.style.display = 'block';
        } else if (formType === 'forgot-password' && forgotSection) {
            forgotSection.style.display = 'block';
        }
    }

    // Sidebar toggle setup
    setupSidebarToggle() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.dashboard-sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                if (overlay) overlay.classList.toggle('active');
            });
            
            // Overlay click
            if (overlay) {
                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                });
            }
            
            // Esc tuşu ile kapat
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                }
            });
        }
    }

    // İlgi alanları seçimi
    setupInterestSelection() {
        console.log('[SmartTime] İlgi alanları seçimi kuruluyor');
        
        const interests = [
            { id: 'ders', name: 'Ders', icon: 'fas fa-graduation-cap', desc: 'Ders çalışma ve öğrenme' },
            { id: 'spor', name: 'Spor', icon: 'fas fa-dumbbell', desc: 'Spor ve fitness' },
            { id: 'yemek', name: 'Yemek', icon: 'fas fa-utensils', desc: 'Yemek hazırlama' },
            { id: 'yazılım', name: 'Yazılım', icon: 'fas fa-code', desc: 'Kod yazma ve geliştirme' },
            { id: 'oyun', name: 'Oyun', icon: 'fas fa-gamepad', desc: 'Oyun ve eğlence' },
            { id: 'kitap', name: 'Kitap', icon: 'fas fa-book', desc: 'Kitap okuma' },
            { id: 'sanat', name: 'Sanat', icon: 'fas fa-palette', desc: 'Sanatsal aktiviteler' },
            { id: 'dinlenme', name: 'Dinlenme', icon: 'fas fa-couch', desc: 'Dinlenme ve rahatlama' }
        ];
        
        const selectedInterests = authManager.currentUser?.interests || [];
        const container = document.getElementById('interests-container');
        const countElement = document.getElementById('selected-count');
        
        if (!container) return;
        
        // Update count
        function updateCount() {
            if (countElement) {
                const selected = container.querySelectorAll('.interest-item.selected').length;
                countElement.textContent = selected;
            }
        }
        
        // Create interest items
        container.innerHTML = interests.map(interest => `
            <div class="interest-item ${selectedInterests.includes(interest.id) ? 'selected' : ''}" 
                 data-interest="${interest.id}">
                <div class="interest-icon">
                    <i class="${interest.icon}"></i>
                </div>
                <div class="interest-content">
                    <div class="interest-name">${interest.name}</div>
                    <div class="interest-desc">${interest.desc}</div>
                </div>
                <div class="interest-check">
                    <i class="fas fa-check"></i>
                </div>
            </div>
        `).join('');
        
        // Add click events
        container.querySelectorAll('.interest-item').forEach(item => {
            item.addEventListener('click', function() {
                this.classList.toggle('selected');
                updateCount();
            });
        });
        
        // Save button
        const saveBtn = document.getElementById('save-interests');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const selected = Array.from(container.querySelectorAll('.interest-item.selected'))
                    .map(item => item.dataset.interest);
                
                if (selected.length === 0) {
                    utils.showToast('En az bir ilgi alanı seçmelisiniz', 'warning');
                    return;
                }
                
                authManager.updateUserInterests(selected);
                utils.showToast('İlgi alanlarınız kaydedildi', 'success');
                
                setTimeout(() => {
                    utils.navigateTo('dashboard.html');
                }, 1500);
            });
        }
        
        updateCount();
    }

    // Bugünün tarihini güncelle
    updateTodayDate() {
        const dateElement = document.getElementById('today-date');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('tr-TR', options);
        }
    }

    // Global event listener'lar
    setupGlobalEventListeners() {
        console.log('[SmartTime] Global event listener\'lar kuruluyor');
        
        // Tüm modal close butonları
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.closest('.modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    utils.hideModal(modal.id);
                }
            }
            
            // Modal dışına tıklama
            if (e.target.classList.contains('modal')) {
                utils.hideModal(e.target.id);
            }
        });
        
        // Escape tuşu ile modal kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    utils.hideModal(modal.id);
                });
            }
        });
        
        // Navigation
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-nav]');
            if (navLink) {
                e.preventDefault();
                const target = navLink.dataset.nav;
                this.navigateTo(target);
            }
        });
        
        // User menu dropdown
        const userMenu = document.getElementById('user-menu');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenu && userDropdown) {
            userMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
                
                // Position dropdown
                const rect = this.getBoundingClientRect();
                userDropdown.style.position = 'fixed';
                userDropdown.s