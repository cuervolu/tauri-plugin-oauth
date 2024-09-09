import { invoke } from '@tauri-apps/api/core';
import { Event, listen } from '@tauri-apps/api/event';

/**
 * Configuration options for the OAuth server.
 */
export interface OauthConfig {
  /**
   * An array of port numbers the server should try to bind to.
   * If not provided, the server will use a random available port.
   */
  ports?: number[];

  /**
   * Custom HTML response sent to the user after being redirected.
   * If not provided, a default response will be used.
   */
  response?: string;
}

/**
 * Starts the OAuth server.
 * @param config - Optional configuration for the server.
 * @returns A promise that resolves with the port number the server is listening on.
 * @example
 * ```typescript
 * import { oauth } from '@fabianlars/tauri-plugin-oauth';
 *
 * const port = await oauth.start({ ports: [8000, 8001] });
 * console.log(`OAuth server started on port ${port}`);
 * ```
 */
export async function start(config?: OauthConfig): Promise<number> {
  return await invoke<number>('plugin:oauth|start', { config });
}

/**
 * Stops the OAuth server running on the specified port.
 * @param port - The port number of the server to stop.
 * @returns A promise that resolves when the server has been stopped.
 * @example
 * ```typescript
 * import { oauth } from '@fabianlars/tauri-plugin-oauth';
 *
 * await oauth.cancel(8000);
 * console.log('OAuth server stopped');
 * ```
 */
export async function cancel(port: number): Promise<void> {
  await invoke<void>('plugin:oauth|cancel', { port });
}

/**
 * Listens for valid OAuth URLs.
 * @param callback - Function to be called when a valid URL is received.
 * @returns A promise that resolves with a function to remove the event listener.
 * @example
 * ```typescript
 * import { oauth } from '@fabianlars/tauri-plugin-oauth';
 *
 * const unlisten = await oauth.onUrl((url) => {
 *   console.log('Received OAuth URL:', url);
 *   // Process the OAuth URL...
 * });
 *
 * // Later, to stop listening:
 * unlisten();
 * ```
 */
export function onUrl(callback: (url: string) => void): Promise<() => void> {
  return listen('oauth://url', (event: Event<string>) => {
    callback(event.payload);
  });
}

/**
 * Listens for invalid OAuth URLs.
 * @param callback - Function to be called when an invalid URL is received.
 * @returns A promise that resolves with a function to remove the event listener.
 * @example
 * ```typescript
 * import { oauth } from '@fabianlars/tauri-plugin-oauth';
 *
 * const unlisten = await oauth.onInvalidUrl((error) => {
 *   console.error('Received invalid OAuth URL:', error);
 *   // Handle the error...
 * });
 *
 * // Later, to stop listening:
 * unlisten();
 * ```
 */
export function onInvalidUrl(callback: (error: string) => void): Promise<() => void> {
  return listen('oauth://invalid-url', (event: Event<string>) => {
    callback(event.payload);
  });
}

/**
 * Interface for the OAuth plugin functions.
 */
export interface OauthPlugin {
  start: typeof start;
  cancel: typeof cancel;
  onUrl: typeof onUrl;
  onInvalidUrl: typeof onInvalidUrl;
}

/**
 * The main OAuth plugin object containing all plugin functions.
 * @example
 * ```typescript
 * import { oauth } from '@fabianlars/tauri-plugin-oauth';
 *
 * async function initOAuth() {
 *   const port = await oauth.start({ ports: [8000, 8001] });
 *   console.log(`OAuth server started on port ${port}`);
 *
 *   oauth.onUrl((url) => {
 *     console.log('Received OAuth URL:', url);
 *     // Process the OAuth URL...
 *   });
 *
 *   oauth.onInvalidUrl((error) => {
 *     console.error('Received invalid OAuth URL:', error);
 *     // Handle the error...
 *   });
 *
 *   // Later, to stop the server:
 *   // await oauth.cancel(port);
 * }
 *
 * initOAuth();
 * ```
 */
export const oauth: OauthPlugin = {
  start,
  cancel,
  onUrl,
  onInvalidUrl,
};