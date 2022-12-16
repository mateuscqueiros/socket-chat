var socket = io();

var editName = document.querySelector("#edit-name");
var form = document.querySelector("#form");
var input = document.querySelector("#input");
var inputName = document.querySelector("#name");
var typing = document.querySelector("#typing");

input.style.display = "none";

if (!localStorage.getItem("name")) {
    input.style.display = "none";
    inputName.style.display = 'block';
} else {
    socket.emit("join", localStorage.getItem("name"))
    input.style.display = "block";
    inputName.style.display = 'none';
}
let userName = localStorage.getItem("name");
let isEditingName = false;

form.addEventListener("submit", e => {
    e.preventDefault()

    if (!userName) {
        if (inputName.value) {
            localStorage.setItem("name", inputName.value);
            userName = localStorage.getItem("name");
            if (!isEditingName) {
                socket.emit("join", userName)
            }
            inputName.value = '';
            input.style.display = 'block';
            inputName.style.display = 'none';
            isEditingName = false;
        } else {
            console.log("Digite um nome")
        }
    } else {
        if (input.value) {
            const obj = { name: userName, message: input.value };
            appendNewMessage(obj);
            socket.emit('message', obj);
            input.value = '';
        }
    }

})

editName.addEventListener("click", () => {
    localStorage.setItem("name", null);
    userName = null;
    isEditingName = true;

    input.style.display = "none";
    inputName.style.display = 'block';
});

var typingTimeOut;

input.addEventListener("keydown", (e) => {
    socket.emit("typing", { name: userName });
    clearInterval(typingTimeOut);
    typingTimeOut = setTimeout(() => {
        socket.emit("finishtyping", { name: userName });
    }, 3000);
})

socket.on('message', (obj) => {
    console.log(obj);
    appendNewMessage(obj);
    clearInterval(typingTimeOut);
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on('userleave', (obj) => {
    appendInfo(obj)
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on('join', (obj) => {
    appendInfo(obj)
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on('typing', (obj) => {
    appendTyping(obj.name)
})

socket.on('finishtyping', (obj) => {
    removeTyping(obj.name)
})

function appendNewMessage(obj) {
    var item = `
        <li ${userName === obj.name ? "class='message-item self'" : "class='message-item'"} data-name=${obj.name}>
            <div>
                <span class="name">${obj.name}</span>
                <span>${obj.message}</span>
            </div>
        </li>
    `;
    messages.insertAdjacentHTML('beforeend', item);
}

function appendInfo(obj) {
    var item = `
        <li class="info">
            <div>
                <span>${obj.msg}</span>
            </div>
        </li>
    `;
    messages.insertAdjacentHTML('beforeend', item);
}

var typingUsers = [];

function appendTyping(name) {
    console.log(typing)
    if (!typingUsers.includes(name)) {
        typingUsers.push(name)
        var item = `
            <span id="${name}-typing">${name} está digitando...</span>
        `;
        typing.insertAdjacentHTML('beforeend', item);
    }

}

function removeTyping(name) {
    console.log("#" + name + "-typing");
    let i = typingUsers.indexOf(name);
    if (i > -1) {
        typingUsers.splice(i, 1);
        let selector = "#typing #" + name + "-typing";
        let el = document.querySelector(selector);
        console.log(el)
        el.remove();
    }
}