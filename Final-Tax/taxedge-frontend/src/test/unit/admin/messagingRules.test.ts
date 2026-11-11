import { describe, expect, it } from 'vitest';
import { canCaAgentMessage } from '@/modules/ca-agent/shared/caAgentCommunication';
import { canCaManagerMessage } from '@/modules/ca-manager/shared/caManagerCommunication';
import { canLoanAgentMessage } from '@/modules/loan-agent/shared/loanAgentCommunication';
import { canLoanManagerMessage } from '@/modules/loan-manager/shared/loanManagerCommunication';

const party = (id: string, role: string, managerId: string | null = null) => ({ id, role, managerId });

const ADMIN = party('ADMIN', 'ADMIN');
const CA_MGR = party('MGR-101', 'CA_MANAGER');
const CA_MGR_2 = party('MGR-102', 'CA_MANAGER');
const MY_CA_AGENT = party('AGT-301', 'CA_AGENT', 'MGR-101');
const OTHER_CA_AGENT = party('AGT-303', 'CA_AGENT', 'MGR-102');
const LOAN_MGR = party('MGR-201', 'LOAN_MANAGER');
const LOAN_AGENT = party('AGT-401', 'LOAN_AGENT', 'MGR-201');

describe('workspace contact rules', () => {
  it('lets a CA manager reach the administrator, fellow CA managers and only their own agents', () => {
    expect(canCaManagerMessage(CA_MGR, ADMIN)).toBe(true);
    expect(canCaManagerMessage(CA_MGR, CA_MGR_2)).toBe(true);
    expect(canCaManagerMessage(CA_MGR, MY_CA_AGENT)).toBe(true);
    expect(canCaManagerMessage(CA_MGR, OTHER_CA_AGENT)).toBe(false);
    expect(canCaManagerMessage(CA_MGR, LOAN_AGENT)).toBe(false);
  });

  it('lets a CA agent reach the administrator and CA managers only', () => {
    expect(canCaAgentMessage(MY_CA_AGENT, ADMIN)).toBe(true);
    expect(canCaAgentMessage(MY_CA_AGENT, CA_MGR)).toBe(true);
    expect(canCaAgentMessage(MY_CA_AGENT, OTHER_CA_AGENT)).toBe(false);
    expect(canCaAgentMessage(MY_CA_AGENT, LOAN_MGR)).toBe(false);
  });

  it('mirrors the same boundaries for the loan team', () => {
    expect(canLoanManagerMessage(LOAN_MGR, LOAN_AGENT)).toBe(true);
    expect(canLoanManagerMessage(LOAN_MGR, ADMIN)).toBe(true);
    expect(canLoanManagerMessage(LOAN_MGR, MY_CA_AGENT)).toBe(false);
    expect(canLoanAgentMessage(LOAN_AGENT, LOAN_MGR)).toBe(true);
    expect(canLoanAgentMessage(LOAN_AGENT, CA_MGR)).toBe(false);
  });
});
