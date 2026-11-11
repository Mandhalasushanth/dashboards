export interface RequestInterceptorContext {
  headers: Record<string, string>;
  url: string;
  method: string;
}

export type RequestInterceptor = (config: RequestInterceptorContext) => Promise<RequestInterceptorContext> | RequestInterceptorContext;
export type ResponseInterceptor = <T>(response: T) => Promise<T> | T;
export type ErrorInterceptor = (error: unknown) => Promise<never> | never;

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  useRequest(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  useResponse(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  useError(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  async runRequestInterceptors(context: RequestInterceptorContext): Promise<RequestInterceptorContext> {
    let current = context;
    await this.requestInterceptors.reduce(async (accPromise, interceptor) => {
      await accPromise;
      current = await interceptor(current);
    }, Promise.resolve());
    return current;
  }

  async runResponseInterceptors<T>(response: T): Promise<T> {
    let current: T = response;
    await this.responseInterceptors.reduce(async (accPromise, interceptor) => {
      await accPromise;
      current = await interceptor(current);
    }, Promise.resolve());
    return current;
  }

  async runErrorInterceptors(error: unknown): Promise<never> {
    await this.errorInterceptors.reduce(async (accPromise, interceptor) => {
      await accPromise;
      await interceptor(error);
    }, Promise.resolve());
    throw error;
  }
}
