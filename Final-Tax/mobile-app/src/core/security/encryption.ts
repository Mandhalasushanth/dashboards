export class EncryptionService {
  static maskSensitiveString(str: string, visibleStart = 2, visibleEnd = 4): string {
    if (!str || str.length <= visibleStart + visibleEnd) {
      return str;
    }
    const start = str.slice(0, visibleStart);
    const end = str.slice(-visibleEnd);
    const maskedLength = Math.max(0, str.length - (visibleStart + visibleEnd));
    return `${start}${"*".repeat(maskedLength)}${end}`;
  }

  static maskAadhaar(aadhaar: string): string {
    const clean = aadhaar.replace(/\s+/g, "");
    if (clean.length !== 12) return aadhaar;
    return `XXXX XXXX ${clean.slice(8)}`;
  }

  static maskPan(pan: string): string {
    if (pan.length !== 10) return pan;
    return `${pan.slice(0, 2)}XXXXXX${pan.slice(8)}`;
  }

  static maskPhone(phone: string): string {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) return phone;
    return `+91 ******${clean.slice(-4)}`;
  }
}

export default EncryptionService;
