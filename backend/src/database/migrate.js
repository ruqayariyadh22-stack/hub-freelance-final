import pg from 'pg';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';

const { Client } = pg;

const INITIAL_MIGRATION_ID = '015a_initial_schema';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('client', 'freelancer', 'admin')),
    profile_image TEXT,
    account_status TEXT CHECK (account_status IN ('active', 'disabled')),
    created_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    status TEXT CHECK (status IN ('approved', 'pending', 'rejected')),
    requested_by UUID REFERENCES users (id),
    reviewed_by UUID REFERENCES users (id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users (id),
    company_name TEXT,
    logo TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users (id),
    specialty_id UUID REFERENCES specialties (id),
    bio TEXT,
    experience_years INTEGER,
    rating_avg NUMERIC,
    completed_projects_count INTEGER,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'expired', 'none'))
  )`,
  `CREATE TABLE IF NOT EXISTS freelancer_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL REFERENCES freelancer_profiles (id),
    skill_id UUID NOT NULL REFERENCES skills (id)
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL REFERENCES freelancer_profiles (id),
    title TEXT,
    description TEXT,
    category TEXT,
    price NUMERIC,
    delivery_time INTEGER,
    status TEXT CHECK (status IN ('active', 'hidden'))
  )`,
  `CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users (id),
    balance NUMERIC,
    escrow_balance NUMERIC
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_profiles (id),
    title TEXT,
    description TEXT,
    category TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    duration INTEGER,
    required_skills TEXT[],
    attachments TEXT[],
    status TEXT CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
    chosen_freelancer_id UUID REFERENCES freelancer_profiles (id),
    published_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects (id),
    freelancer_id UUID NOT NULL REFERENCES freelancer_profiles (id),
    proposed_price NUMERIC,
    proposed_duration INTEGER,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
    submitted_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users (id),
    freelancer_id UUID NOT NULL REFERENCES users (id),
    project_id UUID NOT NULL REFERENCES projects (id)
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations (id),
    attachments TEXT[]
  )`,
  `CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES projects (id),
    client_id UUID NOT NULL REFERENCES client_profiles (id),
    freelancer_id UUID NOT NULL REFERENCES freelancer_profiles (id),
    contract_value NUMERIC,
    commission NUMERIC,
    status TEXT CHECK (status IN ('awaiting_escrow', 'in_progress', 'delivered', 'completed')),
    start_date DATE,
    delivery_date DATE,
    payment_status TEXT CHECK (payment_status IN ('pending', 'released'))
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts (id),
    title TEXT,
    description TEXT,
    status TEXT,
    due_date DATE
  )`,
  `CREATE TABLE IF NOT EXISTS scope_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts (id),
    requested_by UUID NOT NULL REFERENCES users (id),
    description TEXT,
    price_adjustment NUMERIC,
    duration_adjustment INTEGER,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected'))
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets (id),
    contract_id UUID REFERENCES contracts (id),
    type TEXT CHECK (type IN ('deposit', 'escrow', 'release', 'withdrawal')),
    commission NUMERIC
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL REFERENCES freelancer_profiles (id),
    plan_type TEXT,
    price NUMERIC,
    start_date DATE,
    end_date DATE,
    status TEXT,
    payment_status TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts (id),
    reviewer_id UUID NOT NULL REFERENCES users (id),
    reviewee_id UUID NOT NULL REFERENCES users (id),
    rating NUMERIC,
    comment TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID NOT NULL REFERENCES users (id),
    reported_against UUID REFERENCES users (id),
    project_id UUID NOT NULL REFERENCES projects (id),
    issue_type TEXT,
    description TEXT,
    evidence_attachments TEXT[],
    status TEXT,
    action_taken TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users (id),
    type TEXT,
    message TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users (id)
  )`,
  `CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects (id)
  )`,
  `CREATE TABLE IF NOT EXISTS ai_matching_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects (id)
  )`,
];

const TRANSACTIONS_AMOUNT_MIGRATION_ID = '015b_transactions_amount';

const TRANSACTIONS_AMOUNT_STATEMENTS = [
  `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount NUMERIC`,
];

const PROJECTS_PENDING_APPROVAL_MIGRATION_ID = '015c_projects_pending_approval';

const PROJECTS_PENDING_APPROVAL_STATEMENTS = [
  `ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check`,
  `ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'open', 'pending_approval', 'in_progress', 'completed', 'cancelled'))`,
];

const NUMERIC_IDS_MIGRATION_ID = '016_numeric_ids';

const NUMERIC_IDS_STATEMENTS = [
  `ALTER TABLE users ADD COLUMN id_new INTEGER`,
  `ALTER TABLE specialties ADD COLUMN id_new INTEGER`,
  `ALTER TABLE skills ADD COLUMN id_new INTEGER`,
  `ALTER TABLE client_profiles ADD COLUMN id_new INTEGER`,
  `ALTER TABLE freelancer_profiles ADD COLUMN id_new INTEGER`,
  `ALTER TABLE freelancer_skills ADD COLUMN id_new INTEGER`,
  `ALTER TABLE services ADD COLUMN id_new INTEGER`,
  `ALTER TABLE wallets ADD COLUMN id_new INTEGER`,
  `ALTER TABLE projects ADD COLUMN id_new INTEGER`,
  `ALTER TABLE proposals ADD COLUMN id_new INTEGER`,
  `ALTER TABLE conversations ADD COLUMN id_new INTEGER`,
  `ALTER TABLE messages ADD COLUMN id_new INTEGER`,
  `ALTER TABLE contracts ADD COLUMN id_new INTEGER`,
  `ALTER TABLE tasks ADD COLUMN id_new INTEGER`,
  `ALTER TABLE scope_changes ADD COLUMN id_new INTEGER`,
  `ALTER TABLE transactions ADD COLUMN id_new INTEGER`,
  `ALTER TABLE subscriptions ADD COLUMN id_new INTEGER`,
  `ALTER TABLE reviews ADD COLUMN id_new INTEGER`,
  `ALTER TABLE disputes ADD COLUMN id_new INTEGER`,
  `ALTER TABLE notifications ADD COLUMN id_new INTEGER`,
  `ALTER TABLE ai_usage_logs ADD COLUMN id_new INTEGER`,
  `ALTER TABLE ai_analysis_results ADD COLUMN id_new INTEGER`,
  `ALTER TABLE ai_matching_results ADD COLUMN id_new INTEGER`,

  `UPDATE users u SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS new_id FROM users
  ) n WHERE u.id = n.id`,
  `UPDATE specialties s SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS new_id FROM specialties
  ) n WHERE s.id = n.id`,
  `UPDATE skills s SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM skills
  ) n WHERE s.id = n.id`,
  `UPDATE client_profiles cp SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM client_profiles
  ) n WHERE cp.id = n.id`,
  `UPDATE freelancer_profiles fp SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM freelancer_profiles
  ) n WHERE fp.id = n.id`,
  `UPDATE freelancer_skills fs SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM freelancer_skills
  ) n WHERE fs.id = n.id`,
  `UPDATE services s SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM services
  ) n WHERE s.id = n.id`,
  `UPDATE wallets w SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM wallets
  ) n WHERE w.id = n.id`,
  `UPDATE projects p SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM projects
  ) n WHERE p.id = n.id`,
  `UPDATE proposals p SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM proposals
  ) n WHERE p.id = n.id`,
  `UPDATE conversations c SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM conversations
  ) n WHERE c.id = n.id`,
  `UPDATE messages m SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM messages
  ) n WHERE m.id = n.id`,
  `UPDATE contracts c SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM contracts
  ) n WHERE c.id = n.id`,
  `UPDATE tasks t SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM tasks
  ) n WHERE t.id = n.id`,
  `UPDATE scope_changes sc SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM scope_changes
  ) n WHERE sc.id = n.id`,
  `UPDATE transactions t SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM transactions
  ) n WHERE t.id = n.id`,
  `UPDATE subscriptions s SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM subscriptions
  ) n WHERE s.id = n.id`,
  `UPDATE reviews r SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM reviews
  ) n WHERE r.id = n.id`,
  `UPDATE disputes d SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM disputes
  ) n WHERE d.id = n.id`,
  `UPDATE notifications n SET id_new = numbered.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS new_id FROM notifications
  ) numbered WHERE n.id = numbered.id`,
  `UPDATE ai_usage_logs a SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM ai_usage_logs
  ) n WHERE a.id = n.id`,
  `UPDATE ai_analysis_results a SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM ai_analysis_results
  ) n WHERE a.id = n.id`,
  `UPDATE ai_matching_results a SET id_new = n.new_id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id FROM ai_matching_results
  ) n WHERE a.id = n.id`,

  `ALTER TABLE users ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE specialties ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE skills ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE client_profiles ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE freelancer_profiles ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE freelancer_skills ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE services ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE wallets ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE projects ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE proposals ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE conversations ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE messages ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE contracts ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE tasks ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE scope_changes ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE transactions ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE subscriptions ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE reviews ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE disputes ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE notifications ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE ai_usage_logs ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE ai_analysis_results ALTER COLUMN id_new SET NOT NULL`,
  `ALTER TABLE ai_matching_results ALTER COLUMN id_new SET NOT NULL`,

  `ALTER TABLE specialties ADD COLUMN requested_by_new INTEGER`,
  `ALTER TABLE specialties ADD COLUMN reviewed_by_new INTEGER`,
  `ALTER TABLE client_profiles ADD COLUMN user_id_new INTEGER`,
  `ALTER TABLE freelancer_profiles ADD COLUMN user_id_new INTEGER`,
  `ALTER TABLE freelancer_profiles ADD COLUMN specialty_id_new INTEGER`,
  `ALTER TABLE freelancer_skills ADD COLUMN freelancer_id_new INTEGER`,
  `ALTER TABLE freelancer_skills ADD COLUMN skill_id_new INTEGER`,
  `ALTER TABLE services ADD COLUMN freelancer_id_new INTEGER`,
  `ALTER TABLE wallets ADD COLUMN user_id_new INTEGER`,
  `ALTER TABLE projects ADD COLUMN client_id_new INTEGER`,
  `ALTER TABLE projects ADD COLUMN chosen_freelancer_id_new INTEGER`,
  `ALTER TABLE proposals ADD COLUMN project_id_new INTEGER`,
  `ALTER TABLE proposals ADD COLUMN freelancer_id_new INTEGER`,
  `ALTER TABLE conversations ADD COLUMN client_id_new INTEGER`,
  `ALTER TABLE conversations ADD COLUMN freelancer_id_new INTEGER`,
  `ALTER TABLE conversations ADD COLUMN project_id_new INTEGER`,
  `ALTER TABLE messages ADD COLUMN conversation_id_new INTEGER`,
  `ALTER TABLE contracts ADD COLUMN project_id_new INTEGER`,
  `ALTER TABLE contracts ADD COLUMN client_id_new INTEGER`,
  `ALTER TABLE contracts ADD COLUMN freelancer_id_new INTEGER`,
  `ALTER TABLE tasks ADD COLUMN contract_id_new INTEGER`,
  `ALTER TABLE scope_changes ADD COLUMN contract_id_new INTEGER`,
  `ALTER TABLE scope_changes ADD COLUMN requested_by_new INTEGER`,
  `ALTER TABLE transactions ADD COLUMN wallet_id_new INTEGER`,
  `ALTER TABLE transactions ADD COLUMN contract_id_new INTEGER`,
  `ALTER TABLE subscriptions ADD COLUMN freelancer_id_new INTEGER`,
  `ALTER TABLE reviews ADD COLUMN contract_id_new INTEGER`,
  `ALTER TABLE reviews ADD COLUMN reviewer_id_new INTEGER`,
  `ALTER TABLE reviews ADD COLUMN reviewee_id_new INTEGER`,
  `ALTER TABLE disputes ADD COLUMN reported_by_new INTEGER`,
  `ALTER TABLE disputes ADD COLUMN reported_against_new INTEGER`,
  `ALTER TABLE disputes ADD COLUMN project_id_new INTEGER`,
  `ALTER TABLE notifications ADD COLUMN user_id_new INTEGER`,
  `ALTER TABLE ai_usage_logs ADD COLUMN user_id_new INTEGER`,
  `ALTER TABLE ai_analysis_results ADD COLUMN project_id_new INTEGER`,
  `ALTER TABLE ai_matching_results ADD COLUMN project_id_new INTEGER`,

  `UPDATE specialties s SET requested_by_new = u.id_new FROM users u WHERE s.requested_by = u.id`,
  `UPDATE specialties s SET reviewed_by_new = u.id_new FROM users u WHERE s.reviewed_by = u.id`,
  `UPDATE client_profiles cp SET user_id_new = u.id_new FROM users u WHERE cp.user_id = u.id`,
  `UPDATE freelancer_profiles fp SET user_id_new = u.id_new FROM users u WHERE fp.user_id = u.id`,
  `UPDATE freelancer_profiles fp SET specialty_id_new = s.id_new FROM specialties s WHERE fp.specialty_id = s.id`,
  `UPDATE freelancer_skills fs SET freelancer_id_new = fp.id_new FROM freelancer_profiles fp WHERE fs.freelancer_id = fp.id`,
  `UPDATE freelancer_skills fs SET skill_id_new = s.id_new FROM skills s WHERE fs.skill_id = s.id`,
  `UPDATE services s SET freelancer_id_new = fp.id_new FROM freelancer_profiles fp WHERE s.freelancer_id = fp.id`,
  `UPDATE wallets w SET user_id_new = u.id_new FROM users u WHERE w.user_id = u.id`,
  `UPDATE projects p SET client_id_new = cp.id_new FROM client_profiles cp WHERE p.client_id = cp.id`,
  `UPDATE projects p SET chosen_freelancer_id_new = fp.id_new FROM freelancer_profiles fp WHERE p.chosen_freelancer_id = fp.id`,
  `UPDATE proposals p SET project_id_new = pr.id_new FROM projects pr WHERE p.project_id = pr.id`,
  `UPDATE proposals p SET freelancer_id_new = fp.id_new FROM freelancer_profiles fp WHERE p.freelancer_id = fp.id`,
  `UPDATE conversations c SET client_id_new = u.id_new FROM users u WHERE c.client_id = u.id`,
  `UPDATE conversations c SET freelancer_id_new = u.id_new FROM users u WHERE c.freelancer_id = u.id`,
  `UPDATE conversations c SET project_id_new = p.id_new FROM projects p WHERE c.project_id = p.id`,
  `UPDATE messages m SET conversation_id_new = c.id_new FROM conversations c WHERE m.conversation_id = c.id`,
  `UPDATE contracts c SET project_id_new = p.id_new FROM projects p WHERE c.project_id = p.id`,
  `UPDATE contracts c SET client_id_new = cp.id_new FROM client_profiles cp WHERE c.client_id = cp.id`,
  `UPDATE contracts c SET freelancer_id_new = fp.id_new FROM freelancer_profiles fp WHERE c.freelancer_id = fp.id`,
  `UPDATE tasks t SET contract_id_new = c.id_new FROM contracts c WHERE t.contract_id = c.id`,
  `UPDATE scope_changes sc SET contract_id_new = c.id_new FROM contracts c WHERE sc.contract_id = c.id`,
  `UPDATE scope_changes sc SET requested_by_new = u.id_new FROM users u WHERE sc.requested_by = u.id`,
  `UPDATE transactions t SET wallet_id_new = w.id_new FROM wallets w WHERE t.wallet_id = w.id`,
  `UPDATE transactions t SET contract_id_new = c.id_new FROM contracts c WHERE t.contract_id = c.id`,
  `UPDATE subscriptions s SET freelancer_id_new = fp.id_new FROM freelancer_profiles fp WHERE s.freelancer_id = fp.id`,
  `UPDATE reviews r SET contract_id_new = c.id_new FROM contracts c WHERE r.contract_id = c.id`,
  `UPDATE reviews r SET reviewer_id_new = u.id_new FROM users u WHERE r.reviewer_id = u.id`,
  `UPDATE reviews r SET reviewee_id_new = u.id_new FROM users u WHERE r.reviewee_id = u.id`,
  `UPDATE disputes d SET reported_by_new = u.id_new FROM users u WHERE d.reported_by = u.id`,
  `UPDATE disputes d SET reported_against_new = u.id_new FROM users u WHERE d.reported_against = u.id`,
  `UPDATE disputes d SET project_id_new = p.id_new FROM projects p WHERE d.project_id = p.id`,
  `UPDATE notifications n SET user_id_new = u.id_new FROM users u WHERE n.user_id = u.id`,
  `UPDATE ai_usage_logs a SET user_id_new = u.id_new FROM users u WHERE a.user_id = u.id`,
  `UPDATE ai_analysis_results a SET project_id_new = p.id_new FROM projects p WHERE a.project_id = p.id`,
  `UPDATE ai_matching_results a SET project_id_new = p.id_new FROM projects p WHERE a.project_id = p.id`,

  `ALTER TABLE client_profiles ALTER COLUMN user_id_new SET NOT NULL`,
  `ALTER TABLE freelancer_profiles ALTER COLUMN user_id_new SET NOT NULL`,
  `ALTER TABLE freelancer_skills ALTER COLUMN freelancer_id_new SET NOT NULL`,
  `ALTER TABLE freelancer_skills ALTER COLUMN skill_id_new SET NOT NULL`,
  `ALTER TABLE services ALTER COLUMN freelancer_id_new SET NOT NULL`,
  `ALTER TABLE wallets ALTER COLUMN user_id_new SET NOT NULL`,
  `ALTER TABLE projects ALTER COLUMN client_id_new SET NOT NULL`,
  `ALTER TABLE proposals ALTER COLUMN project_id_new SET NOT NULL`,
  `ALTER TABLE proposals ALTER COLUMN freelancer_id_new SET NOT NULL`,
  `ALTER TABLE conversations ALTER COLUMN client_id_new SET NOT NULL`,
  `ALTER TABLE conversations ALTER COLUMN freelancer_id_new SET NOT NULL`,
  `ALTER TABLE conversations ALTER COLUMN project_id_new SET NOT NULL`,
  `ALTER TABLE messages ALTER COLUMN conversation_id_new SET NOT NULL`,
  `ALTER TABLE contracts ALTER COLUMN project_id_new SET NOT NULL`,
  `ALTER TABLE contracts ALTER COLUMN client_id_new SET NOT NULL`,
  `ALTER TABLE contracts ALTER COLUMN freelancer_id_new SET NOT NULL`,
  `ALTER TABLE tasks ALTER COLUMN contract_id_new SET NOT NULL`,
  `ALTER TABLE scope_changes ALTER COLUMN contract_id_new SET NOT NULL`,
  `ALTER TABLE scope_changes ALTER COLUMN requested_by_new SET NOT NULL`,
  `ALTER TABLE transactions ALTER COLUMN wallet_id_new SET NOT NULL`,
  `ALTER TABLE subscriptions ALTER COLUMN freelancer_id_new SET NOT NULL`,
  `ALTER TABLE reviews ALTER COLUMN contract_id_new SET NOT NULL`,
  `ALTER TABLE reviews ALTER COLUMN reviewer_id_new SET NOT NULL`,
  `ALTER TABLE reviews ALTER COLUMN reviewee_id_new SET NOT NULL`,
  `ALTER TABLE disputes ALTER COLUMN reported_by_new SET NOT NULL`,
  `ALTER TABLE disputes ALTER COLUMN project_id_new SET NOT NULL`,
  `ALTER TABLE notifications ALTER COLUMN user_id_new SET NOT NULL`,
  `ALTER TABLE ai_usage_logs ALTER COLUMN user_id_new SET NOT NULL`,
  `ALTER TABLE ai_analysis_results ALTER COLUMN project_id_new SET NOT NULL`,
  `ALTER TABLE ai_matching_results ALTER COLUMN project_id_new SET NOT NULL`,

  `DO $numeric_ids$
  DECLARE
    rec RECORD;
  BEGIN
    FOR rec IN
      SELECT c.conrelid::regclass AS tbl, c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE c.contype = 'f'
        AND n.nspname = 'public'
        AND t.relname = ANY (ARRAY[
          'users',
          'specialties',
          'skills',
          'client_profiles',
          'freelancer_profiles',
          'freelancer_skills',
          'services',
          'wallets',
          'projects',
          'proposals',
          'conversations',
          'messages',
          'contracts',
          'tasks',
          'scope_changes',
          'transactions',
          'subscriptions',
          'reviews',
          'disputes',
          'notifications',
          'ai_usage_logs',
          'ai_analysis_results',
          'ai_matching_results'
        ])
    LOOP
      EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', rec.tbl, rec.conname);
    END LOOP;
  END
  $numeric_ids$`,

  `ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_user_id_key`,
  `ALTER TABLE freelancer_profiles DROP CONSTRAINT IF EXISTS freelancer_profiles_user_id_key`,
  `ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_key`,
  `ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_project_id_key`,

  `DO $numeric_ids$
  DECLARE
    rec RECORD;
  BEGIN
    FOR rec IN
      SELECT c.conrelid::regclass AS tbl, c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE c.contype = 'p'
        AND n.nspname = 'public'
        AND t.relname = ANY (ARRAY[
          'users',
          'specialties',
          'skills',
          'client_profiles',
          'freelancer_profiles',
          'freelancer_skills',
          'services',
          'wallets',
          'projects',
          'proposals',
          'conversations',
          'messages',
          'contracts',
          'tasks',
          'scope_changes',
          'transactions',
          'subscriptions',
          'reviews',
          'disputes',
          'notifications',
          'ai_usage_logs',
          'ai_analysis_results',
          'ai_matching_results'
        ])
    LOOP
      EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', rec.tbl, rec.conname);
    END LOOP;
  END
  $numeric_ids$`,

  `ALTER TABLE specialties DROP COLUMN requested_by`,
  `ALTER TABLE specialties DROP COLUMN reviewed_by`,
  `ALTER TABLE specialties DROP COLUMN id`,
  `ALTER TABLE client_profiles DROP COLUMN user_id`,
  `ALTER TABLE client_profiles DROP COLUMN id`,
  `ALTER TABLE freelancer_profiles DROP COLUMN user_id`,
  `ALTER TABLE freelancer_profiles DROP COLUMN specialty_id`,
  `ALTER TABLE freelancer_profiles DROP COLUMN id`,
  `ALTER TABLE freelancer_skills DROP COLUMN freelancer_id`,
  `ALTER TABLE freelancer_skills DROP COLUMN skill_id`,
  `ALTER TABLE freelancer_skills DROP COLUMN id`,
  `ALTER TABLE services DROP COLUMN freelancer_id`,
  `ALTER TABLE services DROP COLUMN id`,
  `ALTER TABLE wallets DROP COLUMN user_id`,
  `ALTER TABLE wallets DROP COLUMN id`,
  `ALTER TABLE projects DROP COLUMN client_id`,
  `ALTER TABLE projects DROP COLUMN chosen_freelancer_id`,
  `ALTER TABLE projects DROP COLUMN id`,
  `ALTER TABLE proposals DROP COLUMN project_id`,
  `ALTER TABLE proposals DROP COLUMN freelancer_id`,
  `ALTER TABLE proposals DROP COLUMN id`,
  `ALTER TABLE conversations DROP COLUMN client_id`,
  `ALTER TABLE conversations DROP COLUMN freelancer_id`,
  `ALTER TABLE conversations DROP COLUMN project_id`,
  `ALTER TABLE conversations DROP COLUMN id`,
  `ALTER TABLE messages DROP COLUMN conversation_id`,
  `ALTER TABLE messages DROP COLUMN id`,
  `ALTER TABLE contracts DROP COLUMN project_id`,
  `ALTER TABLE contracts DROP COLUMN client_id`,
  `ALTER TABLE contracts DROP COLUMN freelancer_id`,
  `ALTER TABLE contracts DROP COLUMN id`,
  `ALTER TABLE tasks DROP COLUMN contract_id`,
  `ALTER TABLE tasks DROP COLUMN id`,
  `ALTER TABLE scope_changes DROP COLUMN requested_by`,
  `ALTER TABLE scope_changes DROP COLUMN contract_id`,
  `ALTER TABLE scope_changes DROP COLUMN id`,
  `ALTER TABLE transactions DROP COLUMN wallet_id`,
  `ALTER TABLE transactions DROP COLUMN contract_id`,
  `ALTER TABLE transactions DROP COLUMN id`,
  `ALTER TABLE subscriptions DROP COLUMN freelancer_id`,
  `ALTER TABLE subscriptions DROP COLUMN id`,
  `ALTER TABLE reviews DROP COLUMN contract_id`,
  `ALTER TABLE reviews DROP COLUMN reviewer_id`,
  `ALTER TABLE reviews DROP COLUMN reviewee_id`,
  `ALTER TABLE reviews DROP COLUMN id`,
  `ALTER TABLE disputes DROP COLUMN reported_by`,
  `ALTER TABLE disputes DROP COLUMN reported_against`,
  `ALTER TABLE disputes DROP COLUMN project_id`,
  `ALTER TABLE disputes DROP COLUMN id`,
  `ALTER TABLE notifications DROP COLUMN user_id`,
  `ALTER TABLE notifications DROP COLUMN id`,
  `ALTER TABLE ai_usage_logs DROP COLUMN user_id`,
  `ALTER TABLE ai_usage_logs DROP COLUMN id`,
  `ALTER TABLE ai_analysis_results DROP COLUMN project_id`,
  `ALTER TABLE ai_analysis_results DROP COLUMN id`,
  `ALTER TABLE ai_matching_results DROP COLUMN project_id`,
  `ALTER TABLE ai_matching_results DROP COLUMN id`,
  `ALTER TABLE skills DROP COLUMN id`,
  `ALTER TABLE users DROP COLUMN id`,

  `ALTER TABLE users RENAME COLUMN id_new TO id`,
  `ALTER TABLE specialties RENAME COLUMN id_new TO id`,
  `ALTER TABLE specialties RENAME COLUMN requested_by_new TO requested_by`,
  `ALTER TABLE specialties RENAME COLUMN reviewed_by_new TO reviewed_by`,
  `ALTER TABLE skills RENAME COLUMN id_new TO id`,
  `ALTER TABLE client_profiles RENAME COLUMN id_new TO id`,
  `ALTER TABLE client_profiles RENAME COLUMN user_id_new TO user_id`,
  `ALTER TABLE freelancer_profiles RENAME COLUMN id_new TO id`,
  `ALTER TABLE freelancer_profiles RENAME COLUMN user_id_new TO user_id`,
  `ALTER TABLE freelancer_profiles RENAME COLUMN specialty_id_new TO specialty_id`,
  `ALTER TABLE freelancer_skills RENAME COLUMN id_new TO id`,
  `ALTER TABLE freelancer_skills RENAME COLUMN freelancer_id_new TO freelancer_id`,
  `ALTER TABLE freelancer_skills RENAME COLUMN skill_id_new TO skill_id`,
  `ALTER TABLE services RENAME COLUMN id_new TO id`,
  `ALTER TABLE services RENAME COLUMN freelancer_id_new TO freelancer_id`,
  `ALTER TABLE wallets RENAME COLUMN id_new TO id`,
  `ALTER TABLE wallets RENAME COLUMN user_id_new TO user_id`,
  `ALTER TABLE projects RENAME COLUMN id_new TO id`,
  `ALTER TABLE projects RENAME COLUMN client_id_new TO client_id`,
  `ALTER TABLE projects RENAME COLUMN chosen_freelancer_id_new TO chosen_freelancer_id`,
  `ALTER TABLE proposals RENAME COLUMN id_new TO id`,
  `ALTER TABLE proposals RENAME COLUMN project_id_new TO project_id`,
  `ALTER TABLE proposals RENAME COLUMN freelancer_id_new TO freelancer_id`,
  `ALTER TABLE conversations RENAME COLUMN id_new TO id`,
  `ALTER TABLE conversations RENAME COLUMN client_id_new TO client_id`,
  `ALTER TABLE conversations RENAME COLUMN freelancer_id_new TO freelancer_id`,
  `ALTER TABLE conversations RENAME COLUMN project_id_new TO project_id`,
  `ALTER TABLE messages RENAME COLUMN id_new TO id`,
  `ALTER TABLE messages RENAME COLUMN conversation_id_new TO conversation_id`,
  `ALTER TABLE contracts RENAME COLUMN id_new TO id`,
  `ALTER TABLE contracts RENAME COLUMN project_id_new TO project_id`,
  `ALTER TABLE contracts RENAME COLUMN client_id_new TO client_id`,
  `ALTER TABLE contracts RENAME COLUMN freelancer_id_new TO freelancer_id`,
  `ALTER TABLE tasks RENAME COLUMN id_new TO id`,
  `ALTER TABLE tasks RENAME COLUMN contract_id_new TO contract_id`,
  `ALTER TABLE scope_changes RENAME COLUMN id_new TO id`,
  `ALTER TABLE scope_changes RENAME COLUMN contract_id_new TO contract_id`,
  `ALTER TABLE scope_changes RENAME COLUMN requested_by_new TO requested_by`,
  `ALTER TABLE transactions RENAME COLUMN id_new TO id`,
  `ALTER TABLE transactions RENAME COLUMN wallet_id_new TO wallet_id`,
  `ALTER TABLE transactions RENAME COLUMN contract_id_new TO contract_id`,
  `ALTER TABLE subscriptions RENAME COLUMN id_new TO id`,
  `ALTER TABLE subscriptions RENAME COLUMN freelancer_id_new TO freelancer_id`,
  `ALTER TABLE reviews RENAME COLUMN id_new TO id`,
  `ALTER TABLE reviews RENAME COLUMN contract_id_new TO contract_id`,
  `ALTER TABLE reviews RENAME COLUMN reviewer_id_new TO reviewer_id`,
  `ALTER TABLE reviews RENAME COLUMN reviewee_id_new TO reviewee_id`,
  `ALTER TABLE disputes RENAME COLUMN id_new TO id`,
  `ALTER TABLE disputes RENAME COLUMN reported_by_new TO reported_by`,
  `ALTER TABLE disputes RENAME COLUMN reported_against_new TO reported_against`,
  `ALTER TABLE disputes RENAME COLUMN project_id_new TO project_id`,
  `ALTER TABLE notifications RENAME COLUMN id_new TO id`,
  `ALTER TABLE notifications RENAME COLUMN user_id_new TO user_id`,
  `ALTER TABLE ai_usage_logs RENAME COLUMN id_new TO id`,
  `ALTER TABLE ai_usage_logs RENAME COLUMN user_id_new TO user_id`,
  `ALTER TABLE ai_analysis_results RENAME COLUMN id_new TO id`,
  `ALTER TABLE ai_analysis_results RENAME COLUMN project_id_new TO project_id`,
  `ALTER TABLE ai_matching_results RENAME COLUMN id_new TO id`,
  `ALTER TABLE ai_matching_results RENAME COLUMN project_id_new TO project_id`,

  `ALTER TABLE users ADD PRIMARY KEY (id)`,
  `ALTER TABLE specialties ADD PRIMARY KEY (id)`,
  `ALTER TABLE skills ADD PRIMARY KEY (id)`,
  `ALTER TABLE client_profiles ADD PRIMARY KEY (id)`,
  `ALTER TABLE freelancer_profiles ADD PRIMARY KEY (id)`,
  `ALTER TABLE freelancer_skills ADD PRIMARY KEY (id)`,
  `ALTER TABLE services ADD PRIMARY KEY (id)`,
  `ALTER TABLE wallets ADD PRIMARY KEY (id)`,
  `ALTER TABLE projects ADD PRIMARY KEY (id)`,
  `ALTER TABLE proposals ADD PRIMARY KEY (id)`,
  `ALTER TABLE conversations ADD PRIMARY KEY (id)`,
  `ALTER TABLE messages ADD PRIMARY KEY (id)`,
  `ALTER TABLE contracts ADD PRIMARY KEY (id)`,
  `ALTER TABLE tasks ADD PRIMARY KEY (id)`,
  `ALTER TABLE scope_changes ADD PRIMARY KEY (id)`,
  `ALTER TABLE transactions ADD PRIMARY KEY (id)`,
  `ALTER TABLE subscriptions ADD PRIMARY KEY (id)`,
  `ALTER TABLE reviews ADD PRIMARY KEY (id)`,
  `ALTER TABLE disputes ADD PRIMARY KEY (id)`,
  `ALTER TABLE notifications ADD PRIMARY KEY (id)`,
  `ALTER TABLE ai_usage_logs ADD PRIMARY KEY (id)`,
  `ALTER TABLE ai_analysis_results ADD PRIMARY KEY (id)`,
  `ALTER TABLE ai_matching_results ADD PRIMARY KEY (id)`,

  `ALTER TABLE users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE specialties ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE skills ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE client_profiles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE freelancer_profiles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE freelancer_skills ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE services ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE wallets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE projects ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE proposals ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE conversations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE contracts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE tasks ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE scope_changes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE transactions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE subscriptions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE reviews ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE disputes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE ai_usage_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE ai_analysis_results ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,
  `ALTER TABLE ai_matching_results ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY`,

  `ALTER TABLE client_profiles ADD CONSTRAINT client_profiles_user_id_key UNIQUE (user_id)`,
  `ALTER TABLE freelancer_profiles ADD CONSTRAINT freelancer_profiles_user_id_key UNIQUE (user_id)`,
  `ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id)`,
  `ALTER TABLE contracts ADD CONSTRAINT contracts_project_id_key UNIQUE (project_id)`,

  `ALTER TABLE specialties ADD CONSTRAINT specialties_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES users (id)`,
  `ALTER TABLE specialties ADD CONSTRAINT specialties_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users (id)`,
  `ALTER TABLE client_profiles ADD CONSTRAINT client_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)`,
  `ALTER TABLE freelancer_profiles ADD CONSTRAINT freelancer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)`,
  `ALTER TABLE freelancer_profiles ADD CONSTRAINT freelancer_profiles_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES specialties (id)`,
  `ALTER TABLE freelancer_skills ADD CONSTRAINT freelancer_skills_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles (id)`,
  `ALTER TABLE freelancer_skills ADD CONSTRAINT freelancer_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES skills (id)`,
  `ALTER TABLE services ADD CONSTRAINT services_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles (id)`,
  `ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)`,
  `ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES client_profiles (id)`,
  `ALTER TABLE projects ADD CONSTRAINT projects_chosen_freelancer_id_fkey FOREIGN KEY (chosen_freelancer_id) REFERENCES freelancer_profiles (id)`,
  `ALTER TABLE proposals ADD CONSTRAINT proposals_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id)`,
  `ALTER TABLE proposals ADD CONSTRAINT proposals_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles (id)`,
  `ALTER TABLE conversations ADD CONSTRAINT conversations_client_id_fkey FOREIGN KEY (client_id) REFERENCES users (id)`,
  `ALTER TABLE conversations ADD CONSTRAINT conversations_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES users (id)`,
  `ALTER TABLE conversations ADD CONSTRAINT conversations_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id)`,
  `ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations (id)`,
  `ALTER TABLE contracts ADD CONSTRAINT contracts_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id)`,
  `ALTER TABLE contracts ADD CONSTRAINT contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES client_profiles (id)`,
  `ALTER TABLE contracts ADD CONSTRAINT contracts_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles (id)`,
  `ALTER TABLE tasks ADD CONSTRAINT tasks_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id)`,
  `ALTER TABLE scope_changes ADD CONSTRAINT scope_changes_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id)`,
  `ALTER TABLE scope_changes ADD CONSTRAINT scope_changes_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES users (id)`,
  `ALTER TABLE transactions ADD CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES wallets (id)`,
  `ALTER TABLE transactions ADD CONSTRAINT transactions_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id)`,
  `ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_freelancer_id_fkey FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles (id)`,
  `ALTER TABLE reviews ADD CONSTRAINT reviews_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts (id)`,
  `ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users (id)`,
  `ALTER TABLE reviews ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES users (id)`,
  `ALTER TABLE disputes ADD CONSTRAINT disputes_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES users (id)`,
  `ALTER TABLE disputes ADD CONSTRAINT disputes_reported_against_fkey FOREIGN KEY (reported_against) REFERENCES users (id)`,
  `ALTER TABLE disputes ADD CONSTRAINT disputes_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id)`,
  `ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)`,
  `ALTER TABLE ai_usage_logs ADD CONSTRAINT ai_usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)`,
  `ALTER TABLE ai_analysis_results ADD CONSTRAINT ai_analysis_results_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id)`,
  `ALTER TABLE ai_matching_results ADD CONSTRAINT ai_matching_results_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id)`,

  `DO $numeric_ids$
  DECLARE
    tbl text;
    seq_name text;
    max_id integer;
  BEGIN
    FOREACH tbl IN ARRAY ARRAY[
      'users',
      'specialties',
      'skills',
      'client_profiles',
      'freelancer_profiles',
      'freelancer_skills',
      'services',
      'wallets',
      'projects',
      'proposals',
      'conversations',
      'messages',
      'contracts',
      'tasks',
      'scope_changes',
      'transactions',
      'subscriptions',
      'reviews',
      'disputes',
      'notifications',
      'ai_usage_logs',
      'ai_analysis_results',
      'ai_matching_results'
    ]
    LOOP
      seq_name := pg_get_serial_sequence(tbl, 'id');
      EXECUTE format('SELECT MAX(id) FROM %I', tbl) INTO max_id;
      IF max_id IS NULL THEN
        PERFORM setval(seq_name, 1, false);
      ELSE
        PERFORM setval(seq_name, max_id, true);
      END IF;
    END LOOP;
  END
  $numeric_ids$`,
];

