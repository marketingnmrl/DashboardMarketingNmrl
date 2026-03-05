const { createClient } = require('@supabase/supabase-js');

function getMissingSupabaseEnv() {
  const missing = [];

  for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return missing;
}

function getSupabaseClient() {
  const missing = getMissingSupabaseEnv();
  if (missing.length > 0) {
    throw new Error(`Variaveis Supabase ausentes: ${missing.join(', ')}`);
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

async function testSupabaseConnection() {
  const missing = getMissingSupabaseEnv();
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Variaveis Supabase ausentes: ${missing.join(', ')}`,
      missing
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        ok: false,
        error: error.message
      };
    }

    return {
      ok: true,
      projectUrl: process.env.SUPABASE_URL,
      buckets: Array.isArray(data) ? data.length : 0
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

module.exports = {
  getSupabaseClient,
  getMissingSupabaseEnv,
  testSupabaseConnection
};
