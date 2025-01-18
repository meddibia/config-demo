import axios from "axios";
import type{ UIConfig } from "./types";

// In a real deployment, the base URL might come from an env variable or .env file
const API_BASE_URL = "http://localhost:8000";

export async function getUIConfig(
  tenantId: string,
  configName: string
): Promise<UIConfig> {
  const response = await axios.get(`${API_BASE_URL}/config/${tenantId}/${configName}`);
  return response.data;
}
