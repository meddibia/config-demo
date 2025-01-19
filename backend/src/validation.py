from config_model import FormFieldType, UIConfig
from pydantic import (
    BaseModel,
    Field,
    constr,
    create_model,
)


def build_dynamic_model_from_config(config: UIConfig) -> type[BaseModel]:
    """
    dynamically create a pydantic model class from a UIConfig's fields,
    applying validation constraints
    """
    field_defs = {}

    for form_field in config.fields:
        # skip fields that don't accept user input
        if form_field.type in (FormFieldType.HEADER, FormFieldType.STATIC):
            continue

        # if the field has no 'name', skip it - can't store in the model
        if not form_field.name:
            continue

        # determine python type
        if (
            form_field.type == FormFieldType.TEXT
            or form_field.type == FormFieldType.SELECT
        ):
            field_type = str
        elif form_field.type == FormFieldType.CHECKBOX:
            field_type = bool
        else:
            # fallback
            field_type = str

        # accumulate constraints
        # for strings, use `constr()`
        # we'd need to implement more validation as we expand the field types
        validation_kws = {}
        if form_field.validation:
            if form_field.validation.min_length is not None:
                validation_kws["min_length"] = form_field.validation.min_length
            if form_field.validation.max_length is not None:
                validation_kws["max_length"] = form_field.validation.max_length
            if form_field.validation.pattern is not None:
                validation_kws["regex"] = form_field.validation.pattern

        # if it s astring field, create a `constr()`
        if field_type is str and validation_kws:
            field_type = constr(**validation_kws)

        # determine default / required
        default_val = form_field.default
        required = True
        if form_field.validation and form_field.validation.required is False:
            required = False

        if not required:
            # if field is optional, set the default to none,
            # or keep the user-provided default
            # it must be allowed to be None
            field_type = field_type | None
            default_val = default_val if default_val is not None else None

        # track the field definition
        # store tuples: (type, Field(default=))
        field_defs[form_field.name] = (field_type, Field(default=default_val))

    # create and return a pydantic model
    DynamicModel = create_model(
        f"DynamicModel_{config.tenant_id}_{config.type}",
        **field_defs,
    )

    return DynamicModel
