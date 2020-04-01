let siteType, storageName, cookies;


document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('addAccounts').addEventListener('click', addAccounts);
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        try {
            var url = tabs[0].url.match(/(?<=https?:\/\/)(.*?)(?=$|[\/?\&])/)[0];
            if (url.split('.').reverse()[1] == 'naver' && url.split('.').reverse()[0] == 'com') siteType = sites.Naver;
            else if (url.split('.').reverse()[1] == 'daum' && url.split('.').reverse()[0] == 'net') siteType = sites.Daum;
            else if (url.split('.').reverse()[1] == 'kakao' && url.split('.').reverse()[0] == 'com') siteType = sites.Kakao;
            else if (url.split('.').reverse()[1] == 'kakaocorp' && url.split('.').reverse()[0] == 'com') siteType = sites.Kakao;
            else if (url.split('.').reverse()[1] == 'nate' && url.split('.').reverse()[0] == 'com') siteType = sites.Nate;
            else siteType = sites.Undifined;

            var cssId = 'myCss';  // you could encode the css path itself to generate id..
            if (!document.getElementById(cssId)) {
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('link');
                link.id = cssId;
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'style/sites/' + siteType.toString() + '.css';
                link.media = 'all';
                head.appendChild(link);
            }

            document.getElementById('logo').src = 'logo/' + siteType + '.png';
            if (siteType != sites.Undifined) document.getElementById('information').innerText = "계정을 선택하세요.";
            else document.getElementById('information').innerText = "지원하지 않는 사이트입니다.";
            storageName = 's' + siteType.toString();
            chrome.storage.sync.get([storageName], async function (items) {
                loginInfo = await getLoginInfo(siteType);
                cookies = items[storageName];
                if (loginInfo == null) {
                    for (const i in cookies) {
                        document.getElementById('cardContainer').innerHTML += `<div class='card login' data-site='${siteType}' data-id='${i}'>${i}<div class="cardRipple rippleJS" data-site='${siteType}' data-id='${i}'></div></div>`
                    }
                    document.getElementById('cardContainer').innerHTML += `<div style="width:100%;height:45px"></div>`;
                    document.querySelectorAll('.login').forEach(obj => {
                        obj.addEventListener('click', (e) => {
                            document.querySelectorAll('.card').forEach(el => {
                                el.classList.remove('current');
                            });
                            e.target.parentNode.classList.add('current');
                            login(e.target.getAttribute('data-site'), e.target.getAttribute('data-id'));
                        })
                    });
                    return;
                }
                if (items == null) items = Object();
                if (items[storageName] == null) items[storageName] = Object();
                if (siteType != sites.Undifined && loginInfo != null) items[storageName][loginInfo.id] = loginInfo.cookie;
                chrome.storage.sync.set(items, function () {
                    for (const i in cookies) {
                        if (loginInfo == null) document.getElementById('cardContainer').innerHTML += `<div class='card login' data-site='${siteType}' data-id='${i}'>${i}<div class="cardRipple rippleJS" data-site='${siteType}' data-id='${i}'></div></div>`
                        else if (loginInfo.id == i) document.getElementById('cardContainer').innerHTML += `<div class='card login current' data-site='${siteType}' data-id='${i}'>${i}<div class="cardRipple rippleJS" data-site='${siteType}' data-id='${i}'></div></div>`
                        else document.getElementById('cardContainer').innerHTML += `<div class='card login' data-site='${siteType}' data-id='${i}'>${i}<div class="cardRipple rippleJS" data-site='${siteType}' data-id='${i}'></div></div>`
                    }
                    document.getElementById('cardContainer').innerHTML += `<div style="width:100%;height:45px"></div>`;
                    document.querySelectorAll('.login').forEach(obj => {
                        obj.addEventListener('click', (e) => {
                            document.querySelectorAll('.card').forEach(el => {
                                el.classList.remove('current');
                            });
                            e.target.parentNode.classList.add('current');
                            login(e.target.getAttribute('data-site'), e.target.getAttribute('data-id'));
                        })
                    });
                });
            });
        } catch (e) {
            chrome.runtime.sendMessage({
                type: "refPage", options: {}
            });
            window.close();
        }
    });
})


let shadowIntv = setInterval(() => {
    try {
        if (window.scrollY != 0) document.getElementById('logoContainer').classList.add('secShadow');
        else document.getElementById('logoContainer').classList.remove('secShadow');
    } catch (e) {
        clearInterval(shadowIntv);
    }
}, 100);

function addAccounts() {
    setTimeout(() => {
        if (siteType == sites.Naver) chrome.tabs.create({url: "https://nid.naver.com/nidlogin.login"});
        if (siteType == sites.Daum) chrome.tabs.create({url: "https://logins.daum.net/accounts/loginform.do"});
        if (siteType == sites.Kakao) chrome.tabs.create({url: "https://logins.daum.net/accounts/loginform.do"});
        if (siteType == sites.Nate) chrome.tabs.create({url: "http://xo.nate.com/Login.sk"});
        window.close();
    }, 100)
}