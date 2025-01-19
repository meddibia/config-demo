from typing import Any

import logfire
from config_model import ConfigType, UIConfig
from fastapi import APIRouter, Body, HTTPException, status
from pydantic import ValidationError
from redis_cache import get_config_from_cache, set_config_in_cache
from validation import build_dynamic_model_from_config

router = APIRouter()


@router.post("{tenant_id}/{config_type}/submit")
async def submit_form_data(
    tenant_id: str,
    config_type: ConfigType,
    data: dict[str, Any] = Body(...),
) -> dict[str, Any]:
    """Validates user-submitted data against the dynamic form definition in UIConfig,
    applying any constraints stored in the config fields."""

    # fetch teh UIConfig (from cache or db)
    cached_config = get_config_from_cache(tenant_id, config_type)
    if cached_config is None:
        doc = await UIConfig.find_one(
            UIConfig.tenant_id == tenant_id, UIConfig.type == config_type
        )
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Config not found"
            )
        # set in cache
        set_config_in_cache(tenant_id, config_type, doc.model_dump())
        config_obj = doc
    else:
        config_obj = UIConfig(**cached_config)

    # build a pydantic model from the config
    DynamicModel = build_dynamic_model_from_config(config_obj)

    # validate the submitted data
    try:
        validated_data = DynamicModel(**data).model_dump()
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors()
        ) from e

    logfire.debug("Form data validated", data=validated_data)

    # TODO: save validated data to the audit collection
    return {"success": True, "data": validated_data.model_dump()}
