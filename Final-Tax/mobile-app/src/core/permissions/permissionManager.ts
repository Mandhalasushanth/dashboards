export type PermissionType = "camera" | "photos" | "notifications" | "location";

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

class PermissionManager {
  async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    return { granted: true, canAskAgain: true };
  }

  async requestPermission(type: PermissionType): Promise<PermissionStatus> {
    return { granted: true, canAskAgain: true };
  }
}

export const permissionManager = new PermissionManager();
export default permissionManager;
