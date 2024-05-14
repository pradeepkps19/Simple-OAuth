let clientId    = '';
let scope       = '';
let redirectUri = '';
let oauthDomain = '';

let scopesHistory = [];

var clientConfig = {
   "local": {
       "clientId" : '',
       "domain"   : ''
   },
   "dev": {
       "clientId" : '',
       "domain"   : ''
   }
};

let currentAppServer = 'live';
let callback_after_authorize = (function(generatedOauthToken){
                                    document.getElementById("oauthtoken").innerHTML = generatedOauthToken;
                                    console.log('OAuthtoken = ' + generatedOauthToken );
                                });


let ci;
let ct;
let generatedOauthToken = null;

function initiateAuthroizeFromInput(e){
    console.log(e);
    e.preventDefault();
    clientId    = document.getElementById("client_id").value.trim();
    scope       = document.getElementById("scopes").value.trim();
    redirectUri = document.getElementById("redirect_uri").value.trim();
    initiateAuthorize();
}

function selectAppServer(appServer){
    currentAppServer = appServer;
    clientId    = clientConfig[appServer].clientId;
    oauthDomain = clientConfig[appServer].domain;
    window.localStorage.setItem("last_appserver", appServer);
    console.log('current appserver - ' +appServer);
}

function initiateAuthorize(e){
    e.preventDefault();
    scope = document.getElementById("scopes").value.trim();
    let authWindow = window.open(`${oauthDomain}/oauth/v2/auth?response_type=token&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=1234`,
                            '_blank',
                            'width=500,height=500'
                    );
    let authPromise = new Promise((res, rej) => {
        ci = setInterval(() => {
            try {
                let hashData = authWindow.location.hash;
                if(hashData) {
                    res(hashData);
                    authWindow.close();
                }
            }
            catch (e) {
                console.log('hash not yet received');
            }
      }, 1000);
      ct = setTimeout(() => {
                rej('timeout reached');
                ci();
                authWindow.close();
          }, 50000);
    });
    authPromise.then(
        hash => {
            generatedOauthToken = getAccessToken(hash);
            callback_after_authorize(generatedOauthToken);
        },
        err => console.log(' error... ', err)
    );
}

function syncScopesForAutoFill(){
    window.localStorage.setItem("last_scope", document.getElementById("scopes").value.trim());
}

function initDefaultValue(){
    document.getElementById("scopes").value = scope;
}

function getParameterByName(name, hash) {
    let match = RegExp(`[#&]${name}=([^&]*)`).exec(hash);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getAccessToken(hash) {
    return getParameterByName('access_token', hash);
}