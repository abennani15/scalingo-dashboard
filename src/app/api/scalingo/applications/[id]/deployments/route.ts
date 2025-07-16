import { NextRequest, NextResponse } from "next/server";
import { fetchScalingoDeployments } from "@/lib/utils";

// Validate application ID format (basic UUID/alphanumeric validation)
function isValidApplicationId(id: string): boolean {
	// Allow UUIDs, MongoDB ObjectIds, or alphanumeric IDs (common formats)
	const validIdPattern =
		/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$|^[a-fA-F0-9]{24}$|^[a-zA-Z0-9_-]{6,50}$/;
	return validIdPattern.test(id) && id.length >= 6 && id.length <= 50;
}

// Validate page number
function isValidPage(page: number): boolean {
	return Number.isInteger(page) && page >= 1 && page <= 1000; // Reasonable limits
}

// Simple authentication check - in production, implement proper JWT/session validation
function isAuthenticated(request: NextRequest): boolean {
	// Check for Authorization header
	const authHeader = request.headers.get("authorization");
	if (authHeader && authHeader.startsWith("Bearer ")) {
		return true; // In production, validate the actual token
	}

	// Check for auth cookie
	const authCookie = request.cookies.get("auth-token");
	if (authCookie && authCookie.value) {
		return true; // In production, validate the actual token
	}

	// Check for custom auth header (for client-side requests)
	const customAuth = request.headers.get("x-auth-token");
	if (customAuth) {
		return true; // In production, validate the actual token
	}

	return false;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Authentication check
		if (!isAuthenticated(request)) {
			return NextResponse.json({ error: "Unauthorized - Authentication required" }, { status: 401 });
		}

		// Parameter validation
		const { id } = await params;

		// Validate application ID
		if (!id || typeof id !== "string") {
			return NextResponse.json({ error: "Bad Request - Missing or invalid application ID" }, { status: 400 });
		}

		if (!isValidApplicationId(id)) {
			return NextResponse.json({ error: "Bad Request - Invalid application ID format" }, { status: 400 });
		}

		// Validate and sanitize query parameters
		const { searchParams } = new URL(request.url);
		const pageParam = searchParams.get("page");

		let page = 1;
		if (pageParam) {
			const parsedPage = parseInt(pageParam, 10);
			if (Number.isNaN(parsedPage) || !isValidPage(parsedPage)) {
				return NextResponse.json(
					{ error: "Bad Request - Invalid page parameter (must be between 1 and 1000)" },
					{ status: 400 }
				);
			}
			page = parsedPage;
		}

		// Additional security: Rate limiting could be added here
		// Rate limiting headers could be checked and enforced

		// Make the API call with validated parameters
		const deployments = await fetchScalingoDeployments(id, page);

		// Add security headers to response
		const response = NextResponse.json(deployments);
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-XSS-Protection", "1; mode=block");

		return response;
	} catch (error) {
		// Log error securely without exposing internal details
		const errorMessage = error instanceof Error ? error.message : "Unknown error";

		// Don't expose internal error details in production
		const isProduction = process.env.NODE_ENV === "production";
		const publicError = isProduction ? "Internal server error" : `Failed to fetch deployments: ${errorMessage}`;

		return NextResponse.json({ error: publicError }, { status: 500 });
	}
}
