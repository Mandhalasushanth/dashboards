package com.taxedge.loan.propertyloan.enums;

public enum PropertyDocumentType {
    PROPERTY_SALE_AGREEMENT_DOCUMENT("Property / Sale Agreement Document", "Upload the property document available with you."),
    BANK_STATEMENT_INCOME_DOCUMENT("Bank Statement / Income Document", "Latest 6 months bank statement showing regular credits or operational funds"),
    PROPERTY_QUOTATION_BUILDER_DOCUMENT("Property Quotation / Builder Document", "Builder quotation, cost sheet or demand letter if available"),
    ADDITIONAL_PROPERTY_DOCUMENT("Additional Property Document", "Any other property records, tax receipts or possession letters"),
    PROPERTY_OWNERSHIP_DOCUMENT("Plot / Property Ownership Document", "Registered title deed, allotment letter or sale deed"),
    CONSTRUCTION_DOCUMENT("Construction Document", "Construction document, if available"),
    SANCTIONED_BUILDING_PLAN("Sanctioned Building Plan", "Approved floor plan or blueprint from local authority"),
    CONSTRUCTION_COST_ESTIMATE("Construction Cost Estimate", "Civil construction cost estimate or architect BOQ"),
    RENOVATION_COST_ESTIMATE("Renovation Cost Estimate", "Estimated cost sheet for home renovation"),
    CONTRACTOR_QUOTATION("Contractor Quotation", "Quotation from approved civil contractor"),
    PLOT_PROPERTY_OWNERSHIP_DOCUMENT("Plot / Property Ownership Document", "Registered title deed, allotment letter or sale deed of plot"),
    SALE_AGREEMENT("Sale Agreement", "Sale agreement document for plot acquisition"),
    PLOT_QUOTATION_COST_SHEET("Plot Quotation / Cost Sheet", "Quotation or cost sheet for plot"),
    SALE_AGREEMENT_ALLOTMENT_LETTER("Sale Agreement / Allotment Letter", "Purchase agreement for the plot if recently acquired"),
    EXISTING_LOAN_STATEMENT_ACCOUNT_DOCUMENT("Existing Loan Statement / Account Document", "Latest 12 months loan repayment account statement / SOA"),
    PROPERTY_DOCUMENT_COPY("Property Document Copy", "Sale deed, title deed or possession letter"),
    FORECLOSURE_OUTSTANDING_STATEMENT("Foreclosure / Outstanding Statement", "Foreclosure statement / LOD");

    private final String displayName;
    private final String description;

    PropertyDocumentType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
