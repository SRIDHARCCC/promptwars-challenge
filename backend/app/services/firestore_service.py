"""
Google Cloud Firestore Persistence Service for Satta Thozhan.
Stores per-customer legal queries and prep-sheets indexed by Firebase Auth ID.
Uses Google Application Default Credentials (ADC).
"""

import json
import logging
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import google.auth
from google.auth.transport.requests import Request
from app.config import settings

logger = logging.getLogger(__name__)

FIRESTORE_SCOPES = ["https://www.googleapis.com/auth/datastore"]

# In-memory fallback if Firestore credentials fail
_LOCAL_STORE: Dict[str, Dict[str, Any]] = {}


def _to_firestore_value(val: Any) -> Dict[str, Any]:
    """Converts a standard Python object to Firestore REST API typed value."""
    if val is None:
        return {"nullValue": None}
    elif isinstance(val, bool):
        return {"booleanValue": val}
    elif isinstance(val, int):
        return {"integerValue": str(val)}
    elif isinstance(val, float):
        return {"doubleValue": val}
    elif isinstance(val, str):
        return {"stringValue": val}
    elif isinstance(val, list):
        return {"arrayValue": {"values": [_to_firestore_value(x) for x in val]}}
    elif isinstance(val, dict):
        return {
            "mapValue": {
                "fields": {k: _to_firestore_value(v) for k, v in val.items()}
            }
        }
    return {"stringValue": str(val)}


def _from_firestore_value(val_dict: Dict[str, Any]) -> Any:
    """Converts a Firestore REST API typed value to a native Python object."""
    if not isinstance(val_dict, dict):
        return val_dict
    if "stringValue" in val_dict:
        return val_dict["stringValue"]
    if "integerValue" in val_dict:
        try:
            return int(val_dict["integerValue"])
        except ValueError:
            return val_dict["integerValue"]
    if "doubleValue" in val_dict:
        return float(val_dict["doubleValue"])
    if "booleanValue" in val_dict:
        return bool(val_dict["booleanValue"])
    if "nullValue" in val_dict:
        return None
    if "timestampValue" in val_dict:
        return val_dict["timestampValue"]
    if "arrayValue" in val_dict:
        values = val_dict["arrayValue"].get("values", [])
        return [_from_firestore_value(v) for v in values]
    if "mapValue" in val_dict:
        fields = val_dict["mapValue"].get("fields", {})
        return {k: _from_firestore_value(v) for k, v in fields.items()}
    return val_dict


def _get_access_token() -> Optional[str]:
    """Retrieves an OAuth2 access token via Application Default Credentials."""
    try:
        credentials, _ = google.auth.default(scopes=FIRESTORE_SCOPES)
        credentials.refresh(Request())
        return credentials.token
    except Exception as e:
        logger.warning(f"Could not acquire GCP ADC token for Firestore: {e}")
        return None


class FirestoreService:
    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id or settings.GOOGLE_CLOUD_PROJECT or "default"
        self.base_url = f"https://firestore.googleapis.com/v1/projects/{self.project_id}/databases/(default)/documents"

    def save_consultation(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves a citizen legal consultation query to the 'consultations' collection."""
        token = _get_access_token()
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Ensure timestamp and ID
        case_id = case_data.get("id") or f"case_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        case_data["id"] = case_id
        case_data["updated_at"] = now_iso
        if "created_at" not in case_data:
            case_data["created_at"] = now_iso

        if not token:
            logger.info(f"Storing consultation {case_id} in local storage fallback.")
            _LOCAL_STORE[case_id] = case_data
            return case_data

        url = f"{self.base_url}/consultations/{case_id}"
        fields = {k: _to_firestore_value(v) for k, v in case_data.items()}
        payload = json.dumps({"fields": fields}).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            method="PATCH"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                logger.info(f"Successfully saved consultation {case_id} to Firestore.")
                _LOCAL_STORE[case_id] = case_data
                return case_data
        except Exception as e:
            logger.error(f"Failed to write consultation to Firestore: {e}. Storing locally.")
            _LOCAL_STORE[case_id] = case_data
            return case_data

    def list_user_consultations(self, auth_id: str) -> List[Dict[str, Any]]:
        """Queries all consultations for a given Firebase Auth ID."""
        token = _get_access_token()
        if not token:
            return [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]

        url = f"{self.base_url}/consultations?pageSize=100"
        req = urllib.request.Request(
            url,
            headers={"Authorization": f"Bearer {token}"},
            method="GET"
        )

        results: List[Dict[str, Any]] = []
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                docs = data.get("documents", [])
                for doc in docs:
                    raw_fields = doc.get("fields", {})
                    parsed = {k: _from_firestore_value(v) for k, v in raw_fields.items()}
                    if parsed.get("auth_id") == auth_id:
                        results.append(parsed)
            # Sort by created_at descending
            results.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
            return results
        except Exception as e:
            logger.warning(f"Error querying Firestore consultations: {e}. Falling back to local.")
            matched = [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]
            matched.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
            return matched

    def get_consultation(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single consultation document by ID."""
        if case_id in _LOCAL_STORE:
            return _LOCAL_STORE[case_id]

        token = _get_access_token()
        if not token:
            return None

        url = f"{self.base_url}/consultations/{case_id}"
        req = urllib.request.Request(
            url,
            headers={"Authorization": f"Bearer {token}"},
            method="GET"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                doc = json.loads(resp.read().decode("utf-8"))
                fields = doc.get("fields", {})
                return {k: _from_firestore_value(v) for k, v in fields.items()}
        except Exception as e:
            logger.warning(f"Failed to fetch document {case_id} from Firestore: {e}")
            return None


firestore_service = FirestoreService()
