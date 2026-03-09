/* ======================================
   NexBot Admin Panel — JavaScript
   ====================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Defaults ----
    const DEFAULT_EMAIL = 'admin@nexbot.com';
    const DEFAULT_PASSWORD = 'admin123';

    // ---- State ----
    let currentPage = 'dashboard';

    // ---- LocalStorage Keys ----
    const KEYS = {
        leads: 'nexbot_leads',
        auth: 'nexbot_admin_auth',
        credentials: 'nexbot_admin_credentials',
        emailjs: 'nexbot_emailjs_config'
    };

    // ---- Helpers ----
    function getLeads() {
        return JSON.parse(localStorage.getItem(KEYS.leads) || '[]');
    }

    function saveLeads(leads) {
        localStorage.setItem(KEYS.leads, JSON.stringify(leads));
    }

    function getCredentials() {
        const stored = localStorage.getItem(KEYS.credentials);
        if (stored) return JSON.parse(stored);
        return { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD };
    }

    function isLoggedIn() {
        return localStorage.getItem(KEYS.auth) === 'true';
    }

    function formatDate(isoString) {
        const d = new Date(isoString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    function timeAgo(isoString) {
        const now = new Date();
        const date = new Date(isoString);
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Agora mesmo';
        if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
        if (diff < 604800) return `${Math.floor(diff/86400)}d atrás`;
        return formatDate(isoString);
    }

    function getInitials(name) {
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    function statusLabel(status) {
        const labels = {
            novo: '🔵 Novo',
            atendendo: '🟡 Atendendo',
            convertido: '🟢 Convertido',
            arquivado: '⚫ Arquivado'
        };
        return labels[status] || status;
    }

    // ---- Auth ----
    function showLogin() {
        document.getElementById('login-screen').style.display = '';
        document.getElementById('admin-panel').style.display = 'none';
    }

    function showAdmin() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        updateTopbarDate();
        navigateTo('dashboard');
    }

    function updateTopbarDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('topbar-date').textContent = now.toLocaleDateString('pt-BR', options);
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const creds = getCredentials();

        if (email === creds.email && password === creds.password) {
            localStorage.setItem(KEYS.auth, 'true');
            document.getElementById('login-error').textContent = '';
            showAdmin();
        } else {
            document.getElementById('login-error').textContent = 'Email ou senha incorretos.';
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(KEYS.auth);
        showLogin();
    });

    // Initial check
    if (isLoggedIn()) {
        showAdmin();
    } else {
        showLogin();
    }

    // ---- Navigation ----
    function navigateTo(page) {
        currentPage = page;

        // Update nav
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === page);
        });

        // Update pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) targetPage.classList.add('active');

        // Update title
        const titles = { dashboard: 'Dashboard', leads: 'Leads & Mensagens', settings: 'Configurações' };
        document.getElementById('page-title').textContent = titles[page] || page;

        // Load page data
        if (page === 'dashboard') loadDashboard();
        if (page === 'leads') loadLeads();
        if (page === 'settings') loadSettings();

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
    }

    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.getAttribute('data-page'));
        });
    });

    // "View all leads" button on dashboard
    document.getElementById('view-all-leads').addEventListener('click', () => navigateTo('leads'));

    // ---- Mobile Sidebar ----
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('sidebar-close').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });

    // ---- Dashboard ----
    function loadDashboard() {
        const leads = getLeads();
        const today = new Date().toDateString();

        const totalLeads = leads.length;
        const newLeads = leads.filter(l => l.status === 'novo').length;
        const attendingLeads = leads.filter(l => l.status === 'atendendo').length;
        const convertedLeads = leads.filter(l => l.status === 'convertido').length;
        const todayLeads = leads.filter(l => new Date(l.date).toDateString() === today).length;

        document.getElementById('metric-total').textContent = totalLeads;
        document.getElementById('metric-new').textContent = newLeads;
        document.getElementById('metric-attending').textContent = attendingLeads;
        document.getElementById('metric-converted').textContent = convertedLeads;

        document.getElementById('trend-total').textContent = `+${todayLeads} hoje`;
        document.getElementById('trend-new').textContent = newLeads > 0 ? `${newLeads} aguardando` : 'Nenhum';
        document.getElementById('trend-attending').textContent = attendingLeads > 0 ? `${attendingLeads} ativos` : 'Nenhum';
        document.getElementById('trend-converted').textContent = convertedLeads > 0 ? `${convertedLeads} total` : 'Nenhum';

        if (newLeads > 0) document.getElementById('trend-new').classList.add('up');
        else document.getElementById('trend-new').classList.remove('up');

        // Badge
        document.getElementById('leads-badge').textContent = newLeads;

        // Recent leads
        renderRecentLeads(leads.slice(0, 5));

        // Chart
        renderChart();

        // Distribution
        renderDistribution(leads);
    }

    function renderRecentLeads(leads) {
        const container = document.getElementById('recent-leads-list');
        if (leads.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/><path d="M24 16V32M16 24H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    <p>Nenhum lead recebido ainda</p>
                    <span>Os contatos da landing page aparecerão aqui</span>
                </div>
            `;
            return;
        }

        container.innerHTML = leads.map(lead => `
            <div class="recent-lead-item" data-id="${lead.id}">
                <div class="status-dot ${lead.status}"></div>
                <div class="lead-avatar">${getInitials(lead.name)}</div>
                <div class="lead-info">
                    <div class="lead-name">${lead.name}</div>
                    <div class="lead-email">${lead.email}</div>
                </div>
                <span class="lead-time">${timeAgo(lead.date)}</span>
            </div>
        `).join('');

        // Click handlers
        container.querySelectorAll('.recent-lead-item').forEach(item => {
            item.addEventListener('click', () => openLeadModal(item.getAttribute('data-id')));
        });
    }

    function renderChart() {
        const leads = getLeads();
        const period = parseInt(document.getElementById('chart-period').value);
        const barsContainer = document.getElementById('chart-bars');
        const labelsContainer = document.getElementById('chart-labels');

        const now = new Date();
        const days = [];

        for (let i = period - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            days.push({
                date: d.toDateString(),
                label: `${d.getDate()}/${d.getMonth()+1}`,
                count: 0
            });
        }

        leads.forEach(lead => {
            const leadDate = new Date(lead.date).toDateString();
            const dayEntry = days.find(d => d.date === leadDate);
            if (dayEntry) dayEntry.count++;
        });

        const maxCount = Math.max(...days.map(d => d.count), 1);

        // Only show up to 14 labels to avoid clutter
        const showEvery = period > 14 ? Math.ceil(period / 14) : 1;

        barsContainer.innerHTML = days.map(d =>
            `<div class="chart-bar" style="height:${Math.max((d.count / maxCount) * 100, 3)}%" data-value="${d.count}"></div>`
        ).join('');

        labelsContainer.innerHTML = days.map((d, i) =>
            `<span class="chart-label">${i % showEvery === 0 ? d.label : ''}</span>`
        ).join('');
    }

    document.getElementById('chart-period').addEventListener('change', renderChart);

    function renderDistribution(leads) {
        const sizes = { '1-10': 0, '11-50': 0, '51-200': 0, '201+': 0 };
        leads.forEach(l => {
            if (sizes[l.companySize] !== undefined) sizes[l.companySize]++;
        });
        const total = leads.length || 1;

        document.getElementById('dist-1-10').textContent = sizes['1-10'];
        document.getElementById('dist-11-50').textContent = sizes['11-50'];
        document.getElementById('dist-51-200').textContent = sizes['51-200'];
        document.getElementById('dist-201').textContent = sizes['201+'];

        document.querySelectorAll('.dist-bar').forEach(bar => {
            const size = bar.getAttribute('data-size');
            const pct = ((sizes[size] || 0) / total) * 100;
            bar.style.width = `${Math.max(pct, 1)}%`;
        });
    }

    // ---- Leads Page ----
    let filteredLeads = [];

    function loadLeads() {
        const leads = getLeads();
        const search = document.getElementById('search-leads').value.toLowerCase().trim();
        const statusFilter = document.getElementById('filter-status').value;

        filteredLeads = leads.filter(lead => {
            const matchesSearch = !search ||
                lead.name.toLowerCase().includes(search) ||
                lead.email.toLowerCase().includes(search) ||
                (lead.phone && lead.phone.toLowerCase().includes(search));

            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        renderLeadsTable(filteredLeads);
    }

    function renderLeadsTable(leads) {
        const tbody = document.getElementById('leads-tbody');
        const emptyState = document.getElementById('leads-empty');

        if (leads.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = '';
            return;
        }

        emptyState.style.display = 'none';
        tbody.innerHTML = leads.map(lead => `
            <tr>
                <td><span class="status-badge ${lead.status}">${statusLabel(lead.status)}</span></td>
                <td style="font-weight:600;color:var(--text-primary);">${lead.name}</td>
                <td>${lead.email}</td>
                <td>${lead.phone}</td>
                <td>${lead.companySize || '—'}</td>
                <td>${formatDate(lead.date)}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn view-lead" data-id="${lead.id}" title="Ver detalhes">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7C1 7 3 2 7 2C11 2 13 7 13 7C13 7 11 12 7 12C3 12 1 7 1 7Z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.2"/></svg>
                        </button>
                        <button class="table-btn change-status" data-id="${lead.id}" title="Alterar status">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <button class="table-btn delete" data-id="${lead.id}" title="Excluir">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M5 4V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V4M3.5 4V11.5C3.5 11.7761 3.72386 12 4 12H10C10.2761 12 10.5 11.7761 10.5 11.5V4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Event listeners
        tbody.querySelectorAll('.view-lead').forEach(btn => {
            btn.addEventListener('click', () => openLeadModal(btn.getAttribute('data-id')));
        });

        tbody.querySelectorAll('.change-status').forEach(btn => {
            btn.addEventListener('click', () => cycleLeadStatus(btn.getAttribute('data-id')));
        });

        tbody.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', () => deleteLead(btn.getAttribute('data-id')));
        });
    }

    // Search & filter
    document.getElementById('search-leads').addEventListener('input', loadLeads);
    document.getElementById('filter-status').addEventListener('change', loadLeads);

    // ---- Lead Actions ----
    function cycleLeadStatus(leadId) {
        const leads = getLeads();
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        const order = ['novo', 'atendendo', 'convertido', 'arquivado'];
        const currentIdx = order.indexOf(lead.status);
        lead.status = order[(currentIdx + 1) % order.length];

        saveLeads(leads);
        loadLeads();
        loadDashboard();
    }

    function deleteLead(leadId) {
        if (!confirm('Tem certeza que deseja excluir este lead?')) return;
        let leads = getLeads();
        leads = leads.filter(l => l.id !== leadId);
        saveLeads(leads);
        loadLeads();
        loadDashboard();
    }

    // ---- Lead Modal ----
    function openLeadModal(leadId) {
        const leads = getLeads();
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="modal-detail">
                <span class="modal-label">Status</span>
                <span class="modal-value"><span class="status-badge ${lead.status}">${statusLabel(lead.status)}</span></span>
                <span class="modal-label">Nome</span>
                <span class="modal-value">${lead.name}</span>
                <span class="modal-label">E-mail</span>
                <span class="modal-value"><a href="mailto:${lead.email}" style="color:var(--primary-light)">${lead.email}</a></span>
                <span class="modal-label">Telefone</span>
                <span class="modal-value">${lead.phone || 'Não informado'}</span>
                <span class="modal-label">Empresa</span>
                <span class="modal-value">${lead.companySize || 'Não informado'}</span>
                <span class="modal-label">Data</span>
                <span class="modal-value">${formatDate(lead.date)}</span>
                <span class="modal-label">Origem</span>
                <span class="modal-value">${lead.source || 'Landing Page'}</span>
            </div>
            <div class="modal-message">
                <span class="modal-label" style="display:block;margin-bottom:8px;">Mensagem</span>
                <p>${lead.message || 'Sem mensagem'}</p>
            </div>
            <div class="modal-actions">
                <button class="btn-action" id="modal-status-btn" data-id="${lead.id}">
                    ✅ Alterar Status
                </button>
                <button class="btn-action" onclick="window.open('mailto:${lead.email}', '_blank')">
                    📧 Responder por Email
                </button>
                ${lead.phone && lead.phone !== 'Não informado' ? `
                <button class="btn-action" onclick="window.open('https://wa.me/55${lead.phone.replace(/\\D/g, '')}', '_blank')">
                    💬 WhatsApp
                </button>
                ` : ''}
            </div>
        `;

        document.getElementById('modal-status-btn').addEventListener('click', () => {
            cycleLeadStatus(leadId);
            openLeadModal(leadId); // Refresh modal
        });

        document.getElementById('modal-overlay').classList.add('active');
    }

    // Close modal
    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.remove('active');
    });
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('modal-overlay').classList.remove('active');
        }
    });

    // ---- Export CSV ----
    document.getElementById('export-csv').addEventListener('click', () => {
        const leads = filteredLeads.length > 0 ? filteredLeads : getLeads();
        if (leads.length === 0) {
            alert('Nenhum lead para exportar.');
            return;
        }

        const headers = ['Nome', 'Email', 'Telefone', 'Tamanho Empresa', 'Mensagem', 'Status', 'Data'];
        const rows = leads.map(l => [
            l.name,
            l.email,
            l.phone,
            l.companySize,
            `"${(l.message || '').replace(/"/g, '""')}"`,
            l.status,
            formatDate(l.date)
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nexbot_leads_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    });

    // ---- Settings ----
    function loadSettings() {
        const creds = getCredentials();
        document.getElementById('settings-email').value = creds.email;

        const emailjsConfig = JSON.parse(localStorage.getItem(KEYS.emailjs) || '{}');
        document.getElementById('emailjs-public-key').value = emailjsConfig.publicKey || '';
        document.getElementById('emailjs-service-id').value = emailjsConfig.serviceId || '';
        document.getElementById('emailjs-template-id').value = emailjsConfig.templateId || '';
    }

    // Save credentials
    document.getElementById('save-credentials').addEventListener('click', () => {
        const email = document.getElementById('settings-email').value.trim();
        const password = document.getElementById('settings-password').value;
        const confirm = document.getElementById('settings-password-confirm').value;
        const msgEl = document.getElementById('credentials-msg');

        if (!email) {
            msgEl.textContent = 'Informe o e-mail.';
            msgEl.className = 'settings-msg error';
            return;
        }

        if (password && password !== confirm) {
            msgEl.textContent = 'As senhas não coincidem.';
            msgEl.className = 'settings-msg error';
            return;
        }

        const creds = getCredentials();
        creds.email = email;
        if (password) creds.password = password;

        localStorage.setItem(KEYS.credentials, JSON.stringify(creds));
        msgEl.textContent = '✅ Credenciais salvas com sucesso!';
        msgEl.className = 'settings-msg success';
        document.getElementById('settings-password').value = '';
        document.getElementById('settings-password-confirm').value = '';

        setTimeout(() => { msgEl.textContent = ''; }, 3000);
    });

    // Save EmailJS config
    document.getElementById('save-emailjs').addEventListener('click', () => {
        const config = {
            publicKey: document.getElementById('emailjs-public-key').value.trim(),
            serviceId: document.getElementById('emailjs-service-id').value.trim(),
            templateId: document.getElementById('emailjs-template-id').value.trim()
        };
        const msgEl = document.getElementById('emailjs-msg');

        localStorage.setItem(KEYS.emailjs, JSON.stringify(config));
        msgEl.textContent = '✅ Configuração salva! Atualize a landing page para usar os novos IDs.';
        msgEl.className = 'settings-msg success';

        setTimeout(() => { msgEl.textContent = ''; }, 4000);
    });

    // Clear leads
    document.getElementById('clear-leads').addEventListener('click', () => {
        if (!confirm('Tem certeza que deseja excluir TODOS os leads? Esta ação é irreversível.')) return;
        localStorage.removeItem(KEYS.leads);
        loadDashboard();
        loadLeads();
        alert('Todos os leads foram excluídos.');
    });

    // Reset settings
    document.getElementById('reset-settings').addEventListener('click', () => {
        if (!confirm('Resetar todas as configurações para os valores padrão?')) return;
        localStorage.removeItem(KEYS.credentials);
        localStorage.removeItem(KEYS.emailjs);
        loadSettings();
        alert('Configurações resetadas.');
    });

    // ---- Auto-refresh dashboard every 30s ----
    setInterval(() => {
        if (currentPage === 'dashboard') loadDashboard();
    }, 30000);

});
