let currentPage = 'visao_geral';
let appData = null;
let revenueChart = null;
let salesChart = null;

function resetCharts() {
  if (revenueChart) { revenueChart.destroy(); revenueChart = null; }
  if (salesChart) { salesChart.destroy(); salesChart = null; }
}

function renderLoadingState(message = 'Carregando dados...') {
  resetCharts();
  document.getElementById('page-content').innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
}

function navigate(page, btn) {
  currentPage = page;

  document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titles = {
    visao_geral: ['Visão Geral do Desempenho', 'Métricas consolidadas e análise de resultados.'],
    campanhas: ['Campanhas', 'Desempenho por produto e oferta.'],
    placar: ['Placar Semanal', 'Ranking semanal de desempenho.'],
    pipelines: ['Pipelines', 'Funil de vendas e acompanhamento de leads.'],
    leads: ['Leads', 'Base completa de leads e compradores.'],
    recuperacao: ['Recuperação', 'Transações pendentes, canceladas e reembolsadas.'],
    relatorio_sdr: ['Relatório SDR', 'Métricas consolidadas de transações.'],
    configuracoes: ['Configurações', 'Configurações do sistema.'],
    docs_api: ['Documentação API', 'Referência da API Hotmart.']
  };

  const t = titles[page] || ['Dashboard', ''];
  document.querySelector('.header-title').textContent = t[0];
  document.querySelector('.header-subtitle').textContent = t[1];

  renderPage();
}

function getFilters() {
  const fonte = document.querySelector('input[name="fonte"]:checked')?.value || 'Todos';
  const periodo = document.getElementById('periodo')?.value || 'Últimos 7 dias';
  return { fonte, periodo };
}

async function fetchData() {
  const { fonte, periodo } = getFilters();
  const params = new URLSearchParams({ canal: fonte, periodo });

  try {
    renderLoadingState('Buscando dados da Hotmart...');
    const resp = await fetch(`/api/data?${params}`);
    if (!resp.ok) throw new Error('Erro na API');
    appData = await resp.json();
    renderPage();
  } catch (err) {
    console.error('Fetch error:', err);
    resetCharts();
    document.getElementById('page-content').innerHTML =
      '<div class="empty-state">Erro ao carregar dados. Verifique as credenciais da API.</div>';
  }
}

