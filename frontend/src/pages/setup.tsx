import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
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
import { cn } from "@/lib/utils"; // utility for merging classnames, if desired
import {
  ConfigType,
  type FormField,
  FormFieldType,
  type UIConfig,
} from "@/services/types";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

// Optionally, adjust to your actual backend base URL
const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";

export default function ConfiguratorPage() {
  // Basic config data
  const [tenantId, setTenantId] = useState("");
  const [configType, setConfigType] = useState<ConfigType | "">("");
  const [description, setDescription] = useState("");

  // We'll keep track of whether we've loaded an existing config
  const [existingConfig, setExistingConfig] = useState<UIConfig | null>(null);

  // The array of form fields
  const [fields, setFields] = useState<FormField[]>([]);

  // --------------
  // Helper methods
  // --------------

  // Fetch config (GET) if you want to load existing data
  async function handleLoadConfig() {
    if (!tenantId || !configType) {
      toast.error("Please enter both tenantId and configType before loading.");
      return;
    }

    try {
      const res = await axios.get<UIConfig>(
        `${API_BASE_URL}/config/${tenantId}/${configType}`,
      );
      const data = res.data;
      setExistingConfig(data);
      setDescription(data.description ?? "");
      setFields(data.fields);
      toast.success("Existing config loaded.");
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail ?? "Config not found.");
      } else {
        toast.error("Config not found.");
      }
      setExistingConfig(null);
      setFields([]);
      setDescription("");
    }
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
      if (existingConfig) {
        // If a config is already loaded, do PUT
        res = await axios.put<UIConfig>(
          `${API_BASE_URL}/config/${tenantId}/${configType}`,
          {
            description,
            fields,
          },
        );
        toast.success("Config updated successfully");
      } else {
        // Otherwise create new (POST)
        res = await axios.post<UIConfig>(`${API_BASE_URL}/config/`, payload);
        toast.success("Config created successfully");
      }

      // After save, update local state
      setExistingConfig(res.data);
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

  // Delete entire config
  async function handleDeleteConfig() {
    if (!tenantId || !configType) {
      toast.error("Tenant ID and Config Type are required to delete.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/config/${tenantId}/${configType}`);
      toast.success("Config deleted successfully");
      // Clear local states
      setExistingConfig(null);
      setFields([]);
      setDescription("");
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail ?? "Error deleting config.");
      } else {
        toast.error("Error deleting config.");
      }
    }
  }

  // --------------
  // Field methods
  // --------------

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
    };
    setFields((prev) => [...prev, newField]);
  }

  // Remove a field card by ID
  function handleRemoveField(id: string) {
    setFields((prev) => prev.filter((field) => field.id !== id));
  }

  // Update a field's property
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

  // --------------
  // Render
  // --------------

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        Customize Forms for the Frontend
      </h1>

      {/* Basic config info */}
      <div className="space-y-4 border-b pb-4">
        <div>
          <Label>Tenant ID</Label>
          <Input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="tenant123"
          />
        </div>

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

        <div className="flex space-x-2">
          <Button variant="default" onClick={handleLoadConfig}>
            Load Existing Config
          </Button>
          <Button variant="outline" onClick={handleDeleteConfig}>
            Delete Config
          </Button>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Form Fields</h2>
          <Button onClick={handleAddField}>Add New Field</Button>
        </div>

        {fields.map((field) => (
          <Card key={field.id}>
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Field: {field.id.slice(0, 8)}...
                </CardTitle>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveField(field.id)}
              >
                Delete
              </Button>
            </CardHeader>
            <CardContent>
              {/* Field type selector */}
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

              {/* Show dynamic controls based on field type */}
              {renderFieldControls(field)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveConfig}>Save Config</Button>
      </div>
    </div>
  );
}
