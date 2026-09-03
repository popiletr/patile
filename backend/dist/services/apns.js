"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSilentPush = sendSilentPush;
async function sendSilentPush(token, popItem) {
    console.log(`\x1b[36m[APNs Service]\x1b[0m Sending content-available: 1 silent push to token: ${token.substring(0, 10)}...`);
    console.log(`\x1b[35m[APNs Payload]\x1b[0m Type: ${popItem.type}, Sender: ${popItem.senderName}`);
    // In production, connect to Apple APNs HTTP/2 endpoint:
    // POST https://api.push.apple.com/3/device/{device_token}
    // Headers: { 'apns-push-type': 'background', 'apns-priority': '5', 'apns-topic': 'com.bipop.app' }
    // Body: { "aps": { "content-available": 1 }, "pop_payload": JSON.stringify(popItem) }
    return true;
}
