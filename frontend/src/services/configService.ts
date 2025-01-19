import axios from "axios";
import type { UIConfig } from "./types";

// In a real deployment, the base URL might come from an env variable or .env file
const API_BASE_URL = "http://localhost:8000";

export async function getUIConfig(
	tenantId: string,
	configName: string,
): Promise<UIConfig> {
	const response = await axios.get(
		`${API_BASE_URL}/config/${tenantId}/${configName}`,
	);
	return response.data;
}

export async function createUIConfig(config: UIConfig): Promise<UIConfig> {
	const response = await axios.post(`${API_BASE_URL}/config/`, config);
	return response.data;
}

export async function updateUIConfig(
	tenantId: string,
	configName: string,
	updatedData: Partial<UIConfig>
): Promise<UIConfig> {
	const response = await axios.put(
		`${API_BASE_URL}/config/${tenantId}/${configName}`,
		updatedData
	);
	return response.data;
}

export async function deleteUIConfig(
	tenantId: string,
	configName: string
): Promise<{status: string, message: string}> {
	const response = await axios.delete(
		`${API_BASE_URL}/config/${tenantId}/${configName}`
	);
	return response.data;
}

export async function listConfigs(
	tenantId?: string,
	configType?: string
): Promise<UIConfig[]> {
	const params = new URLSearchParams();
	if (tenantId) params.append('tenant_id', tenantId);
	if (configType) params.append('config_type', configType);

	const response = await axios.get(`${API_BASE_URL}/config/`, { params });
	return response.data;
}

export async function flushCache(): Promise<{status: string, message: string}> {
	const response = await axios.post(`${API_BASE_URL}/config/flush-cache`);
	return response.data;
}
