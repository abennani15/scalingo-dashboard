import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Scalingo API utility functions
interface ScalingoTokenResponse {
	token: string;
}

interface FetchOptions {
	method?: string;
	headers?: Record<string, string>;
	body?: string;
}

// Application interface for type safety
export interface Application {
	id: string;
	name: string;
	created_at: string;
	last_deployed_at?: string;
	url?: string;
	status: "running" | "stopped" | "deploying" | "scaling" | "restarting";
	region: string;
	git_url?: string;
	stack?: string;
	instances?: number;
}

// Log entry interface for type safety
export interface LogEntry {
	id: string;
	timestamp: string;
	level: "info" | "error" | "warn";
	message: string;
	source: string;
}

// Deployment interfaces for type safety
export interface Deployment {
	app_id: string;
	created_at: string;
	git_ref: string;
	status: "success" | "build-error" | "crashed" | "timeout" | "aborted";
	id: string;
	image_size: number;
	stack_base_image: string;
	pusher: {
		email: string;
		id: string;
		username: string;
	};
}

export interface DeploymentResponse {
	deployments: Deployment[];
	meta: {
		pagination: {
			current_page: number;
			prev_page: number | null;
			next_page: number | null;
			total_pages: number;
			total_count: number;
		};
	};
}

export interface DeploymentOutput {
	output: string;
}

export interface Domain {
	id: string;
	name: string;
	ssl: boolean;
	canonical: boolean;
	letsencrypt_enabled: boolean;
	letsencrypt: boolean;
	letsencrypt_status: string;
	tlscert?: string;
	tlskey?: string;
	validity?: string;
}

export interface DomainsResponse {
	domains: Domain[];
}

/**
 * Exchange API token for Bearer token
 * @returns Promise<string> Bearer token
 * @throws Error if token exchange fails
 */
