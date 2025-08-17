
# Siperb-Provisioning JavaScript Library

## Overview

Siperb-Provisioning is a JavaScript library for securely retrieving user session, device, and provisioning information from the Siperb API. It is designed for use in both browser and module environments, supporting modern workflows and caching for performance.

## Typical Usage Sequence


1. **GetSession**: Authenticate with your access token to obtain a session token and user ID.
2. **GetDevices** (optional): Retrieve the list of devices associated with the user (optionally using caching). This step is not essential if you already have your DeviceToken (e.g., from the Admin Control Panel).
3. **GetProvisioning**: Fetch provisioning details for a specific device, including SIP credentials and settings (optionally using caching). You can call this directly after GetSession if you know your DeviceToken.

**Note:** If you already have your DeviceToken (for example, from the Siperb Admin Control Panel), you can skip GetDevices and call GetProvisioning immediately after GetSession. This is useful for automated scripts or when provisioning a known device.

This sequence allows a user to securely obtain all information needed to configure a SIP client or device.

## API Reference

### Siperb.GetSession(accessToken)
**Parameters:**
- `accessToken` (string): Your Siperb access token (from OAuth or other authentication).

**Returns:**
- `Promise<Object>`: Resolves with a session object containing at least `SessionToken` and `UserId`.

**Side Effects:**
 Sets `window.SiperbAPI.SESSION_TOKEN` and `window.SiperbAPI.USER_ID` in the browser.

**Errors:**
- Rejects the promise if authentication fails or the API is unreachable.

**Example:**
```js
const session = await Siperb.GetSession('YOUR_ACCESS_TOKEN');
console.log(session.SessionToken, session.UserId);
```

### Siperb.GetDevices(options)
**Parameters:**
- `options` (object):
	- `UserId` (string): The user ID (from GetSession)
	- `SessionToken` (string): The session token (from GetSession)
	- `EnableCache` (boolean, optional): Whether to use localStorage caching
	- `SessionKey` (string, optional): The cache key for devices

**Returns:**
- `Promise<Object|Array>`: Resolves with the user's devices (array or object, depending on API).

**Side Effects:**
 Sets `window.SiperbAPI.DEVICES` in the browser.

**Errors:**
- Always resolves; returns `null` or empty array on error or forbidden.

**Example:**
```js
const devices = await Siperb.GetDevices({
	UserId: session.UserId,
	SessionToken: session.SessionToken,
	EnableCache: true,
	SessionKey: 'SiperbDevices'
});
console.log(devices);
```

### Siperb.GetProvisioning(options)
**Parameters:**
- `options` (object):
	- `UserId` (string): The user ID (from GetSession)
	- `DeviceToken` (string): The device token (from a device in GetDevices)
	- `SessionToken` (string): The session token (from GetSession)
	- `EnableCache` (boolean, optional): Whether to use localStorage caching
	- `ProvisioningKey` (string, optional): The cache key for provisioning

**Returns:**
- `Promise<Object>`: Resolves with provisioning details, including SIP username, password, and settings.

**Side Effects:**
 Sets `window.SiperbAPI.PROVISIONING` in the browser.

**Errors:**
- Always resolves; returns `null` on error or forbidden.

**Example:**
```js
const provisioning = await Siperb.GetProvisioning({
	UserId: session.UserId,
	DeviceToken: device.DeviceToken,
	SessionToken: session.SessionToken,
	EnableCache: true,
	ProvisioningKey: 'SiperbProvisioning'
});
console.log(provisioning.SIPUsername, provisioning.SIPPassword);
```

## Full Example: End-to-End Usage

```js
import Siperb from './Siperb-Provisioning.esm.js';

async function main() {
	// 1. Authenticate and get session
	let session;
	try {
		session = await Siperb.GetSession('YOUR_ACCESS_TOKEN');
		console.log('Session:', session);
	} catch (error) {
		console.error('Failed to get session:', error);
		return;
	}

	// 2. Get devices
	const devices = await Siperb.GetDevices({
		UserId: session.UserId,
		SessionToken: session.SessionToken,
		EnableCache: true,
		SessionKey: 'SiperbDevices'
	});
	console.log('Devices:', devices);

	// 3. Get provisioning for the first device
	if (devices && devices.length > 0) {
		const provisioning = await Siperb.GetProvisioning({
			UserId: session.UserId,
			DeviceToken: devices[0].DeviceToken,
			SessionToken: session.SessionToken,
			EnableCache: true,
			ProvisioningKey: 'SiperbProvisioning'
		});
		console.log('Provisioning:', provisioning);
		// Example: Use SIP credentials
		console.log('SIP Username:', provisioning.SIPUsername);
		console.log('SIP Password:', provisioning.SIPPassword);
	} else {
		console.log('No devices found for provisioning.');
	}
}

main();
```