function formatBRL(value) {
  return 'R$ ' + (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(value) {
  return (value || 0).toFixed(1) + '%';
}

function formatNumber(value) {
  return (value || 0).toLocaleString('pt-BR');
}

function renderPage() {
  if (!appData) return;
  const container = document.getElementById('page-content');

  switch (currentPage) {
    case 'visao_geral': renderVisaoGeral(container); break;
    case 'campanhas': renderCampanhas(container); break;
    case 'placar': renderPlacar(container); break;
    case 'pipelines': renderPipelines(container); break;
    case 'leads': renderLeads(container); break;
    case 'recuperacao': renderRecuperacao(container); break;
    case 'relatorio_sdr': renderRelatorioSDR(container); break;
    case 'configuracoes': renderConfiguracoes(container); break;
    case 'docs_api': renderDocsAPI(container); break;
    default: container.innerHTML = '<div class="empty-state">Página não encontrada</div>';
  }
}

function renderVisaoGeral(container) {
  const k = appData.kpis;
  const daily = appData.daily || [];

  const approvedCount = k.vendas || 0;
  const totalTx = k.total_transacoes || 0;
  const taxaHotmart = k.investimento > 0 && k.faturamento > 0 ? ((k.investimento / k.faturamento) * 100) : 0;
  const cpl = k.leads > 0 ? k.investimento / k.leads : 0;

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Faturamento</div>
        <div class="kpi-value">${formatBRL(k.faturamento)}</div>
        <div class="kpi-icon">💰</div>
        <div class="kpi-help"><span class="help-icon">?</span><div class="help-tooltip">Soma de price.value das transações aprovadas</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Investimento</div>
        <div class="kpi-value">${formatBRL(k.investimento)}</div>
        <div class="kpi-icon">📉</div>
        <div class="kpi-help"><span class="help-icon">?</span><div class="help-tooltip">Soma de hotmart_fee.total das aprovadas</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Vendas</div>
        <div class="kpi-value">${formatNumber(k.vendas)}</div>
        <div class="kpi-icon">🛒</div>
        <div class="kpi-help"><span class="help-icon">?</span><div class="help-tooltip">Transações com status APPROVED ou COMPLETE</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Leads Totais</div>
        <div class="kpi-value">${formatNumber(k.leads)}</div>
        <div class="kpi-icon">👥</div>
        <div class="kpi-help"><span class="help-icon">?</span><div class="help-tooltip">Total de transações excluindo CANCELLED</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Taxa de Conversão</div>
        <div class="kpi-value">${formatPercent(k.conversao)}</div>
        <div class="kpi-icon">📈</div>
        <div class="kpi-help"><span class="help-icon">?</span><div class="help-tooltip">Vendas aprovadas / total de transações × 100</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">ROAS</div>
        <div class="kpi-value">${k.roas ? k.roas.toFixed(2) + 'x' : '0.00x'}</div>
        <div class="kpi-icon">🎯</div>
        <div class="kpi-help"><span class="help-icon">?</span><div class="help-tooltip">Faturamento / Investimento</div></div>
      </div>
    </div>

    <div class="metrics-card">
      <div class="metrics-title">📊 Métricas de Vendas</div>
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">Transações</div>
          <div class="metric-value">${formatNumber(totalTx)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Aprovadas</div>
          <div class="metric-value">${formatNumber(approvedCount)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Conversão</div>
          <div class="metric-value">${formatPercent(k.conversao)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Ticket Médio</div>
          <div class="metric-value">${formatBRL(k.ticket_medio)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Taxa Hotmart</div>
          <div class="metric-value">${formatPercent(taxaHotmart)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">CPL</div>
          <div class="metric-value">${formatBRL(cpl)}</div>
        </div>
      </div>
    </div>

    <div class="daily-section">
      <div class="daily-title">📅 Dados Diários</div>
      <div class="daily-subtitle">Faturamento e vendas por dia no período selecionado</div>
      <div class="charts-row">
        <div class="chart-container"><canvas id="revenueChart"></canvas></div>
        <div class="chart-container"><canvas id="salesChart"></canvas></div>
      </div>
    </div>
  `;

  renderCharts(daily);
}

function renderCharts(daily) {
  resetCharts();

  const labels = daily.map(d => {
    const parts = d.data.split('-');
    return parts[2] + '/' + parts[1];
  });
  const revData = daily.map(d => d.faturamento);
  const salesData = daily.map(d => d.vendas);

  const revCtx = document.getElementById('revenueChart');
  const salesCtx = document.getElementById('salesChart');
  if (!revCtx || !salesCtx) return;

  revenueChart = new Chart(revCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Faturamento (R$)',
        data: revData,
        backgroundColor: 'rgba(45, 45, 140, 0.7)',
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => 'R$ ' + ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => 'R$ ' + (v / 1000).toFixed(0) + 'k',
            font: { size: 11 }
          },
          grid: { color: '#f0f0f5' }
        },
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });

  salesChart = new Chart(salesCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Vendas',
        data: salesData,
        backgroundColor: 'rgba(200, 230, 74, 0.8)',
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { font: { size: 11 }, stepSize: 1 },
          grid: { color: '#f0f0f5' }
        },
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderCampanhas(container) {
  const products = appData.products || {};
  const entries = Object.entries(products);

  let rows = '';
  for (const [name, data] of entries) {
    const conv = data.transacoes > 0 ? ((data.vendas / data.transacoes) * 100).toFixed(1) + '%' : '0.0%';
    rows += `<tr>
      <td>${name}</td>
      <td>${formatNumber(data.transacoes)}</td>
      <td>${formatNumber(data.vendas)}</td>
      <td>${formatBRL(data.faturamento)}</td>
      <td>${conv}</td>
    </tr>`;
  }

  if (!rows) {
    rows = '<tr><td colspan="5" style="text-align:center;color:#9a9aaf;padding:20px;">Nenhum produto encontrado</td></tr>';
  }

  container.innerHTML = `
    <div class="section-title">Campanhas</div>
    <div class="section-subtitle">Desempenho por produto Hotmart</div>
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Transações</th>
            <th>Vendas</th>
            <th>Faturamento</th>
            <th>Conversão</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderPlacar(container) {
  container.innerHTML = `
    <div class="section-title">Placar Semanal</div>
    <div class="section-subtitle">Ranking semanal de desempenho</div>
    <div class="data-table-wrapper">
      <div class="empty-state">
        🏆 O placar semanal será atualizado automaticamente com base nos dados das vendas.
      </div>
    </div>
  `;
}

function renderPipelines(container) {
  const p = appData.pipeline || {};
  const stages = ['Novo Lead', 'Contato Feito', 'Qualificado', 'Proposta', 'Fechado'];
  const colors = ['#3498db', '#f39c12', '#9b59b6', '#e67e22', '#27ae60'];
  const total = Object.values(p).reduce((a, b) => a + b, 0);

  let cards = '';
  stages.forEach((stage, i) => {
    const count = p[stage] || 0;
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    cards += `
      <div class="pipeline-card" style="border-top: 3px solid ${colors[i]};">
        <div class="pipeline-stage">${stage}</div>
        <div class="pipeline-count">${count}</div>
        <div class="pipeline-label">${pct}% do total</div>
      </div>`;
  });

  container.innerHTML = `
    <div class="section-title">Pipelines</div>
    <div class="section-subtitle">Funil de vendas baseado no status das transações Hotmart</div>
    <div class="pipeline-grid">${cards}</div>
  `;
}

function renderLeads(container) {
  const leads = appData.leads || [];

  container.innerHTML = `
    <div class="section-title">Leads</div>
    <div class="section-subtitle">Base completa de leads e compradores</div>
    <div class="data-table-wrapper">
      <div class="search-filters">
        <input type="text" class="search-input" id="lead-search" placeholder="Buscar por nome ou email..." oninput="filterLeadsTable()">
        <select class="search-select" id="lead-status-filter" onchange="filterLeadsTable()">
          <option value="">Todos os status</option>
          <option value="Approved">Approved</option>
          <option value="Complete">Complete</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Refunded">Refunded</option>
          <option value="Started">Started</option>
          <option value="Waiting Payment">Waiting Payment</option>
          <option value="Printed Billet">Printed Billet</option>
        </select>
      </div>
      <table class="data-table" id="leads-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Produto</th>
            <th>Valor</th>
            <th>Pagamento</th>
            <th>Status</th>
            <th>Canal</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody id="leads-tbody"></tbody>
      </table>
    </div>
  `;

  renderLeadsRows(leads);
}

function renderLeadsRows(leads) {
  const tbody = document.getElementById('leads-tbody');
  if (!tbody) return;

  if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#9a9aaf;padding:20px;">Nenhum lead encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = leads.map(l => {
    const statusLower = (l.Status || '').toLowerCase().replace(/\s/g, '');
    let statusClass = 'status-pending';
    if (['approved', 'complete'].includes(statusLower)) statusClass = 'status-approved';
    else if (['cancelled', 'refunded', 'chargeback'].includes(statusLower)) statusClass = 'status-cancelled';

    return `<tr>
      <td>${l.Nome}</td>
      <td>${l.Email}</td>
      <td>${l.Produto}</td>
      <td>${formatBRL(l.Valor)}</td>
      <td>${l.Pagamento}</td>
      <td><span class="status-badge ${statusClass}">${l.Status}</span></td>
      <td>${l.Canal}</td>
      <td>${l.Data}</td>
    </tr>`;
  }).join('');
}

function filterLeadsTable() {
  const search = (document.getElementById('lead-search')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('lead-status-filter')?.value || '';

  let filtered = appData.leads || [];
  if (search) {
    filtered = filtered.filter(l =>
      (l.Nome || '').toLowerCase().includes(search) ||
      (l.Email || '').toLowerCase().includes(search)
    );
  }
  if (statusFilter) {
    filtered = filtered.filter(l => l.Status === statusFilter);
  }
  renderLeadsRows(filtered);
}

function renderRecuperacao(container) {
  const leads = appData.recoveryLeads || [];

  container.innerHTML = `
    <div class="section-title">Recuperação</div>
    <div class="section-subtitle">Transações pendentes, canceladas e reembolsadas</div>
    <div class="kpi-grid" style="grid-template-columns: repeat(2, 1fr); max-width: 400px;">
      <div class="kpi-card">
        <div class="kpi-label">Pendentes</div>
        <div class="kpi-value">${formatNumber(appData.pending)}</div>
        <div class="kpi-icon">⏳</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Cancelados/Reembolsados</div>
        <div class="kpi-value">${formatNumber(appData.cancelled)}</div>
        <div class="kpi-icon">❌</div>
      </div>
    </div>
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Produto</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Canal</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${leads.length ? leads.map(l => {
            const statusLower = (l.Status || '').toLowerCase().replace(/\s/g, '');
            let statusClass = 'status-pending';
            if (['cancelled', 'refunded', 'chargeback'].includes(statusLower)) statusClass = 'status-cancelled';
            return `<tr>
              <td>${l.Nome}</td>
              <td>${l.Email}</td>
              <td>${l.Produto}</td>
              <td>${formatBRL(l.Valor)}</td>
              <td><span class="status-badge ${statusClass}">${l.Status}</span></td>
              <td>${l.Canal}</td>
              <td>${l.Data}</td>
            </tr>`;
          }).join('') : '<tr><td colspan="7" style="text-align:center;color:#9a9aaf;padding:20px;">Nenhuma transação para recuperação</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderRelatorioSDR(container) {
  const k = appData.kpis;
  const taxaAprovacao = k.total_transacoes > 0 ? ((k.vendas / k.total_transacoes) * 100) : 0;

  container.innerHTML = `
    <div class="section-title">Relatório SDR</div>
    <div class="section-subtitle">Métricas consolidadas de transações</div>
    <div class="metrics-card">
      <div class="metrics-title">📋 Resumo de Transações</div>
      <div class="metrics-grid cols-4">
        <div class="metric-item">
          <div class="metric-label">Total Transações</div>
          <div class="metric-value">${formatNumber(k.total_transacoes)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Aprovadas</div>
          <div class="metric-value">${formatNumber(k.vendas)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Pendentes</div>
          <div class="metric-value">${formatNumber(appData.pending)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Canceladas</div>
          <div class="metric-value">${formatNumber(appData.cancelled)}</div>
        </div>
      </div>
    </div>
    <div class="metrics-card">
      <div class="metrics-title">💰 Métricas Financeiras</div>
      <div class="metrics-grid cols-4">
        <div class="metric-item">
          <div class="metric-label">Faturamento</div>
          <div class="metric-value">${formatBRL(k.faturamento)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Ticket Médio</div>
          <div class="metric-value">${formatBRL(k.ticket_medio)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Taxa Aprovação</div>
          <div class="metric-value">${formatPercent(taxaAprovacao)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">ROAS</div>
          <div class="metric-value">${k.roas ? k.roas.toFixed(2) + 'x' : '0.00x'}</div>
        </div>
      </div>
    </div>
  `;
}

function renderConfiguracoes(container) {
  container.innerHTML = `
    <div class="section-title">Configurações</div>
    <div class="section-subtitle">Configurações do sistema</div>
    <div class="metrics-card">
      <div class="metrics-title">⚙️ Configurações Gerais</div>
      <div style="padding: 20px 0; color: #4a4a6a; font-size: 14px;">
        <p><strong>Versão:</strong> 2.0.0 (Node.js)</p>
        <p style="margin-top:8px;"><strong>Stack:</strong> Express.js + EJS + Chart.js</p>
        <p style="margin-top:8px;"><strong>API:</strong> Hotmart Sales History v1</p>
        <p style="margin-top:8px;"><strong>Cache:</strong> 5 minutos (in-memory)</p>
        <p style="margin-top:8px;"><strong>Credenciais:</strong> ${['HOTMART_CLIENT_ID', 'HOTMART_CLIENT_SECRET', 'HOTMART_BASIC'].map(k => `<span style="background:#e6f7e6;color:#27ae60;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:4px;">${k} ✓</span>`).join('')}</p>
      </div>
    </div>
  `;
}

function renderDocsAPI(container) {
  container.innerHTML = `
    <div class="section-title">Documentação API</div>
    <div class="section-subtitle">Referência da API utilizada</div>
    <div class="metrics-card">
      <div class="metrics-title">📄 Hotmart API - Sales History</div>
      <div style="padding: 16px 0; color: #4a4a6a; font-size: 14px; line-height: 1.8;">
        <p><strong>Base URL:</strong> <code style="background:#f0f0f5;padding:2px 6px;border-radius:4px;">https://developers.hotmart.com/payments/api/v1</code></p>
        <p><strong>Autenticação:</strong> OAuth2 Client Credentials</p>
        <p><strong>Token URL:</strong> <code style="background:#f0f0f5;padding:2px 6px;border-radius:4px;">https://api-sec-vlc.hotmart.com/security/oauth/token</code></p>
        <hr style="border:none;border-top:1px solid #e8e8ef;margin:16px 0;">
        <p><strong>Endpoint:</strong> <code style="background:#f0f0f5;padding:2px 6px;border-radius:4px;">GET /sales/history</code></p>
        <p><strong>Parâmetros:</strong></p>
        <ul style="margin-left:20px;margin-top:8px;">
          <li><code>start_date</code> — Timestamp de início (ms)</li>
          <li><code>end_date</code> — Timestamp de fim (ms)</li>
          <li><code>transaction_status</code> — Status da transação</li>
          <li><code>max_results</code> — Máximo de resultados por página (50)</li>
          <li><code>page_token</code> — Token para próxima página</li>
        </ul>
        <hr style="border:none;border-top:1px solid #e8e8ef;margin:16px 0;">
        <p><strong>Status possíveis:</strong></p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
          ${['COMPLETE', 'APPROVED', 'CANCELLED', 'REFUNDED', 'EXPIRED', 'OVERDUE', 'STARTED', 'WAITING_PAYMENT', 'PRINTED_BILLET', 'NO_FUNDS', 'CHARGEBACK', 'BLOCKED'].map(s =>
            `<span style="background:#f0f0f5;padding:3px 10px;border-radius:4px;font-size:12px;font-family:monospace;">${s}</span>`
          ).join('')}
        </div>
      </div>
    </div>
  `;
}

document.querySelectorAll('input[name="fonte"]').forEach(r => {
  r.addEventListener('change', fetchData);
});
document.getElementById('periodo')?.addEventListener('change', fetchData);

fetchData();
