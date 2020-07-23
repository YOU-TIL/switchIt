const sites = {
    'Undifined': 0,
    'Naver': 1,
    'Daum': 2,
    'Kakao': 3,
    'Nate': 4,
    'Microsoft': 5,
    'Dcinside': 6
};

let reTry = 0;

function getCookie(url, cookieValue) {
    return new Promise(function (resolve, reject) {
        try {
            chrome.cookies.get({"url": url, "name": cookieValue}, function (cookie) {
                try {
                    resolve(cookie.value)
                } catch (e) {
                    resolve("")
                }
            });
        } catch (error) {
            reject(error)
        }
    })
}

async function getLoginInfo(siteType) {
    let res = null;
    try {
        if (siteType == sites.Naver) {
            res = Object();
            res.id = (await (await fetch('https://www.naver.com')).text()).toString().split('isLogin: "')[1].split('"')[0];
            res.cookie = Object();
            await getCookie('https://www.naver.com', 'NID_AUT').then((cookie) => {
                res.cookie['NID_AUT'] = cookie;
            });
            await getCookie('https://www.naver.com', 'NID_SES').then((cookie) => {
                res.cookie['NID_SES'] = cookie;
            });
            await getCookie('https://www.naver.com', 'NID_JKL').then((cookie) => {
                res.cookie['NID_JKL'] = cookie;
            });
        }
        if (siteType == sites.Daum || siteType == sites.Kakao) {
            res = Object();
            res.id = (await (await fetch('https://accounts.kakao.com/weblogin/account/info')).text()).toString().split('<strong class="tit_set">Email</strong>')[1].split('<span class="txt_set">')[1].split('</span>')[0];
            res.cookie = Object();
            await getCookie('https://www.daum.net', 'HM_CU').then((cookie) => {
                res.cookie['HM_CU'] = cookie;
            });
            await getCookie('https://www.daum.net', 'HTS').then((cookie) => {
                res.cookie['HTS'] = cookie;
            });
            await getCookie('https://www.daum.net', 'LSID').then((cookie) => {
                res.cookie['LSID'] = cookie;
            });
            await getCookie('https://www.daum.net', 'PROF').then((cookie) => {
                res.cookie['PROF'] = cookie;
            });
            await getCookie('https://www.daum.net', 'TS').then((cookie) => {
                res.cookie['TS'] = cookie;
            });

            await getCookie('https://accounts.kakao.com', '_kawlp').then((cookie) => {
                res.cookie['_kawlp'] = cookie;
            });
            await getCookie('https://accounts.kakao.com', '_kawlptea').then((cookie) => {
                res.cookie['_kawlptea'] = cookie;
            });
            await getCookie('https://accounts.kakao.com', '_kawlt').then((cookie) => {
                res.cookie['_kawlt'] = cookie;
            });
            await getCookie('https://accounts.kakao.com', '_kawltea').then((cookie) => {
                res.cookie['_kawltea'] = cookie;
            });
        }
        if (siteType == sites.Nate) {
            res = Object();
            res.id = (await (await fetch('https://member.nate.com/modify/CheckPasswordFrm.sk?pg_code=myinfo')).text()).toString().split('</caption>')[1].split('<strong>')[1].split('</strong>')[0];
            res.cookie = Object();
            await getCookie('https://www.nate.com', 'SFN').then((cookie) => {
                res.cookie['SFN'] = cookie;
            });
        }
        if (siteType == sites.Dcinside) {
            res = Object();
            if ((await (await fetch('https://gallog.dcinside.com/')).text()).toString().split('script').length > 4) throw new Error("Not Logined");
            res.id = (await (await fetch('https://gallog.dcinside.com/')).text()).toString().split('");</script>')[0].split('/').reverse()[0];
            res.cookie = Object();
            await getCookie('https://www.dcinside.com', 'PHPSESSID').then((cookie) => {
                res.cookie['PHPSESSID'] = cookie;
            });
            await getCookie('https://www.dcinside.com', 'PHPSESSKEY').then((cookie) => {
                res.cookie['PHPSESSKEY'] = cookie;
            });
        }
    } catch (e) {
        res = null;
    }
    return res;
}


function login(loginSite, loginId) {
    if (reTry > 2) {
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            chrome.runtime.sendMessage({
                type: "setId", options: {
                    id: loginId
                }
            });
            let loginLink;
            if (siteType == sites.Naver) loginLink = 'https://nid.naver.com/nidlogin.login';
            if (siteType == sites.Daum || siteType == sites.Kakao) loginLink = 'https://logins.daum.net/accounts/loginform.do';
            if (siteType == sites.Nate) loginLink = 'http://xo.nate.com/Login.sk';
            if (siteType == sites.Dcinside) loginLink = 'https://dcid.dcinside.com/join/login.php?s_url=http%3A%2F%2Fgall.dcinside.com';
            chrome.tabs.executeScript(tabs[0].id, {
                code: `if(confirm('로그인 토큰이 만료되었습니다. 다시 로그인할까요?')) window.location.href = '${loginLink}'`
            });
        });
        return;
    }
    storageName = 's' + loginSite.toString();
    chrome.storage.sync.get([storageName], async function (items) {
        cookies = items[storageName][loginId];

        if (loginSite == sites.Naver) domain = "naver.com";
        if (loginSite == sites.Daum || loginSite == sites.Kakao) domain = "daum.net";
        if (loginSite == sites.Nate) domain = "nate.com";
        if (loginSite == sites.Dcinside) domain = "dcinside.com";

        if (loginSite == sites.Naver) url = "https://www.naver.com";
        if (loginSite == sites.Daum || loginSite == sites.Kakao) url = "https://www.daum.net";
        if (loginSite == sites.Nate) url = "https://www.nate.com";
        if (loginSite == sites.Dcinside) url = "https://www.dcinside.com";

        for (const i in cookies) {
            try {
                tDomain = domain;
                tUrl = url;
                if ((siteType == sites.Daum || siteType == sites.Kakao) && i.substring(0, 1) == '_') {
                    tDomain = "kakao.com";
                    tUrl = "https://accounts.kakao.com";
                }
                chrome.cookies.set({
                    url: tUrl,
                    name: i,
                    value: cookies[i],
                    domain: tDomain
                }, () => {
                });
            } catch (e) {

            }
        }
        chrome.tabs.getSelected(null, async function (tab) {
            setTimeout(async () => {
                reTry++;
                stat = await getLoginInfo(loginSite);
                if (stat == null) login(loginSite, loginId);
                else {
                    chrome.runtime.sendMessage({
                        type: "loginFin", options: {}
                    });
                    window.close();
                }
            }, 300);
        });
    });
}