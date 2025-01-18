export interface FormField {
  id: string;
  type: string;                  // "text", "select", "checkbox", "header", "static"
  label?: string;
  name?: string;
  options?: string[];
  content?: string;
  default?: string | boolean;
}

export interface UIConfig {
  _id?: string;
  tenant_id: string;
  config_name: string;
  description?: string;
  fields: FormField[];
}
