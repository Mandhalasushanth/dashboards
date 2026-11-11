import { useEffect, useState } from 'react';
import { gstService } from '../services/GstService';
import type { GstServiceItem } from '../types/gst.types';

export function useGST() {
  const [services, setServices] = useState<GstServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gstService.fetchGstServices().then((res) => {
      setServices(res);
      setLoading(false);
    });
  }, []);

  return { services, loading };
}

export default useGST;
