-- =====================================================================
-- KESHO — Part 3: Row Level Security, Triggers, Functions, Views
-- =====================================================================
-- This migration is authored by hand (Prisma migrate does not generate
-- RLS policies, triggers, or PL/pgSQL functions). Apply it with
-- `npm run prisma:migrate --workspace=apps/api` after the base tables
-- exist, or paste it into the Supabase SQL editor for staging/prod.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
-- Every user-owned table: users may only read/write their own rows.
-- Admins (checked via admin_users table, added in the Admin module) get
-- a separate policy once that table exists — for now these policies
-- cover end-user access only.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_fund ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_owner_select ON profiles FOR SELECT USING (auth.uid()::text = auth_user_id);
CREATE POLICY profiles_owner_update ON profiles FOR UPDATE USING (auth.uid()::text = auth_user_id);

CREATE POLICY wallets_owner_all ON wallets FOR ALL USING (auth.uid()::text = auth_user_id);

CREATE POLICY money_pockets_owner_all ON money_pockets FOR ALL USING (
  wallet_id IN (SELECT id FROM wallets WHERE auth_user_id = auth.uid()::text)
);

CREATE POLICY budget_rules_owner_all ON budget_rules FOR ALL USING (
  wallet_id IN (SELECT id FROM wallets WHERE auth_user_id = auth.uid()::text)
);

CREATE POLICY income_owner_all ON income FOR ALL USING (auth.uid()::text = auth_user_id);
CREATE POLICY expenses_owner_all ON expenses FOR ALL USING (auth.uid()::text = auth_user_id);

CREATE POLICY transactions_owner_all ON transactions FOR ALL USING (auth.uid()::text = auth_user_id);

CREATE POLICY bills_owner_all ON bills FOR ALL USING (auth.uid()::text = auth_user_id);
CREATE POLICY bill_payments_owner_all ON bill_payments FOR ALL USING (auth.uid()::text = auth_user_id);

CREATE POLICY savings_goals_owner_all ON savings_goals FOR ALL USING (auth.uid()::text = auth_user_id);
CREATE POLICY emergency_fund_owner_all ON emergency_fund FOR ALL USING (auth.uid()::text = auth_user_id);
CREATE POLICY transport_budget_owner_all ON transport_budget FOR ALL USING (auth.uid()::text = auth_user_id);
CREATE POLICY notifications_owner_all ON notifications FOR ALL USING (auth.uid()::text = auth_user_id);

CREATE POLICY audit_logs_owner_select ON audit_logs FOR SELECT USING (auth.uid()::text = auth_user_id);
CREATE POLICY login_history_owner_select ON login_history FOR SELECT USING (auth.uid()::text = auth_user_id);
CREATE POLICY wallet_pins_owner_all ON wallet_pins FOR ALL USING (auth.uid()::text = auth_user_id);
CREATE POLICY passkeys_owner_all ON passkeys FOR ALL USING (auth.uid()::text = auth_user_id);
CREATE POLICY trusted_devices_owner_all ON trusted_devices FOR ALL USING (auth.uid()::text = auth_user_id);

-- Service-role (used by the backend API) bypasses RLS by default in
-- Supabase, which is why apps/api/src/lib/supabaseAdmin.ts is the only
-- place the service role key is ever used, and why the backend — not the
-- browser — is responsible for enforcing who can call which endpoint.

-- ---------------------------------------------------------------------
-- 2. TRIGGERS — auto-provisioning on new profile
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION kesho_handle_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  new_wallet_id uuid;
BEGIN
  INSERT INTO wallets (id, auth_user_id, total_balance, available_balance, reserved_balance)
  VALUES (gen_random_uuid(), NEW.auth_user_id, 0, 0, 0)
  RETURNING id INTO new_wallet_id;

  INSERT INTO money_pockets (id, wallet_id, name, type, icon, color, priority)
  VALUES
    (gen_random_uuid(), new_wallet_id, 'Daily Spending', 'DAILY_SPENDING', 'wallet', '#1fa863', 1),
    (gen_random_uuid(), new_wallet_id, 'Bills Vault', 'BILLS_VAULT', 'home', '#f5820c', 2),
    (gen_random_uuid(), new_wallet_id, 'Transport', 'TRANSPORT', 'bus', '#1fa863', 3),
    (gen_random_uuid(), new_wallet_id, 'Food', 'FOOD', 'utensils', '#f5820c', 4),
    (gen_random_uuid(), new_wallet_id, 'Shopping', 'SHOPPING', 'shopping-bag', '#1fa863', 5),
    (gen_random_uuid(), new_wallet_id, 'Savings Goals', 'SAVINGS', 'target', '#f5820c', 6),
    (gen_random_uuid(), new_wallet_id, 'Emergency Fund', 'EMERGENCY_FUND', 'shield', '#1fa863', 7),
    (gen_random_uuid(), new_wallet_id, 'Entertainment', 'ENTERTAINMENT', 'film', '#f5820c', 8);

  INSERT INTO emergency_fund (id, auth_user_id, balance)
  VALUES (gen_random_uuid(), NEW.auth_user_id, 0);

  INSERT INTO transport_budget (id, auth_user_id, current_balance)
  VALUES (gen_random_uuid(), NEW.auth_user_id, 0);

  INSERT INTO audit_logs (id, auth_user_id, action, metadata)
  VALUES (gen_random_uuid(), NEW.auth_user_id, 'WALLET_PROVISIONED', jsonb_build_object('wallet_id', new_wallet_id));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_profile ON profiles;
