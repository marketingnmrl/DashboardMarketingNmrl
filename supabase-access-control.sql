-- ================================================
-- SISTEMA DE NÍVEIS DE ACESSO
-- Execute este script no Supabase SQL Editor
-- ================================================

-- 1. Tabela de Níveis de Acesso
CREATE TABLE IF NOT EXISTS access_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    allowed_routes TEXT[] DEFAULT '{}',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Usuários da Organização
CREATE TABLE IF NOT EXISTS org_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    access_level_id UUID REFERENCES access_levels(id) ON DELETE SET NULL,
    is_owner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email)
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_org_users_auth_user_id ON org_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_org_users_email ON org_users(email);
CREATE INDEX IF NOT EXISTS idx_org_users_access_level ON org_users(access_level_id);

-- 4. Row Level Security
ALTER TABLE access_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view access levels" ON access_levels;
DROP POLICY IF EXISTS "Admins can manage access levels" ON access_levels;
DROP POLICY IF EXISTS "Users can view org users" ON org_users;
DROP POLICY IF EXISTS "Admins can manage org users" ON org_users;

-- Simple policies: authenticated users can do everything
-- (access control is handled in the application layer)
CREATE POLICY "Allow all for authenticated users on access_levels"
    ON access_levels FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on org_users"
    ON org_users FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Criar nível de acesso padrão "Administrador"
INSERT INTO access_levels (name, description, is_admin, allowed_routes)
VALUES (
    'Administrador',
    'Acesso total a todas as funcionalidades',
    true,
    ARRAY[
        '/',
        '/campanhas',
        '/crm/pipelines',
        '/crm/configuracoes',
        '/funis',
        '/analise/alcance',
        '/analise/trafego',
        '/analise/conteudo',
        '/analise/eficiencia',
        '/analise/investimentos',
        '/conversoes/leads',
        '/conversoes/financeiro',
        '/eventos',
        '/eventos/trimestral',
        '/eventos/mensal',
        '/eventos/anual',
        '/gestao/campanhas',
        '/gestao/relatorios',
        '/configuracoes',
        '/placar-semanal'
    ]
) ON CONFLICT DO NOTHING;

-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_access_levels_updated_at ON access_levels;
CREATE TRIGGER update_access_levels_updated_at
    BEFORE UPDATE ON access_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_users_updated_at ON org_users;
CREATE TRIGGER update_org_users_updated_at
    BEFORE UPDATE ON org_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Após criar as tabelas, adicione seu usuário como owner:
--    
--    INSERT INTO org_users (auth_user_id, email, name, access_level_id, is_owner)
--    SELECT 
--        auth.uid(),
--        'seu-email@exemplo.com',
--        'Seu Nome',
--        (SELECT id FROM access_levels WHERE name = 'Administrador'),
--        true;
-- ================================================

-- ================================================
-- INTEGRAÇÃO COM CRM
-- Adiciona campos de responsável aos leads
-- ================================================

-- Adicionar campo de responsável nos leads
ALTER TABLE crm_leads 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES org_users(id) ON DELETE SET NULL;

-- Adicionar campo de quem moveu no histórico
ALTER TABLE crm_lead_stage_history 
ADD COLUMN IF NOT EXISTS moved_by UUID REFERENCES org_users(id) ON DELETE SET NULL;

-- Índice para buscar leads por responsável
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_to ON crm_leads(assigned_to);

-- ================================================
-- ATUALIZAR RLS DO CRM PARA ACESSO COMPARTILHADO
-- Permite que todos usuários autenticados vejam os mesmos dados
-- ================================================

-- Remover policies antigas do CRM
DROP POLICY IF EXISTS "Users can view own pipelines" ON crm_pipelines;
DROP POLICY IF EXISTS "Users can create own pipelines" ON crm_pipelines;
DROP POLICY IF EXISTS "Users can update own pipelines" ON crm_pipelines;
DROP POLICY IF EXISTS "Users can delete own pipelines" ON crm_pipelines;

DROP POLICY IF EXISTS "Users can view stages of own pipelines" ON crm_pipeline_stages;
DROP POLICY IF EXISTS "Users can create stages in own pipelines" ON crm_pipeline_stages;
DROP POLICY IF EXISTS "Users can update stages in own pipelines" ON crm_pipeline_stages;
DROP POLICY IF EXISTS "Users can delete stages in own pipelines" ON crm_pipeline_stages;

DROP POLICY IF EXISTS "Users can view own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can create own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can update own leads" ON crm_leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON crm_leads;

DROP POLICY IF EXISTS "Users can view history of own leads" ON crm_lead_stage_history;
DROP POLICY IF EXISTS "Users can create history for own leads" ON crm_lead_stage_history;
DROP POLICY IF EXISTS "Users can delete history of own leads" ON crm_lead_stage_history;

DROP POLICY IF EXISTS "Users can view interactions of own leads" ON crm_lead_interactions;
DROP POLICY IF EXISTS "Users can create interactions for own leads" ON crm_lead_interactions;

-- Novas policies: todos autenticados podem acessar
CREATE POLICY "Authenticated can view all pipelines" ON crm_pipelines
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage all pipelines" ON crm_pipelines
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can view all stages" ON crm_pipeline_stages
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage all stages" ON crm_pipeline_stages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can view all leads" ON crm_leads
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage all leads" ON crm_leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can view all history" ON crm_lead_stage_history
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage all history" ON crm_lead_stage_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can view all interactions" ON crm_lead_interactions
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage all interactions" ON crm_lead_interactions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

