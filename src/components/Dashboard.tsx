import React from "react";
import OverviewCard from "@/components/DashboardCards/OverviewCard";
import CreateCard from "@/components/DashboardCards/CreateCard";
import DocumentsCard from "@/components/DocumentsCard/DocumentsCard";

const Dashboard: React.FC = () => {
	return (
		<div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
			<OverviewCard />
			<CreateCard />
			<DocumentsCard mini />
		</div>
	);
};

export default Dashboard;
