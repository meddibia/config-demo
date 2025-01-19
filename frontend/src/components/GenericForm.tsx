import type React from "react";
import type { UIConfig, FormField } from "../services/types";
import FormFieldComponent from "./FormField";
import { Button } from "../components/ui/button";

interface GenericFormProps {
	config: UIConfig;
}

function GenericForm({ config }: GenericFormProps) {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Do something with form data
		alert("Form submitted! (Check console for captured data.)");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-2xl font-semibold mb-4">{config.description}</h2>
			{config.fields.map((field: FormField) => (
				<FormFieldComponent key={field.id} field={field} />
			))}
			<Button type="submit">Submit</Button>
		</form>
	);
}

export default GenericForm;
