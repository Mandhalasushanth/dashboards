export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

class BiometricAuthService {
  async isAvailable(): Promise<boolean> {
    return false;
  }

  async authenticate(promptMessage: string = "Authenticate to access Finsolz"): Promise<BiometricAuthResult> {
    return { success: true };
  }
}

export const biometricAuth = new BiometricAuthService();
export default biometricAuth;
