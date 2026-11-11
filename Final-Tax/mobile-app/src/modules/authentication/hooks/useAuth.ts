import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const {
    isLoggedIn,
    mobileNumber,
    customer,
    setMobileNumber,
    loginWithPasscode,
    login,
    register,
    setAvatar,
    logout,
  } = useAuthStore();

  return {
    isLoggedIn,
    mobileNumber,
    customer,
    setMobileNumber,
    loginWithPasscode,
    login,
    register,
    setAvatar,
    logout,
  };
}

export default useAuth;
