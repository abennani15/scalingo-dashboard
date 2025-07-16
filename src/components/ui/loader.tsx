import React from "react";

interface LoaderProps {
	text?: string;
	centered?: boolean;
}

export default function Loader({ text = "Loading...", centered = false }: LoaderProps) {
	const loaderContent = (
		<div className="bg-gray-100 rounded-lg p-8 text-center">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
			<p className="text-gray-600">{text}</p>
		</div>
	);

	if (centered) {
		return <div className="min-h-screen flex items-center justify-center">{loaderContent}</div>;
	}

	return loaderContent;
}
