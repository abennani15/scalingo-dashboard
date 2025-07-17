import { NextRequest, NextResponse } from "next/server";
import { fetchScalingoDeploymentOutput } from "@/lib/utils";

// Validation helpers
function isValidApplicationId(id: string): boolean {
	return typeof id === "string" && id.length > 0 && /^[a-zA-Z0-9-_]+$/.test(id);
}

function isValidDeploymentId(id: string): boolean {
	return typeof id === "string" && id.length > 0 && /^[a-zA-Z0-9-_]+$/.test(id);
}

function isAuthenticated(request: NextRequest): boolean {
	const authToken = request.headers.get("x-auth-token");
	return !!authToken;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; deploymentId: string }> }
): Promise<NextResponse> {
	try {
		// Await params before using
		const { id, deploymentId } = await params;

		// Validate authentication (we still check for client auth token to ensure user is logged in)
		if (!isAuthenticated(request)) {
			return NextResponse.json({ error: "Authentication required" }, { status: 401 });
		}

		// Validate application ID
		if (!isValidApplicationId(id)) {
			return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
		}

		// Validate deployment ID
		if (!isValidDeploymentId(deploymentId)) {
			return NextResponse.json({ error: "Invalid deployment ID" }, { status: 400 });
		}

		// Use utils function to fetch deployment output
		const data = await fetchScalingoDeploymentOutput(id, deploymentId);

		// Add security headers
		const headers = new Headers();
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("X-Frame-Options", "DENY");
		headers.set("X-XSS-Protection", "1; mode=block");

		return NextResponse.json(data, { headers });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Failed to fetch deployment output";

		// Return appropriate status based on error message
		if (errorMessage.includes("not found") || errorMessage.includes("not available")) {
			return NextResponse.json({ error: errorMessage }, { status: 404 });
		}

		return NextResponse.json(
			{ error: process.env.NODE_ENV === "development" ? errorMessage : "Internal server error" },
			{ status: 500 }
		);
	}
}
