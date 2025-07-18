import React from "react";
import { Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationDomainsSkeleton() {
	return (
		<div>
			<span className="text-sm font-medium text-gray-500">Application URL</span>
			<div className="space-y-2 mt-1">
				{/* Primary Domain Skeleton - matches exact height of text-sm link */}
				<div className="flex items-center">
					<Globe className="h-4 w-4 mr-2 text-gray-400" />
					<Skeleton className="h-4 w-52" />
					{/* SSL icon skeleton */}
					<Skeleton className="h-3 w-3 ml-2 rounded-full" />
					{/* Primary badge skeleton */}
					<Skeleton className="h-4 w-12 ml-2 rounded" />
				</div>
			</div>
		</div>
	);
}
