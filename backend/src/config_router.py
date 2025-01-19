"""
config_router.py
fastapi router for crud ops on UIConfig
implements redis caching to reduce mongodb lookups
"""

# TODO: add logfire, run experiments to compare with/without redis
# TODO: figure out what, if any, authentication is required for cache hits/writes
#       it may just be as simple as applying our regullar RBAC and letting that control
#       cache access

from fastapi import APIRouter, HTTPException, status

from config_model import UIConfig, UpdateUIConfig
from redis_cache import get_config_from_cache, set_config_in_cache

router = APIRouter()


@router.get("/{tenant_id}/{config_name}", response_model=UIConfig)
async def get_ui_config(tenant_id: str, config_name: str):
    """
    fetch a ui config from redis or from mongodb if not found in the cache
    """

    # check cache
    cached_config = get_config_from_cache(tenant_id, config_name)
    if cached_config:
        return cached_config

    # if not in cache, fetch from mongo
    doc = await UIConfig.find_one(
        UIConfig.tenant_id == tenant_id, UIConfig.config_name == config_name
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Config not found"
        )

    # cache + return result
    set_config_in_cache(tenant_id, config_name, doc.model_dump())
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
        UIConfig.config_name == config.config_name,
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Config with this tenant_id already exists"
        )
    await config.insert()

    set_config_in_cache(config.tenant_id, config.config_name, config.model_dump())
    return config


@router.put("/{tenant_id}/{config_name}", response_model=UIConfig)
async def update_ui_config(
    tenant_id: str, config_name: str, updated_data: UpdateUIConfig
):
    """update existing config in both mongodb and redis"""
    doc = await UIConfig.find_one(
        UIConfig.tenant_id == tenant_id, UIConfig.config_name == config_name
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Config not found")

    if updated_data.fields:
        doc.fields = updated_data.fields
    if updated_data.description:
        doc.description = updated_data.description

    await doc.save()

    set_config_in_cache(tenant_id, config_name, doc.model_dump())
    return doc


@router.get("/", response_model=list[UIConfig])
async def list_configs(tenant_id: str | None = None, config_name: str | None = None):
    """list existing configs that match the query parameters"""

    query = {}
    if tenant_id is not None:
        query["tenant_id"] = tenant_id
    if config_name is not None:
        query["config_name"] = tenant_id

    configs = await UIConfig.find(query).to_list()
    return configs


@router.put("/uiconfig/{config_id}", response_model=UIConfig)
async def update_ui_config_by_id(config_id: str, config: UpdateUIConfig):
    existing_config = await UIConfig.get(config_id)
    if not existing_config:
        raise HTTPException(status_code=404, detail="UIConfig not found")

    update_data = config.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(existing_config, key, value)

    await existing_config.save()
    set_config_in_cache(
        existing_config.tenant_id,
        existing_config.config_name,
        existing_config.model_dump(),
    )
    return existing_config
