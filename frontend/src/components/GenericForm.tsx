import type React from "react";
import type { UIConfig, FormField } from "../services/types";
import FormFieldComponent from "./FormField";
import { Button } from "../components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "../components/ui/card";

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
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>{config.name}</CardTitle>
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
