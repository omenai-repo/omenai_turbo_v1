import crypto from "node:crypto";
export function hashPayloadHMAC(
    payload: unknown,
    secret: string
): string {
    const json = JSON.stringify(payload);

    return crypto
        .createHmac("sha256", secret)
        .update(json)
        .digest("base64")
        .replace(/[/+=]/g, ""); // Clean for URLs, filenames, etc.
}

export function hashPayloadToken(
    payload: unknown,
    secret = process.env.SECRET_SALT
): string {
    if (!secret) {
        throw new Error(
            "Cannot perform operation"
        );
    }

    return hashPayloadHMAC(payload, secret);
}
