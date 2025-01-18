import React, { useEffect, useState } from "react";
import { getUIConfig } from "./services/configService";
import GenericForm from "./components/GenericForm";
import { UIConfig } from "./services/types";

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

	if (loading) return <div>Loading config...</div>;
	if (!config) return <div>Config not found or error occurred.</div>;

	return (
		<div style={{ padding: "1rem" }}>
			<h1>Dynamic Form Demo</h1>
			<GenericForm config={config} />
		</div>
	);
}

export default App;
