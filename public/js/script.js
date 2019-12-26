const signIn = () => {
    const data = {
        email: document.querySelector('#email').value,
        password: document.querySelector('#password').value
    };
    $.ajax({
        type: 'POST',
        url: '/login',
        data,
        success: (data) => {
            window.location.replace('/game.html');
        },
        error: (xhr) => {
            window.alert(JSON.stringify(xhr));
            window.location.replace('/index.html');
        }
    });
};

const signUp = () => {
    const data = {
        email: document.querySelector('#email').value,
        password: document.querySelector('#password').value,
        name: document.querySelector("#name").value
    };
    $.ajax({
        type: 'POST',
        url: '/signup',
        data,
        success: (data) => {
            window.alert('user created successfully'); // Great user experience >.>
            window.location.replace('/index.html');
        },
        error: (xhr) => {
            window.alert(JSON.stringify(xhr));
            window.location.replace('/signup.html');
        }
    });
};