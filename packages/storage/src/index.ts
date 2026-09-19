import { createHash } from "node:crypto";
export interface StorageAdapter {
  upload(content: string | Uint8Array, name: string): Promise<{ cid: string }>;
  retrieve(cid: string): Promise<Uint8Array>;
  remove(cid: string): Promise<void>;
}
export class LocalStorageAdapter implements StorageAdapter {
  private readonly items = new Map<string, Uint8Array>();
  async upload(content: string | Uint8Array): Promise<{ cid: string }> {
    const bytes =
      typeof content === "string" ? new TextEncoder().encode(content) : content;
    const cid = createHash("sha256").update(bytes).digest("hex");
    this.items.set(cid, bytes);
    return { cid };
  }
  async retrieve(cid: string) {
    const value = this.items.get(cid);
    if (!value) throw new Error("Stored object not found");
    return value;
  }
  async remove(cid: string) {
    this.items.delete(cid);
  }
}
export class PinataStorageAdapter implements StorageAdapter {
  constructor(private readonly jwt: string) {}
  async upload(content: string | Uint8Array, name: string) {
    const body = new FormData();
    body.append("file", new Blob([Buffer.from(content)]), name);
    const response = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.jwt}` },
      body,
    });
    if (!response.ok)
      throw new Error(`Pinata upload failed: ${response.status}`);
    const json = (await response.json()) as { data: { cid: string } };
    return { cid: json.data.cid };
  }
  async retrieve(cid: string) {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!response.ok) throw new Error("Pinata retrieval failed");
    return new Uint8Array(await response.arrayBuffer());
  }
  async remove(): Promise<void> {
    throw new Error(
      "Pinata deletion is intentionally disabled for immutable credential artifacts",
    );
  }
}
