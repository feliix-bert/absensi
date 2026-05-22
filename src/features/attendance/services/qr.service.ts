export function validateStaticQR(scannedToken: string): boolean {
  const expectedToken = process.env.STATIC_QR_TOKEN
  
  if (!expectedToken) {
    console.error('STATIC_QR_TOKEN is not configured in environment variables')
    return false
  }

  const cleanExpected = expectedToken.trim().replace(/^["']|["']$/g, '');
  const cleanScanned = scannedToken.trim().replace(/^["']|["']$/g, '');

  return cleanScanned === cleanExpected
}
