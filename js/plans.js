// ========== PLAN MANAGEMENT FUNCTIONS ==========

class PlanManager {
    constructor() {
        this.plans = [];
        this.categories = [
            { id: 'ders', name: 'Ders', icon: 'fas fa-graduation-cap' },
            { id: 'spor', name: 'Spor', icon: 'fas fa-dumbbell' },
            { id: 'yemek', name: 'Yemek', icon: 'fas fa-utensils' },
            { id: 'yazılım', name: 'Yazılım', icon: 'fas fa-code' },
            { id: 'oyun', name: 'Oyun', icon: 'fas fa-gamepad' },
            { id: 'kitap', name: 'Kitap', icon: 'fas fa-book' },
            { id: 'sanat', name: 'Sanat', icon: 'fas fa-palette' },
            { id: 'dinlenme', name: 'Dinlenme', icon: 'fas fa-couch' }
        ];
        this.init();
    }

    init() {
        this.loadPlans();
        this.setupEventListeners();
    }

    // Planları yükle
    loadPlans() {
        const user = authManager.currentUser;
        if (!user) return;

        const userPlans = utils.getItem(`plans_${user.id}`) || [];
        this.plans = userPlans.map(plan => ({
            ...plan,
            start: new Date(plan.start),
            end: new Date(plan.end)
        }));

        utils.log(`${this.plans.length} plan yüklendi`);
    }

