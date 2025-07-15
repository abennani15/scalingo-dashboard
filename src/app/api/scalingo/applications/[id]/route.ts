import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	const mockApp = {
		id: params.id,
		name: "my-web-app",
		created_at: "2024-01-15T10:30:00Z",
		last_deployed_at: "2024-01-20T14:22:00Z",
		url: "https://my-web-app.scalingo.io",
		status: "running",
		region: "osc-fr1",
		git_url: "https://github.com/user/my-web-app.git",
		stack: "scalingo-22",
		instances: 2
	};

	return NextResponse.json({ application: mockApp });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
	const { action } = await request.json();

	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Handle different actions
	switch (action) {
		case "restart":
		case "stop":
		case "start":
			return NextResponse.json({
				success: true,
				message: `Application ${action} initiated`
			});
		default:
			return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	}
}
