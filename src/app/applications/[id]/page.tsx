import React, { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { fetchScalingoApplication, performScalingoApplicationAction } from "@/lib/utils";
import Loader from "@/components/ui/loader";
import ApplicationDetailContent from "./application-detail-content";
import ApplicationLogs from "./application-logs";
import ApplicationDeployments from "./application-deployments";

interface ApplicationDetailPageProps {
	params: Promise<{ id: string }>;
}

// Server Action for handling application actions
async function handleApplicationAction(formData: FormData) {
	"use server";

	const appId = formData.get("appId") as string;
	const action = formData.get("action") as string;

	if (!appId || !action) {
		throw new Error("Missing required parameters");
	}

	// Perform the action on the server
	const success = await performScalingoApplicationAction(appId, action);

	if (success) {
		// Revalidate the page to show updated data
		revalidatePath(`/applications/${appId}`);
	}

	// Redirect back to the same page to show updated status
	redirect(`/applications/${appId}`);
}

export default async function ApplicationDetail({ params }: ApplicationDetailPageProps) {
	// Await the params since it's now a Promise in Next.js 15
	const { id } = await params;

	// Fetch only the application on the server
	const application = await fetchScalingoApplication(id);

	// If application not found, show 404
	if (!application) {
		notFound();
	}

	return (
		<ApplicationDetailContent
			application={application}
			onAction={handleApplicationAction}
			logsComponent={
				<Suspense fallback={<Loader text="Loading logs..." />}>
					<ApplicationLogs applicationId={id} logsCount={100} />
				</Suspense>
			}
			deploymentsComponent={<ApplicationDeployments applicationId={id} />}
		/>
	);
}
