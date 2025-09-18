// Example: Using Siperb-Provisioning with JsSIP
// You must install JsSIP in your project for this test to work.
// npm install jssip

import Siperb from './dist/Siperb-Provisioning.esm.min.js';
import JsSIP from 'jssip';

async function main() {
  const accessToken = 'YOUR_ACCESS_TOKEN_HERE';
  let session;
  try {
    session = await Siperb.GetSession(accessToken);
  } catch (error) {
    console.error('Failed to get session:', error);
    return;
  }

  // Assume you have a known DeviceToken or use GetDevices as in test.js
  const deviceToken = 'YOUR_KNOWN_DEVICE_TOKEN';
  const provisioning = await Siperb.GetProvisioning({
    UserId: session.UserId,
    DeviceToken: deviceToken,
    SessionToken: session.SessionToken,
    EnableCache: true,
    ProvisioningKey: 'SiperbProvisioning'
  });

  // Example JsSIP configuration using provisioning details

  // Build WebSocket server URL
  const wsServer = `wss://${provisioning.wssServer}:443/ws/`;
  const socket = new JsSIP.WebSocketInterface(wsServer);
  const configuration = {
    sockets: [socket],
    uri: `sip:${provisioning.SipUsername}@${provisioning.SipDomain}`,
    password: provisioning.SipPassword,
    contact_uri: `sip:${provisioning.ContactUserName}@${provisioning.SipDomain}`,
    // ...other JsSIP options as needed
  };

  console.log('JsSIP config:', configuration);

  // Start JsSIP UserAgent
  const ua = new JsSIP.UA(configuration);
  ua.start();
  console.log('JsSIP UA started.');

  // Example: Make an outbound call with custom headers
  const target = 'sip:destination@example.com'; // Replace with real destination
  const eventHandlers = {};
  const options = {
    extraHeaders: [
      `X-Siperb-Sid: ${session.SessionToken}`,
      `X-Siperb-Uid: ${session.UserId}`
    ]
    // ...other call options as needed
  };
  ua.call(target, options);
  console.log('Outbound call initiated with custom headers.');
}

main();
