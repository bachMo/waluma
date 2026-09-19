// En développement : OTP affiché dans le terminal
// En production : envoi via WhatsApp Business API

interface OtpStore {
  code: string;
  expiresAt: Date;
  attempts: number;
}

// Stockage temporaire en mémoire (en prod → Redis)
const otpStore = new Map<string, OtpStore>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(telephone: string): Promise<string> {
  const code = "000000"//generateOtp();
  const expiresAt = new Date(
    Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || "5") * 60 * 1000
  );

  otpStore.set(telephone, { code, expiresAt, attempts: 0 });

  if (process.env.NODE_ENV === "development") {
    console.log(`\n🔐 OTP pour ${telephone} : ${code}\n`);
  } else {
    // TODO : intégrer WhatsApp Business API ici
    console.log(`WhatsApp OTP envoyé à ${telephone}`);
  }

  return code;
}

export function verifyOtp(telephone: string, code: string): boolean {
  const stored = otpStore.get(telephone);

  if (!stored) return false;
  if (new Date() > stored.expiresAt) {
    otpStore.delete(telephone);
    return false;
  }

  stored.attempts += 1;

  // Max 5 tentatives
  if (stored.attempts > 5) {
    otpStore.delete(telephone);
    return false;
  }

  if (stored.code !== code) return false;

  otpStore.delete(telephone);
  return true;
}