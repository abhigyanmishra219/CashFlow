const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Helper to convert an ArrayBuffer or Uint8Array to a Base64URL string
function base64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Helper to convert a Base64URL string to an ArrayBuffer
function base64urlDecode(str: string): ArrayBuffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Signs a JWT payload using HS256 algorithm and a secret key.
 * @param payload The data to encode in the token.
 * @param secret The secret string key.
 * @param expiresInSeconds Duration in seconds for token validity (defaults to 1 hour).
 * @returns A promise that resolves to the signed JWT string.
 */
export async function signJWT(
  payload: Record<string, any>,
  secret?: string,
  expiresInSeconds: number = 3600 * 24
): Promise<string> {
  const finalSecret = secret || process.env.JWT_SECRET || "default_coachflow_jwt_secret_key_2026";
  const header = { alg: "HS256", typ: "JWT" };
  
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  
  const encodedHeader = base64url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64url(encoder.encode(JSON.stringify(fullPayload)));
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(finalSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  return `${encodedHeader}.${encodedPayload}.${base64url(signature)}`;
}

/**
 * Verifies and decodes an HS256-signed JWT token.
 * @param token The JWT string to verify.
 * @param secret The secret key used for signing.
 * @returns The decoded payload if valid and not expired; null otherwise.
 */
export async function verifyJWT(
  token: string,
  secret?: string
): Promise<Record<string, any> | null> {
  const finalSecret = secret || process.env.JWT_SECRET || "default_coachflow_jwt_secret_key_2026";
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(finalSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signature = base64urlDecode(encodedSignature);
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      data
    );
    
    if (!isValid) {
      return null;
    }
    
    const decodedPayload = JSON.parse(
      decoder.decode(base64urlDecode(encodedPayload))
    );
    
    // Check expiration claim
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null; // Token expired
    }
    
    return decodedPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
