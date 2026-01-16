// ========== STATISTICS MANAGER ==========

class StatisticsManager {
    constructor() {
        this.user = null;
        this.stats = {
            weekly: {},
            monthly: {},
            category: {},
            trends: []
        };
        this.init();
    }

    init() {
        this.user = authManager.currentUser;
        if (!this.user) return;
        
        this.loadStatistics();
        this.setupEventListeners();
        this.renderCharts();
    }

    // İstatistikleri yükle
    loadStatistics() {
        if (!window.planManager) return;
        
        const plans = planManager.plans;
        this.stats = {
            weekly: this.calculateWeeklyStats(plans),
            monthly: this.calculateMonthlyStats(plans),
            category: this.calculateCategoryStats(plans),
            trends: this.calculateTrends(plans),
            completion: this.calculateCompletionStats(plans),
            productivity: this.calculateProductivityStats(plans)
        };
    }

    // Event listener'ları kur
    setupEventListeners() {
        // Time period toggle
        document.querySelectorAll('.stats-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.switchPeriod(period);
            });
        });
        
        // Refresh butonu
        const refreshBtn = document.getElementById('refresh-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshStatistics());
        }
        
        // Export butonu
        const exportBtn = document.getElementById('export-stats');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportStatistics());
        }
    }

    // Grafikleri render et
    renderCharts() {
        this.renderCategoryChart();
        this.renderWeeklyChart();
        this.renderTrendChart();
        this.renderCompletionChart();
        this.renderProductivityChart();
        this.updateStatsCards();
    }

    // Dashboard için istatistikleri güncelle
    updateDashboardStats() {
        if (!window.planManager) return;
        
        const plans = planManager.plans;
        const today = new Date();
        
        // Bugünün istatistikleri
        const todayPlans = plans.filter(plan => 
            utils.isToday(new Date(plan.start))
        );
        
        // Haftalık istatistikler
        const weeklyPlans = plans.filter(plan => {
            const planDate = new Date(plan.start);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return planDate >= weekAgo;
        });
        
        // Dashboard istatistik kartlarını güncelle
        this.updateStatsCards();
    }

    // Kategori dağılımı grafiği
    renderCategoryChart() {
        const container = document.getElementById('category-chart');
        if (!container || !this.stats.category) return;
        
        const categories = Object.keys(this.stats.category);
        const counts = Object.values(this.stats.category);
        const colors = categories.map(cat => utils.getCategoryColor(cat));
        
        // Canvas oluştur
        container.innerHTML = '<canvas id="categoryChartCanvas"></canvas>';
        const ctx = document.getElementById('categoryChartCanvas').getContext('2d');
        
        // Basit bir pie chart oluştur
        const total = counts.reduce((sum, count) => sum + count, 0);
        
        // Canvas üzerinde pie chart çiz
        const centerX = 150;
        const centerY = 150;
        const radius = 120;
        let startAngle = 0;
        
        ctx.clearRect(0, 0, 300, 300);
        
        categories.forEach((category, index) => {
            const sliceAngle = (counts[index] / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            
            // Dilimi çiz
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index];
            ctx.fill();
            
            // Etiket
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round((counts[index] / total) * 100)}%`, labelX, labelY);
            
            startAngle = endAngle;
        });
        
        // Legend
        const legendContainer = document.getElementById('category-legend');
        if (legendContainer) {
            legendContainer.innerHTML = categories.map((category, index) => `
                <div class="chart-legend-item">
                    <span class="legend-color" style="background-color: ${colors[index]}"></span>
                    <span class="legend-label">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span class="legend-value">${counts[index]} plan (${Math.round((counts[index] / total) * 100)}%)</span>
                </div>
            `).join('');
        }
    }

    // Haftalık aktivite grafiği
    renderWeeklyChart() {
        const container = document.getElementById('weekly-chart');
        if (!container || !this.stats.weekly) return;
        
        const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        const hours = days.map(day => this.stats.weekly[day] || 0);
        const maxHours = Math.max(...hours, 1);
        
        container.innerHTML = '<canvas id="weeklyChartCanvas"></canvas>';
        const ctx = document.getElementById('weeklyChartCanvas').getContext('2d');
        const width = 400;
        const height = 200;
        const barWidth = 40;
        const spacing = 20;
        
        ctx.clearRect(0, 0, width, height);
        
        // Grid çiz
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Yatay grid çizgileri
        for (let i = 0; i <= 5; i++) {
            const y = height - (i * height / 5);
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            
            // Etiket
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.round((i * maxHours) / 5)}s`, 25, y + 3);
        }
        
        // Barları çiz
        days.forEach((day, index) => {
            const x = 40 + index * (barWidth + spacing);
            const barHeight = (hours[index] / maxHours) * (height - 40);
            const y = height - barHeight - 20;
            
            // Bar
            ctx.fillStyle = '#4361ee';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Gün etiketi
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(day, x + barWidth / 2, height - 5);
            
            // Saat değeri
            ctx.fillStyle = '#4361ee';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(`${hours[index]}s`, x + barWidth / 2, y - 5);
        });
    }

    // Trend grafiği
    renderTrendChart() {
        const container = document.getElementById('trend-chart');
        if (!container || this.stats.trends.length === 0) return;
        
        const weeks = this.stats.trends.map(t => t.week);
        const completions = this.stats.trends.map(t => t.completionRate);
        const maxRate = Math.max(...completions, 100);
        
        container.innerHTML = '<canvas id="trendChartCanvas"></canvas>';
        const ctx = document.getElementById('trendChartCanvas').getContext('2d');
        const width = 500;
        const height = 200;
        
        ctx.clearRect(0, 0, width, height);
        
        // Çizgi grafiği çiz
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        
        weeks.forEach((week, index) => {
            const x = 50 + (index * 80);
            const y = height - 30 - (completions[index] / maxRate) * (height - 60);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Noktalar
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Hafta etiketi
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(week, x, height - 10);
            
            // Değer etiketi
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(`${completions[index]}%`, x, y - 10);
        });
        
        ctx.stroke();
    }

    // Tamamlama oranı grafiği
    renderCompletionChart() {
        const container = document.getElementById('completion-chart');
        if (!container || !this.stats.completion) return;
        
        const { completed, pending, missed } = this.stats.completion;
        const total = completed + pending + missed;
        
        container.innerHTML = `
            <div class="completion-stats">
                <div class="completion-item success">
                    <div class="completion-label">Tamamlanan</div>
                    <div class="completion-bar">
                        <div class="completion-fill" style="width: ${(completed / total) * 100}%"></div>
                    </div>
                    <div class="completion-value">${completed} (${Math.round((completed / total) * 100)}%)</div>
                </div>
                
                <div class="completion-item warning">
                    <div class="completion-label">Bekleyen</div>
                    <div class="completion-bar">
                        <div class="completion-fill" style="width: ${(pending / total) * 100}%"></div>
                    </div>
                    <div class="completion-value">${pending} (${Math.round((pending / total) * 100)}%)</div>
                </div>
                
                <div class="completion-item danger">
                    <div class="completion-label">Kaçırılan</div>
                    <div class="completion-bar">
                        <div class="completion-fill" style="width: ${(missed / total) * 100}%"></div>
                    </div>
                    <div class="completion-value">${missed} (${Math.round((missed / total) * 100)}%)</div>
                </div>
            </div>
        `;
    }

    // Üretkenlik grafiği
    renderProductivityChart() {
        const container = document.getElementById('productivity-chart');
        if (!container || !this.stats.productivity) return;
        
        const { bestDay, bestTime, peakHours } = this.stats.productivity;
        
        container.innerHTML = `
            <div class="productivity-insights">
                <div class="insight-card">
                    <i class="fas fa-calendar-star"></i>
                    <div>
                        <div class="insight-label">En Üretken Gün</div>
                        <div class="insight-value">${bestDay}</div>
                    </div>
                </div>
                
                <div class="insight-card">
                    <i class="fas fa-clock"></i>
                    <div>
                        <div class="insight-label">En Verimli Saat</div>
                        <div class="insight-value">${bestTime}</div>
                    </div>
                </div>
                
                <div class="insight-card">
                    <i class="fas fa-chart-line"></i>
                    <div>
                        <div class="insight-label">Zirve Saatleri</div>
                        <div class="insight-value">${peakHours}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // İstatistik kartlarını güncelle
    updateStatsCards() {
        const container = document.getElementById('stats-cards');
        if (!container) return;
        
        const totalPlans = planManager?.plans.length || 0;
        const completedPlans = planManager?.plans.filter(p => p.completed).length || 0;
        const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;
        
        // Toplam süre
        let totalDuration = 0;
        if (planManager?.plans) {
            totalDuration = planManager.plans.reduce((total, plan) => {
                return total + utils.calculateDuration(plan.start, plan.end);
            }, 0);
        }
        
        // Ortalama günlük süre
        const daysActive = this.calculateActiveDays();
        const avgDailyDuration = daysActive > 0 ? Math.round(totalDuration / daysActive) : 0;
        
        // En aktif kategori
        const categories = {};
        if (planManager?.plans) {
            planManager.plans.forEach(plan => {
                categories[plan.category] = (categories[plan.category] || 0) + 1;
            });
        }
        
        const mostActiveCategory = Object.keys(categories).length > 0
            ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b)
            : 'Henüz yok';
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card-large">
                    <div class="stat-icon-large primary">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="stat-info-large">
                        <div class="stat-value-large">${totalPlans}</div>
                        <div class="stat-label-large">Toplam Plan</div>
                        <div class="stat-change">+${this.stats.trends.length > 0 ? this.stats.trends[this.stats.trends.length - 1].totalPlans - (this.stats.trends.length > 1 ? this.stats.trends[this.stats.trends.length - 2].totalPlans : 0) : 0} geçen haftaya göre</div>
                    </div>
                </div>
                
                <div class="stat-card-large">
                    <div class="stat-icon-large success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info-large">
                        <div class="stat-value-large">${completionRate}%</div>
                        <div class="stat-label-large">Tamamlama Oranı</div>
                        <div class="stat-change">+${this.stats.trends.length > 0 ? this.stats.trends[this.stats.trends.length - 1].completionRate - (this.stats.trends.length > 1 ? this.stats.trends[this.stats.trends.length - 2].completionRate : 0) : 0}% geçen haftaya göre</div>
                    </div>
                </div>
                
                <div class="stat-card-large">
                    <div class="stat-icon-large warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info-large">
                        <div class="stat-value-large">${utils.formatDuration(totalDuration)}</div>
                        <div class="stat-label-large">Toplam Süre</div>
                        <div class="stat-change">Ortalama günlük: ${utils.formatDuration(avgDailyDuration)}</div>
                    </div>
                </div>
                
                <div class="stat-card-large">
                    <div class="stat-icon-large accent">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-info-large">
                        <div class="stat-value-large">${mostActiveCategory.charAt(0).toUpperCase() + mostActiveCategory.slice(1)}</div>
                        <div class="stat-label-large">En Aktif Kategori</div>
                        <div class="stat-change">${categories[mostActiveCategory] || 0} plan</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Yardımcı fonksiyonlar
    calculateWeeklyStats(plans) {
        const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
        const weeklyStats = {};
        
        days.forEach(day => {
            weeklyStats[day.substring(0, 3)] = 0;
        });
        
        plans.forEach(plan => {
            const dayIndex = new Date(plan.start).getDay();
            const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1].substring(0, 3); // Pzt, Sal, vs.
            const duration = utils.calculateDuration(plan.start, plan.end) / 60; // Saate çevir
            
            weeklyStats[dayName] = (weeklyStats[dayName] || 0) + duration;
        });
        
        return weeklyStats;
    }

    calculateMonthlyStats(plans) {
        const monthlyStats = {};
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        for (let i = 0; i < 12; i++) {
            const month = new Date(currentYear, currentMonth - i, 1);
            const monthName = month.toLocaleDateString('tr-TR', { month: 'short' });
            monthlyStats[monthName] = 0;
        }
        
        plans.forEach(plan => {
            const planDate = new Date(plan.start);
            const monthName = planDate.toLocaleDateString('tr-TR', { month: 'short' });
            const duration = utils.calculateDuration(plan.start, plan.end) / 60;
            
            monthlyStats[monthName] = (monthlyStats[monthName] || 0) + duration;
        });
        
        return monthlyStats;
    }

    calculateCategoryStats(plans) {
        const categoryStats = {};
        
        plans.forEach(plan => {
            categoryStats[plan.category] = (categoryStats[plan.category] || 0) + 1;
        });
        
        return categoryStats;
    }

    calculateTrends(plans) {
        const trends = [];
        const today = new Date();
        
        // Son 4 haftayı hesapla
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - (i * 7));
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const weekPlans = plans.filter(plan => {
                const planDate = new Date(plan.start);
                return planDate >= weekStart && planDate <= weekEnd;
            });
            
            const totalPlans = weekPlans.length;
            const completedPlans = weekPlans.filter(p => p.completed).length;
            const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;
            
            trends.push({
                week: `Hafta ${4 - i}`,
                totalPlans,
                completedPlans,
                completionRate
            });
        }
        
        return trends;
    }

    calculateCompletionStats(plans) {
        const now = new Date();
        
        const completed = plans.filter(p => p.completed).length;
        const pending = plans.filter(p => !p.completed && new Date(p.end) > now).length;
        const missed = plans.filter(p => !p.completed && new Date(p.end) <= now).length;
        
        return { completed, pending, missed };
    }

    calculateProductivityStats(plans) {
        if (plans.length === 0) {
            return {
                bestDay: 'Henüz yok',
                bestTime: 'Henüz yok',
                peakHours: 'Henüz yok'
            };
        }
        
        // Günlere göre plan sayısı
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const dayCounts = {};
        days.forEach(day => dayCounts[day] = 0);
        
        plans.forEach(plan => {
            const dayIndex = new Date(plan.start).getDay();
            dayCounts[days[dayIndex]]++;
        });
        
        const bestDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);
        
        // Saatlere göre verimlilik
        const hourCounts = {};
        for (let i = 0; i < 24; i++) hourCounts[i] = 0;
        
        plans.forEach(plan => {
            const hour = new Date(plan.start).getHours();
            hourCounts[hour]++;
        });
        
        const bestHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
        const bestTime = `${bestHour}:00`;
        
        // Zirve saatleri (en yoğun 3 saat)
        const sortedHours = Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => `${hour}:00`);
        
        return {
            bestDay,
            bestTime,
            peakHours: sortedHours.join(', ')
        };
    }

    calculateActiveDays() {
        if (!planManager?.plans) return 0;
        
        const uniqueDates = new Set();
        planManager.plans.forEach(plan => {
            const dateStr = utils.formatDate(plan.start, 'short');
            uniqueDates.add(dateStr);
        });
        
        return uniqueDates.size;
    }

    // Period değiştirme
    switchPeriod(period) {
        // Butonları güncelle
        document.querySelectorAll('.stats-period-btn').forEach(btn => {
            if (btn.dataset.period === period) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // İstatistikleri yeniden hesapla ve göster
        this.loadStatistics();
        this.renderCharts();
        
        utils.showToast(`${period === 'weekly' ? 'Haftalık' : period === 'monthly' ? 'Aylık' : 'Tüm zaman'} istatistikler gösteriliyor`, 'info');
    }

    // İstatistikleri yenile
    refreshStatistics() {
        this.loadStatistics();
        this.renderCharts();
        utils.showToast('İstatistikler yenilendi', 'success');
    }

    // İstatistikleri dışa aktar
    exportStatistics() {
        const data = {
            user: this.user.name,
            exportDate: new Date().toISOString(),
            statistics: this.stats
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `smarttime_stats_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        utils.showToast('İstatistikler başarıyla dışa aktarıldı', 'success');
    }
}

// Global instance oluştur
window.statisticsManager = new StatisticsManager();