CREATE TRIGGER trg_new_profile
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION kesho_handle_new_profile();

-- ---------------------------------------------------------------------
-- 3. TRIGGERS — balance maintenance on transactions
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION kesho_apply_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'SUCCESS' THEN
    IF NEW.type = 'DEPOSIT' OR NEW.type = 'REFUND' THEN
      UPDATE wallets SET
        total_balance = total_balance + NEW.amount,
        available_balance = available_balance + NEW.amount,
        updated_at = now()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type IN ('WITHDRAWAL', 'BILL_PAYMENT') THEN
      UPDATE wallets SET
        total_balance = total_balance - NEW.amount - NEW.fee,
        available_balance = available_balance - NEW.amount - NEW.fee,
        updated_at = now()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_apply_transaction ON transactions;
CREATE TRIGGER trg_apply_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION kesho_apply_transaction();

-- ---------------------------------------------------------------------
-- 4. TRIGGERS — savings goal progress
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION kesho_update_savings_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = false AND NEW.current_amount >= NEW.target_amount THEN
    NEW.completed := true;
    INSERT INTO notifications (id, auth_user_id, channel, title, body)
    VALUES (
      gen_random_uuid(), NEW.auth_user_id, 'IN_APP', 'Savings goal reached! 🎉',
      format('You just hit your "%s" savings goal.', NEW.name)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_savings_progress ON savings_goals;
CREATE TRIGGER trg_savings_progress
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION kesho_update_savings_progress();

-- ---------------------------------------------------------------------
-- 5. FUNCTIONS — money movement
-- ---------------------------------------------------------------------

-- Transfer money between two pockets belonging to the same wallet.
CREATE OR REPLACE FUNCTION kesho_transfer_between_pockets(
  p_from_pocket uuid, p_to_pocket uuid, p_amount numeric
) RETURNS void AS $$
DECLARE
  v_from_balance numeric;
  v_wallet_from uuid;
  v_wallet_to uuid;
BEGIN
  SELECT balance, wallet_id INTO v_from_balance, v_wallet_from FROM money_pockets WHERE id = p_from_pocket FOR UPDATE;
  SELECT wallet_id INTO v_wallet_to FROM money_pockets WHERE id = p_to_pocket FOR UPDATE;

  IF v_wallet_from IS DISTINCT FROM v_wallet_to THEN
    RAISE EXCEPTION 'Pockets must belong to the same wallet';
  END IF;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient pocket balance';
  END IF;

  UPDATE money_pockets SET balance = balance - p_amount, updated_at = now() WHERE id = p_from_pocket;
  UPDATE money_pockets SET balance = balance + p_amount, updated_at = now() WHERE id = p_to_pocket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reserve bill money: move funds from a source pocket into the Bills Vault.
CREATE OR REPLACE FUNCTION kesho_reserve_bill_money(
  p_wallet_id uuid, p_source_pocket uuid, p_amount numeric
) RETURNS void AS $$
DECLARE
  v_bills_vault uuid;
BEGIN
  SELECT id INTO v_bills_vault FROM money_pockets WHERE wallet_id = p_wallet_id AND type = 'BILLS_VAULT' LIMIT 1;
  PERFORM kesho_transfer_between_pockets(p_source_pocket, v_bills_vault, p_amount);
  UPDATE wallets SET reserved_balance = reserved_balance + p_amount, updated_at = now() WHERE id = p_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pay a bill: release reserved funds and record the bill payment + transaction.
CREATE OR REPLACE FUNCTION kesho_pay_bill(p_bill_id uuid, p_transaction_ref text)
RETURNS void AS $$
DECLARE
  v_bill bills%ROWTYPE;
  v_wallet_id uuid;
  v_balance_before numeric;
BEGIN
  SELECT * INTO v_bill FROM bills WHERE id = p_bill_id FOR UPDATE;
  SELECT id, total_balance INTO v_wallet_id, v_balance_before
    FROM wallets WHERE auth_user_id = v_bill.auth_user_id;

  INSERT INTO transactions (
    id, wallet_id, auth_user_id, type, amount, reference, status,
    description, balance_before, balance_after
  ) VALUES (
    gen_random_uuid(), v_wallet_id, v_bill.auth_user_id, 'BILL_PAYMENT', v_bill.amount,
    p_transaction_ref, 'SUCCESS', format('Bill payment: %s', v_bill.name),
    v_balance_before, v_balance_before - v_bill.amount
  );

  INSERT INTO bill_payments (id, bill_id, auth_user_id, amount, status)
  VALUES (gen_random_uuid(), p_bill_id, v_bill.auth_user_id, v_bill.amount, 'SUCCESS');

  UPDATE bills SET status = 'PAID', updated_at = now() WHERE id = p_bill_id;
  UPDATE wallets SET reserved_balance = GREATEST(reserved_balance - v_bill.amount, 0) WHERE id = v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- 6. FUNCTIONS — budgeting & scoring calculations
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION kesho_calculate_daily_allowance(p_auth_user_id text)
RETURNS numeric AS $$
DECLARE
  v_available numeric;
  v_days_to_payday int;
BEGIN
  SELECT available_balance INTO v_available FROM wallets WHERE auth_user_id = p_auth_user_id;

  SELECT GREATEST(
    1,
    CASE
      WHEN payday IS NULL THEN 30
      WHEN EXTRACT(DAY FROM now())::int <= payday THEN payday - EXTRACT(DAY FROM now())::int
      ELSE (payday + 30 - EXTRACT(DAY FROM now())::int)
    END
  ) INTO v_days_to_payday
  FROM profiles WHERE auth_user_id = p_auth_user_id;

  RETURN ROUND(COALESCE(v_available, 0) / v_days_to_payday, 2);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION kesho_calculate_weekly_allowance(p_auth_user_id text)
RETURNS numeric AS $$
BEGIN
  RETURN kesho_calculate_daily_allowance(p_auth_user_id) * 7;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION kesho_calculate_remaining_salary(p_auth_user_id text)
RETURNS numeric AS $$
DECLARE
  v_result numeric;
BEGIN
  SELECT available_balance INTO v_result FROM wallets WHERE auth_user_id = p_auth_user_id;
  RETURN COALESCE(v_result, 0);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION kesho_calculate_savings_rate(p_auth_user_id text, p_since timestamptz DEFAULT now() - interval '30 days')
RETURNS numeric AS $$
DECLARE
  v_income numeric;
  v_saved numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_income FROM income WHERE auth_user_id = p_auth_user_id AND received_at >= p_since;
  SELECT COALESCE(SUM(amount), 0) INTO v_saved FROM transactions
    WHERE auth_user_id = p_auth_user_id AND type = 'SAVINGS' AND status = 'SUCCESS' AND created_at >= p_since;

  IF v_income = 0 THEN RETURN 0; END IF;
  RETURN ROUND((v_saved / v_income) * 100, 1);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION kesho_calculate_overspending(p_auth_user_id text, p_since timestamptz DEFAULT date_trunc('month', now()))
RETURNS numeric AS $$
DECLARE
  v_budget numeric;
  v_spent numeric;
BEGIN
  SELECT monthly_budget INTO v_budget FROM wallets WHERE auth_user_id = p_auth_user_id;
  SELECT COALESCE(SUM(amount), 0) INTO v_spent FROM expenses WHERE auth_user_id = p_auth_user_id AND spent_at >= p_since;

  IF v_budget IS NULL OR v_budget = 0 THEN RETURN 0; END IF;
  RETURN GREATEST(v_spent - v_budget, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Financial Health Score (0-100), weighted composite of budget adherence,
-- savings rate, bill payment history, and emergency fund progress.
CREATE OR REPLACE FUNCTION kesho_calculate_financial_score(p_auth_user_id text)
RETURNS int AS $$
DECLARE
  v_savings_rate numeric;
  v_overspend numeric;
  v_overdue_bills int;
  v_ef_ratio numeric;
  v_score numeric;
BEGIN
  v_savings_rate := kesho_calculate_savings_rate(p_auth_user_id);
  v_overspend := kesho_calculate_overspending(p_auth_user_id);

  SELECT COUNT(*) INTO v_overdue_bills FROM bills WHERE auth_user_id = p_auth_user_id AND status = 'OVERDUE';

  SELECT LEAST(COALESCE(ef.balance / NULLIF(ef.target_amount, 0), 0), 1) INTO v_ef_ratio
    FROM emergency_fund ef WHERE ef.auth_user_id = p_auth_user_id;

  v_score := 40 * LEAST(v_savings_rate / 20, 1)   -- up to 40 pts for a 20%+ savings rate
           + 25 * (1 - LEAST(v_overspend / 10000, 1)) -- up to 25 pts for staying within budget
           + 20 * COALESCE(v_ef_ratio, 0)           -- up to 20 pts for emergency fund progress
           + 15 * (1 - LEAST(v_overdue_bills::numeric / 5, 1)); -- up to 15 pts for on-time bills

  UPDATE wallets SET financial_health_score = ROUND(v_score), updated_at = now()
    WHERE auth_user_id = p_auth_user_id;

  RETURN ROUND(v_score);
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 7. VIEWS
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW kesho_dashboard_summary AS
SELECT
  w.auth_user_id,
  w.total_balance,
  w.available_balance,
  w.reserved_balance,
  w.daily_budget,
  w.weekly_budget,
  w.monthly_budget,
  w.financial_health_score,
  ef.balance AS emergency_fund_balance,
  ef.target_amount AS emergency_fund_target,
  (SELECT COUNT(*) FROM bills b WHERE b.auth_user_id = w.auth_user_id AND b.status IN ('UPCOMING', 'DUE_TODAY')) AS upcoming_bills_count
FROM wallets w
LEFT JOIN emergency_fund ef ON ef.auth_user_id = w.auth_user_id;

CREATE OR REPLACE VIEW kesho_wallet_summary AS
SELECT
  wa.id AS wallet_id,
  wa.auth_user_id,
  wa.total_balance,
  wa.available_balance,
  wa.reserved_balance,
  COUNT(mp.id) AS pocket_count,
  COALESCE(SUM(mp.balance), 0) AS total_pocket_balance
FROM wallets wa
LEFT JOIN money_pockets mp ON mp.wallet_id = wa.id AND mp.archived = false
GROUP BY wa.id;

CREATE OR REPLACE VIEW kesho_monthly_spending AS
SELECT auth_user_id, date_trunc('month', spent_at) AS month, category, SUM(amount) AS total
FROM expenses
GROUP BY auth_user_id, date_trunc('month', spent_at), category;

CREATE OR REPLACE VIEW kesho_monthly_income AS
SELECT auth_user_id, date_trunc('month', received_at) AS month, source, SUM(amount) AS total
FROM income
GROUP BY auth_user_id, date_trunc('month', received_at), source;

CREATE OR REPLACE VIEW kesho_savings_progress AS
SELECT
  id, auth_user_id, name, target_amount, current_amount,
  ROUND((current_amount / NULLIF(target_amount, 0)) * 100, 1) AS percent_complete,
  deadline, completed
FROM savings_goals;

CREATE OR REPLACE VIEW kesho_upcoming_bills AS
SELECT * FROM bills WHERE status = 'UPCOMING' AND due_date >= now() ORDER BY due_date ASC;

CREATE OR REPLACE VIEW kesho_bills_due_today AS
SELECT * FROM bills WHERE due_date::date = now()::date AND status IN ('UPCOMING', 'DUE_TODAY');

CREATE OR REPLACE VIEW kesho_overdue_bills AS
SELECT * FROM bills WHERE due_date < now() AND status != 'PAID';

CREATE OR REPLACE VIEW kesho_financial_health AS
SELECT auth_user_id, financial_health_score, updated_at FROM wallets;

-- ---------------------------------------------------------------------
-- 8. INDEXES (beyond what Prisma already creates for FKs/uniques)
-- ---------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON expenses (spent_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills (due_date);

-- ---------------------------------------------------------------------
-- 9. STORAGE BUCKETS
-- ---------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('receipts', 'receipts', false),
  ('invoices', 'invoices', false),
  ('documents', 'documents', false),
  ('kyc', 'kyc', false)
ON CONFLICT (id) DO NOTHING;

-- Owner-only access for private buckets (receipts, invoices, documents, kyc):
CREATE POLICY storage_owner_read ON storage.objects FOR SELECT USING (
  bucket_id IN ('receipts', 'invoices', 'documents', 'kyc')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY storage_owner_write ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('receipts', 'invoices', 'documents', 'kyc', 'avatars')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
