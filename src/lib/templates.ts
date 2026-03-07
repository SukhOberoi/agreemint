/**
 * Contract template library.
 * Each template contains skeleton clauses the model can adapt to match
 * the negotiated terms extracted from audio / user prompt.
 */

export interface TemplateClause {
  id: string;
  heading: string;
  text: string;
}

export interface ContractTemplate {
  type: string;
  displayName: string;
  description: string;
  clauses: TemplateClause[];
}

const templates: ContractTemplate[] = [
  {
    type: "employment",
    displayName: "Employment Agreement",
    description:
      "Standard employment contract covering position, compensation, benefits, termination, and confidentiality.",
    clauses: [
      {
        id: "emp-1",
        heading: "Position & Duties",
        text: "The Employee shall serve as [JOB_TITLE] and perform duties as reasonably assigned by the Employer.",
      },
      {
        id: "emp-2",
        heading: "Compensation",
        text: "The Employer shall pay the Employee a base salary of [SALARY] per [PAY_PERIOD], subject to applicable withholdings.",
      },
      {
        id: "emp-3",
        heading: "Benefits",
        text: "The Employee shall be entitled to participate in all benefit plans generally available to employees of the same level.",
      },
      {
        id: "emp-4",
        heading: "Term & Termination",
        text: "This Agreement shall commence on [START_DATE] and continue until terminated by either party with [NOTICE_PERIOD] written notice.",
      },
      {
        id: "emp-5",
        heading: "Confidentiality",
        text: "The Employee agrees not to disclose any proprietary or confidential information of the Employer during or after employment.",
      },
      {
        id: "emp-6",
        heading: "Non-Compete",
        text: "For [NON_COMPETE_PERIOD] after termination, the Employee shall not engage in any business that directly competes with the Employer within [GEOGRAPHIC_SCOPE].",
      },
      {
        id: "emp-7",
        heading: "Intellectual Property",
        text: "All work created by the Employee during the term of employment shall be the exclusive property of the Employer.",
      },
      {
        id: "emp-8",
        heading: "Dispute Resolution",
        text: "Any disputes shall be resolved through binding arbitration in [ARBITRATION_LOCATION] under the rules of [ARBITRATION_BODY].",
      },
      {
        id: "emp-9",
        heading: "Governing Law",
        text: "This Agreement shall be governed by and construed in accordance with the laws of [GOVERNING_JURISDICTION].",
      },
    ],
  },
  {
    type: "nda",
    displayName: "Non-Disclosure Agreement",
    description:
      "Mutual or unilateral NDA protecting confidential information shared between parties.",
    clauses: [
      {
        id: "nda-1",
        heading: "Definition of Confidential Information",
        text: 'For purposes of this Agreement, "Confidential Information" means any non-public information disclosed by the Disclosing Party, whether orally, in writing, or electronically.',
      },
      {
        id: "nda-2",
        heading: "Obligations of the Receiving Party",
        text: "The Receiving Party shall hold all Confidential Information in strict confidence and shall not disclose it to any third party without prior written consent.",
      },
      {
        id: "nda-3",
        heading: "Exclusions",
        text: "Confidential Information does not include information that: (a) is publicly available, (b) was known prior to disclosure, (c) was independently developed, or (d) was disclosed by a third party without restriction.",
      },
      {
        id: "nda-4",
        heading: "Term",
        text: "This Agreement shall remain in effect for [NDA_TERM] from the Effective Date.",
      },
      {
        id: "nda-5",
        heading: "Return of Materials",
        text: "Upon termination, the Receiving Party shall promptly return or destroy all Confidential Information and certify such destruction in writing.",
      },
      {
        id: "nda-6",
        heading: "Remedies",
        text: "The Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law or in equity.",
      },
      {
        id: "nda-7",
        heading: "Governing Law",
        text: "This Agreement shall be governed by the laws of [GOVERNING_JURISDICTION].",
      },
    ],
  },
  {
    type: "service",
    displayName: "Service Agreement",
    description:
      "Professional services contract between a service provider and a client.",
    clauses: [
      {
        id: "svc-1",
        heading: "Scope of Services",
        text: "The Service Provider shall perform the services described in Exhibit A (the \"Services\") in a professional and workmanlike manner.",
      },
      {
        id: "svc-2",
        heading: "Compensation",
        text: "The Client shall pay the Service Provider [FEE_AMOUNT] [FEE_STRUCTURE] for the Services. Payment is due within [PAYMENT_TERMS] of invoice date.",
      },
      {
        id: "svc-3",
        heading: "Term",
        text: "This Agreement begins on [START_DATE] and continues until [END_DATE] unless terminated earlier.",
      },
      {
        id: "svc-4",
        heading: "Independent Contractor",
        text: "The Service Provider is an independent contractor and nothing in this Agreement creates an employment, partnership, or agency relationship.",
      },
      {
        id: "svc-5",
        heading: "Confidentiality",
        text: "Each party agrees to keep confidential any proprietary information received from the other party during the performance of this Agreement.",
      },
      {
        id: "svc-6",
        heading: "Limitation of Liability",
        text: "In no event shall either party be liable for indirect, incidental, or consequential damages. Total liability shall not exceed [LIABILITY_CAP].",
      },
      {
        id: "svc-7",
        heading: "Termination",
        text: "Either party may terminate this Agreement with [NOTICE_PERIOD] written notice. The Client shall pay for all Services performed through the termination date.",
      },
      {
        id: "svc-8",
        heading: "Dispute Resolution",
        text: "Disputes shall first be submitted to mediation. If unresolved within [MEDIATION_PERIOD], they shall proceed to binding arbitration.",
      },
      {
        id: "svc-9",
        heading: "Governing Law",
        text: "This Agreement shall be governed by the laws of [GOVERNING_JURISDICTION].",
      },
    ],
  },
  {
    type: "freelance",
    displayName: "Freelance Contract",
    description:
      "Contract for freelance/gig work covering deliverables, milestones, and payment.",
    clauses: [
      {
        id: "fl-1",
        heading: "Project Description",
        text: "The Freelancer agrees to complete the following project: [PROJECT_DESCRIPTION].",
      },
      {
        id: "fl-2",
        heading: "Deliverables & Milestones",
        text: "The Freelancer shall deliver the following milestones: [MILESTONES]. Each milestone is due by its respective deadline.",
      },
      {
        id: "fl-3",
        heading: "Payment",
        text: "The Client shall pay [TOTAL_FEE] in the following schedule: [PAYMENT_SCHEDULE]. Late payments accrue interest at [LATE_FEE_RATE].",
      },
      {
        id: "fl-4",
        heading: "Revisions",
        text: "The fee includes up to [REVISION_COUNT] rounds of revisions. Additional revisions will be billed at [HOURLY_RATE] per hour.",
      },
      {
        id: "fl-5",
        heading: "Intellectual Property",
        text: "Upon full payment, all intellectual property rights in the deliverables transfer to the Client.",
      },
      {
        id: "fl-6",
        heading: "Confidentiality",
        text: "The Freelancer shall not disclose any confidential business information of the Client.",
      },
      {
        id: "fl-7",
        heading: "Termination",
        text: "Either party may terminate with [NOTICE_PERIOD] notice. The Freelancer shall be paid for work completed up to the termination date.",
      },
      {
        id: "fl-8",
        heading: "Governing Law",
        text: "This Agreement shall be governed by the laws of [GOVERNING_JURISDICTION].",
      },
    ],
  },
  {
    type: "lease",
    displayName: "Lease Agreement",
    description:
      "Residential or commercial lease covering rent, term, maintenance obligations, and termination.",
    clauses: [
      {
        id: "ls-1",
        heading: "Premises",
        text: "The Landlord agrees to lease the property located at [PROPERTY_ADDRESS] to the Tenant.",
      },
      {
        id: "ls-2",
        heading: "Term",
        text: "The lease term begins on [START_DATE] and ends on [END_DATE], unless renewed or terminated earlier.",
      },
      {
        id: "ls-3",
        heading: "Rent",
        text: "The Tenant shall pay rent of [RENT_AMOUNT] per [RENT_PERIOD], due on the [DUE_DAY] of each period.",
      },
      {
        id: "ls-4",
        heading: "Security Deposit",
        text: "The Tenant shall pay a security deposit of [DEPOSIT_AMOUNT] upon signing, refundable subject to the terms herein.",
      },
      {
        id: "ls-5",
        heading: "Maintenance & Repairs",
        text: "The Landlord is responsible for structural repairs. The Tenant shall maintain the premises in good condition.",
      },
      {
        id: "ls-6",
        heading: "Termination",
        text: "Either party may terminate with [NOTICE_PERIOD] written notice. Early termination may incur a fee of [EARLY_TERM_FEE].",
      },
      {
        id: "ls-7",
        heading: "Governing Law",
        text: "This lease shall be governed by the laws of [GOVERNING_JURISDICTION].",
      },
    ],
  },
  {
    type: "partnership",
    displayName: "Partnership Agreement",
    description:
      "Agreement between business partners covering contributions, profit sharing, and dissolution.",
    clauses: [
      {
        id: "pa-1",
        heading: "Formation",
        text: "The Partners hereby form a partnership under the name [PARTNERSHIP_NAME] for the purpose of [BUSINESS_PURPOSE].",
      },
      {
        id: "pa-2",
        heading: "Capital Contributions",
        text: "Each Partner shall contribute the following: [CONTRIBUTIONS]. Additional contributions require unanimous consent.",
      },
      {
        id: "pa-3",
        heading: "Profit & Loss Sharing",
        text: "Profits and losses shall be shared in the following ratio: [PROFIT_SPLIT].",
      },
      {
        id: "pa-4",
        heading: "Management",
        text: "All Partners shall have equal rights in the management and conduct of the partnership business unless otherwise agreed.",
      },
      {
        id: "pa-5",
        heading: "Withdrawal",
        text: "A Partner may withdraw with [NOTICE_PERIOD] written notice. The withdrawing Partner's interest shall be valued as of the withdrawal date.",
      },
      {
        id: "pa-6",
        heading: "Dissolution",
        text: "The partnership may be dissolved by unanimous consent or upon the occurrence of events specified herein.",
      },
      {
        id: "pa-7",
        heading: "Governing Law",
        text: "This Agreement shall be governed by the laws of [GOVERNING_JURISDICTION].",
      },
    ],
  },
  {
    type: "product-supply",
    displayName: "Product Supply Agreement",
    description:
      "Agreement between a supplier and a buyer for the ongoing supply of goods, covering pricing, delivery, quality, and liability.",
    clauses: [
      {
        id: "ps-1",
        heading: "Products",
        text: "The Supplier agrees to manufacture and supply to the Buyer the products described in Schedule A (the \"Products\").",
      },
      {
        id: "ps-2",
        heading: "Ordering & Forecasting",
        text: "The Buyer shall submit purchase orders at least [LEAD_TIME] in advance of the requested delivery date. The Buyer shall provide a rolling [FORECAST_PERIOD] non-binding demand forecast.",
      },
      {
        id: "ps-3",
        heading: "Pricing",
        text: "The price per unit for each Product is set forth in Schedule B. Prices are fixed for [PRICE_LOCK_PERIOD] from the Effective Date and may be adjusted thereafter upon [PRICE_REVIEW_NOTICE] written notice.",
      },
      {
        id: "ps-4",
        heading: "Minimum Order Quantity",
        text: "Each purchase order shall meet a minimum order quantity of [MIN_ORDER_QTY] units. Orders below the minimum may be subject to a surcharge of [SMALL_ORDER_SURCHARGE].",
      },
      {
        id: "ps-5",
        heading: "Delivery & Shipping",
        text: "The Supplier shall deliver the Products [DELIVERY_TERMS] to [DELIVERY_LOCATION]. Risk of loss passes to the Buyer upon [RISK_TRANSFER_POINT].",
      },
      {
        id: "ps-6",
        heading: "Inspection & Acceptance",
        text: "The Buyer shall inspect all deliveries within [INSPECTION_PERIOD] of receipt. Products not rejected in writing within that period are deemed accepted.",
      },
      {
        id: "ps-7",
        heading: "Quality & Specifications",
        text: "All Products shall conform to the specifications set forth in Schedule A and comply with all applicable laws and industry standards. The Supplier shall maintain a quality management system consistent with [QUALITY_STANDARD].",
      },
      {
        id: "ps-8",
        heading: "Warranties",
        text: "The Supplier warrants that the Products will be free from defects in materials and workmanship for a period of [WARRANTY_PERIOD] from delivery. Defective Products shall be replaced or credited at the Supplier's expense.",
      },
      {
        id: "ps-9",
        heading: "Payment Terms",
        text: "The Buyer shall pay all undisputed invoices within [PAYMENT_TERMS] of the invoice date. Late payments shall accrue interest at [LATE_INTEREST_RATE] per month.",
      },
      {
        id: "ps-10",
        heading: "Term & Renewal",
        text: "This Agreement commences on [START_DATE] and continues for an initial term of [INITIAL_TERM]. It shall automatically renew for successive [RENEWAL_TERM] periods unless either party provides [RENEWAL_NOTICE] written notice of non-renewal.",
      },
      {
        id: "ps-11",
        heading: "Termination",
        text: "Either party may terminate this Agreement for cause upon [CURE_PERIOD] written notice if the other party materially breaches and fails to cure within that period. Either party may terminate for convenience with [CONVENIENCE_NOTICE] written notice.",
      },
      {
        id: "ps-12",
        heading: "Limitation of Liability",
        text: "Neither party shall be liable for indirect, incidental, or consequential damages. The Supplier's total liability shall not exceed [LIABILITY_CAP].",
      },
      {
        id: "ps-13",
        heading: "Force Majeure",
        text: "Neither party shall be liable for delays or failures in performance resulting from events beyond its reasonable control, including natural disasters, war, or government action.",
      },
      {
        id: "ps-14",
        heading: "Confidentiality",
        text: "Each party shall keep confidential any proprietary information received from the other party and shall not disclose it to third parties without prior written consent.",
      },
      {
        id: "ps-15",
        heading: "Dispute Resolution",
        text: "Any disputes arising under this Agreement shall first be submitted to good-faith negotiation. If unresolved within [NEGOTIATION_PERIOD], the dispute shall proceed to binding arbitration in [ARBITRATION_LOCATION].",
      },
      {
        id: "ps-16",
        heading: "Governing Law",
        text: "This Agreement shall be governed by and construed in accordance with the laws of [GOVERNING_JURISDICTION].",
      },
    ],
  },
];

/**
 * Look up a template by type identifier.
 */
export function getTemplate(type: string): ContractTemplate | null {
  return templates.find((t) => t.type === type) ?? null;
}

/**
 * Return a summary list of all available templates (for the model to choose from).
 */
export function listTemplates(): { type: string; displayName: string; description: string }[] {
  return templates.map(({ type, displayName, description }) => ({
    type,
    displayName,
    description,
  }));
}

export default templates;
