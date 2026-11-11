import { StaffDirectory } from '../staff/StaffDirectory';

/** Admin "Executives / Agents": provision and manage CA and loan agent accounts. */
export default function AgentsSection() {
  return <StaffDirectory tier="AGENT" title="Executives / Agents" />;
}
