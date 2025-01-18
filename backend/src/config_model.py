"""
config_model.py
defines the mongodb model for storing form/config data using beanie
"""

from beanie import Document
from pydantic import BaseModel, Field, field_serializer


# TODO:  add enum for type
class FormField(BaseModel):
    """
    represents a single form field or a static item in the ui

    type: eg. "text", "select", "checkbox", "header", "static"
    label: display label for formfields (not used if type is "header", "static")
    name: form field name (not used if type is "header"/"static")
    options: optional list of select/checkbox options
    content: used for static text / headers
    """

    id: str
    type: str
    label: str | None = None
    name: str | None = None
    options: list[str] | None = None
    content: str | None = None
    default: str | bool | None = None


class UIConfig(Document):
    """
    a top-level ui configuration document
    for multi-tenancy, store the tenant_id (mainly relevant for cloud deployments)
    we can define configs for different parts of the ui, separated by the config_name field
    """

    tenant_id: str
    # this could also be config_type as an enum
    config_name: str  # e.g. 'patient-registration'
    description: str | None
    fields: list[FormField] = Field(default_factory=list)

    # TODO: see if beanie will let us enforce uniqueness on the tenant_id and config_name fields

    @field_serializer("id")
    def serialize_objcet_id(self, id) -> str:
        return str(id)
