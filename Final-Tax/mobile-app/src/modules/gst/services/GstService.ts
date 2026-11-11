import { gstRepository } from '../repository/GstRepository';
import { gstApi } from './gstApi';
import type { GstServiceItem } from '../types/gst.types';

export const gstService = {
  repository: gstRepository,
  api: gstApi,
  fetchGstServices: async (): Promise<GstServiceItem[]> => {
    return gstRepository.getGstServices();
  },
  getServices: async (): Promise<GstServiceItem[]> => {
    return gstRepository.getGstServices();
  },
};

export default gstService;
