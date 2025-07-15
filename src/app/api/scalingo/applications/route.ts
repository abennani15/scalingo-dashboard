import { NextResponse } from "next/server";

// Mock data for Scalingo applications
const mockApplications = [
	{
		id: "app-1",
		name: "my-web-app",
		created_at: "2024-01-15T10:30:00Z",
		last_deployed_at: "2024-01-20T14:22:00Z",
		url: "https://my-web-app.scalingo.io",
		status: "running",
		region: "osc-fr1",
		git_url: "https://github.com/user/my-web-app.git",
		stack: "scalingo-22",
		instances: 2
	}
	// Add more mock applications as needed
];

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const page = Number.parseInt(searchParams.get("page") || "1");
	const limit = Number.parseInt(searchParams.get("limit") || "10");

	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedApps = mockApplications.slice(startIndex, endIndex);

	return NextResponse.json({
		applications: paginatedApps,
		meta: {
			current_page: page,
			total_pages: Math.ceil(mockApplications.length / limit),
			total_count: mockApplications.length
		}
	});
}
