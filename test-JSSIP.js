async function main() {
  const accessToken = '<YOUR_PERSONAL_ACCESS_TOKEN>';
  let session;
  try {
    session = await window.Siperb.Login(accessToken);
  } catch (error) {
    console.error('Failed to get session:', error);
    return;
  }

  // Assume you have a known DeviceToken or use GetDevices as in test.js
  // See admin control Panel for generating Script Devices (to get DeviceToken)
  const deviceToken = "<YOUR_KNOWN_DEVICE_TOKEN>";
  const provisioning = await window.Siperb.GetProvisioning({
    UserId: session.UserId,
    DeviceToken: deviceToken,
    SessionToken: session.SessionToken,
    EnableCache: true,
    ProvisioningKey: 'SiperbProvisioning'
  });

  // Build WebSocket server URL
  const wsServer = `wss://${provisioning.SipWssServer}:${provisioning.SipWebsocketPort}/${provisioning.SipServerPath}`;
  // Example JsSIP configuration using provisioning details
  const socket = new window.JsSIP.WebSocketInterface(wsServer);
  const configuration = {
    sockets: [socket],
    uri: `sip:${provisioning.SipUsername}@${provisioning.SipDomain}`,
    password: provisioning.SipPassword,
    contact_uri: `sip:${provisioning.ContactUserName}@${provisioning.SipDomain}`,
    // ...other JsSIP options as needed
  };

  console.log('JsSIP config:', configuration);

  // Start JsSIP UserAgent
  const ua = new window.JsSIP.UA(configuration);
  ua.start();
  console.log('JsSIP UA started.');

  // Example: Make an outbound call with custom headers
  const target = 'sip:*65@example.com'; // Replace with real destination
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
  // End of demonstration
}

window.addEventListener('load', () => {
  main();
});