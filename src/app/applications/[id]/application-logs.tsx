import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchScalingoLogs, type LogEntry } from "@/lib/utils";

interface ApplicationLogsProps {
	applicationId: string;
	logsCount?: number;
}

function getLevelColor(level: string) {
	switch (level.toLowerCase()) {
		case "error":
			return "text-red-400";
		case "warn":
		case "warning":
			return "text-yellow-400";
		case "info":
			return "text-blue-400";
		case "debug":
			return "text-gray-400";
		default:
			return "text-gray-300";
	}
}

export default async function ApplicationLogs({ applicationId, logsCount = 100 }: ApplicationLogsProps) {
	const logs = await fetchScalingoLogs(applicationId, logsCount);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Application Logs</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-96 w-full border rounded-md p-4 bg-gray-900 text-gray-100 font-mono text-sm">
					{logs.length > 0 ? (
						logs.map((log: LogEntry) => (
							<div key={log.id} className="mb-2">
								<span className="text-gray-400">{log.timestamp}</span>
								<span className="mx-2 text-gray-500">{log.source}</span>
								<span className={`font-medium ${getLevelColor(log.level)}`}>{log.level.toUpperCase()}</span>
								<span className="ml-2">{log.message}</span>
							</div>
						))
					) : (
						<div className="text-gray-400">No logs available</div>
					)}
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
