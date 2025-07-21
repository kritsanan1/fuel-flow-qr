
-- Create custom types for the system
CREATE TYPE employee_role AS ENUM ('admin', 'manager', 'cashier');
CREATE TYPE fuel_type_enum AS ENUM ('gasoline_95', 'gasoline_91', 'diesel', 'premium_diesel', 'e20', 'e85');
CREATE TYPE payment_method AS ENUM ('qr_code', 'cash', 'credit_card');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE alert_status AS ENUM ('active', 'resolved', 'dismissed');
CREATE TYPE audit_action AS ENUM ('login', 'logout', 'create_transaction', 'update_transaction', 'create_employee', 'update_employee', 'delete_employee', 'update_fuel_price', 'generate_report');

-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    pin TEXT NOT NULL,
    rfid_code TEXT UNIQUE,
    role employee_role NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fuel types table
CREATE TABLE fuel_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type fuel_type_enum NOT NULL,
    price_per_liter DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gas transactions table
CREATE TABLE gas_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    fuel_type_id UUID NOT NULL,
    fuel_amount DECIMAL(10,3) NOT NULL,
    fuel_price_per_liter DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    receipt_number TEXT,
    stripe_payment_intent_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payment requests table (for QR codes)
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    transaction_id UUID,
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    description TEXT,
    qr_code TEXT NOT NULL,
    qr_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alerts table for system notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type alert_status NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    employee_id UUID,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    status alert_status NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table for compliance and security
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID,
    action audit_action NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_gas_transactions_employee_id ON gas_transactions(employee_id);
CREATE INDEX idx_gas_transactions_fuel_type_id ON gas_transactions(fuel_type_id);
CREATE INDEX idx_gas_transactions_created_at ON gas_transactions(created_at);
CREATE INDEX idx_gas_transactions_status ON gas_transactions(status);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_expires_at ON payment_requests(expires_at);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_audit_logs_employee_id ON audit_logs(employee_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fuel_types_updated_at BEFORE UPDATE ON fuel_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gas_transactions_updated_at BEFORE UPDATE ON gas_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_requests_updated_at BEFORE UPDATE ON payment_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a function to get current employee context
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS UUID AS $$
BEGIN
    RETURN (current_setting('app.current_employee_id', true))::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for employees
CREATE POLICY "Employees can view their own data" ON employees
    FOR SELECT USING (
        id = get_current_employee_id() OR 
        (SELECT role FROM employees WHERE id = get_current_employee_id()) IN ('admin', 'manager')
    );

CREATE POLICY "Admins can manage all employees" ON employees
    FOR ALL USING (
        (SELECT role FROM employees WHERE id = get_current_employee_id()) IN ('admin', 'manager')
    );

-- RLS Policies for fuel_types
CREATE POLICY "All employees can view fuel types" ON fuel_types
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage fuel types" ON fuel_types
    FOR ALL USING (
        (SELECT role FROM employees WHERE id = get_current_employee_id()) IN ('admin', 'manager')
    );

-- RLS Policies for gas_transactions
CREATE POLICY "Employees can view their own transactions" ON gas_transactions
    FOR SELECT USING (
        employee_id = get_current_employee_id() OR 
        (SELECT role FROM employees WHERE id = get_current_employee_id()) IN ('admin', 'manager')
    );

CREATE POLICY "Employees can create transactions" ON gas_transactions
    FOR INSERT WITH CHECK (employee_id = get_current_employee_id());

CREATE POLICY "Only admins can update transactions" ON gas_transactions
    FOR UPDATE USING (
        (SELECT role FROM employees WHERE id = get_current_employee_id()) IN ('admin', 'manager')
    );

-- RLS Policies for payment_requests
CREATE POLICY "Users can view their own payment requests" ON payment_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests" ON payment_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment requests" ON payment_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment requests" ON payment_requests
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Admins can manage alerts" ON alerts
    FOR ALL USING (
        (SELECT role FROM employees WHERE id = get_current_employee_id()) IN ('admin', 'manager')
    );

-- RLS Policies for audit_logs
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        (SELECT role FROM employees WHERE id = get_current_employee_id()) IN ('admin', 'manager')
    );

-- Insert default fuel types
INSERT INTO fuel_types (name, type, price_per_liter) VALUES
    ('Gasoline 95', 'gasoline_95', 35.50),
    ('Gasoline 91', 'gasoline_91', 33.00),
    ('Diesel', 'diesel', 32.50),
    ('Premium Diesel', 'premium_diesel', 34.00),
    ('E20', 'e20', 31.00),
    ('E85', 'e85', 28.50);

-- Insert default admin employee
INSERT INTO employees (full_name, pin, role) VALUES
    ('System Administrator', '0000', 'admin'),
    ('Station Manager', '1234', 'manager'),
    ('Cashier 1', '5678', 'cashier');
