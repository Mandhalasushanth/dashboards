import { GST_SERVICES } from "../mock/gstServices";
import { GstServiceItem } from "../types/gst.types";

export interface IGstRepository {
  getGstServices(): Promise<GstServiceItem[]>;
}

export class GstRepository implements IGstRepository {
  async getGstServices(): Promise<GstServiceItem[]> {
    return GST_SERVICES;
  }
}

export const gstRepository = new GstRepository();
