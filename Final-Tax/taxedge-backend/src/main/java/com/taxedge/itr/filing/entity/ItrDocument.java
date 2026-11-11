package com.taxedge.itr.filing.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "itr_document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItrDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true)
    private String documentId;

    @OneToOne
    @JoinColumn(name = "itr_id", nullable = false)
    private ItrFiling itrFiling;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "form_16_part_a_part_b", columnDefinition = "bytea")
    private byte[] form16PartAPartB;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "form_26as", columnDefinition = "bytea")
    private byte[] form26as;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "ais_tis", columnDefinition = "bytea")
    private byte[] aisTis;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "bank_account_statement", columnDefinition = "bytea")
    private byte[] bankAccountStatement;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "salary_payslips", columnDefinition = "bytea")
    private byte[] salaryPayslips;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "capital_gains_statement", columnDefinition = "bytea")
    private byte[] capitalGainsStatement;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "business_turnover", columnDefinition = "bytea")
    private byte[] businessTurnover;
}