const PASSWORD_RESET_TOKENS_MIGRATION_ID = '017_password_reset_tokens';

const PASSWORD_RESET_TOKENS_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS password_reset_tokens_token_hash_idx
    ON password_reset_tokens (token_hash)`,
  `CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_expires_at_idx
    ON password_reset_tokens (user_id, expires_at)`,
];

const PORTFOLIO_ITEMS_MIGRATION_ID = '018_portfolio_items';

const PORTFOLIO_ITEMS_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS portfolio_items (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    freelancer_id INTEGER NOT NULL REFERENCES freelancer_profiles (id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS portfolio_items_freelancer_id_idx
    ON portfolio_items (freelancer_id)`,
];

const SUBSCRIPTION_FOUNDATION_MIGRATION_ID = '019_subscription_foundation';

const SUBSCRIPTION_FOUNDATION_STATEMENTS = [
  `ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_plan_type_check
    CHECK (plan_type IN ('Freelancer Pro'))`,
  `ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'expired', 'cancelled'))`,
  `ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_payment_status_check
    CHECK (payment_status IN ('paid', 'failed'))`,
  `CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_freelancer_idx
    ON subscriptions (freelancer_id)
    WHERE status = 'active'`,
  `CREATE TABLE IF NOT EXISTS subscription_ad_usage (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    freelancer_id INTEGER NOT NULL REFERENCES freelancer_profiles (id),
    subscription_id INTEGER NOT NULL REFERENCES subscriptions (id),
    period_start DATE NOT NULL,
    ads_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subscription_ad_usage_ads_used_check
      CHECK (ads_used >= 0 AND ads_used <= 2),
    CONSTRAINT subscription_ad_usage_period_key
      UNIQUE (freelancer_id, subscription_id, period_start)
  )`,
  `ALTER TABLE services
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE`,
];