export async function getScalingoBearerToken(): Promise<string> {
	const apiToken = process.env.SCALINGO_API_TOKEN;

	if (!apiToken) {
		throw new Error("SCALINGO_API_TOKEN is not defined in environment variables");
	}

	try {
		const response = await fetch("https://auth.scalingo.com/v1/tokens/exchange", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Basic ${Buffer.from(`:${apiToken}`).toString("base64")}`
			}
		});

		if (!response.ok) {
			throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
		}

		const data: ScalingoTokenResponse = await response.json();
		return data.token;
	} catch (error) {
		throw new Error(`Failed to get Scalingo bearer token: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}

/**
 * Get authenticated headers for Scalingo API requests
 * @returns Promise<Record<string, string>> Headers with Bearer token
 */
export async function getScalingoAuthHeaders(): Promise<Record<string, string>> {
	const bearerToken = await getScalingoBearerToken();

	return {
		Accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${bearerToken}`
	};
}

/**
 * Make authenticated request to Scalingo API
 * @param endpoint API endpoint (without base URL)
 * @param options Fetch options
 * @returns Promise<Response>
 */
export async function scalingoApiRequest(endpoint: string, options: FetchOptions = {}): Promise<Response> {
	const apiUrl = process.env.SCALINGO_API_URL || "https://api.osc-fr1.scalingo.com";
	const url = `${apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

	const authHeaders = await getScalingoAuthHeaders();

	const response = await fetch(url, {
		...options,
		headers: {
			...authHeaders,
			...options.headers
		}
	});

	return response;
}

/**
 * Fetch applications from Scalingo API
 * @returns Promise<Application[]> Array of applications
 */
export async function fetchScalingoApplications(): Promise<Application[]> {
	try {
		const response = await scalingoApiRequest("/v1/apps", {
			method: "GET"
		});

		if (!response.ok) {
			throw new Error(`Scalingo API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data.apps || [];
	} catch {
		return [];
	}
}

/**
 * Fetch a single application from Scalingo API
 * @param appId The application ID
 * @returns Promise<Application | null> Application data or null if not found
 */
export async function fetchScalingoApplication(appId: string): Promise<Application | null> {
	try {
		const response = await scalingoApiRequest(`/v1/apps/${appId}`, {
			method: "GET"
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.app || null;
	} catch {
		return null;
	}
}

/**
 * Parse Scalingo logs text into structured LogEntry format
 * @param logsText Raw logs text from Scalingo
 * @returns LogEntry[] Structured log entries
 */
export function parseScalingoLogs(logsText: string): LogEntry[] {
	if (!logsText.trim()) {
		return [];
	}

	const lines = logsText.trim().split("\n");
	const logEntries: LogEntry[] = [];

	lines.forEach((line) => {
		// Scalingo log format: date time timezone [instance] message
		// Example: 2025-07-15 12:10:47.951404087 +0200 CEST [web-1] ▲ Next.js 13.5.11
		const logMatch = line.match(
			/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+)\s+([+-]\d{4})\s+(\w+)\s+\[([^\]]+)\]\s+(.*)$/
		);

		if (logMatch) {
			const [, datetime, , , instance, message] = logMatch;

			// Extract just the time part for display (HH:MM:SS) - no milliseconds
			const timeMatch = datetime.match(/(\d{2}:\d{2}:\d{2})/);
			const displayTime = timeMatch ? timeMatch[1] : datetime.split(" ")[1]?.split(".")[0] || "00:00:00";

			// Determine log level from message content (basic heuristic)
			let level: "info" | "error" | "warn" = "info";
			const lowerMessage = message.toLowerCase();

			const errorKeywords = ["error", "failed", "exception"];
			const warnKeywords = ["warn", "warning", "deprecated"];

			if (errorKeywords.some((keyword) => lowerMessage.includes(keyword))) {
				level = "error";
			} else if (warnKeywords.some((keyword) => lowerMessage.includes(keyword))) {
				level = "warn";
			}

			logEntries.push({
				id: uuidv4(),
				timestamp: displayTime,
				level,
				message: message.trim(),
				source: `[${instance}]`
			});
		} else {
			// More flexible fallback parsing for lines that don't match the expected format
			// Try to extract at least the instance name if it exists
			const instanceMatch = line.match(/\[([^\]]+)\]/);
			const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/);

			// Create a clean time format without milliseconds
			const fallbackTime = timeMatch
				? timeMatch[1]
				: new Date().toLocaleTimeString("en-US", {
						hour12: false,
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit"
					});

			logEntries.push({
				id: uuidv4(),
				timestamp: fallbackTime,
				level: "info",
				message: line.trim(),
				source: instanceMatch ? `[${instanceMatch[1]}]` : "unknown"
			});
		}
	});

	return logEntries;
}

/**
 * Fetch application logs from Scalingo API
 * @param appId The application ID
 * @param lines Number of log lines to fetch (default: 150)
 * @returns Promise<LogEntry[]> Array of log entries
 */
export async function fetchScalingoLogs(appId: string, lines = 150): Promise<LogEntry[]> {
	try {
		// Step 1: Get the logs URL from Scalingo API
		const response = await scalingoApiRequest(`/v1/apps/${appId}/logs`, {
			method: "GET"
		});

		if (!response.ok) {
			return [];
		}

		const data = await response.json();
		const logsUrl = data.logs_url;

		if (!logsUrl) {
			return [];
		}

		// Step 2: Fetch the actual logs from the logs URL with line count parameter
		const logsResponse = await fetch(`${logsUrl}&n=${lines}`);

		if (!logsResponse.ok) {
			return [];
		}

		// The logs come as plain text, so we need to parse them
		const logsText = await logsResponse.text();

		// Parse the logs into structured format
		return parseScalingoLogs(logsText);
	} catch {
		return [];
	}
}

/**
 * Perform an action on a Scalingo application
 * @param appId The application ID
 * @param action The action to perform (start, stop, restart)
 * @returns Promise<boolean> Success status
 */
export async function performScalingoApplicationAction(appId: string, action: string): Promise<boolean> {
	try {
		let endpoint = "";

		switch (action) {
			case "restart":
				endpoint = `/v1/apps/${appId}/restart`;
				break;
			case "stop":
				endpoint = `/v1/apps/${appId}/stop`;
				break;
			case "start":
				endpoint = `/v1/apps/${appId}/start`;
				break;
			default:
				return false;
		}

		const response = await scalingoApiRequest(endpoint, {
			method: "POST"
		});

		return response.ok;
	} catch {
		return false;
	}
}

/**
 * Fetch deployments for a Scalingo application
 * @param appId The application ID
 * @param page The page number (optional, defaults to 1)
 * @returns Promise<DeploymentResponse> Deployments response with pagination
 */
export async function fetchScalingoDeployments(appId: string, page: number = 1): Promise<DeploymentResponse> {
	try {
		const response = await scalingoApiRequest(`/v1/apps/${appId}/deployments?page=${page}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch deployments: ${response.status}`);
		}

		const data: DeploymentResponse = await response.json();
		return data;
	} catch {
		return {
			deployments: [],
			meta: {
				pagination: {
					current_page: 1,
					prev_page: null,
					next_page: null,
					total_pages: 1,
					total_count: 0
				}
			}
		};
	}
}

/**
 * Fetch deployment output for a specific deployment
 * @param appId The application ID
 * @param deploymentId The deployment ID
 * @returns Promise<DeploymentOutput> Deployment output data
 */
export async function fetchScalingoDeploymentOutput(appId: string, deploymentId: string): Promise<DeploymentOutput> {
	try {
		const response = await scalingoApiRequest(`/v1/apps/${appId}/deployments/${deploymentId}/output`);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error("Deployment not found or output not available");
			}
			throw new Error(`Failed to fetch deployment output: ${response.status}`);
		}

		// The response is plain text, not JSON
		const output = await response.text();
		return { output };
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : "Failed to fetch deployment output");
	}
}

/**
 * Fetch domains for a Scalingo application
 * @param appId The application ID
 * @returns Promise<DomainsResponse> Domains response
 */
export async function fetchScalingoDomains(appId: string): Promise<DomainsResponse> {
	try {
		const response = await scalingoApiRequest(`/v1/apps/${appId}/domains`);

		if (!response.ok) {
			throw new Error(`Failed to fetch domains: ${response.status}`);
		}

		const data: DomainsResponse = await response.json();
		return data;
	} catch {
		return {
			domains: []
		};
	}
}
