import { useApplicationStore } from '../../../store/applicationStore';
import type { Application } from '../../../shared/types/domain';

export function useApplications() {
  const applications = useApplicationStore((s) => s.applications);
  const selectedApplicationId = useApplicationStore((s) => s.selectedApplicationId);
  const setSelectedApplicationId = useApplicationStore((s) => s.setSelectedApplicationId);

  const getApplicationById = (id: string): Application | undefined =>
    applications.find((a: Application) => a.id === id);

  const getApplicationsByCategory = (cat: string): Application[] =>
    applications.filter((a: Application) => a.category === cat);

  const getApplicationsByStatus = (status: string): Application[] =>
    applications.filter((a: Application) => a.status === status);

  return {
    applications,
    selectedApplicationId,
    setSelectedApplicationId,
    getApplicationById,
    getApplicationsByCategory,
    getApplicationsByStatus,
  };
}
