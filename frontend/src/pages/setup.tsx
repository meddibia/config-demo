import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ConfigType,
  FieldValidation,
  type FormField,
  FormFieldType,
  type UIConfig,
} from "@/services/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listConfigs, deleteUIConfig } from "@/services/configService";
import { Eye } from "lucide-react";

// Optionally, adjust to your actual backend base URL
const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";

function ConfigFormDialog({
  tenantId,
  open,
  onOpenChange,
  onSuccess,
  configToEdit,
}: {
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (config: UIConfig) => void;
  // Pass in an existing config (if editing) or undefined (if creating)
  configToEdit?: UIConfig;
}) {
  const [configType, setConfigType] = useState<ConfigType | "">("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [existingId, setExistingId] = useState<string | undefined>(undefined);

  // When configToEdit changes, update local state for editing
  useEffect(() => {
    if (configToEdit) {
      setConfigType(configToEdit.type);
      setDescription(configToEdit.description ?? "");
      setFields(configToEdit.fields);
      setExistingId(configToEdit._id);
    } else {
      // Reset for creating
      setConfigType("");
      setDescription("");
      setFields([]);
      setExistingId(undefined);
    }
  }, [configToEdit]);

  // Helper to update the top-level field properties
  function handleFieldChange(
    id: string,
    prop: keyof FormField,
    value: unknown,
  ) {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === id) {
          return { ...field, [prop]: value };
        }
        return field;
      }),
    );
  }

  // Helper to update only the nested validation object
  function handleFieldValidationChange(
    id: string,
    key: keyof FieldValidation,
    value: unknown,
  ) {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === id) {
          return {
            ...field,
            validation: {
              required: field.validation?.required ?? true,
              ...field.validation,
              [key]: value,
            },
          };
        }
        return field;
      }),
    );
  }

  // Create or Update config
  async function handleSaveConfig() {
    if (!tenantId || !configType) {
      toast.error("Tenant ID and Config Type are required.");
      return;
    }

    // Prepare the body
    const payload: Partial<UIConfig> = {
      tenant_id: tenantId,
      type: configType as ConfigType,
      description,
      fields,
    };

    try {
      let res: { data: UIConfig } | undefined;

      // If we have an _id, assume we are updating, else create
      if (existingId) {
        res = await axios.put<UIConfig>(
          `${API_BASE_URL}/config/${tenantId}/${configType}`,
          payload,
        );
        toast.success("Config updated successfully");
      } else {
        res = await axios.post<UIConfig>(`${API_BASE_URL}/config/`, payload);
        toast.success("Config created successfully");
      }

      if (res?.data) {
        onSuccess(res.data);
      }
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ?? "Error creating/updating config.",
        );
      } else {
        toast.error("Error creating/updating config.");
      }
    }
  }

  // Add a new form field card
  function handleAddField() {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: FormFieldType.TEXT,
      label: "",
      name: "",
      options: [],
      content: "",
      default: "",
      validation: {
        required: true,
        min_length: undefined,
        max_length: undefined,
        pattern: undefined,
      },
    };
    setFields((prev) => [...prev, newField]);
  }

  // Remove a field card by ID
  function handleRemoveField(id: string) {
    setFields((prev) => prev.filter((field) => field.id !== id));
  }

  // Render the dynamic form controls for each field type
  function renderFieldControls(field: FormField) {
    switch (field.type) {
      case FormFieldType.HEADER:
      case FormFieldType.STATIC:
        return (
          <>
            <Label className="mt-2">Content</Label>
            <Input
              value={field.content ?? ""}
              onChange={(e) =>
                handleFieldChange(field.id, "content", e.target.value)
              }
              placeholder="Enter the header or static text..."
            />
          </>
        );

      case FormFieldType.TEXT:
        return (
          <>
            <Label className="mt-2">Label</Label>
            <Input
              value={field.label ?? ""}
              onChange={(e) =>
                handleFieldChange(field.id, "label", e.target.value)
              }
            />
            <Label className="mt-2">Name</Label>
            <Input
              value={field.name ?? ""}
              onChange={(e) =>
                handleFieldChange(field.id, "name", e.target.value)
              }
            />
            <Label className="mt-2">Default Value</Label>
            <Input
              value={String(field.default ?? "")}
              onChange={(e) =>
                handleFieldChange(field.id, "default", e.target.value)
              }
            />
          </>
        );

      case FormFieldType.SELECT:
        return (
          <>
            <Label className="mt-2">Label</Label>
            <Input
              value={field.label ?? ""}
              onChange={(e) =>
                handleFieldChange(field.id, "label", e.target.value)
              }
            />
            <Label className="mt-2">Name</Label>
            <Input
              value={field.name ?? ""}
              onChange={(e) =>
                handleFieldChange(field.id, "name", e.target.value)
              }
            />
            <Label className="mt-2">Options (comma-separated)</Label>
            <Input
              value={field.options?.join(", ") ?? ""}
              onChange={(e) =>
                handleFieldChange(
                  field.id,
                  "options",
                  e.target.value.split(","),
                )
              }
              placeholder="e.g. Male, Female, Other"
            />
            <Label className="mt-2">Default Selection</Label>
            <Input
              value={String(field.default ?? "")}
              onChange={(e) =>
                handleFieldChange(field.id, "default", e.target.value)
              }
            />
          </>
        );

      case FormFieldType.CHECKBOX:
        return (
          <>
            <Label className="mt-2">Label</Label>
            <Input
              value={field.label ?? ""}
              onChange={(e) =>
                handleFieldChange(field.id, "label", e.target.value)
              }
            />
            <Label className="mt-2">Name</Label>
            <Input
              value={field.name ?? ""}
              onChange={(e) =>
                handleFieldChange(field.id, "name", e.target.value)
              }
            />
            <Label className="mt-2">Default Checked</Label>
            <Select
              value={field.default === true ? "true" : "false"}
              onValueChange={(val) =>
                handleFieldChange(field.id, "default", val === "true")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </>
        );

      default:
        return null;
    }
  }

  // Show validation controls if the field is not HEADER/STATIC
  function renderValidationControls(field: FormField) {
    if (
      field.type === FormFieldType.HEADER ||
      field.type === FormFieldType.STATIC
    ) {
      return null;
    }

    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="text-md font-medium mb-2">Validation</h3>

        <div className="flex items-center mb-2">
          <Label className="mr-2">Required:</Label>
          <input
            type="checkbox"
            checked={field.validation?.required !== false}
            onChange={(e) =>
              handleFieldValidationChange(
                field.id,
                "required",
                e.target.checked,
              )
            }
          />
        </div>

        <Label className="mt-2">Min Length:</Label>
        <Input
          type="number"
          value={field.validation?.min_length ?? ""}
          onChange={(e) =>
            handleFieldValidationChange(
              field.id,
              "min_length",
              e.target.value ? parseInt(e.target.value, 10) : undefined,
            )
          }
        />

        <Label className="mt-2">Max Length:</Label>
        <Input
          type="number"
          value={field.validation?.max_length ?? ""}
          onChange={(e) =>
            handleFieldValidationChange(
              field.id,
              "max_length",
              e.target.value ? parseInt(e.target.value, 10) : undefined,
            )
          }
        />

        <Label className="mt-2">Regex Pattern:</Label>
        <Input
          value={field.validation?.pattern ?? ""}
          onChange={(e) =>
            handleFieldValidationChange(field.id, "pattern", e.target.value)
          }
          placeholder="e.g. ^[0-9]{3}-[0-9]{2}-[0-9]{4}$"
        />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingId ? "Edit Configuration" : "Create New Configuration"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Config Type</Label>
            <Select
              value={configType}
              onValueChange={(val) => setConfigType(val as ConfigType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select config type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ConfigType).map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    {ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the config..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Form Fields</h2>
              <Button onClick={handleAddField}>Add New Field</Button>
            </div>

            {fields.map((field) => (
              <Card key={field.id}>
                <CardHeader className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Field: {field.id.slice(0, 8)}...
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveField(field.id)}
                  >
                    Delete
                  </Button>
                </CardHeader>
                <CardContent>
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(val) =>
                      handleFieldChange(field.id, "type", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(FormFieldType).map((ft) => (
                        <SelectItem key={ft} value={ft}>
                          {ft}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Main field controls */}
                  {renderFieldControls(field)}

                  {/* Validation controls */}
                  {renderValidationControls(field)}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig}>
              {existingId ? "Save Changes" : "Create Config"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SetupPage() {
  const [tenantId, setTenantId] = useState("tenant123");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [configs, setConfigs] = useState<UIConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<UIConfig | undefined>(
    undefined,
  );

  // Load configs on mount
  useEffect(() => {
    async function fetchConfigs() {
      try {
        const data = await listConfigs(tenantId);
        setConfigs(data);
      } catch (error) {
        console.error(error);
        toast.error("Error loading configs");
      }
    }
    fetchConfigs();
  }, [tenantId]);

  // Open dialog for creating a new config
  function handleNewConfig() {
    setSelectedConfig(undefined);
    setIsDialogOpen(true);
  }

  // Open dialog for editing an existing config
  function handleEditConfig(config: UIConfig) {
    setSelectedConfig(config);
    setIsDialogOpen(true);
  }

  // Delete a config
  async function handleDeleteConfig(config: UIConfig) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the config of type "${config.type}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteUIConfig(tenantId, config.type);
      toast.success("Config deleted successfully");
      const data = await listConfigs(tenantId);
      setConfigs(data);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error deleting config.");
      } else {
        toast.error("Error deleting config.");
      }
    }
  }

  // When a config is successfully created/updated
  async function handleSuccess(updatedConfig: UIConfig) {
    setIsDialogOpen(false);
    try {
      const data = await listConfigs(tenantId);
      setConfigs(data);
    } catch (err) {
      console.error(err);
      toast.error("Error reloading configs");
    }
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-2xl font-bold mb-4">Configuration Management</h1>

        <div className="space-y-4">
          <div>
            <Label>Tenant ID</Label>
            <Input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="tenant123"
              disabled
            />
          </div>

          {/* Existing configs */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Existing Configs</h2>
            {configs.length === 0 && <p>No configs found</p>}
            {configs.length > 0 && (
              <table className="min-w-full border">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg) => (
                    <tr
                      key={cfg._id ?? `${cfg.tenant_id}-${cfg.type}`}
                      className="border-b"
                    >
                      <td className="p-2">{cfg.type}</td>
                      <td className="p-2">{cfg.description}</td>
                      <td className="p-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditConfig(cfg)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View/Edit
                        </Button>
                        {/* Delete button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteConfig(cfg)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <Button onClick={handleNewConfig}>Create New Config</Button>
        </div>
      </div>

      <ConfigFormDialog
        tenantId={tenantId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
        configToEdit={selectedConfig}
      />
    </div>
  );
}
