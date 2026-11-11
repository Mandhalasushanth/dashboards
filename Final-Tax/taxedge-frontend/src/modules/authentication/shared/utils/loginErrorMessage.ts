/**
 * The message for a failed POST /auth/login. Only a real rejection (400, 401, 403) means wrong credentials;
 * anything else (backend down, wrong address in the proxy, server error) says so, so a correct password is
 * never reported as invalid.
 */
export async function loginErrorMessage(response: Response): Promise<string> {
  if (response.status === 400 || response.status === 401 || response.status === 403) {
    try {
      const body = (await response.json()) as { message?: unknown } | null;
      if (typeof body?.message === 'string' && body.message.trim()) return body.message;
    } catch {
      // No JSON body: use the default below.
    }
    return 'Invalid username or password';
  }
  return `The sign-in server could not be reached (HTTP ${response.status}). Check that the backend is running and the API address is correct, then try again.`;
}

/** fetch() itself failed: no network, or the dev server is not running. */
export const LOGIN_NETWORK_ERROR = 'Cannot connect to the server. Check your connection and that the app is running, then try again.';
