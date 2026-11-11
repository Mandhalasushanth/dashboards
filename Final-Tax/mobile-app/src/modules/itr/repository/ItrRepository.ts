import { ITR_SERVICES } from "../mock/itrServices";
import { ItrServiceItem } from "../types/itr.types";

export interface IItrRepository {
  getItrServices(): Promise<ItrServiceItem[]>;
}

export class ItrRepository implements IItrRepository {
  async getItrServices(): Promise<ItrServiceItem[]> {
    return ITR_SERVICES;
  }
}

export const itrRepository = new ItrRepository();
