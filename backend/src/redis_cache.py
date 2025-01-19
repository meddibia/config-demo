"""
redis_cache.py
provides a wrapper around redis for caching configs.
we should extend this to cache responses from other endpoints, where appropriate
"""

import json

import redis

# we'd load these from config.Settings
# TODO: check if this should be set to `redis` when this runs in docker
REDIS_HOST = "redis"
REDIS_PORT = 6379
CACHE_EXPIRE_S = 3600  # 1 hour

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

# TODO: make a decorator to wrap the cache functions
#       should effectively automate the cache lookup/set logic


def get_config_from_cache(tenant_id: str, config_name: str) -> dict:
    key = f"ui_config:{tenant_id}:{config_name}"
    data = redis_client.get(key)
    if data is None:
        return None
    return json.loads(data)


def set_config_in_cache(tenant_id: str, config_name: str, config_dict: dict):
    key = f"ui_config:{tenant_id}:{config_name}"
    redis_client.set(key, json.dumps(config_dict), ex=CACHE_EXPIRE_S)


def flush_cache():
    """
    Flushes the entire Redis database.
    Use with caution, as this clears all keys/data.
    """
    redis_client.flushdb()
