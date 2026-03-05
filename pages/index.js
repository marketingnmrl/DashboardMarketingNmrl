import Head from 'next/head';
import Script from 'next/script';

export default function DashboardPage({ userName, userEmail, avatarLetters }) {
  return (
    <>
      <Head>
        <title>Marketing na Moral - CRM Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/style.css" />
      </Head>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.webp" alt="Marketing na Moral" />
        </div>

        <div className="sidebar-section-title">DASHBOARD</div>
        <button className="sidebar-nav-btn active" onClick={e => window.navigate?.('visao_geral', e.currentTarget)}>
          Visao Geral
        </button>
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('campanhas', e.currentTarget)}>
          Campanhas
        </button>
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('placar', e.currentTarget)}>
          Placar Semanal
        </button>

        <div className="sidebar-section-title">CRM</div>
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('pipelines', e.currentTarget)}>
          Pipelines
        </button>
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('leads', e.currentTarget)}>
          Leads
        </button>
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('recuperacao', e.currentTarget)}>
          Recuperacao
        </button>
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('relatorio_sdr', e.currentTarget)}>
          Relatorio SDR
        </button>

        <hr className="sidebar-divider" />
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('configuracoes', e.currentTarget)}>
          Configuracoes
        </button>
        <button className="sidebar-nav-btn" onClick={e => window.navigate?.('docs_api', e.currentTarget)}>
          Documentacao API
        </button>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{avatarLetters}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-email">{userEmail}</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-header">
          <div className="header-left">
            <div className="header-title">Visao Geral do Desempenho</div>
            <div className="header-subtitle">Metricas consolidadas e analise de resultados.</div>
          </div>
          <div className="header-right">
            <div className="header-icon">!</div>
            <div className="header-avatar">{avatarLetters}</div>
            <form method="POST" action="/api/auth/logout" style={{ marginLeft: '8px' }}>
              <button
                type="submit"
                className="sidebar-nav-btn"
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: '#ffffff1f',
                  color: '#fff'
                }}
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#4a4a6a' }}>Fonte</span>
            <div className="filter-radio-group">
              <input type="radio" name="fonte" id="fonte_todos" value="Todos" defaultChecked />
              <label htmlFor="fonte_todos">Todos</label>
              <input type="radio" name="fonte" id="fonte_hotmart" value="Hotmart" />
              <label htmlFor="fonte_hotmart">Hotmart</label>
              <input type="radio" name="fonte" id="fonte_zouti" value="Zouti" />
              <label htmlFor="fonte_zouti">Zouti</label>
            </div>
          </div>
          <div className="filter-group">
            <label htmlFor="periodo">Periodo</label>
            <select id="periodo" className="filter-select" defaultValue="Ultimos 7 dias">
              <option value="Ultimos 7 dias">Ultimos 7 dias</option>
              <option value="Ultimos 15 dias">Ultimos 15 dias</option>
              <option value="Ultimos 30 dias">Ultimos 30 dias</option>
              <option value="Este mes">Este mes</option>
              <option value="Mes passado">Mes passado</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="conta">Conta</label>
            <select id="conta" className="filter-select">
              <option value="Todas as contas">Todas as contas</option>
              <option value="Conta Principal">Conta Principal</option>
              <option value="Conta Secundaria">Conta Secundaria</option>
            </select>
          </div>
        </div>

        <div className="page-content" id="page-content">
          <div className="loading-spinner">Carregando dados...</div>
        </div>
      </main>

      <Script src="https://cdn.jsdelivr.net/npm/chart.js@4" strategy="beforeInteractive" />
      <Script src="/js/app.js" strategy="afterInteractive" />
    </>
  );
}

export async function getServerSideProps(context) {
  const { AUTH_COOKIE_NAME, verifyAuthToken } = require('../services/auth');
  const token = context.req.cookies?.[AUTH_COOKIE_NAME];
  const authUser = token ? verifyAuthToken(token) : null;

  if (!authUser) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  const userName = authUser.name || authUser.email || 'Usuario';
  const userEmail = authUser.email || '';
  const avatarLetters = String(userName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(value => value[0].toUpperCase())
    .join('') || 'US';

  return {
    props: {
      userName,
      userEmail,
      avatarLetters
    }
  };
}
