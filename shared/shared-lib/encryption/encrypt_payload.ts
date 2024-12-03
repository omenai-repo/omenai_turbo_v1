// import forge from "node-forge"
import forge from "node-forge";

export function encryptPayload(encryptionKey: any, payload: any) {
  const text = JSON.stringify(payload);

  const key = forge.util.createBuffer(encryptionKey);

  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher("3DES-ECB", key);

  cipher.start({ iv: iv });

  cipher.update(forge.util.createBuffer(text, "utf8"));

  cipher.finish();

  const encrypted = cipher.output;

  return forge.util.encode64(encrypted.getBytes());
}
