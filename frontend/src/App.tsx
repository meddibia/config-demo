import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import GenericForm from "./components/GenericForm";
import SetupPage from "./pages/setup";
import { listConfigs } from "./services/configService";
import type { UIConfig } from "./services/types";
import "./index.css";

function HomePage() {
  const [configs, setConfigs] = useState<UIConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hard-coding tenant for demo
    listConfigs("tenant123")
      .then((response) => {
        setConfigs(response);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading configs...</div>;
  if (!configs.length)
    return <div className="p-4">No configs found or error occurred.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dynamic Forms Demo</h1>
      <div className="space-y-8 max-h-[80vh] overflow-y-auto">
        {configs.map((config) => (
          <div key={`${config.tenant_id}-${config.type}`} className="bg-white border-b border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{config.type}</h2>
            <GenericForm config={config} />
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