const SUBSCRIPTION_LIFECYCLE_MIGRATION_ID = '020_subscription_lifecycle';

const SUBSCRIPTION_LIFECYCLE_STATEMENTS = [
  `ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE`,
];

const ADVERTISEMENTS_MIGRATION_ID = '021_advertisements';

const ADVERTISEMENTS_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS advertisements (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    freelancer_id INTEGER NOT NULL REFERENCES freelancer_profiles (id),
    service_id INTEGER NOT NULL REFERENCES services (id),
    subscription_id INTEGER NOT NULL REFERENCES subscriptions (id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

const AI_USAGE_CREATED_AT_MIGRATION_ID = '022_ai_usage_created_at';

const AI_USAGE_CREATED_AT_STATEMENTS = [
  `ALTER TABLE ai_usage_logs
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `CREATE INDEX IF NOT EXISTS ai_usage_logs_user_id_created_at_idx
    ON ai_usage_logs (user_id, created_at)`,
];

const MESSAGES_TEXT_MIGRATION_ID = '023_messages_text';

const MESSAGES_TEXT_STATEMENTS = [
  `ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS sender_id INTEGER REFERENCES users (id)`,
  `ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS message TEXT`,
  `ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE messages
    ALTER COLUMN sender_id SET NOT NULL`,
  `ALTER TABLE messages
    ALTER COLUMN message SET NOT NULL`,
  `CREATE INDEX IF NOT EXISTS messages_conversation_id_created_at_idx
    ON messages (conversation_id, created_at)`,
];

const CLIENT_AI_FEATURES_MIGRATION_ID = '024_client_ai_features';

const CLIENT_AI_FEATURES_STATEMENTS = [
  `ALTER TABLE ai_usage_logs
    ADD COLUMN IF NOT EXISTS action TEXT`,
  `CREATE INDEX IF NOT EXISTS ai_usage_logs_user_id_action_created_at_idx
    ON ai_usage_logs (user_id, action, created_at)`,
  `CREATE TABLE IF NOT EXISTS client_ai_entitlements (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    entitlement TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT client_ai_entitlements_user_entitlement_key UNIQUE (user_id, entitlement)
  )`,
];

const CLIENT_AI_SUBSCRIPTION_MIGRATION_ID = '025_client_ai_subscription';

const CLIENT_AI_SUBSCRIPTION_STATEMENTS = [
  `ALTER TABLE subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check`,
  `ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_plan_type_check
    CHECK (plan_type IN ('Freelancer Pro', 'Client AI'))`,
  `ALTER TABLE subscriptions
    ALTER COLUMN freelancer_id DROP NOT NULL`,
  `ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES client_profiles (id)`,
  `ALTER TABLE subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_party_check`,
  `ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_party_check
    CHECK (
      (freelancer_id IS NOT NULL AND client_id IS NULL)
      OR (freelancer_id IS NULL AND client_id IS NOT NULL)
    )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_client_idx
    ON subscriptions (client_id)
    WHERE status = 'active' AND client_id IS NOT NULL`,
];

const CONTRACTS_AWAITING_ESCROW_MIGRATION_ID = '026_contracts_awaiting_escrow';

const CONTRACTS_AWAITING_ESCROW_STATEMENTS = [
  `ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check`,
  `ALTER TABLE contracts ADD CONSTRAINT contracts_status_check
    CHECK (status IN ('awaiting_escrow', 'in_progress', 'delivered', 'completed'))`,
];

const MIGRATIONS = [
  {
    id: INITIAL_MIGRATION_ID,
    statements: SCHEMA_STATEMENTS,
  },
  {
    id: TRANSACTIONS_AMOUNT_MIGRATION_ID,
    statements: TRANSACTIONS_AMOUNT_STATEMENTS,
  },
  {
    id: PROJECTS_PENDING_APPROVAL_MIGRATION_ID,
    statements: PROJECTS_PENDING_APPROVAL_STATEMENTS,
  },
  {
    id: NUMERIC_IDS_MIGRATION_ID,
    statements: NUMERIC_IDS_STATEMENTS,
  },
  {
    id: PASSWORD_RESET_TOKENS_MIGRATION_ID,
    statements: PASSWORD_RESET_TOKENS_STATEMENTS,
  },
  {
    id: PORTFOLIO_ITEMS_MIGRATION_ID,
    statements: PORTFOLIO_ITEMS_STATEMENTS,
  },
  {
    id: SUBSCRIPTION_FOUNDATION_MIGRATION_ID,
    statements: SUBSCRIPTION_FOUNDATION_STATEMENTS,
  },
  {
    id: SUBSCRIPTION_LIFECYCLE_MIGRATION_ID,
    statements: SUBSCRIPTION_LIFECYCLE_STATEMENTS,
  },
  {
    id: ADVERTISEMENTS_MIGRATION_ID,
    statements: ADVERTISEMENTS_STATEMENTS,
  },
  {
    id: AI_USAGE_CREATED_AT_MIGRATION_ID,
    statements: AI_USAGE_CREATED_AT_STATEMENTS,
  },
  {
    id: MESSAGES_TEXT_MIGRATION_ID,
    statements: MESSAGES_TEXT_STATEMENTS,
  },
  {
    id: CLIENT_AI_FEATURES_MIGRATION_ID,
    statements: CLIENT_AI_FEATURES_STATEMENTS,
  },
  {
    id: CLIENT_AI_SUBSCRIPTION_MIGRATION_ID,
    statements: CLIENT_AI_SUBSCRIPTION_STATEMENTS,
  },
  {
    id: CONTRACTS_AWAITING_ESCROW_MIGRATION_ID,
    statements: CONTRACTS_AWAITING_ESCROW_STATEMENTS,
  },
];

const getTargetDatabaseName = () => {
  if (env.databaseUrl) {
    try {
      const parsed = new URL(env.databaseUrl);
      return decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    } catch {
      throw new Error('DATABASE_URL is invalid.');
    }
  }

  return env.pg.database;
};

const getAdminClientConfig = () => {
  if (env.databaseUrl) {
    const parsed = new URL(env.databaseUrl);
    parsed.pathname = '/postgres';
    return { connectionString: parsed.toString() };
  }

  return {
    host: env.pg.host,
    port: env.pg.port,
    user: env.pg.user,
    password: env.pg.password,
    database: 'postgres',
  };
};

const assertDatabaseConfigured = () => {
  if (env.databaseUrl || env.pg.password || process.env.PGPASSWORD) {
    return;
  }

  throw new Error(
    'PostgreSQL is not configured. Set DATABASE_URL or PGPASSWORD before running migrate.js.',
  );
};

const ensureDatabaseExists = async () => {
  const databaseName = getTargetDatabaseName();

  if (!databaseName) {
    throw new Error('Target PostgreSQL database name is missing.');
  }

  const adminClient = new Client(getAdminClientConfig());

  try {
    await adminClient.connect();

    const existing = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (existing.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${JSON.stringify(databaseName)}`);
      console.log(`Created database ${databaseName}`);
    }
  } finally {
    await adminClient.end();
  }
};

const applySchema = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const migration of MIGRATIONS) {
      const applied = await client.query(
        'SELECT id FROM schema_migrations WHERE id = $1',
        [migration.id],
      );

      if (applied.rowCount > 0) {
        console.log(`Migration ${migration.id} already applied.`);
        continue;
      }

      for (const statement of migration.statements) {
        await client.query(statement);
      }

      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [
        migration.id,
      ]);
      console.log(`Migration ${migration.id} applied.`);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const migrate = async () => {
  assertDatabaseConfigured();
  await ensureDatabaseExists();
  await applySchema();
};

migrate()
  .catch((error) => {
    console.error('PostgreSQL migration failed.');
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
