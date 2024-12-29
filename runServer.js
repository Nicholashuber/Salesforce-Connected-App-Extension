var http = require('http');
var fetch = require('node-fetch');

console.log('running server');

http.createServer(function (req, res) {
    if (req.method == "POST") {
        console.log('POST request received');
        console.log('Request URL:', req.url);

        if (req.url.includes('?code=')) {
            // Handle OAuth token exchange
            let authCode = req.url.replace('/?code=', '');
            let value = makeCallout(authCode);
            value.then((response) => {
                console.log('OAuth response:', response);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai'
                });
                res.end(JSON.stringify(response));
            }).catch((err) => {
                console.log('OAuth error:', err);
                res.writeHead(300, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai'
                });
                res.end(JSON.stringify({ 'err': err }));
            });
        }
        else if (req.url.includes('?Name=')) {
            // Handle Account creation
            let responsePromise = createAccount('http://abc.com' + req.url);
            responsePromise.then((resp) => {
                console.log('Account creation response:', resp);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai'
                });
                res.end(JSON.stringify(resp));
            }).catch((error) => {
                console.log('Account creation error:', error);
                res.writeHead(300, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai'
                });
                res.end(JSON.stringify(error));
            });
        }
        else if (req.url.includes('?AccessToken=')) {
            // Handle fetching Apex logs
            let responsePromise = getApexLogs('http://abc.com' + req.url);
            responsePromise.then((resp) => {
                console.log('Apex logs response:', resp);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai'
                });
                res.end(JSON.stringify(resp));
            }).catch((error) => {
                console.log('Apex logs error:', error);
                res.writeHead(300, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai'
                });
                res.end(JSON.stringify(error));
            });
        }
        else {
            // Handle other POST requests
            res.writeHead(400, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai'
            });
            res.end(JSON.stringify({ 'error': 'Invalid request' }));
        }
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('Hello World!');
    }
}).listen(8080);

// Function to create an Account in Salesforce
async function createAccount(url) {
    console.log('createAccount called with URL:', url);
    var url_string = new URL(url);
    return new Promise(function (resolve, reject) {
        const body = {
            Name: url_string.searchParams.get("Name")
        };
        fetch(url_string.searchParams.get("url") + '/services/data/v55.0/sobjects/Account', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + url_string.searchParams.get("AccessToken")
            },
            body: JSON.stringify(body)
        })
            .then((response) => response.json())
            .then((json) => {
                console.log('Account creation response:', json);
                resolve(json);
            })
            .catch(err => {
                console.log('Error creating account:', err);
                reject(err);
            });
    });
}

// Function to exchange auth code for access token
async function makeCallout(authCode) {
    console.log('makeCallout called with authCode:', authCode);
    return new Promise(function (resolve, reject) {
        fetch('https://login.salesforce.com/services/oauth2/token?grant_type=authorization_code&client_id=3MVG9JJwBBbcN47Kc2rxoKEy7S9bKdSHmfJYEJVoYRJcLHmm7QzzUZdnMUkSvLn5G0VLeNNaYxPqvdAeaXAL2&redirect_uri=chrome-extension://fdbaoifejjjcihdnnkaklbegkajmmdai/index.html&code=' + authCode, {
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
        })
            .then((response) => response.json())
            .then((json) => {
                console.log('OAuth token response:', json);
                if (json.access_token) {
                    resolve(json);
                }
                else {
                    reject(json.error);
                }
            })
            .catch(err => {
                console.log('Error in OAuth token exchange:', err);
                reject(err);
            });
    });
}

// Function to fetch Apex debug logs
async function getApexLogs(url) {
    console.log('getApexLogs called with URL:', url);
    var url_string = new URL(url);
    return new Promise(function (resolve, reject) {
        const accessToken = url_string.searchParams.get("AccessToken");
        const instanceUrl = url_string.searchParams.get("url");

        // Query to get the latest Apex debug logs
        fetch(instanceUrl + '/services/data/v55.0/query/?q=' + encodeURIComponent('SELECT Id FROM ApexLog ORDER BY StartTime DESC LIMIT 5'), {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.records && json.records.length > 0) {
                    // Fetch the body of each log
                    let logPromises = json.records.map(logRecord => {
                        return fetch(instanceUrl + '/services/data/v55.0/sobjects/ApexLog/' + logRecord.Id + '/Body', {
                            method: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + accessToken
                            }
                        })
                            .then(response => response.text())
                            .then(bodyContent => {
                                return {
                                    Id: logRecord.Id,
                                    Body: bodyContent
                                };
                            });
                    });

                    Promise.all(logPromises)
                        .then(logsWithBody => {
                            resolve({ records: logsWithBody });
                        })
                        .catch(error => {
                            console.error('Error fetching log bodies:', error);
                            reject(error);
                        });
                } else {
                    console.log('No logs found or error in query response');
                    resolve({ records: [] });
                }
            })
            .catch(err => {
                console.error('Error querying logs:', err);
                reject(err);
            });
    });
}