    // Event listener'ları kur
    setupEventListeners() {
        // Yeni plan ekle butonu
        const addPlanBtn = document.getElementById('add-plan-btn');
        if (addPlanBtn) {
            addPlanBtn.addEventListener('click', () => this.showAddPlanModal());
        }

        // Plan formu
        const planForm = document.getElementById('plan-form');
        if (planForm) {
            planForm.addEventListener('submit', (e) => this.handlePlanSubmit(e));
        }

        // Plan silme
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-plan-btn')) {
                const planId = e.target.closest('.delete-plan-btn').dataset.planId;
                this.deletePlan(planId);
            }
        });

        // Plan tamamlama
        document.addEventListener('click', (e) => {
            if (e.target.closest('.complete-plan-btn')) {
                const planId = e.target.closest('.complete-plan-btn').dataset.planId;
                this.togglePlanComplete(planId);
            }
        });

        // Plan düzenleme
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-plan-btn')) {
                const planId = e.target.closest('.edit-plan-btn').dataset.planId;
                this.editPlan(planId);
            }
        });

        // Tarih ve saat input'ları
        const dateInputs = document.querySelectorAll('input[type="date"], input[type="time"]');
        dateInputs.forEach(input => {
            input.addEventListener('change', () => this.validateDateTime());
        });
    }

    // Plan ekle modal'ını göster
    showAddPlanModal(plan = null) {
        const modal = document.getElementById('plan-modal');
        if (!modal) return;

        const form = document.getElementById('plan-form');
        const modalTitle = document.getElementById('modal-title');
        const submitBtn = document.getElementById('plan-submit-btn');

        if (plan) {
            // Düzenleme modu
            modalTitle.textContent = 'Planı Düzenle';
            submitBtn.textContent = 'Güncelle';

            // Formu doldur
            form.dataset.editId = plan.id;
            document.getElementById('plan-title').value = plan.title;
            document.getElementById('plan-category').value = plan.category;
            document.getElementById('plan-date').value = utils.formatDate(plan.start, 'yyyy-mm-dd');
            document.getElementById('plan-start-time').value = utils.formatDate(plan.start, 'HH:MM');
            document.getElementById('plan-end-time').value = utils.formatDate(plan.end, 'HH:MM');
            document.getElementById('plan-description').value = plan.description || '';
        } else {
            // Yeni plan modu
            modalTitle.textContent = 'Yeni Plan Ekle';
            submitBtn.textContent = 'Kaydet';
            delete form.dataset.editId;

            // Formu temizle
            form.reset();
            
            // Varsayılan değerleri ayarla
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('plan-date').value = today;
            
            // Bir sonraki saati ayarla
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1);
            nextHour.setMinutes(0, 0, 0);
            
            const startTime = utils.formatDate(nextHour, 'HH:MM');
            const endTime = utils.formatDate(new Date(nextHour.getTime() + 60 * 60 * 1000), 'HH:MM');
            
            document.getElementById('plan-start-time').value = startTime;
            document.getElementById('plan-end-time').value = endTime;
        }

        utils.showModal('plan-modal');
    }

    // Plan form submit işlemi
    async handlePlanSubmit(e) {
        e.preventDefault();
        
        const formData = utils.getFormData('plan-form');
        const {
            'plan-title': title,
            'plan-category': category,
            'plan-date': date,
            'plan-start-time': startTime,
            'plan-end-time': endTime,
            'plan-description': description
        } = formData;

        // Validasyon
        if (!title || title.trim().length < 2) {
            utils.showToast('Plan başlığı en az 2 karakter olmalıdır', 'error');
            return;
        }

        if (!category) {
            utils.showToast('Bir kategori seçmelisiniz', 'error');
            return;
        }

        // Tarih ve saat validasyonu
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            utils.showToast('Geçerli bir tarih ve saat giriniz', 'error');
            return;
        }

        if (endDateTime <= startDateTime) {
            utils.showToast('Bitiş saati başlangıç saatinden sonra olmalıdır', 'error');
            return;
        }

        if (endDateTime.getTime() - startDateTime.getTime() < 15 * 60 * 1000) {
            utils.showToast('Plan en az 15 dakika sürmelidir', 'error');
            return;
        }

        // Kullanıcı kontrolü
        const user = authManager.checkAuth();
        if (!user) return;

        const loading = utils.showLoading();

        try {
            const planData = {
                id: e.target.dataset.editId || utils.generateUUID(),
                userId: user.id,
                title: title.trim(),
                category: category,
                description: description?.trim() || '',
                start: startDateTime,
                end: endDateTime,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Planı kaydet
            if (e.target.dataset.editId) {
                // Düzenleme
                this.updatePlan(planData);
                utils.showToast('Plan başarıyla güncellendi', 'success');
            } else {
                // Yeni plan
                this.addPlan(planData);
                utils.showToast('Plan başarıyla eklendi', 'success');
            }

            // Modal'ı kapat
            utils.hideModal('plan-modal');

            // Plan listesini yenile
            this.refreshPlanList();

            // Dashboard istatistiklerini güncelle
            if (window.statisticsManager) {
                statisticsManager.updateStats();
            }

        } catch (error) {
            utils.logError('Plan kaydetme hatası', error);
            utils.showToast('Plan kaydedilirken bir hata oluştu', 'error');
        } finally {
            utils.hideLoading(loading);
        }
    }

    // Yeni plan ekle
    addPlan(plan) {
        this.plans.push(plan);
        this.savePlans();
        
        // Akıllı öneri kontrolü
        this.checkForSmartSuggestions(plan);
    }

    // Plan güncelle
    updatePlan(updatedPlan) {
        const index = this.plans.findIndex(p => p.id === updatedPlan.id);
        if (index !== -1) {
            this.plans[index] = {
                ...this.plans[index],
                ...updatedPlan,
                updatedAt: new Date().toISOString()
            };
            this.savePlans();
        }
    }

    // Plan sil
    deletePlan(planId) {
        const confirmed = confirm('Bu planı silmek istediğinize emin misiniz?');
        if (!confirmed) return;

        this.plans = this.plans.filter(p => p.id !== planId);
        this.savePlans();
        
        utils.showToast('Plan başarıyla silindi', 'success');
        this.refreshPlanList();
        
        // Dashboard istatistiklerini güncelle
        if (window.statisticsManager) {
            statisticsManager.updateStats();
        }
    }

    // Plan tamamlama
    togglePlanComplete(planId) {
        const plan = this.plans.find(p => p.id === planId);
        if (!plan) return;

        plan.completed = !plan.completed;
        plan.updatedAt = new Date().toISOString();
        
        this.savePlans();
        
        const message = plan.completed 
            ? 'Plan tamamlandı olarak işaretlendi ✓'
            : 'Plan tamamlanmadı olarak işaretlendi';
        
        utils.showToast(message, plan.completed ? 'success' : 'info');
        this.refreshPlanList();
        
        // Dashboard istatistiklerini güncelle
        if (window.statisticsManager) {
            statisticsManager.updateStats();
        }
    }

    // Plan düzenle
    editPlan(planId) {
        const plan = this.plans.find(p => p.id === planId);
        if (plan) {
            this.showAddPlanModal(plan);
        }
    }

    // Planları kaydet
    savePlans() {
        const user = authManager.currentUser;
        if (!user) return;

        utils.setItem(`plans_${user.id}`, this.plans);
    }

    // Plan listesini yenile
    refreshPlanList(date = new Date()) {
        // Bugünün planlarını filtrele
        const todayPlans = this.getPlansForDate(date);
        
        // Plan listesi container'ını bul
        const planListContainer = document.getElementById('today-plan-list');
        if (!planListContainer) return;

        // Container'ı temizle
        planListContainer.innerHTML = '';

        if (todayPlans.length === 0) {
            // Boş durum mesajı göster
            planListContainer.innerHTML = `
                <div class="plan-empty">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>Bugün Planınız Yok</h3>
                    <p>Yeni bir plan ekleyerek başlayın!</p>
                    <button class="btn btn-primary mt-2" id="add-first-plan-btn">
                        <i class="fas fa-plus"></i> İlk Planınızı Ekleyin
                    </button>
                </div>
            `;

            // İlk plan ekle butonu için event listener ekle
            const addFirstPlanBtn = document.getElementById('add-first-plan-btn');
            if (addFirstPlanBtn) {
                addFirstPlanBtn.addEventListener('click', () => this.showAddPlanModal());
            }

            return;
        }

        // Planları sırala (zamana göre)
        todayPlans.sort((a, b) => new Date(a.start) - new Date(b.start));

        // Plan kartlarını oluştur
        todayPlans.forEach(plan => {
            const planCard = this.createPlanCard(plan);
            planListContainer.appendChild(planCard);
        });
    }

    // Plan kartı oluştur
    createPlanCard(plan) {
        const card = document.createElement('div');
        card.className = `plan-card ${plan.completed ? 'completed' : utils.isPast(plan.end) ? 'missed' : 'upcoming'}`;
        card.dataset.planId = plan.id;

        const categoryIcon = utils.getCategoryIcon(plan.category);
        const categoryColor = utils.getCategoryColor(plan.category);
        const duration = utils.calculateDuration(plan.start, plan.end);
        const timeRange = utils.formatTimeRange(plan.start, plan.end);

        card.innerHTML = `
            <div class="plan-time" style="border-left-color: ${categoryColor}">
                <div class="plan-start">${utils.formatDate(plan.start, 'time')}</div>
                <div class="plan-end">${utils.formatDate(plan.end, 'time')}</div>
                <div class="plan-duration" style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.25rem;">
                    ${utils.formatDuration(duration)}
                </div>
            </div>
            <div class="plan-info">
                <div class="plan-title">${utils.escapeHtml(plan.title)}</div>
                <div class="plan-category" style="color: ${categoryColor}">
                    <i class="${categoryIcon}"></i>
                    ${plan.category.charAt(0).toUpperCase() + plan.category.slice(1)}
                </div>
                ${plan.description ? `<div class="plan-description">${utils.escapeHtml(utils.truncateText(plan.description, 100))}</div>` : ''}
            </div>
            <div class="plan-actions">
                <button class="plan-action-btn complete-plan-btn" data-plan-id="${plan.id}" 
                        title="${plan.completed ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}">
                    <i class="fas fa-${plan.completed ? 'undo' : 'check'}"></i>
                </button>
                <button class="plan-action-btn edit-plan-btn" data-plan-id="${plan.id}" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="plan-action-btn delete-plan-btn" data-plan-id="${plan.id}" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return card;
    }

    // Tarihe göre planları getir
    getPlansForDate(date) {
        const targetDate = new Date(date);
        return this.plans.filter(plan => {
            const planDate = new Date(plan.start);
            return planDate.toDateString() === targetDate.toDateString();
        });
    }

    // Haftalık planları getir
    getWeeklyPlans(startDate = new Date()) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        
        return this.plans.filter(plan => {
            const planDate = new Date(plan.start);
            return planDate >= start && planDate < end;
        });
    }

    // Kategoriye göre planları getir
    getPlansByCategory(category) {
        return this.plans.filter(plan => plan.category === category);
    }

    // Tarih ve saat validasyonu
    validateDateTime() {
        const date = document.getElementById('plan-date')?.value;
        const startTime = document.getElementById('plan-start-time')?.value;
        const endTime = document.getElementById('plan-end-time')?.value;

        if (!date || !startTime || !endTime) return true;

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        
        if (endDateTime <= startDateTime) {
            utils.showToast('Bitiş saati başlangıç saatinden sonra olmalıdır', 'warning');
            return false;
        }

        return true;
    }

    // Akıllı öneriler kontrolü
    checkForSmartSuggestions(plan) {
        // Aynı planın tekrar edip etmediğini kontrol et
        const similarPlans = this.plans.filter(p => 
            p.title.toLowerCase() === plan.title.toLowerCase() &&
            p.category === plan.category &&
            Math.abs(new Date(p.start).getDay() - new Date(plan.start).getDay()) < 2
        );

        if (similarPlans.length >= 2) {
            // Haftalık rutin öner
            setTimeout(() => {
                const confirmRoutine = confirm(
                    `"${plan.title}" planını düzenli olarak ekliyorsunuz. ` +
                    `Bu planı haftalık rutin olarak kaydetmek ister misiniz?`
                );
                
                if (confirmRoutine) {
                    this.createWeeklyRoutine(plan);
                }
            }, 2000);
        }

        // Yoğun gün kontrolü
        const dailyPlans = this.getPlansForDate(plan.start);
        if (dailyPlans.length > 5) {
            utils.showToast(
                'Bugün çok fazla planınız var! Dinlenmeyi unutmayın.',
                'warning'
            );
        }
    }

    // Haftalık rutin oluştur
    createWeeklyRoutine(basePlan) {
        const routines = utils.getItem('routines') || [];
        
        const routine = {
            id: utils.generateUUID(),
            title: basePlan.title,
            category: basePlan.category,
            description: basePlan.description,
            dayOfWeek: new Date(basePlan.start).getDay(),
            startTime: utils.formatDate(basePlan.start, 'time'),
            duration: utils.calculateDuration(basePlan.start, basePlan.end),
            active: true,
            createdAt: new Date().toISOString()
        };

        routines.push(routine);
        utils.setItem('routines', routines);

        utils.showToast('Haftalık rutin başarıyla oluşturuldu', 'success');
    }
}

// Global instance oluştur
window.planManager = new PlanManager();