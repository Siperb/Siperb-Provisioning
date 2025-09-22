// -----------------------------------------------
//  Copyright © - SIPERB LTD - All Rights Reserved
// ===============================================
// File: Siperb-Provisioning.js
// Date: August 2025
// Git: https://github.com/Siperb

// Define the Siperb namespace object
const Siperb = {
    /**
     * Login - fetches your session token using you access token.
     * @param {string} pat - Your Personal Access Token (PAT) generated from the Admin Control Panel
     * @returns {Promise<Object>} - resolves with session object
     */
    Login(pat){
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`https://api.siperb.com/Login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${pat}`
                    }
                });
                if (response.ok) {
                    try{
                        const data = await response.json();
                        console.log(`Login: %cSession retrieved successfully`, "color: green;");

                        if(typeof window !== 'undefined'){
                            window.SiperbAPI = window.SiperbAPI || {};
                            window.SiperbAPI.SESSION_TOKEN = data.SessionToken;
                            window.SiperbAPI.USER_ID = data.UserId;
                        }
                        return resolve(data);
                    }
                    catch (error) {
                        console.log(`Login: %cError occurred while parsing response: ${error.message}`, "color: red;");
                        return reject(error.message);
                    }
                }
                else {
                    console.log(`Login: %cFailed to retrieve session`, "color: red;");
                    return reject(response.statusText || 'Failed to retrieve session');
                }
            }
            catch (error) {
                console.log(`Login: %cError occurred: ${error.message}`, "color: red;");
                return reject(error.message);
            }
        });
    },
    /**
     * GetDevices - fetches session data and sets window.Siperb.SESSION
     * @param {Object} options - options for session retrieval
     * @returns {Promise<Object>} - resolves with session object
     */
    GetDevices(options) {
        return new Promise(async function (resolve, reject) {
            let isResolved = false;
            // Check if the session is already in localStorage
            if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                if(typeof options.SessionKey === "string" && options.SessionKey != ""){
                    // Use the sessionKey from options or default to 'SiperbSession'
                    console.log(`GetSession: %cUsing SessionKey: ${options.SessionKey}`, "color: blue;");
                    if(typeof window !== 'undefined' && typeof window.localStorage !== "undefined"){
                        let cachedSession = localStorage.getItem(options.SessionKey);
                        if (cachedSession) {
                            // Parse the JSON string to an object
                            try {
                                cachedSession = JSON.parse(cachedSession);
                                if (typeof window !== 'undefined') {
                                    window.SiperbAPI = window.SiperbAPI || {};
                                    window.SiperbAPI.SESSION = cachedSession;
                                }
                                // Resolve but don't return.
                                resolve(cachedSession);
                                isResolved = true;
                                console.log(`GetSession: %cUsing cached session`,  "color: green;");
                            }
                            catch (error) {
                                console.log(`GetSession: %cError parsing cached session: ${error.message}`, "color: red;");
                            }
                        }
                        // Nothing cached
                    }
                }
                else {
                    console.log(`GetSession: %cEnableCache is enabled, but no CacheKey provided`, "color: orange;");
                }
            }
            // Not using cache, fetch from API

            // Now perform the API call
            const url = `https://api.siperb.com/Users/${options.UserId}/Devices/`;
            const fetchOptions =  {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': options.SessionToken
                }
            };
            try{
                let response = await fetch(url, fetchOptions);
                if (response.ok) {
                    // If the response is ok, we can proceed
                    console.log(`GetSession: %cGot session from API`, "color: green;");
                    // Get the Session from the response
                    try{
                        let data = await response.json();
                        // Filter for Platform script
                        data = data.filter(item => item.Platform === 'script');
                        // Save the json data to the localStorage
                        if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                            if(typeof options.SessionKey === "string" && options.SessionKey !== ""){
                                if(typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'){
                                    window.localStorage.setItem(options.SessionKey, JSON.stringify(data));
                                    console.log(`GetSession: %cUpdated Session`, "color: green;");
                                }
                            }
                        }
                        if(typeof window !== 'undefined'){
                            window.SiperbAPI = window.SiperbAPI || {};
                            window.SiperbAPI.DEVICES = data;
                        }
                        if(!isResolved) resolve(data);
                    }
                    catch(e){
                        console.log(`GetSession: %cError getting Session: ${e.message}`, "color: red;");
                        if(!isResolved) resolve(null);
                    }
                }
                else {
                    console.log(`GetSession: %cBad Response ${response.status}`, "color: red;");
                    if(!isResolved) resolve(null);
                }
            }
            catch(e){
                console.log(`GetSession: %cError getting session: ${e.message}`, "color: red;");
                if(!isResolved) resolve(null);
            }
        });
    },
    /**
     * GetProvisioning - fetches provisioning data and sets window.Siperb.PROVISIONING
     * @param {Object} options - options for provisioning retrieval
     * @returns {Promise<Object>} - resolves with provisioning object
     */
    GetProvisioning(options) {
        return new Promise(async function (resolve, reject) {
            let isResolved = false;
            // Check if the Provisioning is already in localStorage
            if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                if(typeof options.ProvisioningKey === "string" && options.ProvisioningKey != ""){
                    // Use the ProvisioningKey from options or default to 'SiperbProvisioning'
                    console.log(`GetProvisioning: %cUsing ProvisioningKey: ${options.ProvisioningKey}`, "color: blue;");
                    if(typeof window !== 'undefined' && typeof window.localStorage !== "undefined"){
                        let cachedProvisioning = localStorage.getItem(options.ProvisioningKey);
                        if (cachedProvisioning) {
                            // Parse the JSON string to an object
                            try {
                                cachedProvisioning = JSON.parse(cachedProvisioning);
                                if (typeof window !== 'undefined') {
                                    window.SiperbAPI = window.SiperbAPI || {};
                                    window.SiperbAPI.PROVISIONING = cachedProvisioning;
                                }
                                // Resolve but don't return.
                                resolve(cachedProvisioning);
                                isResolved = true;
                                console.log(`GetProvisioning: %cUsing cached Provisioning`,  "color: green;");
                            }
                            catch (error) {
                                console.log(`GetProvisioning: %cError parsing cached Provisioning: ${error.message}`, "color: red;");
                            }
                        }
                        // Nothing cached
                    }
                }
                else {
                    console.log(`GetProvisioning: %cEnableCache is enabled, but no ProvisioningKey provided`, "color: orange;");
                }
            }
            // Not using cache, fetch from API

            // Now perform the API call
            const url = `https://api.siperb.com/Users/${options.UserId}/Devices/${options.DeviceToken}/?password=yes&settings_json=yes`;
            const fetchOptions =  {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': options.SessionToken
                }
            };
            try{
                let response = await fetch(url, fetchOptions);
                if (response.ok) {
                    // If the response is ok, we can proceed
                    console.log(`GetProvisioning: %cGot Provisioning from API`, "color: green;");
                    // Get the Provisioning from the response
                    try{
                        let data = await response.json();
                        if(data.Platform && data.Platform === 'script'){
                            data = data.Settings_json || {};

                            // Save the json data to the localStorage
                            if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                                if(typeof options.ProvisioningKey === "string" && options.ProvisioningKey !== ""){
                                    if(typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'){
                                        window.localStorage.setItem(options.ProvisioningKey, JSON.stringify(data));
                                        console.log(`GetProvisioning: %cUpdated Provisioning`, "color: green;");
                                    }
                                }
                            }
                            if(typeof window !== 'undefined'){
                                window.SiperbAPI = window.SiperbAPI || {};
                                window.SiperbAPI.PROVISIONING = data;
                            }
                            if(!isResolved) resolve(data);
                        }
                        else {
                            console.log(`GetProvisioning: %cNo valid Platform found`, "color: orange;");
                            if(!isResolved) resolve(null);
                        }
                    }
                    catch(e){
                        console.log(`GetProvisioning: %cError getting Provisioning: ${e.message}`, "color: red;");
                        if(!isResolved) resolve(null);
                    }
                }
                else {
                    console.log(`GetProvisioning: %cBad Response ${response.status}`, "color: red;");
                    if(!isResolved) resolve(null);
                }
            }
            catch(e){
                console.log(`GetProvisioning: %cError getting Provisioning: ${e.message}`, "color: red;");
                if(!isResolved) resolve(null);
            }
        });
    }
};

// Export for modules (ESM/CommonJS)
export default Siperb;

// Attach to window for browser global usage
if (typeof window !== 'undefined') {
    window.SiperbAPI = window.SiperbAPI || {};
    Object.assign(window.SiperbAPI, Siperb);
}