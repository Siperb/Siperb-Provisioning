![Siperb](https://cdn.siperb.com/images/SIPERB-Logo-onlight.webp)

# SIPERB Provisioning

Open‑source Browser Phone / Web Phone SDK for WebRTC and VoIP — securely provision SIP sessions, devices, and credentials for SIP.js, JsSIP, and custom softphones.

[![License](https://img.shields.io/github/license/Siperb/Siperb-Provisioning?color=4c1)](https://github.com/Siperb/Siperb-Provisioning/blob/main/LICENSE)
![Module formats](https://img.shields.io/badge/module-ESM%20%2B%20UMD-4c1)
![Minified](https://img.shields.io/badge/minified-yes-4c1)
[![CDN](https://img.shields.io/badge/CDN-available-blue)](#in-the-browser)
![Node](https://img.shields.io/badge/Node-%3E%3D%2016-3178c6)

## Contents

- Overview
- Features
- Who is this for?
- Quick Start
	- In the Browser (global)
	- As a Module (ESM)
- Typical Usage Sequence
- API Reference
- Full Example
- SIP.js and JsSIP Integration
- Testing locally
- Troubleshooting & FAQ
- Notes
- License

## Overview

Siperb‑Provisioning is a lightweight JavaScript SDK that powers open‑source Web Phone / Browser Phone applications. It securely retrieves user session, devices, and SIP provisioning (username, password, domain, WSS/WebSocket) from the Siperb API so you can bootstrap a WebRTC softphone in minutes. Use it to initialize SIP.js, JsSIP, or your own VoIP client with consistent, secure provisioning flows — in both browser and module environments, with optional caching for performance.

## Features

- Modern dual build: ESM and UMD (minified)
- Works in both browser (global `window.SiperbAPI`) and module projects
- Simple promise-based API: Login → Devices → Provisioning
- Optional caching with localStorage
- Battle-tested examples with SIP.js and JsSIP
- CDN-ready for quick prototypes and demos

## Who is this for?

- Teams building an open‑source Browser Phone or embedded Web Phone in SaaS/CRM
- Developers integrating a WebRTC softphone (VoIP) using SIP.js or JsSIP
- Contact centers and PWAs that need secure SIP provisioning over WSS
- Anyone who wants a simple SDK to automate device provisioning and login flows
- Projects migrating desk phone provisioning into a modern, browser‑based softphone

## Quick Start

### In the Browser
Include the minified bundle from the CDN in your HTML:

```html
<script src="https://cdn.siperb.com/lib/Siperb-Provisioning/Siperb-Provisioning-0.0.8.umd.min.js"></script>
<script>
	// Now you can use window.SiperbAPI
	SiperbAPI.Login('YOUR_ACCESS_TOKEN').then(session => {
		console.log('Session:', session);
	});
	// Or: await SiperbAPI.Login(...) inside an async IIFE
</script>
```

### As a Module (ESM)

```js
import Siperb from './dist/Siperb-Provisioning.esm.min.js';

const session = await Siperb.Login('YOUR_ACCESS_TOKEN');
console.log(session.SessionToken, session.UserId);
```

## Typical Usage Sequence

1. **Login**: Authenticate with your access token to obtain a session token and user ID.
2. **GetDevices** (optional): Retrieve the list of devices associated with the user (optionally using caching). This step is not essential if you already have your DeviceToken (e.g., from the Admin Control Panel).
3. **GetProvisioning**: Fetch provisioning details for a specific device, including SIP credentials and settings (optionally using caching). You can call this directly after ```Login``` if you know your DeviceToken.

**Note:** If you already have your DeviceToken (for example, from the Siperb Admin Control Panel), you can skip GetDevices and call GetProvisioning immediately after ```Login```. This is useful for automated scripts or when provisioning a known device.

This sequence allows a user to securely obtain all information needed to configure a SIP client or device.

## API Reference

### Siperb.Login(pat)
**Parameters:**
- `pat` (string): Your Siperb Personal Access Token (PAT) (from Admin Control Panel).

**Returns:**
- `Promise<Object>`: Resolves with a session object containing at least `SessionToken` and `UserId`.

**Side Effects:**
 Sets `window.SiperbAPI.SESSION_TOKEN` and `window.SiperbAPI.USER_ID` in the browser.

**Errors:**
- Rejects the promise if authentication fails or the API is unreachable.

**Example:**
```js
const session = await Siperb.Login('YOUR_ACCESS_TOKEN');
console.log(session.SessionToken, session.UserId);
```

### Siperb.GetDevices(options)
**Parameters:**
- `options` (object):
	- `UserId` (string): The user ID (from ```Login```)
	- `SessionToken` (string): The session token (from ```Login```)
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
	- `UserId` (string): The user ID (from ```Login```)
	- `DeviceToken` (string): The device token (from a device in GetDevices)
	- `SessionToken` (string): The session token (from ```Login```)
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
console.log(provisioning.SipUsername, provisioning.SipPassword);
```

## Full Example: End-to-End Usage

```js
import Siperb from './dist/Siperb-Provisioning.esm.min.js';

async function main() {
	// 1. Authenticate and get session
	let session;
	try {
		session = await Siperb.Login('YOUR_ACCESS_TOKEN');
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
		console.log('SIP Username:', provisioning.SipUsername);
		console.log('SIP Password:', provisioning.SipPassword);
	} else {
		console.log('No devices found for provisioning.');
	}
}

main();
```


## Why Use This Library?

## SIP.js and JsSIP Integration Examples

### SIP.js Example (Module projects)

Install SIP.js:
```sh
npm install sip.js
```

```js
import Siperb from './dist/Siperb-Provisioning.esm.min.js';
import { UserAgent } from 'sip.js';

async function main() {
	// ...get session and provisioning as shown above...

	// Build WebSocket server URL
	const wsServer = `wss://${provisioning.SipWssServer}:${provisioning.SipWebsocketPort}/${provisioning.SipServerPath}`;
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

### JsSIP Example (Browser friendly)

Install JsSIP:
```sh
npm install jssip
```

```js
import Siperb from './dist/Siperb-Provisioning.esm.min.js';
import JsSIP from 'jssip';

async function main() {
	// ...get session and provisioning as shown above...

	// Build WebSocket server URL
	const wsServer = `wss://${provisioning.SipWssServer}:${provisioning.SipWebsocketPort}/${provisioning.SipServerPath}`;
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


# Full Browser Phone Example

This repository includes a fully usable, IFRAME‑based Browser Phone that you can embed into any web app. It follows the same secure flow described above: Login → (optional) GetDevices → GetProvisioning → Initialize Phone. The UI, logic, and media assets are loaded on demand from the Siperb CDN and initialized inside your own IFRAME.

![Siperb Browser Phone – Web Phone UI](./screenshots/test-Browser-Phone.png)


Why an IFRAME?
- The phone UI ships with its own HTML, CSS, and JS. Loading it in an IFRAME isolates styles and scripts from your app and ensures responsive behavior across screen sizes.
- The smallest supported footprint is ~320×320 px; 400×640 (or larger) is recommended. Fullscreen is supported.

How it works (high level)
1) Authenticate with your Personal Access Token (PAT) to obtain a SessionToken and UserId.
2) Obtain provisioning for a specific DeviceToken (from Admin Control Panel → Script device).
3) Create an IFRAME (src="about:blank") and call `SiperbAPI.LoadBrowserPhone(frame)` to load the UI from CDN.
4) Call `SiperbAPI.ProvisionPhone(...)` with your provisioning + session to configure SIP and bring the phone online.


```html
<!-- 1) Include the UMD build so window.SiperbAPI is available -->
<script src="./dist/Siperb-Provisioning.umd.min.js"></script>

<!-- 2) Add a container IFRAME (recommended ~400x640 or larger) -->
<iframe id="phoneFrame" src="about:blank" style="width:400px;height:640px;border:1px solid #000;border-radius:6px;"></iframe>

<script>
	(async () => {
		// 3) Login to get SessionToken and UserId
		const pat = 'YOUR_ACCESS_TOKEN';
		const session = await window.SiperbAPI.Login(pat);

		// 4) Get provisioning for your Script Device (DeviceToken from Admin Control Panel)
		const deviceToken = 'YOUR_DEVICE_TOKEN';
		const provisioning = await window.SiperbAPI.GetProvisioning({
			UserId: session.UserId,
			DeviceToken: deviceToken,
			SessionToken: session.SessionToken,
			EnableCache: true,
			ProvisioningKey: 'SiperbProvisioning'
		});

		// 5) Load the Browser Phone UI into the IFRAME
		const phoneFrame = document.getElementById('phoneFrame');
		await window.SiperbAPI.LoadBrowserPhone(phoneFrame);

		// 6) Provision and bring the phone online
		const phoneAPI = await window.SiperbAPI.ProvisionPhone({
			Provisioning: provisioning,
			PhoneFrame: phoneFrame,
			ProfileUserId: deviceToken,      // Typically the DeviceToken
			SessionId: session.SessionToken,  // Used for custom SIP headers
			UserId: session.UserId,
		});

	})();
</script>
```

Under the hood
- `LoadBrowserPhone(iframe)` fetches a version tree and loads the phone’s HTML, CSS, and JS from the Siperb CDN into the IFRAME’s document.
- `ProvisionPhone(options)` wires up storage, media, UI, and the SIP provider using your provisioning:
	- WSS endpoint: `SipWssServer` + `SipWebsocketPort` + `SipServerPath`
	- SIP auth: `SipUsername` / `SipPassword` / `SipDomain`
	- Static contact: `SipContact` (ContactUserName)
	- Custom headers: `X-Siperb-Sid`, `X-Siperb-Uid` for call requests

Requirements & notes
- Requires Internet access to the Siperb CDN; offline is not supported for the Browser Phone (use Desktop Phone for offline scenarios).
- If your environment uses strict egress controls, whitelist the Siperb CDN domains.
- The IFRAME must be dedicated to the phone (don’t attempt to inject the phone UI into a DIV on your page).



## Building, Running, and Compiling the Library

First, install dependencies:

```sh
npm install
```

### Build the Library

```sh
npm run build
```

### Build and Show Completion Message


```sh
npm start           # builds and opens test-index.html
npm run start:sipjs # builds and opens test-SIPJS.html
npm run start:jssip # builds and opens test-JSSIP.html
npm run start:phone # builds and opens test-Browser-Phone.html
```

---