import { describe, expect, it } from 'vitest';
import { isTaken, isTakenBy, setServerClaims, withClaim } from '@/modules/workflow/services/managerClaims';
import type { WorkflowCase } from '@/modules/workflow/shared/workflow.types';

const caseWith = (id: string) =>
  ({ id, assignment: { managerId: null, managerName: null, agentId: null, agentName: null, assignedAt: null, instructions: null } }) as unknown as WorkflowCase;

/** "Taken by" comes only from what the server's bucket says; nothing is read from or saved in the browser. */
describe('manager claims ("Take application")', () => {
  it('leaves an application open to every manager until the server says one took it', () => {
    setServerClaims({});
    expect(isTaken(withClaim(caseWith('C-1')))).toBe(false);
  });

  it('shows who took an application and when, as the bucket reports it', () => {
    setServerClaims({ 'C-1': { managerId: '7', managerName: 'Asha', takenAt: '2026-11-10T11:00:00' } });
    const taken = withClaim(caseWith('C-1'));
    expect(taken.assignment).toMatchObject({ managerId: '7', managerName: 'Asha', managerTakenAt: '2026-11-10T11:00:00' });
    expect(isTakenBy(taken, '7')).toBe(true);
    expect(isTakenBy(taken, '8')).toBe(false);
    expect(isTaken(withClaim(caseWith('C-2')))).toBe(false);
  });

  it('follows the server when another manager takes over or the application is given back', () => {
    setServerClaims({ 'C-1': { managerId: '8', managerName: 'Ravi', takenAt: '2026-11-10T12:00:00' } });
    expect(withClaim(caseWith('C-1')).assignment.managerName).toBe('Ravi');
    setServerClaims({});
    expect(isTaken(withClaim(caseWith('C-1')))).toBe(false);
  });
});
