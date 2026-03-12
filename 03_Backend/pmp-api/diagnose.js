
import fs from 'fs';

process.on('uncaughtException', (err) => {
    console.error('CRASH DETECTED (Exception):', err);
    fs.writeFileSync('crash.log', 'Uncaught Exception: ' + err.stack + '\n');
    process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
    console.error('CRASH DETECTED (Rejection):', reason);
    fs.writeFileSync('crash.log', 'Unhandled Rejection: ' + reason + '\n');
    process.exit(1);
});

console.log("Diagnostics: Starting server.js...");

try {
    await import("./server.js");
    console.log("Server module imported. Keeping process alive...");
    setInterval(() => { }, 10000); // Prevent exit
} catch (e) {
    console.error("Import Error:", e);
    fs.writeFileSync('crash.log', 'Import Error: ' + e.stack + '\n');
}