## Why Use This Library?

## SIP.js and JsSIP Integration Examples

### SIP.js Example

Install SIP.js:
```sh
npm install sip.js
```

```js
import Siperb from './Siperb-Provisioning.esm.js';
import { UserAgent } from 'sip.js';

async function main() {
	// ...get session and provisioning as shown above...

	// Build WebSocket server URL
	const wsServer = `wss://${provisioning.wssServer}:443/ws/`;
	const sipConfig = {
		uri: `sip:${provisioning.SipUsername}@${provisioning.SipDomain}`,
		authorizationUsername: provisioning.SipUsername,
		authorizationPassword: provisioning.SipPassword,
		contactName: provisioning.ContactUserName,
		transportOptions: {
			server: wsServer
		}
	};
	const userAgent = new UserAgent(sipConfig);
	userAgent.start(); // Registers with the SIP server

	// Outbound call with custom headers
	const target = 'sip:destination@example.com';
	const inviter = userAgent.invite(target, {
		requestDelegate: {},
		requestOptions: {
			extraHeaders: [
				`X-Siperb-Sid: ${session.SessionToken}`,
				`X-Siperb-Uid: ${session.UserId}`
			]
		}
	});
}
```

### JsSIP Example

Install JsSIP:
```sh
npm install jssip
```

```js
import Siperb from './Siperb-Provisioning.esm.js';
import JsSIP from 'jssip';

async function main() {
	// ...get session and provisioning as shown above...

	// Build WebSocket server URL
	const wsServer = `wss://${provisioning.wssServer}:443/ws/`;
	const socket = new JsSIP.WebSocketInterface(wsServer);
	const configuration = {
		sockets: [socket],
		uri: `sip:${provisioning.SipUsername}@${provisioning.SipDomain}`,
		password: provisioning.SipPassword,
		contact_uri: `sip:${provisioning.ContactUserName}@${provisioning.SipDomain}`
	};
	const ua = new JsSIP.UA(configuration);
	ua.start(); // Registers with the SIP server

	// Outbound call with custom headers
	const target = 'sip:destination@example.com';
	const options = {
		extraHeaders: [
			`X-Siperb-Sid: ${session.SessionToken}`,
			`X-Siperb-Uid: ${session.UserId}`
		]
	};
	ua.call(target, options);
}
```

These examples show how to:
- Register with the SIP server using provisioned credentials
- Always use a static contact (ContactUserName)
- Make outbound calls with custom headers for session and user identification

- **Security**: Handles authentication and session management securely.
- **Convenience**: Provides a simple, promise-based API for all provisioning steps.
- **Caching**: Optional localStorage caching for performance and offline support.
- **Browser & Module Support**: Works in both browser and modern JS module environments.
- **Extensible**: Easily add more API calls or extend caching logic as needed.

## Notes
- Always keep your access tokens secure and never expose them in client-side code unless you trust the environment.
- The provisioning object may contain sensitive SIP credentials—handle with care.

## License
See LICENSE file.
# Siperb-Provisioning
This project show how to Provision a Siperb Device and load Browser Phone, SIP.js JsSIP.js or your own custom Web-based SIP client.

## Usage


### In the Browser
Include the minified bundle from the CDN in your HTML:

```html
<script src="https://cdn.siperb.com/lib/Siperb-Provisioning/Siperb-Provisioning.min.js"></script>
<script>
	// Now you can use window.SiperbAPI.GetSession()
	SiperbAPI.GetSession();
</script>
```

### As a Module (ESM/CommonJS)

```js
// ESM
import Siperb from './Siperb-Provisioning.esm.js';
Siperb.GetSession();

// CommonJS (if you bundle for Node.js)
// const Siperb = require('./Siperb-Provisioning.umd.js');
// Siperb.GetSession();
```

## Building, Running, and Compiling the Library

First, install dependencies:

```sh
npm install
```

### Build the Library

```sh
npm run build
```

### Watch for Changes (Auto-compile)

```sh
npm run watch
```

### Build and Show Completion Message

```sh
npm start
```

This will create:
- `Siperb-Provisioning.umd.js` (UMD for browser and Node.js)
- `Siperb-Provisioning.min.js` (minified UMD for browser)
- `Siperb-Provisioning.esm.js` (ES module)
