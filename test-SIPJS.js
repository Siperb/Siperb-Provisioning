// Example: Using Siperb-Provisioning with SIP.js
// You must install SIP.js in your project for this test to work.
// npm install sip.js

import Siperb from './Siperb-Provisioning.esm.js';
import { UserAgent } from 'sip.js';

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

  // Example SIP.js configuration using provisioning details

  // Build WebSocket server URL
  const wsServer = `wss://${provisioning.wssServer}:443/ws/`;

  const sipConfig = {
    uri: `sip:${provisioning.SipUsername}@${provisioning.SipDomain}`,
    authorizationUsername: provisioning.SipUsername,
    authorizationPassword: provisioning.SipPassword,
    contactName: provisioning.ContactUserName, // Static contact
    transportOptions: {
      server: wsServer
    }
    // ...other SIP.js options as needed
  };

  console.log('SIP.js config:', sipConfig);

  // Start SIP.js UserAgent
  const userAgent = new UserAgent(sipConfig);
  userAgent.start();
  console.log('SIP.js UserAgent started.');

  // Example: Make an outbound call with custom headers
  const target = 'sip:destination@example.com'; // Replace with real destination
  const inviter = userAgent.invite(target, {
    requestDelegate: {},
    requestOptions: {
      extraHeaders: [
        `X-Siperb-Sid: ${session.SessionToken}`,
        `X-Siperb-Uid: ${session.UserId}`
      ]
    }
  });
  console.log('Outbound call initiated with custom headers.');
}

main();
