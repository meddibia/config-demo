export enum FormFieldType {
	HEADER = "header",
	STATIC = "static",
	TEXT = "text",
	SELECT = "select",
	CHECKBOX = "checkbox",
}

export enum ConfigType {
	PATIENT_REGISTRATION = "patient-registration",
	PATIENT_SEARCH = "patient-search",
	PATIENT_DETAILS = "patient-details",
	PATIENT_ENCOUNTERS = "patient-encounters",
	PATIENT_BILLING = "patient-billing",
}

export interface FieldValidation {
	required?: boolean;
	min_length?: number;
	max_length?: number;
	pattern?: string;
}

export interface FormField {
	id: string;
	type: FormFieldType;
	label?: string;
	name?: string;
	options?: string[];
	content?: string;
	default?: string | boolean;
	validation?: FieldValidation;
}

export interface UIConfig {
	_id?: string;
	tenant_id: string;
	type: ConfigType;
	description?: string;
	fields: FormField[];
}
