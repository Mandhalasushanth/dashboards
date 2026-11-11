import { StaffDirectory } from '../staff/StaffDirectory';

/** Admin "Managers": provision and manage CA and loan manager accounts. */
export default function ManagersSection() {
  return <StaffDirectory tier="MANAGER" title="Managers" />;
}
