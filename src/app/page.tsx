"use client";

import React, { useEffect, useState } from "react";
import { Search, LogOut, ExternalLink, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Application {
	id: string;
	name: string;
	created_at: string;
	last_deployed_at: string;
	url: string;
	status: "running" | "stopped" | "deploying";
	region: string;
}

export default function Dashboard() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	const fetchApplications = async () => {
		setLoading(true);
		// Simulate API call to Scalingo
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const mockApps: Application[] = [
			{
				id: "app-1",
				name: "my-web-app",
				created_at: "2024-01-15T10:30:00Z",
				last_deployed_at: "2024-01-20T14:22:00Z",
				url: "https://my-web-app.scalingo.io",
				status: "running",
				region: "osc-fr1"
			},
			{
				id: "app-2",
				name: "api-service",
				created_at: "2024-01-10T09:15:00Z",
				last_deployed_at: "2024-01-19T16:45:00Z",
				url: "https://api-service.scalingo.io",
				status: "running",
				region: "osc-fr1"
			},
			{
				id: "app-3",
				name: "background-worker",
				created_at: "2024-01-08T11:20:00Z",
				last_deployed_at: "2024-01-18T13:30:00Z",
				url: "https://background-worker.scalingo.io",
				status: "stopped",
				region: "osc-secnum-fr1"
			},
			{
				id: "app-4",
				name: "frontend-app",
				created_at: "2024-01-12T15:45:00Z",
				last_deployed_at: "2024-01-21T10:15:00Z",
				url: "https://frontend-app.scalingo.io",
				status: "deploying",
				region: "osc-fr1"
			},
			{
				id: "app-5",
				name: "data-processor",
				created_at: "2024-01-05T08:30:00Z",
				last_deployed_at: "2024-01-17T12:00:00Z",
				url: "https://data-processor.scalingo.io",
				status: "running",
				region: "osc-secnum-fr1"
			},
			{
				id: "app-6",
				name: "notification-service",
				created_at: "2024-01-03T14:20:00Z",
				last_deployed_at: "2024-01-16T09:30:00Z",
				url: "https://notification-service.scalingo.io",
				status: "running",
				region: "osc-fr1"
			},
			{
				id: "app-7",
				name: "analytics-dashboard",
				created_at: "2024-01-01T12:00:00Z",
				last_deployed_at: "2024-01-15T11:45:00Z",
				url: "https://analytics-dashboard.scalingo.io",
				status: "stopped",
				region: "osc-fr1"
			}
		];

		setApplications(mockApps);
		setLoading(false);
	};

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
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	useEffect(() => {
		fetchApplications();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
					<p className="mt-2 text-gray-600">Loading applications...</p>
				</div>
			</div>
		);
	}

	return (
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
									Created {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
								</div>
								<div className="flex items-center text-sm text-gray-600">
									<Clock className="h-4 w-4 mr-2" />
									Deployed {formatDistanceToNow(new Date(app.last_deployed_at), { addSuffix: true })}
								</div>
								<div className="flex items-center justify-between">
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
			</main>
		</div>
	);
}
