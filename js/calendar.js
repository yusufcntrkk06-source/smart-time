// ========== CALENDAR MANAGER ==========

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.viewMode = 'month'; // 'month', 'week', 'day'
        this.events = [];
        this.init();
    }

    init() {
        this.user = authManager.currentUser;
        if (!this.user) return;
        
        this.loadEvents();
        this.setupCalendar();
        this.setupEventListeners();
        this.renderCalendar();
    }

    // Planları event olarak yükle
    loadEvents() {
        if (!window.planManager) return;
        
        this.events = planManager.plans.map(plan => ({
            id: plan.id,
            title: plan.title,
            start: new Date(plan.start),
            end: new Date(plan.end),
            category: plan.category,
            completed: plan.completed,
            description: plan.description,
            color: utils.getCategoryColor(plan.category)
        }));
    }

    // Calendar setup
    setupCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;
        
        // Takvim başlığı
        this.updateCalendarTitle();
        
        // Grid container
        calendarEl.innerHTML = `
            <div class="calendar-header">
                <div class="calendar-navigation">
                    <button class="btn btn-outline" id="prev-period">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 id="calendar-title">Takvim</h3>
                    <button class="btn btn-outline" id="next-period">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="calendar-view-toggle">
                    <button class="btn btn-sm ${this.viewMode === 'month' ? 'btn-primary' : 'btn-outline'}" 
                            data-view="month">Ay</button>
                    <button class="btn btn-sm ${this.viewMode === 'week' ? 'btn-primary' : 'btn-outline'}" 
                            data-view="week">Hafta</button>
                    <button class="btn btn-sm ${this.viewMode === 'day' ? 'btn-primary' : 'btn-outline'}" 
                            data-view="day">Gün</button>
                </div>
                <button class="btn btn-primary" id="today-btn">
                    <i class="fas fa-calendar-day"></i> Bugün
                </button>
            </div>
            <div class="calendar-grid" id="calendar-grid"></div>
        `;
    }

    // Event listener'ları kur
    setupEventListeners() {
        // Navigation
        document.getElementById('prev-period')?.addEventListener('click', () => this.navigate(-1));
        document.getElementById('next-period')?.addEventListener('click', () => this.navigate(1));
        document.getElementById('today-btn')?.addEventListener('click', () => this.goToToday());
        
        // View toggle
        document.querySelectorAll('.calendar-view-toggle button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
        
        // Date selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.calendar-day')) {
                const dayEl = e.target.closest('.calendar-day');
                const dateStr = dayEl.dataset.date;
                if (dateStr) {
                    this.selectDate(new Date(dateStr));
                }
            }
        });
        
        // Event click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.calendar-event')) {
                const eventEl = e.target.closest('.calendar-event');
                const eventId = eventEl.dataset.eventId;
                this.showEventDetails(eventId);
            }
        });
    }

    // Takvimi render et
    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (this.viewMode === 'month') {
            this.renderMonthView(grid);
        } else if (this.viewMode === 'week') {
            this.renderWeekView(grid);
        } else if (this.viewMode === 'day') {
            this.renderDayView(grid);
        }
    }

    // Ay görünümü
    renderMonthView(container) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Ayın ilk günü
        const firstDay = new Date(year, month, 1);
        // Ayın son günü
        const lastDay = new Date(year, month + 1, 0);
        // İlk günün haftanın kaçıncı günü olduğu (0: Pazar)
        const firstDayIndex = firstDay.getDay();
        // Toplam gün sayısı
        const daysInMonth = lastDay.getDate();
        
        // Gün isimleri
        const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        
        // Gün isimlerini ekle
        const headerRow = document.createElement('div');
        headerRow.className = 'calendar-week';
        dayNames.forEach(day => {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day-header';
            dayCell.textContent = day;
            headerRow.appendChild(dayCell);
        });
        container.appendChild(headerRow);
        
        // Günleri ekle
        let day = 1;
        for (let week = 0; week < 6; week++) {
            const weekRow = document.createElement('div');
            weekRow.className = 'calendar-week';
            
            for (let weekDay = 0; weekDay < 7; weekDay++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';
                
                if (week === 0 && weekDay < firstDayIndex) {
                    // Önceki aydan günler
                    const prevDate = new Date(year, month, 0 - (firstDayIndex - weekDay - 1));
                    dayCell.classList.add('calendar-day-other');
                    dayCell.textContent = prevDate.getDate();
                    dayCell.dataset.date = prevDate.toISOString();
                } else if (day > daysInMonth) {
                    // Sonraki aydan günler
                    const nextDate = new Date(year, month + 1, day - daysInMonth);
                    dayCell.classList.add('calendar-day-other');
                    dayCell.textContent = nextDate.getDate();
                    dayCell.dataset.date = nextDate.toISOString();
                    day++;
                } else {
                    // Bu aydan günler
                    const currentDate = new Date(year, month, day);
                    dayCell.dataset.date = currentDate.toISOString();
                    dayCell.textContent = day;
                    
                    // Bugün mü?
                    if (utils.isToday(currentDate)) {
                        dayCell.classList.add('calendar-day-today');
                    }
                    
                    // Seçili gün mü?
                    if (this.selectedDate.toDateString() === currentDate.toDateString()) {
                        dayCell.classList.add('calendar-day-selected');
                    }
                    
                    // Bu güne ait event'ları ekle
                    const dayEvents = this.getEventsForDate(currentDate);
                    if (dayEvents.length > 0) {
                        const eventsContainer = document.createElement('div');
                        eventsContainer.className = 'calendar-day-events';
                        
                        dayEvents.slice(0, 3).forEach(event => {
                            const eventEl = document.createElement('div');
                            eventEl.className = `calendar-event ${event.completed ? 'completed' : ''}`;
                            eventEl.dataset.eventId = event.id;
                            eventEl.style.backgroundColor = event.color;
                            eventEl.innerHTML = `
                                <div class="calendar-event-time">${utils.formatDate(event.start, 'time')}</div>
                                <div class="calendar-event-title">${utils.escapeHtml(event.title)}</div>
                            `;
                            eventsContainer.appendChild(eventEl);
                        });
                        
                        if (dayEvents.length > 3) {
                            const moreEl = document.createElement('div');
                            moreEl.className = 'calendar-event-more';
                            moreEl.textContent = `+${dayEvents.length - 3} daha`;
                            eventsContainer.appendChild(moreEl);
                        }
                        
                        dayCell.appendChild(eventsContainer);
                    }
                    
                    day++;
                }
                
                weekRow.appendChild(dayCell);
            }
            
            container.appendChild(weekRow);
            
            if (day > daysInMonth) {
                break;
            }
        }
    }

    // Hafta görünümü
    renderWeekView(container) {
        // Haftanın başlangıcını bul (Pazartesi)
        const startOfWeek = new Date(this.currentDate);
        const dayOfWeek = startOfWeek.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazartesi'ye ayarla
        startOfWeek.setDate(startOfWeek.getDate() + diff);
        
        // Haftanın günlerini oluştur
        const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
        
        // Saatler
        const hours = Array.from({length: 12}, (_, i) => i + 8); // 08:00 - 19:00
        
        // Grid oluştur
        container.innerHTML = `
            <div class="calendar-week-view">
                <div class="calendar-week-header">
                    <div class="calendar-week-time-col"></div>
                    ${dayNames.map((dayName, index) => {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + index);
                        return `
                            <div class="calendar-week-day-col ${utils.isToday(date) ? 'today' : ''}">
                                <div class="week-day-name">${dayName}</div>
                                <div class="week-day-date">${date.getDate()}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="calendar-week-body">
                    ${hours.map(hour => `
                        <div class="calendar-week-hour-row">
                            <div class="calendar-week-time-cell">${hour}:00</div>
                            ${dayNames.map((_, index) => {
                                const date = new Date(startOfWeek);
                                date.setDate(startOfWeek.getDate() + index);
                                date.setHours(hour, 0, 0, 0);
                                return `<div class="calendar-week-hour-cell" data-time="${date.toISOString()}"></div>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Event'ları yerleştir
        this.placeWeekEvents(startOfWeek, hours);
    }

    // Gün görünümü
    renderDayView(container) {
        const date = this.selectedDate;
        const hours = Array.from({length: 12}, (_, i) => i + 8); // 08:00 - 19:00
        
        container.innerHTML = `
            <div class="calendar-day-view">
                <div class="calendar-day-header">
                    <h4>${utils.formatDate(date, 'long')}</h4>
                </div>
                <div class="calendar-day-body">
                    ${hours.map(hour => `
                        <div class="calendar-day-hour">
                            <div class="calendar-day-time">${hour}:00</div>
                            <div class="calendar-day-hour-slot" data-hour="${hour}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Event'ları yerleştir
        this.placeDayEvents(date, hours);
    }

    // Hafta görünümü için event'ları yerleştir
    placeWeekEvents(startOfWeek, hours) {
        const dayEvents = {};
        
        // Her gün için event'ları grupla
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dayEvents[i] = this.getEventsForDate(date);
        }
        
        // Event'ları grid'e yerleştir
        Object.keys(dayEvents).forEach(dayIndex => {
            dayEvents[dayIndex].forEach(event => {
                const startHour = event.start.getHours();
                const startMinute = event.start.getMinutes();
                const endHour = event.end.getHours();
                const endMinute = event.end.getMinutes();
                
                // Event pozisyonunu hesapla
                const top = ((startHour - 8) * 60 + startMinute) * 0.8; // 48px = 1 saat
                const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 0.8;
                
                // Event elementini oluştur
                const eventEl = document.createElement('div');
                eventEl.className = `calendar-week-event ${event.completed ? 'completed' : ''}`;
                eventEl.dataset.eventId = event.id;
                eventEl.style.cssText = `
                    position: absolute;
                    top: ${top}px;
                    height: ${height}px;
                    background-color: ${event.color};
                    left: calc(${dayIndex} * (100% / 7) + 2px);
                    width: calc(100% / 7 - 4px);
                    padding: 4px;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                    z-index: 1;
                `;
                
                eventEl.innerHTML = `
                    <div class="week-event-time">${utils.formatDate(event.start, 'time')}</div>
                    <div class="week-event-title">${utils.escapeHtml(event.title)}</div>
                `;
                
                const grid = document.querySelector('.calendar-week-body');
                if (grid) {
                    grid.appendChild(eventEl);
                }
            });
        });
    }

    // Gün görünümü için event'ları yerleştir
    placeDayEvents(date, hours) {
        const events = this.getEventsForDate(date);
        
        events.forEach(event => {
            const startHour = event.start.getHours();
            const startMinute = event.start.getMinutes();
            const endHour = event.end.getHours();
            const endMinute = event.end.getMinutes();
            
            // Event pozisyonunu hesapla
            const top = ((startHour - 8) * 60 + startMinute) * 0.8; // 48px = 1 saat
            const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 0.8;
            
            // Event elementini oluştur
            const eventEl = document.createElement('div');
            eventEl.className = `calendar-day-event ${event.completed ? 'completed' : ''}`;
            eventEl.dataset.eventId = event.id;
            eventEl.style.cssText = `
                position: absolute;
                top: ${top}px;
                height: ${height}px;
                background-color: ${event.color};
                left: 60px;
                right: 10px;
                padding: 8px;
                border-radius: 6px;
                overflow: hidden;
                cursor: pointer;
                z-index: 1;
            `;
            
            eventEl.innerHTML = `
                <div class="day-event-time">${utils.formatDate(event.start, 'time')} - ${utils.formatDate(event.end, 'time')}</div>
                <div class="day-event-title">${utils.escapeHtml(event.title)}</div>
                ${event.description ? `<div class="day-event-desc">${utils.escapeHtml(utils.truncateText(event.description, 50))}</div>` : ''}
            `;
            
            const dayBody = document.querySelector('.calendar-day-body');
            if (dayBody) {
                dayBody.appendChild(eventEl);
            }
        });
    }

    // Navigation
    navigate(direction) {
        if (this.viewMode === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.viewMode === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else if (this.viewMode === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() + direction);
        }
        
        this.updateCalendarTitle();
        this.renderCalendar();
    }

    switchView(view) {
        this.viewMode = view;
        
        // Aktif butonu güncelle
        document.querySelectorAll('.calendar-view-toggle button').forEach(btn => {
            if (btn.dataset.view === view) {
                btn.className = 'btn btn-sm btn-primary';
            } else {
                btn.className = 'btn btn-sm btn-outline';
            }
        });
        
        this.updateCalendarTitle();
        this.renderCalendar();
    }

    selectDate(date) {
        this.selectedDate = date;
        
        if (this.viewMode === 'day') {
            this.currentDate = new Date(date);
            this.updateCalendarTitle();
            this.renderCalendar();
        } else {
            this.renderCalendar();
        }
    }

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.updateCalendarTitle();
        this.renderCalendar();
    }

    // Event detaylarını göster
    showEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        const modalHTML = `
            <div class="modal" id="event-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Plan Detayları</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="event-detail-header" style="border-left-color: ${event.color}">
                            <h4>${utils.escapeHtml(event.title)}</h4>
                            <div class="event-category" style="color: ${event.color}">
                                <i class="${utils.getCategoryIcon(event.category)}"></i>
                                ${event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                            </div>
                        </div>
                        
                        <div class="event-detail-info">
                            <div class="detail-row">
                                <i class="fas fa-calendar"></i>
                                <div>
                                    <div class="detail-label">Tarih</div>
                                    <div class="detail-value">${utils.formatDate(event.start, 'long')}</div>
                                </div>
                            </div>
                            
                            <div class="detail-row">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <div class="detail-label">Saat</div>
                                    <div class="detail-value">${utils.formatDate(event.start, 'time')} - ${utils.formatDate(event.end, 'time')}</div>
                                </div>
                            </div>
                            
                            <div class="detail-row">
                                <i class="fas fa-hourglass-half"></i>
                                <div>
                                    <div class="detail-label">Süre</div>
                                    <div class="detail-value">${utils.formatDuration(utils.calculateDuration(event.start, event.end))}</div>
                                </div>
                            </div>
                            
                            <div class="detail-row">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <div class="detail-label">Durum</div>
                                    <div class="detail-value">
                                        <span class="badge ${event.completed ? 'badge-success' : 'badge-warning'}">
                                            ${event.completed ? 'Tamamlandı' : 'Bekliyor'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            ${event.description ? `
                                <div class="detail-row">
                                    <i class="fas fa-align-left"></i>
                                    <div>
                                        <div class="detail-label">Açıklama</div>
                                        <div class="detail-value">${utils.escapeHtml(event.description)}</div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="utils.hideModal('event-modal')">Kapat</button>
                        <button class="btn btn-primary" onclick="planManager.editPlan('${event.id}'); utils.hideModal('event-modal')">
                            <i class="fas fa-edit"></i> Düzenle
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Modal'ı ekle
        const existingModal = document.getElementById('event-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        utils.showModal('event-modal');
    }

    // Yardımcı fonksiyonlar
    updateCalendarTitle() {
        const titleEl = document.getElementById('calendar-title');
        if (!titleEl) return;
        
        let title = '';
        
        if (this.viewMode === 'month') {
            const monthNames = [
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ];
            title = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else if (this.viewMode === 'week') {
            const startOfWeek = new Date(this.currentDate);
            const dayOfWeek = startOfWeek.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            startOfWeek.setDate(startOfWeek.getDate() + diff);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            
            title = `${utils.formatDate(startOfWeek, 'short')} - ${utils.formatDate(endOfWeek, 'short')}`;
        } else if (this.viewMode === 'day') {
            title = utils.formatDate(this.currentDate, 'long');
        }
        
        titleEl.textContent = title;
    }

    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    // Takvimi yenile
    refreshCalendar() {
        this.loadEvents();
        this.renderCalendar();
        utils.showToast('Takvim yenilendi', 'success');
    }
}

// Global instance oluştur
window.calendarManager = new CalendarManager();