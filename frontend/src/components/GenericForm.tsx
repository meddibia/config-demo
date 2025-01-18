import type React from "react";
import type { UIConfig, FormField } from "../services/types";
import FormFieldComponent from "./FormField";

interface GenericFormProps {
	config: UIConfig;
}

function GenericForm({ config }: GenericFormProps) {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Do something with form data
		// For a production system, you'd gather data from each field, maybe store in local state
		// or use a library like react-hook-form or Formik. This is a simplified example.
		alert("Form submitted! (Check console for captured data.)");
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>{config.description}</h2>
			{config.fields.map((field: FormField, index: number) => (
				<FormFieldComponent key={field.id} field={field} />
			))}
			<button type="submit">Submit</button>
		</form>
	);
}

export default GenericForm;
