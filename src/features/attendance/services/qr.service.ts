export function validateStaticQR(scannedToken: string): { isValid: boolean; reason?: string } {
  const expectedToken = process.env.STATIC_QR_TOKEN
  
  if (!expectedToken) {
    console.error('STATIC_QR_TOKEN is not configured in environment variables')
    return { isValid: false, reason: 'Sistem error: STATIC_QR_TOKEN tidak disetting di server.' }
  }

  const cleanExpected = expectedToken.trim().replace(/^["']|["']$/g, '');
  const cleanScanned = scannedToken.trim().replace(/^["']|["']$/g, '');

  if (cleanScanned !== cleanExpected) {
    return { isValid: false, reason: `Isi QR Code (${cleanScanned}) tidak sama dengan token server.` }
  }

  return { isValid: true }
}
