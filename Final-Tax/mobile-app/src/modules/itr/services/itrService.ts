import { IItrRepository, itrRepository } from "../repository/ItrRepository";
import { ItrServiceItem } from "../types/itr.types";

export class ItrService {
  constructor(private readonly repository: IItrRepository = itrRepository) {}

  async fetchItrServices(): Promise<ItrServiceItem[]> {
    return this.repository.getItrServices();
  }
}

export const itrService = new ItrService();
