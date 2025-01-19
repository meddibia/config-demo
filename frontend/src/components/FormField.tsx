import { useState } from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import type { FormField } from "../services/types";

interface FieldProps {
	field: FormField;
}

function FormFieldComponent({ field }: FieldProps) {
	const [value, setValue] = useState<string | boolean>(field.default ?? "");

	switch (field.type) {
		case "header":
			return <h3 className="text-xl font-semibold mb-2">{field.content}</h3>;

		case "static":
			return <div className="text-gray-600 mb-2">{field.content}</div>;

		case "text":
			return (
				<div className="space-y-2">
					<Label htmlFor={field.id}>{field.label}</Label>
					<Input
						type="text"
						id={field.id}
						name={field.name}
						value={String(value)}
						onChange={(e) => setValue(e.target.value)}
					/>
				</div>
			);

		case "select":
			return (
				<div className="space-y-2">
					<Label htmlFor={field.id}>{field.label}</Label>
					<Select value={String(value)} onValueChange={(val) => setValue(val)}>
						<SelectTrigger id={field.id}>
							<SelectValue placeholder="Select an option" />
						</SelectTrigger>
						<SelectContent>
							{field.options?.map((opt) => (
								<SelectItem key={opt} value={opt}>
									{opt}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);

		case "checkbox":
			return (
				<div className="flex items-center space-x-2">
					<Checkbox
						id={field.id}
						checked={Boolean(value)}
						onCheckedChange={(checked) => setValue(checked)}
					/>
					<Label htmlFor={field.id}>{field.label}</Label>
				</div>
			);

		default:
			return <div>Unsupported field type: {field.type}</div>;
	}
}

export default FormFieldComponent;
