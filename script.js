console.log('in script')

var element = document.getElementById("myButton");
const reDirect = window.location.origin

console.log(reDirect)

var insURL;


function createAccount() {
    console.log('inside createAcc')
    user = { 
        "Name": document.getElementById("fname").value
    }

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }
    let fetchRes = fetch('http://localhost:8080?Name='+document.getElementById("fname").value+'&AccessToken='+insURL.access_token+'&url='+insURL.instance_url, options);

    fetchRes.then(res =>res.json()).then(d => {
        console.log(d)
        var mydiv = document.getElementById("accountDetails");
        if(d.id) {
            var aTag = document.createElement('a');
            aTag.setAttribute('href',insURL.instance_url+'/'+d.id);
            aTag.setAttribute('target','_blank');
            aTag.innerText = "Newely Created Account";
            mydiv.appendChild(aTag);

        }
        else {
            mydiv.innerHTML = 'There was some error:' + JSON.stringify(d)
        }
        mydiv.setAttribute('style','display:block')
        
    })    
}

function makeCallout(accessCode) {
    console.log('before request')
    // Make request
    
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }
    // Fake api for making post requests
    let fetchRes = fetch("http://localhost:8080?code="+accessCode, options);

    fetchRes.then(res =>res.json()).then(d => {
        console.log(d)
        insURL = d
        var tokenAcc = document.getElementById("accessToken");
        if(d.access_token) {
            console.log(d.instance_url)
            document.getElementById("tokenHead").innerHTML = (d.access_token).slice(0,10)
            document.getElementById("accButton").addEventListener('click',()=>{
                createAccount()
            })
        }
        else tokenAcc.innerHTML = 'Error received from server: '+d.err;

        tokenAcc.setAttribute('style','display:block')
        
    })

}

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    urlString = tabs[0].url
    console.log(urlString)
    if(urlString.includes('code=')) {
        element.disabled = true
        let paramString = urlString.split('?')[1];
        let queryString = new URLSearchParams(paramString);
        
        var code
        for (let pair of queryString.entries()) {
            if(pair[0]=='code') code = pair[1]
           console.log("Key is: " + pair[0]);
           console.log("Value is: " + pair[1]);
        }
        console.log('code',code)
        makeCallout(code)
        return
    }

    if(urlString.includes(window.location.origin)) {
        element.addEventListener("click", function() {
            window.open("https://login.salesforce.com/services/oauth2/authorize?client_id=<Client_Id>&redirect_uri=<Redirect_URI>&response_type=code")
        });
    }
    else {
        element.addEventListener("click", function() {
            window.open('chrome-extension://yourExtensionURL')
        });
    }


});



