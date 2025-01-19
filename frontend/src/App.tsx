import React, { useEffect, useState } from "react";
import GenericForm from "./components/GenericForm";
import { getUIConfig } from "./services/configService";
import type { UIConfig } from "./services/types";
import "./index.css";

function App() {
	const [config, setConfig] = useState<UIConfig | null>(null);
	const [loading, setLoading] = useState(true);

	// Hard-coding tenant/config name for demo
	useEffect(() => {
		getUIConfig("tenant123", "patient-registration")
			.then((response) => {
				setConfig(response);
			})
			.catch((err) => console.error(err))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div className="p-4">Loading config...</div>;
	if (!config)
		return <div className="p-4">Config not found or error occurred.</div>;

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-4">Dynamic Form Demo</h1>
			<GenericForm config={config} />
		</div>
	);
}

export default App;
