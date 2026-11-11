export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}
