"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, GitBranch, User, HardDrive, Terminal } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { type Deployment, type DeploymentResponse, type DeploymentOutput } from "@/lib/utils";
import Loader from "@/components/ui/loader";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ApplicationDeploymentsProps {
	applicationId: string;
	shouldLoad?: boolean;
	page?: number;
}

function getStatusColor(status: string) {
	switch (status) {
		case "success":
			return "bg-green-100 text-green-800";
		case "build-error":
		case "crashed":
		case "timeout":
		case "aborted":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
}

function formatImageSize(bytes: number) {
	const mb = bytes / (1024 * 1024);
	return `${mb.toFixed(1)} MB`;
}

// Client-side API call with authentication
async function fetchDeployments(applicationId: string, page: number = 1): Promise<DeploymentResponse> {
	// Get auth token from localStorage (same as auth provider)
	const authToken = localStorage.getItem("auth-token");

	const headers: Record<string, string> = {
		"Content-Type": "application/json"
	};

	// Add auth header if token exists
	if (authToken) {
		headers["x-auth-token"] = authToken;
	}

	const response = await fetch(`/api/scalingo/applications/${applicationId}/deployments?page=${page}`, {
		method: "GET",
		headers
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error("Authentication required. Please log in again.");
		}
		if (response.status === 400) {
			const errorData = await response.json().catch(() => ({ error: "Bad request" }));
			throw new Error(errorData.error || "Invalid request");
		}
		throw new Error("Failed to fetch deployments");
	}

	return response.json();
}

// Client-side API call to fetch deployment output
async function fetchDeploymentOutput(applicationId: string, deploymentId: string): Promise<DeploymentOutput> {
	// Get auth token from localStorage (same as auth provider)
	const authToken = localStorage.getItem("auth-token");

	const headers: Record<string, string> = {
		"Content-Type": "application/json"
	};

	// Add auth header if token exists
	if (authToken) {
		headers["x-auth-token"] = authToken;
	}

	const response = await fetch(`/api/scalingo/applications/${applicationId}/deployments/${deploymentId}/output`, {
		method: "GET",
		headers
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error("Authentication required. Please log in again.");
		}
		if (response.status === 404) {
			throw new Error("Deployment not found or output not available.");
		}
		if (response.status === 400) {
			const errorData = await response.json().catch(() => ({ error: "Bad request" }));
			throw new Error(errorData.error || "Invalid request");
		}
		throw new Error("Failed to fetch deployment output");
	}

	return response.json();
}

export default function ApplicationDeployments({
	applicationId,
	shouldLoad = false,
	page = 1
}: ApplicationDeploymentsProps) {
	const [deployments, setDeployments] = useState<DeploymentResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(page);
	const [deploymentOutputs, setDeploymentOutputs] = useState<Record<string, string>>({});
	const [loadingOutputs, setLoadingOutputs] = useState<Record<string, boolean>>({});
	const [outputErrors, setOutputErrors] = useState<Record<string, string>>({});
	const hasFetchedRef = useRef(false);

	useEffect(() => {
		// Only fetch if shouldLoad is true, we don't have data, and we haven't fetched yet
		if (shouldLoad && !deployments && !hasFetchedRef.current) {
			hasFetchedRef.current = true;
			setLoading(true);
			setError(null);

			fetchDeployments(applicationId, currentPage)
				.then(setDeployments)
				.catch(() => setError("Failed to load deployments"))
				.finally(() => setLoading(false));
		}
	}, [shouldLoad, applicationId, currentPage, deployments]);

	// Reset the fetch flag when shouldLoad becomes false (when switching away from tab)
	useEffect(() => {
		if (!shouldLoad) {
			hasFetchedRef.current = false;
		}
	}, [shouldLoad]);

	// Handle page changes
	const handlePageChange = (newPage: number) => {
		if (newPage === currentPage || newPage < 1) return;

		setCurrentPage(newPage);
		setDeployments(null); // Clear current data
		hasFetchedRef.current = false; // Allow new fetch
		setLoading(true);
		setError(null);

		fetchDeployments(applicationId, newPage)
			.then(setDeployments)
			.catch(() => setError("Failed to load deployments"))
			.finally(() => setLoading(false));
	};

	// Handle loading deployment output
	const handleLoadOutput = async (deploymentId: string) => {
		// If output is already loaded, toggle visibility
		if (deploymentOutputs[deploymentId]) {
			setDeploymentOutputs((prev) => {
				const newOutputs = { ...prev };
				delete newOutputs[deploymentId];
				return newOutputs;
			});
			return;
		}

		// Set loading state
		setLoadingOutputs((prev) => ({ ...prev, [deploymentId]: true }));
		setOutputErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[deploymentId];
			return newErrors;
		});

		try {
			const output = await fetchDeploymentOutput(applicationId, deploymentId);
			setDeploymentOutputs((prev) => ({ ...prev, [deploymentId]: output.output }));
		} catch (outputError) {
			setOutputErrors((prev) => ({
				...prev,
				[deploymentId]: outputError instanceof Error ? outputError.message : "Failed to load output"
			}));
		} finally {
			setLoadingOutputs((prev) => {
				const newLoading = { ...prev };
				delete newLoading[deploymentId];
				return newLoading;
			});
		}
	};

	if (!shouldLoad) {
		return null;
	}

	if (loading) {
		return <Loader text="Loading deployments..." />;
	}

	if (error) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<p className="text-red-600">{error}</p>
				</CardContent>
			</Card>
		);
	}

	if (!deployments) {
		return null;
	}

	return (
		<TooltipProvider>
			<Card>
				<CardHeader>
					<CardTitle>Deployments</CardTitle>
					{deployments.meta.pagination.total_count > 0 && (
						<p className="text-sm text-gray-600">
							{deployments.meta.pagination.total_count} total deployment
							{deployments.meta.pagination.total_count !== 1 ? "s" : ""}
						</p>
					)}
				</CardHeader>
				<CardContent>
					{deployments.deployments.length > 0 ? (
						<div className="space-y-4">
							{deployments.deployments.map((deployment: Deployment) => (
								<div key={deployment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center space-x-2">
											<GitBranch className="h-4 w-4 text-gray-400" />
											<code className="text-sm bg-gray-100 px-2 py-1 rounded">
												{deployment.git_ref.substring(0, 8)}
											</code>
											<Badge className={getStatusColor(deployment.status)}>{deployment.status.replace("-", " ")}</Badge>
										</div>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="flex items-center text-sm text-gray-500 cursor-help">
													<Calendar className="h-4 w-4 mr-1" />
													{formatDistanceToNow(new Date(deployment.created_at), { addSuffix: true })}
												</div>
											</TooltipTrigger>
											<TooltipContent>
												<p>{format(new Date(deployment.created_at), "PPP 'at' p")}</p>
											</TooltipContent>
										</Tooltip>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
										<div className="flex items-center">
											<User className="h-4 w-4 mr-2 text-gray-400" />
											<div>
												<p className="font-medium">{deployment.pusher.username}</p>
												<p className="text-gray-500">{deployment.pusher.email}</p>
											</div>
										</div>

										<div className="flex items-center">
											<HardDrive className="h-4 w-4 mr-2 text-gray-400" />
											<div>
												<p className="font-medium">Image Size</p>
												<p className="text-gray-500">{formatImageSize(deployment.image_size)}</p>
											</div>
										</div>

										<div>
											<p className="font-medium">Stack</p>
											<p className="text-gray-500">{deployment.stack_base_image}</p>
										</div>
									</div>

									{/* Build Output Button */}
									<div className="mt-4 flex justify-start">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleLoadOutput(deployment.id)}
											disabled={loadingOutputs[deployment.id]}
											className="flex items-center space-x-2"
										>
											<Terminal className="h-4 w-4" />
											<span>
												{loadingOutputs[deployment.id]
													? "Loading..."
													: deploymentOutputs[deployment.id]
														? "Hide Build Output"
														: "Show Build Output"}
											</span>
										</Button>
									</div>

									{/* Output Display */}
									{outputErrors[deployment.id] && (
										<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
											{outputErrors[deployment.id]}
										</div>
									)}

									{deploymentOutputs[deployment.id] && (
										<div className="mt-4">
											<h4 className="text-sm font-medium mb-2">Build Output:</h4>
											<pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
												{deploymentOutputs[deployment.id]}
											</pre>
										</div>
									)}
								</div>
							))}

							{/* Pagination */}
							{deployments.meta.pagination.total_pages > 1 && (
								<div className="pt-4 border-t">
									<Pagination>
										<PaginationContent>
											<PaginationItem>
												<PaginationPrevious
													onClick={(e) => {
														e.preventDefault();
														handlePageChange(currentPage - 1);
													}}
													className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
												/>
											</PaginationItem>

											{/* Page numbers */}
											{(() => {
												const totalPages = deployments.meta.pagination.total_pages;
												const current = currentPage;
												const pages = [];

												// Always show first page
												if (current > 3) {
													pages.push(
														<PaginationItem key={1}>
															<PaginationLink
																onClick={(e) => {
																	e.preventDefault();
																	handlePageChange(1);
																}}
																className="cursor-pointer"
															>
																1
															</PaginationLink>
														</PaginationItem>
													);
													if (current > 4) {
														pages.push(
															<PaginationItem key="ellipsis1">
																<span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
															</PaginationItem>
														);
													}
												}

												// Show pages around current page
												const startPage = Math.max(1, current - 1);
												const endPage = Math.min(totalPages, current + 1);

												for (let i = startPage; i <= endPage; i += 1) {
													pages.push(
														<PaginationItem key={i}>
															<PaginationLink
																onClick={(e) => {
																	e.preventDefault();
																	handlePageChange(i);
																}}
																isActive={i === current}
																className="cursor-pointer"
															>
																{i}
															</PaginationLink>
														</PaginationItem>
													);
												}

												// Always show last page
												if (current < totalPages - 2) {
													if (current < totalPages - 3) {
														pages.push(
															<PaginationItem key="ellipsis2">
																<span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
															</PaginationItem>
														);
													}
													pages.push(
														<PaginationItem key={totalPages}>
															<PaginationLink
																onClick={(e) => {
																	e.preventDefault();
																	handlePageChange(totalPages);
																}}
																className="cursor-pointer"
															>
																{totalPages}
															</PaginationLink>
														</PaginationItem>
													);
												}

												return pages;
											})()}

											<PaginationItem>
												<PaginationNext
													onClick={(e) => {
														e.preventDefault();
														handlePageChange(currentPage + 1);
													}}
													className={
														currentPage >= deployments.meta.pagination.total_pages
															? "pointer-events-none opacity-50"
															: "cursor-pointer"
													}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>

									{/* Page info */}
									<div className="text-center text-sm text-gray-500 mt-2">
										Page {currentPage} of {deployments.meta.pagination.total_pages} (
										{deployments.meta.pagination.total_count} total deployment
										{deployments.meta.pagination.total_count !== 1 ? "s" : ""})
									</div>
								</div>
							)}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
							<p>No deployments found</p>
							<p className="text-sm">Deployments will appear here when you push code to this application.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
