/**
 * A minimal STOMP 1.2 client over React Native's WebSocket: just enough for the backend chat
 * (CONNECT with the access token, SUBSCRIBE to the user queues, SEND to /app/chat.send).
 */
export interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

export interface StompConnection {
  subscribe: (destination: string, onFrame: (frame: StompFrame) => void) => void;
  send: (destination: string, body: unknown) => void;
  isOpen: () => boolean;
  close: () => void;
}

const NUL = "\u0000";
const CONNECT_TIMEOUT_MS = 10_000;

function encode(command: string, headers: Record<string, string>, body = ""): string {
  const lines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${lines.join("\n")}\n\n${body}${NUL}`;
}

function decode(text: string): StompFrame | null {
  const trimmed = text.replace(/^\n+/, "");
  if (!trimmed) return null;
  const split = trimmed.indexOf("\n\n");
  const head = split === -1 ? trimmed : trimmed.slice(0, split);
  const body = split === -1 ? "" : trimmed.slice(split + 2);
  const [command = "", ...headerLines] = head.split("\n");
  const headers: Record<string, string> = {};
  for (const line of headerLines) {
    const colon = line.indexOf(":");
    if (colon > 0 && !(line.slice(0, colon) in headers)) {
      headers[line.slice(0, colon)] = line.slice(colon + 1);
    }
  }
  return { command: command.trim(), headers, body };
}

/** Opens a connection; resolves once the server answers CONNECTED, rejects on ERROR, close or timeout. */
export function connectStomp(url: string, token: string): Promise<StompConnection> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, ["v12.stomp"]);
    const handlers = new Map<string, (frame: StompFrame) => void>();
    let connected = false;
    let counter = 0;

    const timer = setTimeout(() => {
      socket.close();
      reject(new Error("The chat server did not respond."));
    }, CONNECT_TIMEOUT_MS);

    const connection: StompConnection = {
      subscribe(destination, onFrame) {
        const id = `sub-${counter++}`;
        handlers.set(id, onFrame);
        socket.send(encode("SUBSCRIBE", { id, destination }));
      },
      send(destination, body) {
        socket.send(encode("SEND", { destination, "content-type": "application/json" }, JSON.stringify(body)));
      },
      isOpen: () => socket.readyState === WebSocket.OPEN,
      close: () => socket.close(),
    };

    socket.onopen = () => {
      socket.send(encode("CONNECT", { "accept-version": "1.2", "heart-beat": "0,0", Authorization: `Bearer ${token}` }));
    };
    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      for (const part of event.data.split(NUL)) {
        const frame = decode(part);
        if (!frame) continue;
        if (frame.command === "CONNECTED") {
          connected = true;
          clearTimeout(timer);
          resolve(connection);
        } else if (frame.command === "ERROR" && !connected) {
          clearTimeout(timer);
          reject(new Error(frame.headers.message || "The chat server rejected the connection."));
        } else if (frame.command === "MESSAGE") {
          handlers.get(frame.headers.subscription ?? "")?.(frame);
        }
      }
    };
    socket.onclose = () => {
      clearTimeout(timer);
      if (!connected) reject(new Error("Could not reach the chat server."));
    };
    socket.onerror = () => {
      // onclose follows and settles the promise.
    };
  });
}
