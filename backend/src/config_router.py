"""
config_router.py
fastapi router for crud ops on UIConfig
implements redis caching to reduce mongodb lookups
"""

# TODO: figure out what, if any, authentication is required for cache hits/writes
#       it may just be as simple as applying our regullar RBAC and letting that control
#       cache access

import logfire  # ← add import to enable manual spans
from config_model import ConfigType, UIConfig, UpdateUIConfig
from fastapi import APIRouter, HTTPException, status
from redis_cache import (
    delete_config_from_cache,
    flush_cache,
    get_config_from_cache,
    set_config_in_cache,
)

router = APIRouter()


@router.get("/{tenant_id}/{config_type}", response_model=UIConfig)
async def get_ui_config(tenant_id: str, config_type: ConfigType):
    """
    fetch a ui config from redis or from mongodb if not found in the cache
    """

    # We'll create a parent span to measure the entire request,
    # then sub-spans to compare cache vs. DB fetch.
    with logfire.span("get_ui_config total"):
        with logfire.span("cache lookup"):
            cached_config = get_config_from_cache(tenant_id, config_type)

        if cached_config:
            logfire.info("Cache hit", tenant_id=tenant_id, config_type=str(config_type))
            return cached_config

        with logfire.span("db fetch"):
            doc = await UIConfig.find_one(
                UIConfig.tenant_id == tenant_id, UIConfig.type == config_type
            )
            if not doc:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Config not found"
                )

    # cache + return result
    set_config_in_cache(tenant_id, config_type, doc.model_dump())
    return doc


@router.post("/", response_model=UIConfig)
async def create_ui_config(config: UIConfig):
    """
    create a new UIConfig document in mongodb
    invalidate or update teh redis cache as needed
    """
    # ensure no duplicates
    existing = await UIConfig.find_one(
        UIConfig.tenant_id == config.tenant_id,
        UIConfig.type == config.type,
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Config with this tenant_id already exists"
        )
    await config.insert()

    set_config_in_cache(config.tenant_id, config.type, config.model_dump())
    return config


@router.put("/{tenant_id}/{config_type}", response_model=UIConfig)
async def update_ui_config(
    tenant_id: str, config_type: ConfigType, updated_data: UpdateUIConfig
):
    """update existing config in both mongodb and redis"""
    doc = await UIConfig.find_one(
        UIConfig.tenant_id == tenant_id, UIConfig.type == config_type
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Config not found")

    if updated_data.fields:
        doc.fields = updated_data.fields
    if updated_data.description:
        doc.description = updated_data.description

    await doc.save()

    set_config_in_cache(tenant_id, config_type, doc.model_dump())
    return doc


@router.delete("/{tenant_id}/{config_type}")
async def delete_ui_config(tenant_id: str, config_type: ConfigType):
    """delete a config by tenant_id and config_type"""
    doc = await UIConfig.find_one(
        UIConfig.tenant_id == tenant_id, UIConfig.type == config_type
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Config not found"
        )

    await doc.delete()
    delete_config_from_cache(tenant_id, config_type)
    return {"status": "success", "message": "Config deleted"}


@router.get("/", response_model=list[UIConfig])
async def list_configs(
    tenant_id: str | None = None, config_type: ConfigType | None = None
):
    """list existing configs that match the query parameters"""

    query = {}
    if tenant_id is not None:
        query["tenant_id"] = tenant_id
    if config_type is not None:
        query["config_type"] = config_type

    configs = await UIConfig.find(query).to_list()
    return configs


@router.post("/flush-cache")
async def flush_cache_endpoint():
    """
    Clears the entire Redis cache. Use with caution!
    """
    flush_cache()
    return {"status": "success", "message": "Redis cache flushed"}
