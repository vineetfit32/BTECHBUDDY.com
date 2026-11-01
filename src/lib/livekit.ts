import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  AccessToken,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  RoomServiceClient,
} from "livekit-server-sdk";
import { fileUrl, getStorage } from "@/lib/storage";

const MAX_VIEWERS = 500;

export function recordingsDir(): string {
  return process.env.RECORDINGS_DIR ?? path.join(process.cwd(), "storage", "recordings");
}

export function liveKitApiHost(): string {
  const raw = process.env.LIVEKIT_INTERNAL_URL || process.env.LIVEKIT_URL || "http://127.0.0.1:7880";
  return raw.replace(/^ws/, "http");
}

export function liveKitBrowserUrl(): string {
  const raw = process.env.LIVEKIT_URL || "ws://127.0.0.1:7880";
  return raw.replace(/^http/, "ws");
}

function credentials() {
  const apiKey = process.env.LIVEKIT_API_KEY || "btechbuddy";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "change-me-to-a-long-random-livekit-secret";
  return { apiKey, apiSecret };
}

export function recordingFileName(roomName: string): string {
  return `${roomName}.mp4`;
}

export function recordingKey(roomName: string): string {
  return `recordings/${recordingFileName(roomName)}`;
}

export async function ensureRoom(roomName: string): Promise<void> {
  const { apiKey, apiSecret } = credentials();
  const rooms = new RoomServiceClient(liveKitApiHost(), apiKey, apiSecret);
  try {
    await rooms.createRoom({
      name: roomName,
      emptyTimeout: 5 * 60,
      maxParticipants: MAX_VIEWERS,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already exists/i.test(message)) throw error;
  }
}

export async function mintRoomToken(input: {
  roomName: string;
  identity: string;
  name: string;
  host: boolean;
}): Promise<string> {
  const { apiKey, apiSecret } = credentials();
  const token = new AccessToken(apiKey, apiSecret, {
    identity: input.identity,
    name: input.name,
    ttl: "4h",
  });
  token.addGrant({
    roomJoin: true,
    room: input.roomName,
    canPublish: input.host,
    canSubscribe: true,
    canPublishData: input.host,
    roomAdmin: input.host,
  });
  return token.toJwt();
}

// Saves the tutor's published audio and video. Room-composite recording needs
// headless Chrome, which cannot finish its LiveKit socket from this container.
export async function startParticipantRecording(roomName: string, identity: string): Promise<string> {
  const { apiKey, apiSecret } = credentials();
  const egress = new EgressClient(liveKitApiHost(), apiKey, apiSecret);
  const info = await egress.startParticipantEgress(roomName, identity, {
    file: new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: `/out/${recordingFileName(roomName)}`,
    }),
  });
  if (!info.egressId) throw new Error("LiveKit did not return a recording id");
  return info.egressId;
}

export async function stopRoomRecording(egressId: string): Promise<void> {
  const { apiKey, apiSecret } = credentials();
  const egress = new EgressClient(liveKitApiHost(), apiKey, apiSecret);
  await egress.stopEgress(egressId);
}

/** Copies a finished recording into app storage when it is not already there. */
export async function publishRecording(roomName: string): Promise<string | null> {
  const diskPath = path.join(recordingsDir(), recordingFileName(roomName));
  const key = recordingKey(roomName);
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  let exists = false;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await access(diskPath);
      exists = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  if (!exists) return null;
  if (provider === "s3" || provider === "minio") {
    const body = await readFile(diskPath);
    const info = await stat(diskPath);
    const storage = await getStorage();
    await storage.put(key, body, "video/mp4", info.size);
  }
  return fileUrl(key);
}
