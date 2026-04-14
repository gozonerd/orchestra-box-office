use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

/// Login request
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

/// Auth token response
#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub token: String,
    pub user_id: String,
}

/// Sync payload from desktop
#[derive(Debug, Serialize, Deserialize)]
pub struct SyncPayload {
    pub entity_type: String,
    pub entity_id: String,
    pub operation: String, // "create", "update", "delete"
    pub data: JsonValue,
    pub local_version: i32,
    pub timestamp: i64,
}

/// Batch sync request
#[derive(Debug, Serialize, Deserialize)]
pub struct BatchSyncRequest {
    pub entries: Vec<SyncPayload>,
    pub client_id: String,
}

/// Sync response for single entry
#[derive(Debug, Serialize, Deserialize)]
pub struct SyncResponse {
    pub entity_id: String,
    pub synced: bool,
    pub remote_version: Option<i32>,
    pub conflict: Option<ConflictData>,
    pub error: Option<String>,
}

/// Batch sync response
#[derive(Debug, Serialize, Deserialize)]
pub struct BatchSyncResponse {
    pub synced_count: i32,
    pub failed_count: i32,
    pub conflict_count: i32,
    pub responses: Vec<SyncResponse>,
    pub server_timestamp: i64,
}

/// Conflict data
#[derive(Debug, Serialize, Deserialize)]
pub struct ConflictData {
    pub entity_type: String,
    pub entity_id: String,
    pub local_data: JsonValue,
    pub remote_data: JsonValue,
    pub resolution_strategy: String, // "manual", "local_wins", "remote_wins"
}

/// Conflict resolution request
#[derive(Debug, Serialize, Deserialize)]
pub struct ResolveConflictRequest {
    pub entity_type: String,
    pub entity_id: String,
    pub resolution: String, // "local_wins" or "remote_wins"
}

/// Entity fetch response
#[derive(Debug, Serialize, Deserialize)]
pub struct EntityResponse {
    pub data: JsonValue,
}
