import QRCode from "qrcode";
export class CredentialQrService {
  constructor(
    private readonly verifyBaseUrl = process.env.VERIFY_WEB_URL ??
      "http://localhost:5173/verify",
  ) {}
  async generate(credentialId: string) {
    const verificationUrl = `${this.verifyBaseUrl}?credentialId=${encodeURIComponent(credentialId)}`;
    return {
      verificationUrl,
      qrCodeDataUrl: await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 320,
      }),
    };
  }
}
