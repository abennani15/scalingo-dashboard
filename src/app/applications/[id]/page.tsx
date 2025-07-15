"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	ArrowLeft,
	Play,
	Square,
	RotateCcw,
	ExternalLink,
	Calendar,
	Clock,
	Server,
	Globe,
	MapPin,
	Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Application {
	id: string;
	name: string;
	created_at: string;
	last_deployed_at: string;
	url: string;
	status: "running" | "stopped" | "deploying";
	region: string;
	git_url?: string;
	stack: string;
	instances: number;
}

interface LogEntry {
	timestamp: string;
	level: "info" | "error" | "warn";
	message: string;
	source: string;
}

export default function ApplicationDetail() {
	const params = useParams();
	const router = useRouter();
	const [application, setApplication] = useState<Application | null>(null);
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	useEffect(() => {
		fetchApplication();
		fetchLogs();
	}, [params.id]);

	const fetchApplication = async () => {
		setLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 800));

		const mockApp: Application = {
			id: params.id as string,
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

		setApplication(mockApp);
		setLoading(false);
	};

	const fetchLogs = async () => {
		// Simulate fetching logs
		const mockLogs: LogEntry[] = [
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
			},
			{
				timestamp: "2024-01-21T10:15:18Z",
				level: "info",
				message: "Loading environment variables",
				source: "web.1"
			}
		];
		setLogs(mockLogs);
	};

	const handleAction = async (action: string) => {
		setActionLoading(action);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));

		if (action === "restart") {
			setApplication((prev) => (prev ? { ...prev, status: "deploying" } : null));
			setTimeout(() => {
				setApplication((prev) => (prev ? { ...prev, status: "running" } : null));
			}, 3000);
		} else if (action === "stop") {
			setApplication((prev) => (prev ? { ...prev, status: "stopped" } : null));
		} else if (action === "start") {
			setApplication((prev) => (prev ? { ...prev, status: "running" } : null));
		}

		setActionLoading(null);
	};

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

	const getLevelColor = (level: string) => {
		switch (level) {
			case "error":
				return "text-red-600";
			case "warn":
				return "text-yellow-600";
			case "info":
				return "text-blue-600";
			default:
				return "text-gray-600";
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
					<p className="mt-2 text-gray-600">Loading application...</p>
				</div>
			</div>
		);
	}

	if (!application) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Alert>
					<AlertDescription>Application not found</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center h-16">
						<Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
						<div className="flex items-center space-x-4">
							<h1 className="text-xl font-semibold text-gray-900">{application.name}</h1>
							<Badge className={getStatusColor(application.status)}>{application.status}</Badge>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Application Info */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Server className="h-5 w-5 mr-2" />
									Application Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<span className="text-sm font-medium text-gray-500">Application ID</span>
										<p className="text-sm text-gray-900">{application.id}</p>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-500">Stack</span>
										<p className="text-sm text-gray-900">{application.stack}</p>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-500">Region</span>
										<div className="flex items-center">
											<MapPin className="h-4 w-4 mr-1 text-gray-400" />
											<p className="text-sm text-gray-900">{application.region}</p>
										</div>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-500">Instances</span>
										<div className="flex items-center">
											<Activity className="h-4 w-4 mr-1 text-gray-400" />
											<p className="text-sm text-gray-900">{application.instances}</p>
										</div>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-500">Created</span>
										<div className="flex items-center">
											<Calendar className="h-4 w-4 mr-1 text-gray-400" />
											<p className="text-sm text-gray-900">
												{formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
											</p>
										</div>
									</div>
									<div>
										<span className="text-sm font-medium text-gray-500">Last Deployed</span>
										<div className="flex items-center">
											<Clock className="h-4 w-4 mr-1 text-gray-400" />
											<p className="text-sm text-gray-900">
												{formatDistanceToNow(new Date(application.last_deployed_at), { addSuffix: true })}
											</p>
										</div>
									</div>
								</div>
								<div>
									<span className="text-sm font-medium text-gray-500">Application URL</span>
									<div className="flex items-center mt-1">
										<Globe className="h-4 w-4 mr-2 text-gray-400" />
										<a
											href={application.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
										>
											{application.url}
											<ExternalLink className="h-3 w-3 ml-1" />
										</a>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Logs Section */}
						<Card>
							<CardHeader>
								<CardTitle>Application Logs</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-96 w-full border rounded-md p-4 bg-gray-900 text-gray-100 font-mono text-sm">
									{logs.map((log, index) => (
										<div key={index} className="mb-2">
											<span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
											<span className="mx-2 text-gray-500">[{log.source}]</span>
											<span className={`font-medium ${getLevelColor(log.level)}`}>{log.level.toUpperCase()}</span>
											<span className="ml-2">{log.message}</span>
										</div>
									))}
								</ScrollArea>
							</CardContent>
						</Card>
					</div>

					{/* Actions Panel */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button
									onClick={() => handleAction("restart")}
									disabled={actionLoading === "restart"}
									className="w-full"
									variant="outline"
								>
									<RotateCcw className="h-4 w-4 mr-2" />
									{actionLoading === "restart" ? "Restarting..." : "Restart"}
								</Button>

								{application.status === "running" ? (
									<Button
										onClick={() => handleAction("stop")}
										disabled={actionLoading === "stop"}
										className="w-full"
										variant="destructive"
									>
										<Square className="h-4 w-4 mr-2" />
										{actionLoading === "stop" ? "Stopping..." : "Stop"}
									</Button>
								) : (
									<Button onClick={() => handleAction("start")} disabled={actionLoading === "start"} className="w-full">
										<Play className="h-4 w-4 mr-2" />
										{actionLoading === "start" ? "Starting..." : "Start"}
									</Button>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Quick Stats</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Status</span>
									<Badge className={getStatusColor(application.status)}>{application.status}</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Uptime</span>
									<span className="text-sm font-medium">{application.status === "running" ? "2d 14h" : "0h"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Memory Usage</span>
									<span className="text-sm font-medium">{application.status === "running" ? "245MB" : "0MB"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">CPU Usage</span>
									<span className="text-sm font-medium">{application.status === "running" ? "12%" : "0%"}</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
