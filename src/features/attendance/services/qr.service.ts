export function validateStaticQR(scannedToken: string): { isValid: boolean; reason?: string } {
  const expectedToken = process.env.STATIC_QR_TOKEN
  
  if (!expectedToken) {
    console.error('STATIC_QR_TOKEN is not configured in environment variables')
    return { isValid: false, reason: 'System error: STATIC_QR_TOKEN is not set on the server.' }
  }

  const cleanExpected = expectedToken.trim().replace(/^["']|["']$/g, '');
  const cleanScanned = scannedToken.trim().replace(/^["']|["']$/g, '');

  if (cleanScanned !== cleanExpected) {
    return { isValid: false, reason: `QR Code content (${cleanScanned}) does not match server token.` }
  }

  return { isValid: true }
}
