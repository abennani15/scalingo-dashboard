import React from "react";
import { Globe, ExternalLink, Shield, ShieldCheck } from "lucide-react";
import { fetchScalingoDomains, type Domain } from "@/lib/utils";

interface ApplicationDomainsProps {
	applicationId: string;
}

export default async function ApplicationDomains({ applicationId }: ApplicationDomainsProps) {
	const domainsResponse = await fetchScalingoDomains(applicationId);
	const { domains } = domainsResponse;

	if (domains.length === 0) {
		return null;
	}

	// Find the canonical domain or the first SSL-enabled domain, or fallback to the first domain
	const primaryDomain =
		domains.find((domain) => domain.canonical) || domains.find((domain) => domain.ssl) || domains[0];

	const constructDomainUrl = (domain: Domain) => {
		const protocol = domain.ssl ? "https" : "http";
		return `${protocol}://${domain.name}`;
	};

	return (
		<div>
			<span className="text-sm font-medium text-gray-500">Application URL</span>
			<div className="space-y-2 mt-1">
				{/* Primary Domain */}
				<div className="flex items-center">
					<Globe className="h-4 w-4 mr-2 text-gray-400" />
					<a
						href={constructDomainUrl(primaryDomain)}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
					>
						{constructDomainUrl(primaryDomain)}
						<ExternalLink className="h-3 w-3 ml-1" />
					</a>
					{primaryDomain.ssl && <ShieldCheck className="h-3 w-3 ml-2 text-green-500" />}
					{primaryDomain.canonical && (
						<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Primary</span>
					)}
				</div>

				{/* Additional Domains */}
				{domains.length > 1 && (
					<div className="ml-6 space-y-1">
						{domains
							.filter((domain) => domain.id !== primaryDomain.id)
							.map((domain) => (
								<div key={domain.id} className="flex items-center">
									<a
										href={constructDomainUrl(domain)}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
									>
										{constructDomainUrl(domain)}
										<ExternalLink className="h-3 w-3 ml-1" />
									</a>
									{domain.ssl ? (
										<ShieldCheck className="h-3 w-3 ml-2 text-green-500" />
									) : (
										<Shield className="h-3 w-3 ml-2 text-gray-400" />
									)}
									{domain.canonical && (
										<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Primary</span>
									)}
								</div>
							))}
					</div>
				)}
			</div>
		</div>
	);
}
