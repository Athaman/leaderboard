const getCookie = (cname) => {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

setInterval(() => {
    $.ajax({
        type: 'POST',
        url: '/token',
        data: {
            // TODO include the email here to match the logic at the token route
            refreshToken: getCookie('refreshJwt')
        },
        success: (data) => {

        },
        error: (xhr) => {
            window.alert(JSON.stringify(xhr));
            window.location.replace('/index.html');
        }
    })    
}, 1000);