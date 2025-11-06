"use client";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DocumentList from "./DocumentList";
import Link from "next/link";
import MarkdownEdit from "../MarkdownEdit";
import MDEditor from "@uiw/react-md-editor";

interface DocumentsCardProps {
	mini?: boolean;
}

const DocumentsCard: React.FC<DocumentsCardProps> = ({ mini }) => {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Documents</CardTitle>
				<CardDescription>
					View and manage your existing legal agreements.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex gap-4">
					<DocumentList mini={mini} />
					{!mini && (
						<MDEditor.Markdown
							className="w-3/4 p-6"
							source={`## Mobile App Development Contract

This Mobile App Development Contract ("Agreement") is made and entered into as of 25/10/2024, by and between:

**Cygnet Infotech Pvt Ltd** ("Developer"), a company incorporated and existing under the laws of India, with its registered office at [Address of Cygnet Infotech], Ahmedabad, India, and 

**Amit**, residing at [Address of Amit], hereinafter referred to as "Client".

**WHEREAS**, Client desires to engage Developer to develop and implement a mobile application (the "App") for its online store, and 

**WHEREAS**, Developer possesses the necessary expertise and resources to develop and implement the App.

**NOW, THEREFORE,** in consideration of the foregoing premises and the mutual covenants contained herein, the parties agree as follows:

**1. Scope of Work**

Developer shall develop and implement a mobile application (the "App") for Client's online store. The App shall include, but not be limited to, the following features:

* Product listings
* Shopping cart
* Payment gateway integration
* User reviews

Developer shall provide all necessary services, including, but not limited to, design, development, testing, and deployment of the App.

**2. Responsibilities**

* **Developer Responsibilities:**
    * Develop and implement the App in accordance with the agreed upon specifications and timelines.
    * Provide regular updates and communication to Client regarding the progress of the App development.
    * Ensure the App is user-friendly and visually appealing.
    * Provide training and support to Client on the use of the App.
* **Client Responsibilities:**
    * Provide Developer with all necessary information and materials for the development and implementation of the App.
    * Review and approve the wireframes and prototypes developed by Developer.
    * Provide timely feedback and approvals during the testing phase.

**3. Payment Terms**

The total cost of the App development shall be INR 90,000 (Indian Rupees Ninety Thousand) payable in three installments as follows:

* First installment of INR 30,000 (Indian Rupees Thirty Thousand) due upfront upon execution of this Agreement.
* Second installment of INR 30,000 (Indian Rupees Thirty Thousand) due at the end of the first month of development.
* Third installment of INR 30,000 (Indian Rupees Thirty Thousand) due at the end of the second month of development.

**4. Deadlines**

* The development of the App shall commence on November 1st, 2024.
* The initial wireframes shall be completed within the first two weeks of development.
* The testing phase shall begin around December 1st, 2024.
* The final launch of the App shall be mutually agreed upon by both parties.

**5. Confidentiality**

Developer acknowledges that Client's data, including customer information, sales reports, and business strategies, are confidential and proprietary. Developer shall not disclose any such confidential information to any third party without Client's prior written consent.

**6. Liability**

Developer shall not be liable for any indirect, consequential, incidental, special, or punitive damages arising from the performance of this Agreement. Developer's total liability for any claims arising from this Agreement shall be limited to the amount of fees paid by Client hereunder.

**7. Dispute Resolution**

Any dispute arising out of or in connection with this Agreement shall be resolved through amicable negotiations between the parties. If the parties are unable to reach an amicable settlement, the dispute shall be referred to arbitration in Bangalore, India, in accordance with the Arbitration and Conciliation Act, 1996.

**8. Termination**

This Agreement may be terminated by either party upon thirty (30) days' written notice to the other party. In the event of termination, Client shall be entitled to a refund of any unused fees paid hereunder.

**9. Entire Agreement**

This Agreement constitutes the entire agreement and understanding between the parties with respect to the subject matter hereof and supersedes all prior or contemporaneous communications, representations, or agreements, whether oral or written.

**10. Governing Law**

This Agreement shall be governed by and construed in accordance with the laws of India.

**IN WITNESS WHEREOF,** the parties have executed this Agreement as of the date first written above.

**Cygnet Infotech Pvt Ltd**

_________________________

**Amit**

_________________________ 


Signed by: Amit on 10/25/2024
Hash: 44090f6ae6c2e9d57d29c677165a9482cb6ed21e25065c263a4ae677979e26db`}
							readOnly={true}
						/>
					)}
				</div>
			</CardContent>
			{mini && (
				<CardFooter className="flex justify-end">
					<Link href={"/docs"}>
						<Button variant="link">See more</Button>
					</Link>
				</CardFooter>
			)}
		</Card>
	);
};

export default DocumentsCard;
