import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="max-w-md mx-auto px-4">
				<Card>
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<AlertTriangle className="h-12 w-12 text-yellow-500" />
						</div>
						<CardTitle className="text-xl">Application Not Found</CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-gray-600">
							The application you are looking for does not exist or you do not have access to it.
						</p>
						<Link href="/">
							<Button className="w-full">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Dashboard
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
