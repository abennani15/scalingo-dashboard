import React from "react";
import { fetchScalingoApplications } from "@/lib/utils";
import DashboardContent from "./dashboard-content";

export default async function Dashboard() {
	// Fetch applications on the server
	const applications = await fetchScalingoApplications();

	return <DashboardContent applications={applications} />;
}
