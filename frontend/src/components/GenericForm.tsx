import type React from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import type { FormField, UIConfig } from "../services/types";
import FormFieldComponent from "./FormField";

interface GenericFormProps {
  config: UIConfig;
}

function GenericForm({ config }: GenericFormProps) {
  // If you use a toast library like ShadCN's or react-toastify, import it here.
  // For example, with ShadCN UI:
  // import { useToast } from "@/components/ui/use-toast";
  // const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Collect your form data here. For example, if each FormFieldComponent
      // updates local state, you might gather the state or parse from e.target, etc.
      // This snippet just shows the structure for a POST:
      const formData = {}; // Replace with real data gathering

      const response = await fetch(
        `/${config.tenant_id}/${config.type}/submit`, // or a full path like `/api/${config.tenant_id}/${config.type}/submit`
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error submitting form.");
      }

      // For a toast-based UI, you can do:
      // toast({ title: "Success", description: "Form submitted successfully!" });

      // If no toast library is configured yet, you can fallback to alert:
      alert("Form submitted successfully!");
    } catch (err: any) {
      // toast({
      //   variant: "destructive",
      //   title: "Submission error",
      //   description: err.message,
      // });

      alert(`Error: ${err.message}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{config.type}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {config.fields.map((field: FormField) => (
            <FormFieldComponent key={field.id} field={field} />
          ))}
        </CardContent>
        <CardFooter>
          <Button type="submit">Submit</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default GenericForm;
