import { invoke } from "@tauri-apps/api/core";
import { oauth } from "@fabianlars/tauri-plugin-oauth";

let resultEl: HTMLElement | null;
let currentPort: number | null = null;
let isRustServer = false;

async function stopCurrentServer() {
    if (currentPort !== null) {
        try {
            if (isRustServer) {
                await invoke("stop_server", { port: currentPort });
            } else {
                await oauth.cancel(currentPort);
            }
            console.log(`Stopped server on port ${currentPort}`);
        } catch (error) {
            console.error(`Error stopping server: ${error}`);
        }
        currentPort = null;
    }
}

async function startServerRust() {
    if (resultEl) {
        await stopCurrentServer();
        try {
            const port = await invoke<number>("start_server");
            currentPort = port;
            isRustServer = true;
            resultEl.textContent = `OAuth server started on port ${port} (Rust)`;
        } catch (error) {
            resultEl.textContent = `Error starting OAuth server (Rust): ${error}`;
        }
    }
}

async function startServerTS() {
    if (resultEl) {
        await stopCurrentServer();
        try {
            const port = await oauth.start();
            currentPort = port;
            isRustServer = false;
            resultEl.textContent = `OAuth server started on port ${port} (TypeScript)`;

            const unlistenUrl = await oauth.onUrl((url) => {
                console.log('Received OAuth URL:', url);
                resultEl!.textContent += `\nReceived OAuth URL: ${url}`;
            });

            const unlistenInvalidUrl = await oauth.onInvalidUrl((error) => {
                console.error('Received invalid OAuth URL:', error);
                resultEl!.textContent += `\nReceived invalid OAuth URL: ${error}`;
            });

            // Store unlisten functions to call them when stopping the server
            (window as any).unlistenFunctions = [unlistenUrl, unlistenInvalidUrl];
        } catch (error) {
            resultEl.textContent = `Error starting OAuth server (TypeScript): ${error}`;
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    resultEl = document.querySelector("#result");
    document.querySelector("#start-rust")?.addEventListener("click", startServerRust);
    document.querySelector("#start-ts")?.addEventListener("click", startServerTS);
});