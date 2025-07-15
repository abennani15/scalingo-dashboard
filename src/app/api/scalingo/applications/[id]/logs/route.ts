import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 400));

	const mockLogs = [
		{
			timestamp: "2024-01-21T10:15:32Z",
			level: "info",
			message: "Application started successfully",
			source: "web.1"
		},
		{
			timestamp: "2024-01-21T10:15:30Z",
			level: "info",
			message: "Binding to port 5000",
			source: "web.1"
		},
		{
			timestamp: "2024-01-21T10:15:28Z",
			level: "info",
			message: "Database connection established",
			source: "web.1"
		},
		{
			timestamp: "2024-01-21T10:15:25Z",
			level: "warn",
			message: "Deprecated API endpoint used",
			source: "web.1"
		},
		{
			timestamp: "2024-01-21T10:15:20Z",
			level: "error",
			message: "Failed to connect to Redis, retrying...",
			source: "web.1"
		}
	];

	return NextResponse.json({ logs: mockLogs });
}
