"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { type Application } from "@/lib/utils";

interface ApplicationDetailContentProps {
	application: Application;
	onAction: (formData: FormData) => Promise<void>;
	logsComponent?: React.ReactNode;
	deploymentsComponent?: React.ReactNode;
	domainsComponent?: React.ReactNode;
}

export default function ApplicationDetailContent({
	application,
	onAction,
	logsComponent = null,
	deploymentsComponent = null,
	domainsComponent = null
}: ApplicationDetailContentProps) {
	const router = useRouter();
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("logs");

	const handleAction = async (action: string) => {
		setActionLoading(action);

		const formData = new FormData();
		formData.append("appId", application.id);
		formData.append("action", action);

		try {
			await onAction(formData);
		} catch {
			// Error performing action - the page will redirect anyway
		} finally {
			setActionLoading(null);
		}
	};

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
										{application.stack && (
											<div>
												<span className="text-sm font-medium text-gray-500">Stack</span>
												<p className="text-sm text-gray-900">{application.stack}</p>
											</div>
										)}
										<div>
											<span className="text-sm font-medium text-gray-500">Region</span>
											<div className="flex items-center">
												<MapPin className="h-4 w-4 mr-1 text-gray-400" />
												<p className="text-sm text-gray-900">{application.region}</p>
											</div>
										</div>
										{application.instances && (
											<div>
												<span className="text-sm font-medium text-gray-500">Instances</span>
												<div className="flex items-center">
													<Activity className="h-4 w-4 mr-1 text-gray-400" />
													<p className="text-sm text-gray-900">{application.instances}</p>
												</div>
											</div>
										)}
										<div>
											<span className="text-sm font-medium text-gray-500">Created</span>
											<div className="flex items-center">
												<Calendar className="h-4 w-4 mr-1 text-gray-400" />
												<Tooltip>
													<TooltipTrigger asChild>
														<p className="text-sm text-gray-900 cursor-help">
															{formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
														</p>
													</TooltipTrigger>
													<TooltipContent>
														<p>{new Date(application.created_at).toLocaleString()}</p>
													</TooltipContent>
												</Tooltip>
											</div>
										</div>
										{application.last_deployed_at && (
											<div>
												<span className="text-sm font-medium text-gray-500">Last Deployed</span>
												<div className="flex items-center">
													<Clock className="h-4 w-4 mr-1 text-gray-400" />
													<Tooltip>
														<TooltipTrigger asChild>
															<p className="text-sm text-gray-900 cursor-help">
																{formatDistanceToNow(new Date(application.last_deployed_at), { addSuffix: true })}
															</p>
														</TooltipTrigger>
														<TooltipContent>
															<p>{new Date(application.last_deployed_at).toLocaleString()}</p>
														</TooltipContent>
													</Tooltip>
												</div>
											</div>
										)}
									</div>
									{/* Custom Domains */}
									{domainsComponent}
									{application.git_url && (
										<div>
											<span className="text-sm font-medium text-gray-500">Git Repository</span>
											<div className="flex items-center mt-1">
												<Globe className="h-4 w-4 mr-2 text-gray-400" />
												<a
													href={application.git_url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
												>
													{application.git_url}
													<ExternalLink className="h-3 w-3 ml-1" />
												</a>
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Logs and Deployments Tabs */}
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="logs">Logs</TabsTrigger>
									<TabsTrigger value="deployments">Deployments</TabsTrigger>
								</TabsList>
								<TabsContent value="logs">{logsComponent}</TabsContent>
								<TabsContent value="deployments">
									{React.cloneElement(deploymentsComponent as React.ReactElement, {
										shouldLoad: activeTab === "deployments"
									})}
								</TabsContent>
							</Tabs>
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
										<Button
											onClick={() => handleAction("start")}
											disabled={actionLoading === "start"}
											className="w-full"
										>
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
		</TooltipProvider>
	);
}
