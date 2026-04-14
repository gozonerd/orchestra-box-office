-- Initial schema for Orchestra Box Office Cloud API
-- Database: PostgreSQL 14+

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Auth tokens table (session management)
CREATE TABLE IF NOT EXISTS auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- Entities table (synced data from desktop)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- "Pipeline", "Budget", "PipelineRun", "Outcome"
    entity_id VARCHAR(255) NOT NULL,
    operation VARCHAR(20) NOT NULL, -- "create", "update", "delete"
    data JSONB NOT NULL,
    local_version INT NOT NULL DEFAULT 1,
    remote_version INT NOT NULL DEFAULT 1,
    synced_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entities_user_id_type ON entities(user_id, entity_type);
CREATE INDEX idx_entities_entity_type_id ON entities(entity_type, entity_id, user_id);
CREATE INDEX idx_entities_synced_at ON entities(synced_at);

-- Sync queue (pending entries from desktop)
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    data JSONB NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    local_version INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- "pending", "synced", "failed", "conflict"
    error_message TEXT,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_queue_user_id_status ON sync_queue(user_id, status);
CREATE INDEX idx_sync_queue_client_id ON sync_queue(client_id);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);

-- Conflicts table (sync conflicts requiring manual resolution)
CREATE TABLE IF NOT EXISTS conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    local_data JSONB NOT NULL,
    remote_data JSONB NOT NULL,
    resolution_strategy VARCHAR(20) NOT NULL DEFAULT 'manual', -- "manual", "local_wins", "remote_wins"
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_choice VARCHAR(20), -- "local_wins", "remote_wins"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conflicts_user_id_status ON conflicts(user_id, resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_conflicts_entity ON conflicts(entity_type, entity_id, user_id);

-- Audit log (all mutations)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- "sync_entry", "resolve_conflict", "delete_entity"
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    old_data JSONB,
    new_data JSONB,
    client_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Deployment info (version tracking)
CREATE TABLE IF NOT EXISTS deployment (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deployed_by VARCHAR(255),
    notes TEXT
);

CREATE INDEX idx_deployment_version ON deployment(version);

-- Constraints
ALTER TABLE entities ADD CONSTRAINT chk_entity_operation CHECK (operation IN ('create', 'update', 'delete'));
ALTER TABLE sync_queue ADD CONSTRAINT chk_queue_operation CHECK (operation IN ('create', 'update', 'delete'));
ALTER TABLE sync_queue ADD CONSTRAINT chk_queue_status CHECK (status IN ('pending', 'synced', 'failed', 'conflict'));
ALTER TABLE conflicts ADD CONSTRAINT chk_conflict_strategy CHECK (resolution_strategy IN ('manual', 'local_wins', 'remote_wins'));

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER entities_updated_at BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sync_queue_updated_at BEFORE UPDATE ON sync_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER conflicts_updated_at BEFORE UPDATE ON conflicts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
