import React from "react";
import OverviewCard from "@/components/DashboardCards/OverviewCard";
import CreateCard from "@/components/DashboardCards/CreateCard";
import DocumentsCard from "@/components/DocumentsCard/DocumentsCard";
import OnboardingCard from "@/components/OnboardingCard";
import VerifyCard from "@/components/DashboardCards/VerifyCard";
import TemplatesCard from "@/components/DashboardCards/TemplatesCard";

const Dashboard: React.FC = () => {
	return (
		<div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
			<OverviewCard />
			<CreateCard />
			<DocumentsCard mini />
			<TemplatesCard />
			<OnboardingCard />
			<VerifyCard />
		</div>
	);
};

export default Dashboard;
