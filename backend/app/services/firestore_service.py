"""
Google Cloud Firestore Persistence Service for Satta Thozhan.
Stores per-customer legal queries and prep-sheets indexed by Firebase Auth ID.
Uses Google Application Default Credentials (ADC) and httpx for async non-blocking execution.
Implements indexed structured queries (runQuery) to avoid full collection scans.
"""

import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx
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

    async def save_consultation_async(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Asynchronously saves a citizen legal consultation query to the 'consultations' collection."""
        now_iso = datetime.now(timezone.utc).isoformat()
        case_id = case_data.get("id") or f"case_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        case_data["id"] = case_id
        case_data["updated_at"] = now_iso
        if "created_at" not in case_data:
            case_data["created_at"] = now_iso

        token = await asyncio.to_thread(_get_access_token)
        if not token:
            logger.info(f"Storing consultation {case_id} in local storage fallback.")
            _LOCAL_STORE[case_id] = case_data
            return case_data

        url = f"{self.base_url}/consultations/{case_id}"
        fields = {k: _to_firestore_value(v) for k, v in case_data.items()}
        payload = {"fields": fields}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.patch(
                    url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                )
                if resp.status_code in (200, 201):
                    logger.info(f"Successfully saved consultation {case_id} to Firestore.")
                    _LOCAL_STORE[case_id] = case_data
                    return case_data
                else:
                    logger.warning(f"Firestore save returned status {resp.status_code}: {resp.text}")
                    _LOCAL_STORE[case_id] = case_data
                    return case_data
        except Exception as e:
            logger.error(f"Failed to write consultation to Firestore: {e}. Storing locally.")
            _LOCAL_STORE[case_id] = case_data
            return case_data

    def save_consultation(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Synchronous wrapper for save_consultation."""
        now_iso = datetime.now(timezone.utc).isoformat()
        case_id = case_data.get("id") or f"case_{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        case_data["id"] = case_id
        case_data["updated_at"] = now_iso
        if "created_at" not in case_data:
            case_data["created_at"] = now_iso

        token = _get_access_token()
        if not token:
            _LOCAL_STORE[case_id] = case_data
            return case_data

        url = f"{self.base_url}/consultations/{case_id}"
        fields = {k: _to_firestore_value(v) for k, v in case_data.items()}
        payload = {"fields": fields}

        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.patch(
                    url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                )
                if resp.status_code in (200, 201):
                    _LOCAL_STORE[case_id] = case_data
                    return case_data
                _LOCAL_STORE[case_id] = case_data
                return case_data
        except Exception as e:
            logger.error(f"Sync write to Firestore failed: {e}. Storing locally.")
            _LOCAL_STORE[case_id] = case_data
            return case_data

    async def list_user_consultations_async(self, auth_id: str) -> List[Dict[str, Any]]:
        """
        Asynchronously queries consultations for a given Firebase Auth ID using Firestore runQuery.
        Performs an indexed server-side field filter rather than downloading the entire collection.
        """
        token = await asyncio.to_thread(_get_access_token)
        if not token:
            matched = [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]
            matched.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
            return matched

        # Use structuredQuery to query by auth_id directly on Firestore
        url = f"{self.base_url}:runQuery"
        query_payload = {
            "structuredQuery": {
                "from": [{"collectionId": "consultations"}],
                "where": {
                    "fieldFilter": {
                        "field": {"fieldPath": "auth_id"},
                        "op": "EQUAL",
                        "value": {"stringValue": auth_id}
                    }
                }
            }
        }

        results: List[Dict[str, Any]] = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    url,
                    json=query_payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                )
                if resp.status_code == 200:
                    entries = resp.json()
                    for entry in entries:
                        doc = entry.get("document")
                        if doc:
                            raw_fields = doc.get("fields", {})
                            parsed = {k: _from_firestore_value(v) for k, v in raw_fields.items()}
                            results.append(parsed)
                    results.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
                    return results
                else:
                    logger.warning(f"Firestore runQuery returned status {resp.status_code}")
                    matched = [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]
                    matched.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
                    return matched
        except Exception as e:
            logger.warning(f"Async query to Firestore failed: {e}. Falling back to local.")
            matched = [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]
            matched.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
            return matched

    def list_user_consultations(self, auth_id: str) -> List[Dict[str, Any]]:
        """Synchronous wrapper for list_user_consultations."""
        token = _get_access_token()
        if not token:
            matched = [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]
            matched.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
            return matched

        url = f"{self.base_url}:runQuery"
        query_payload = {
            "structuredQuery": {
                "from": [{"collectionId": "consultations"}],
                "where": {
                    "fieldFilter": {
                        "field": {"fieldPath": "auth_id"},
                        "op": "EQUAL",
                        "value": {"stringValue": auth_id}
                    }
                }
            }
        }

        results: List[Dict[str, Any]] = []
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(
                    url,
                    json=query_payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                )
                if resp.status_code == 200:
                    entries = resp.json()
                    for entry in entries:
                        doc = entry.get("document")
                        if doc:
                            raw_fields = doc.get("fields", {})
                            parsed = {k: _from_firestore_value(v) for k, v in raw_fields.items()}
                            results.append(parsed)
                    results.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
                    return results
                matched = [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]
                matched.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
                return matched
        except Exception as e:
            logger.warning(f"Sync query to Firestore failed: {e}. Falling back to local.")
            matched = [c for c in _LOCAL_STORE.values() if c.get("auth_id") == auth_id]
            matched.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
            return matched

    async def get_consultation_async(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Asynchronously retrieves a single consultation document by ID."""
        if case_id in _LOCAL_STORE:
            return _LOCAL_STORE[case_id]

        token = await asyncio.to_thread(_get_access_token)
        if not token:
            return None

        url = f"{self.base_url}/consultations/{case_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    url,
                    headers={"Authorization": f"Bearer {token}"}
                )
                if resp.status_code == 200:
                    doc = resp.json()
                    fields = doc.get("fields", {})
                    return {k: _from_firestore_value(v) for k, v in fields.items()}
                return None
        except Exception as e:
            logger.warning(f"Failed to fetch document {case_id} asynchronously: {e}")
            return None

    def get_consultation(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single consultation document by ID synchronously."""
        if case_id in _LOCAL_STORE:
            return _LOCAL_STORE[case_id]

        token = _get_access_token()
        if not token:
            return None

        url = f"{self.base_url}/consultations/{case_id}"
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(
                    url,
                    headers={"Authorization": f"Bearer {token}"}
                )
                if resp.status_code == 200:
                    doc = resp.json()
                    fields = doc.get("fields", {})
                    return {k: _from_firestore_value(v) for k, v in fields.items()}
                return None
        except Exception as e:
            logger.warning(f"Failed to fetch document {case_id} synchronously: {e}")
            return None


firestore_service = FirestoreService()
