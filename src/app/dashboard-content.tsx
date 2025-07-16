"use client";

import React, { useState } from "react";
import { Search, LogOut, ExternalLink, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Application } from "@/lib/utils";

interface DashboardContentProps {
	applications: Application[];
}

export default function DashboardContent({ applications }: DashboardContentProps) {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	const filteredApplications = applications.filter((app) => app.name.toLowerCase().includes(searchTerm.toLowerCase()));

	const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "running":
				return "bg-green-100 text-green-800";
			case "stopped":
				return "bg-red-100 text-red-800";
			case "deploying":
			case "scaling":
			case "restarting":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<TooltipProvider>
			<div className="min-h-screen bg-gray-50">
				{/* Header */}
				<header className="bg-white border-b border-gray-200">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center h-16">
							<div className="flex items-center">
								<h1 className="text-xl font-semibold text-gray-900">Scalingo Dashboard</h1>
							</div>
							<div className="flex items-center space-x-4">
								<span className="text-sm text-gray-700">Welcome, {user?.name}</span>
								<Avatar>
									<AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
								</Avatar>
								<Button variant="ghost" size="sm" onClick={logout}>
									<LogOut className="h-4 w-4 mr-2" />
									Logout
								</Button>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Search and Stats */}
					<div className="mb-8">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">Applications</h2>
								<p className="text-gray-600">{applications.length} total applications</p>
							</div>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									placeholder="Search applications..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 w-full sm:w-80"
								/>
							</div>
						</div>
					</div>

					{/* Applications Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						{paginatedApplications.map((app) => (
							<Card
								key={app.id}
								className="hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => {
									router.push(`/applications/${app.id}`);
								}}
							>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg font-semibold truncate">{app.name}</CardTitle>
										<Badge className={getStatusColor(app.status)}>{app.status}</Badge>
									</div>
									<p className="text-sm text-gray-500">ID: {app.id}</p>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center text-sm text-gray-600">
										<Calendar className="h-4 w-4 mr-2" />
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="cursor-help">
													Created {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
												</span>
											</TooltipTrigger>
											<TooltipContent>
												<p>{new Date(app.created_at).toLocaleString()}</p>
											</TooltipContent>
										</Tooltip>
									</div>
									{app.last_deployed_at && (
										<div className="flex items-center text-sm text-gray-600">
											<Clock className="h-4 w-4 mr-2" />
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="cursor-help">
														Deployed {formatDistanceToNow(new Date(app.last_deployed_at), { addSuffix: true })}
													</span>
												</TooltipTrigger>
												<TooltipContent>
													<p>{new Date(app.last_deployed_at).toLocaleString()}</p>
												</TooltipContent>
											</Tooltip>
										</div>
									)}
									<div className="flex items-center justify-between">
										{app.url && (
											<a
												href={app.url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center text-sm text-blue-600 hover:text-blue-800"
												onClick={(e) => e.stopPropagation()}
											>
												<ExternalLink className="h-4 w-4 mr-1" />
												Visit app
											</a>
										)}
										<Badge variant="outline" className="text-xs">
											{app.region}
										</Badge>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
							>
								Previous
							</Button>
							<span className="text-sm text-gray-600">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
								disabled={currentPage === totalPages}
							>
								Next
							</Button>
						</div>
					)}

					{/* Empty state */}
					{applications.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-600 mb-4">No applications found</p>
							<p className="text-sm text-gray-500">
								Your applications will appear here once they are deployed on Scalingo.
							</p>
						</div>
					)}
				</main>
			</div>
		</TooltipProvider>
	);
}
