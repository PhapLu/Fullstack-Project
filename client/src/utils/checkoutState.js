// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

const PASSPHRASE = "bm_checkout_secret_v1";
const SALT = "bm_checkout_salt_v1";

const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey() {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(PASSPHRASE),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(SALT),
      iterations: 120_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function toBase64Url(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptState(obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey();
  const plaintext = enc.encode(JSON.stringify(obj));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  // token = base64url(iv || ciphertext)
  const bundle = new Uint8Array(iv.byteLength + cipher.byteLength);
  bundle.set(iv, 0);
  bundle.set(new Uint8Array(cipher), iv.byteLength);
  return toBase64Url(bundle);
}

export async function decryptState(token) {
  const bundle = fromBase64Url(token);
  const iv = bundle.slice(0, 12);
  const ciphertext = bundle.slice(12);
  const key = await deriveKey();
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return JSON.parse(dec.decode(plain));
}

export function buildCheckoutPayload({
  items,
  currency = "USD",
  deliveryPerOrder = 2,
  discount = 0,
}) {
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
  const delivery = items.length ? deliveryPerOrder : 0;
  const total = Math.max(0, subtotal + delivery - discount);

  return {
    ts: Date.now(),
    currency,
    items,
    pricing: { subtotal, delivery, discount, total },
  };
}

export async function startCheckout(navigate, payload) {
  try {
    const token = await encryptState(payload);
    navigate(`/checkout?state=${encodeURIComponent(token)}`);
  } catch (e) {
    console.error("Failed to build checkout state", e);
    navigate("/checkout");
  }
}
