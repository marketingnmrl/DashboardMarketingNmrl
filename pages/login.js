import Head from 'next/head';

export default function LoginPage({ error, configError }) {
  return (
    <>
      <Head>
        <title>Login - Marketing na Moral</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="login-page">
        <div className="card">
          <div className="logo-wrap">
            <img src="/logo.webp" alt="Marketing na Moral" />
          </div>
          <h1>Acesso ao Dashboard</h1>
          <p>Entre com seu usuario para continuar.</p>

          {configError && <div className="alert warn">{configError}</div>}
          {error && <div className="alert error">{error}</div>}

          <form method="POST" action="/api/auth/login">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="username" required />

            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />

            <button type="submit">Entrar</button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .login-page {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top, #2d2d8c 0%, #1a1a5e 45%, #f4f5fa 45%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
        }
        .card {
          width: min(420px, 92vw);
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8e8ef;
          padding: 26px;
          box-shadow: 0 20px 50px rgba(26, 26, 62, 0.18);
        }
        .logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 42px;
        }
        .logo-wrap img {
          height: 47px;
          width: auto;
          object-fit: contain;
        }
        h1 {
          margin: 0 0 6px 0;
          color: #1a1a3e;
          font-size: 24px;
        }
        p {
          margin: 0 0 18px 0;
          color: #6b6f8c;
          font-size: 14px;
        }
        label {
          display: block;
          margin-bottom: 6px;
          color: #3e4161;
          font-size: 13px;
          font-weight: 600;
        }
        input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid #d8d8e5;
          border-radius: 10px;
          margin-bottom: 14px;
          font-size: 14px;
        }
        button {
          width: 100%;
          border: 0;
          border-radius: 10px;
          padding: 11px 12px;
          background: #2d2d8c;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .alert {
          margin-bottom: 14px;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
        }
        .alert.error {
          background: #fde8e8;
          color: #a52727;
          border: 1px solid #f7cccc;
        }
        .alert.warn {
          background: #fff7db;
          color: #815900;
          border: 1px solid #ffe6a3;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(context) {
  const { AUTH_COOKIE_NAME, verifyAuthToken } = require('../services/auth');
  const token = context.req.cookies?.[AUTH_COOKIE_NAME];
  if (token && verifyAuthToken(token)) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }

  const error = context.query.error ? 'E-mail ou senha invalidos.' : null;
  const configError = context.query.config_error ? 'Configuracao de autenticacao ausente.' : null;

  return {
    props: {
      error,
      configError
    }
  };
}
