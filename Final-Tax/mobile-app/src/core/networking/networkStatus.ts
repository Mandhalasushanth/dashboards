export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

class NetworkStatusService {
  private isConnected = true;
  private listeners: Array<(state: NetworkState) => void> = [];

  getConnectionStatus(): NetworkState {
    return {
      isConnected: this.isConnected,
      isInternetReachable: this.isConnected,
    };
  }

  subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const networkStatus = new NetworkStatusService();
export default networkStatus;
