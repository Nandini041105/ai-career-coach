import fs from 'fs';
import path from 'path';

const url = 'exp://10.178.125.122:8081';
const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(url)}`;

async function downloadQR() {
  console.log(`[QR] Generating QR code for Expo Go URL: ${url}`);
  try {
    const res = await fetch(qrApi);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    const dest1 = path.resolve('expo_qr.png');
    fs.writeFileSync(dest1, buffer);
    console.log(`[QR] Saved to: ${dest1}`);

    const brainDir = 'C:\\Users\\guess\\.gemini\\antigravity-ide\\brain\\a958735d-282a-454d-a6a4-4839ee6b624b';
    if (fs.existsSync(brainDir)) {
      const dest2 = path.join(brainDir, 'expo_qr.png');
      fs.writeFileSync(dest2, buffer);
      console.log(`[QR] Saved to artifact dir: ${dest2}`);
    }
  } catch (err) {
    console.error('[QR] Failed to download QR:', err.message);
  }
}

downloadQR();
