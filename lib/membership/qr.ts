import QRCode from "qrcode";

/** Server-side QR as a data URL for digital membership cards. */
export async function membershipQrDataUrl(verifyUrl: string): Promise<string> {
  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
  });
}
