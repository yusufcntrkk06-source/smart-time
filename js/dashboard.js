// ========== DASHBOARD MANAGER ==========

class DashboardManager {
    constructor() {
        this.user = null;
        this.todayPlans = [];
        this.upcomingPlans = [];
        this.recentActivities = [];
        this.init();
    }

    init() {
        this.user = authManager.currentUser;
        if (!this.user) return;
        
        this.loadDashboardData();
        this.setupEventListeners();
        this.updateDashboard();
    }

    // Dashboard verilerini yükle
    loadDashboardData() {
        // Bugünün planlarını yükle
        if (window.planManager) {
            this.todayPlans = planManager.getPlansForDate(new Date());
        }
        
        // Yaklaşan planları yükle (önümüzdeki 3 gün)
        this.upcomingPlans = this.getUpcomingPlans(3);
        
        // Son aktiviteleri yükle
        this.recentActivities = this.getRecentActivities();
    }

    // Event listener'ları kur
    setupEventListeners() {
        // Hızlı plan ekle butonu
        const quickAddBtn = document.getElementById('quick-add-plan');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                if (window.planManager) {
                    planManager.showAddPlanModal();
                }
            });
        }
        
        // Bugünün tarihini güncelle
        this.updateTodayDate();
        
        // Plan tamamlama
        document.addEventListener('click', (e) => {
            if (e.target.closest('.complete-quick-btn')) {
                const planId = e.target.closest('.complete-quick-btn').dataset.planId;
                this.completePlanQuick(planId);
            }
        });
        
        // Kategori filtreleme
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-filter')) {
                const category = e.target.closest('.category-filter').dataset.category;
                this.filterByCategory(category);
            }
        });
        
        // Refresh butonu
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
    }

    // Dashboard'ı güncelle
    updateDashboard() {
        this.updateGreeting();
        this.updateTodaySummary();
        this.updateInterestCards();
        this.updateUpcomingPlans();
        this.updateRecentActivities();
        this.updateQuickStats();
    }

    // Selamlama mesajını güncelle
    updateGreeting() {
        const greetingElement = document.getElementById('greeting-message');
        if (!greetingElement || !this.user) return;
        
        const hour = new Date().getHours();
        let greeting = '';
        
        if (hour < 12) greeting = 'Günaydın';
        else if (hour < 18) greeting = 'İyi günler';
        else greeting = 'İyi akşamlar';
        
        greetingElement.innerHTML = `
            <h2>${greeting}, <span class="user-name">${this.user.name}</span>!</h2>
            <p>Bugün ${utils.formatDate(new Date(), 'long')}</p>
        `;
    }

    // Bugünün özetini güncelle
    updateTodaySummary() {
        const summaryElement = document.getElementById('today-summary');
        if (!summaryElement) return;
        
        const totalPlans = this.todayPlans.length;
        const completedPlans = this.todayPlans.filter(p => p.completed).length;
        const pendingPlans = totalPlans - completedPlans;
        
        // Toplam süre
        const totalDuration = this.todayPlans.reduce((total, plan) => {
            return total + utils.calculateDuration(plan.start, plan.end);
        }, 0);
        
        summaryElement.innerHTML = `
            <div class="today-summary-stats">
                <div class="stat">
                    <div class="stat-value">${totalPlans}</div>
                    <div class="stat-label">Toplam Plan</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${completedPlans}</div>
                    <div class="stat-label">Tamamlanan</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${pendingPlans}</div>
                    <div class="stat-label">Bekleyen</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${utils.formatDuration(totalDuration)}</div>
                    <div class="stat-label">Toplam Süre</div>
                </div>
            </div>
        `;
    }

    // İlgi alanı kartlarını güncelle
    updateInterestCards() {
        const container = document.getElementById('interest-cards');
        if (!container || !this.user.interests) return;
        
        const interests = [
            { id: 'ders', name: 'Ders', icon: 'fas fa-graduation-cap', color: '#4361ee' },
            { id: 'spor', name: 'Spor', icon: 'fas fa-dumbbell', color: '#4ade80' },
            { id: 'yemek', name: 'Yemek', icon: 'fas fa-utensils', color: '#f59e0b' },
            { id: 'yazılım', name: 'Yazılım', icon: 'fas fa-code', color: '#8b5cf6' },
            { id: 'oyun', name: 'Oyun', icon: 'fas fa-gamepad', color: '#ec4899' },
            { id: 'kitap', name: 'Kitap', icon: 'fas fa-book', color: '#06b6d4' },
            { id: 'sanat', name: 'Sanat', icon: 'fas fa-palette', color: '#f97316' },
            { id: 'dinlenme', name: 'Dinlenme', icon: 'fas fa-couch', color: '#64748b' }
        ];
        
        const userInterests = interests.filter(interest => 
            this.user.interests.includes(interest.id)
        );
        
        container.innerHTML = userInterests.map(interest => {
            const planCount = window.planManager ? 
                planManager.getPlansByCategory(interest.id).length : 0;
            
            return `
                <div class="interest-card" data-category="${interest.id}" style="border-color: ${interest.color}">
                    <div class="interest-card-icon" style="background: ${interest.color}">
                        <i class="${interest.icon}"></i>
                    </div>
                    <div class="interest-card-info">
                        <div class="interest-card-name">${interest.name}</div>
                        <div class="interest-card-count">${planCount} plan</div>
                    </div>
                    <button class="interest-card-action" data-category="${interest.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        // Kategoriye göre plan ekleme butonları
        container.querySelectorAll('.interest-card-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                this.addPlanForCategory(category);
            });
        });
        
        // Karte tıklama
        container.querySelectorAll('.interest-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    // Yaklaşan planları güncelle
    updateUpcomingPlans() {
        const container = document.getElementById('upcoming-plans');
        if (!container) return;
        
        if (this.upcomingPlans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h4>Yaklaşan Planınız Yok</h4>
                    <p>Yeni planlar ekleyerek başlayın</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.upcomingPlans.map(plan => {
            const categoryIcon = utils.getCategoryIcon(plan.category);
            const categoryColor = utils.getCategoryColor(plan.category);
            const timeUntil = this.getTimeUntil(plan.start);
            
            return `
                <div class="upcoming-plan-item" data-plan-id="${plan.id}">
                    <div class="upcoming-plan-time">
                        <div class="upcoming-plan-date">${utils.formatDate(plan.start, 'short')}</div>
                        <div class="upcoming-plan-range">${utils.formatDate(plan.start, 'time')} - ${utils.formatDate(plan.end, 'time')}</div>
                    </div>
                    <div class="upcoming-plan-info">
                        <div class="upcoming-plan-title">${utils.escapeHtml(plan.title)}</div>
                        <div class="upcoming-plan-category" style="color: ${categoryColor}">
                            <i class="${categoryIcon}"></i>
                            ${plan.category}
                        </div>
                    </div>
                    <div class="upcoming-plan-actions">
                        <button class="btn btn-sm btn-outline complete-quick-btn" data-plan-id="${plan.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="planManager.editPlan('${plan.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Son aktiviteleri güncelle
    updateRecentActivities() {
        const container = document.getElementById('recent-activities');
        if (!container) return;
        
        if (this.recentActivities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h4>Henüz Aktivite Yok</h4>
                    <p>Planlarınızı tamamladıkça burada görünecek</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.recentActivities.map(activity => {
            let icon = 'fas fa-check-circle';
            let color = 'var(--success)';
            let action = '';
            
            switch (activity.type) {
                case 'plan_completed':
                    icon = 'fas fa-check-circle';
                    color = 'var(--success)';
                    action = 'planı tamamladı';
                    break;
                case 'plan_created':
                    icon = 'fas fa-plus-circle';
                    color = 'var(--primary)';
                    action = 'plan oluşturdu';
                    break;
                case 'plan_updated':
                    icon = 'fas fa-edit';
                    color = 'var(--warning)';
                    action = 'planı güncelledi';
                    break;
                case 'plan_missed':
                    icon = 'fas fa-times-circle';
                    color = 'var(--danger)';
                    action = 'planı kaçırdı';
                    break;
            }
            
            return `
                <div class="activity-item">
                    <div class="activity-icon" style="color: ${color}">
                        <i class="${icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${activity.planTitle}</strong> ${action}
                        </div>
                        <div class="activity-time">${utils.formatDate(activity.timestamp, 'datetime')}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Hızlı istatistikleri güncelle
    updateQuickStats() {
        const container = document.getElementById('quick-stats');
        if (!container || !window.planManager) return;
        
        const allPlans = planManager.plans;
        const totalPlans = allPlans.length;
        const completedPlans = allPlans.filter(p => p.completed).length;
        const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;
        
        // Haftalık süre
        const weeklyPlans = planManager.getWeeklyPlans();
        const weeklyDuration = weeklyPlans.reduce((total, plan) => {
            return total + utils.calculateDuration(plan.start, plan.end);
        }, 0);
        
        // En aktif kategori
        const categories = {};
        allPlans.forEach(plan => {
            categories[plan.category] = (categories[plan.category] || 0) + 1;
        });
        
        const mostActiveCategory = Object.keys(categories).length > 0
            ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b)
            : 'yok';
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon primary">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${totalPlans}</div>
                    <div class="stat-label">Toplam Plan</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${completionRate}%</div>
                    <div class="stat-label">Tamamlama Oranı</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon warning">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${utils.formatDuration(weeklyDuration)}</div>
                    <div class="stat-label">Haftalık Süre</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon accent">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${mostActiveCategory.charAt(0).toUpperCase() + mostActiveCategory.slice(1)}</div>
                    <div class="stat-label">En Aktif Kategori</div>
                </div>
            </div>
        `;
    }

    // Yardımcı fonksiyonlar
    getUpcomingPlans(days = 3) {
        if (!window.planManager) return [];
        
        const allPlans = planManager.plans;
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);
        
        return allPlans
            .filter(plan => {
                const planDate = new Date(plan.start);
                return planDate > now && planDate <= future && !plan.completed;
            })
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5); // İlk 5 plan
    }

    getRecentActivities() {
        if (!window.planManager) return [];
        
        const activities = [];
        const allPlans = planManager.plans;
        
        // Son 10 planı aktivite olarak ekle
        const recentPlans = [...allPlans]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 10);
        
        recentPlans.forEach(plan => {
            activities.push({
                type: plan.completed ? 'plan_completed' : 'plan_created',
                planTitle: plan.title,
                timestamp: plan.updatedAt || plan.createdAt
            });
        });
        
        return activities;
    }

    getTimeUntil(date) {
        const now = new Date();
        const target = new Date(date);
        const diffMs = target - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays} gün sonra`;
        } else if (diffHours > 0) {
            return `${diffHours} saat sonra`;
        } else {
            return 'Çok yakında';
        }
    }

    // İşlemler
    completePlanQuick(planId) {
        if (window.planManager) {
            planManager.togglePlanComplete(planId);
            this.refreshDashboard();
        }
    }

    addPlanForCategory(category) {
        if (window.planManager) {
            const modal = document.getElementById('plan-modal');
            if (modal) {
                document.getElementById('plan-category').value = category;
                planManager.showAddPlanModal();
            }
        }
    }

    filterByCategory(category) {
        // Kategoriye göre filtrele (ileride geliştirilebilir)
        utils.showToast(`${category} kategorisi filtrelendi`, 'info');
    }

    refreshDashboard() {
        this.loadDashboardData();
        this.updateDashboard();
        utils.showToast('Dashboard yenilendi', 'success');
    }

    updateTodayDate() {
        const dateElement = document.getElementById('today-date');
        if (dateElement) {
            dateElement.textContent = utils.formatDate(new Date(), 'long');
        }
    }
}

// Global instance oluştur
window.dashboardManager = new DashboardManager();