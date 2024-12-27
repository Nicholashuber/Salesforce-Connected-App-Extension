 var http = require('http');

console.log('running server')

http.createServer(function (req, res) {
    if(req.method == "POST") {
        console.log('POST req')
        console.log(req.url)
        //console.log(req)

        if((req.url).includes('?code=')) {
            let value = makeCallout((req.url).replace('/?code=',''))
            value.then((respo)=> {
                console.log('respo',respo)
                res.writeHead(200, {'Content-Type': 'application/json','Access-Control-Allow-Origin' : 'chrome-extension:yourExtensionURL'});
                res.end(JSON.stringify(respo));
    
            }).catch((err)=>{
                console.log('err',err)
                res.writeHead(300, {'Content-Type': 'application/json','Access-Control-Allow-Origin' : 'chrome-extension:yourExtensionURL'});
                res.end(JSON.stringify({'err':err}));
            })
        }
        else {
            let respons = createAccount('http://abc.com'+req.url)
            respons.then((resp)=>{
                console.log('resp',resp)
                res.writeHead(200, {'Content-Type': 'application/json','Access-Control-Allow-Origin' : 'chrome-extension:yourExtensionURL'});
                res.end(JSON.stringify(resp));
            }).catch((erro)=>{
                console.log('erro',erro)
                res.writeHead(300, {'Content-Type': 'application/json','Access-Control-Allow-Origin' : 'chrome-extension:yourExtensionURL'});
                res.end(JSON.stringify(erro));                
            })

        }


    }
    else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Hello World!');
    }

}).listen(8080); 


async function createAccount(url) {
    var url_string = new URL(url);
    return new Promise(function(myResolve, myReject){
        // Propmise then/catch block
        const body = {
            Name: url_string.searchParams.get("Name")
        }
        var fetch = require('node-fetch');
        fetch(url_string.searchParams.get("url")+'/services/data/v55.0/sobjects/Account', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization' : 'Bearer '+url_string.searchParams.get("AccessToken") 
            },
            body: JSON.stringify(body)
        })      
        // Parse JSON data
        .then((response) => response.json())
        
        // Showing response
        .then((json) => {  
            console.log('in then')  
            console.log(json)
            myResolve(json);
        })
        .catch(err => {
            console.log(err)
            myReject(err)
        })

    })
}

async function makeCallout(authCode) {
    console.log('authCode',authCode)
    console.log('before request')

        return new Promise(function(myResolve, myReject){
            // Propmise then/catch block
    
            var fetch = require('node-fetch');
            fetch('http://login.salesforce.com/services/oauth2/token?grant_type=authorization_code&client_id=<Your_ClientId>&redirect_uri=<ChromeURL>&code='+authCode, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                },
            })      
            // Parse JSON data
            .then((response) => response.json())
            
            // Showing response
            .then((json) => {  
                console.log('in then')  
                console.log(json)
                if(json.access_token) {
                    myResolve(json);
                }
                else {
                    myReject(json.error)
                }
            })
            .catch(err => console.log(err))

        })
      
}


