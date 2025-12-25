/* ===== CENÁRIOS ===== */
const scenes = {
    login: document.getElementById("scene-login"),
    home: document.getElementById("scene-home"),
    add: document.getElementById("scene-add"),
    chat: document.getElementById("scene-chat"),
    profile: document.getElementById("scene-profile")
};

function showScene(name) {
    Object.values(scenes).forEach(s => s.classList.add("hidden"));
    scenes[name].classList.remove("hidden");
}

/* ===== ESTADO ===== */
let user = JSON.parse(localStorage.getItem("user"));
let contacts = JSON.parse(localStorage.getItem("contacts")) || {};
let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChat = null;

const BOT_ID = "BOT";

/* ===== INIT ===== */
if (user) {
    initBoraBot();
    showScene("home");
    renderContacts();
}

/* ===== LOGIN ===== */
function generateUserID() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

function confirmName() {
    const name = document.getElementById("nameInput").value.trim();
    if (!name) return alert("Digite seu nome");

    user = {
        name,
        id: generateUserID()
    };

    localStorage.setItem("user", JSON.stringify(user));

    initBoraBot();
    showScene("home");
    renderContacts();
}

/* ===== PERFIL ===== */
function openProfile() {
    document.getElementById("profileName").textContent =
        "Nome: " + user.name;
    document.getElementById("profileId").textContent =
        "ID: " + user.id;

    showScene("profile");
}

/* ===== BORA BOT ===== */
function initBoraBot() {
    if (!contacts[BOT_ID]) {
        contacts[BOT_ID] = { name: "Bora Bot" };
        chats[BOT_ID] = [{
            from: BOT_ID,
            text: "Bem-Vindo ao Bora Chat! Obrigado por usar nosso Site, digite Oi para testar o sistema."
        }];
        saveAll();
    }
}

/* ===== HOME ===== */
function renderContacts() {
    const list = document.getElementById("contactList");
    list.innerHTML = "";

    for (let id in contacts) {
        const btn = document.createElement("button");
        btn.textContent = contacts[id].name;
        btn.onclick = () => openChat(id);
        list.appendChild(btn);
    }
}

function openAddContact() {
    document.getElementById("contactNameInput").value = "";
    document.getElementById("contactIdInput").value = "";
    document.getElementById("addError").textContent = "";
    showScene("add");
}

function goHome() {
    showScene("home");
    renderContacts();
}

/* ===== ADICIONAR CONTATO ===== */
function addContact() {
    const name = document.getElementById("contactNameInput").value.trim();
    const id = document.getElementById("contactIdInput").value.trim();
    const error = document.getElementById("addError");

    if (!name || !id) {
        error.textContent = "Preencha todos os campos";
        return;
    }

    if (id === user.id) {
        error.textContent = "Você não pode adicionar seu próprio ID";
        return;
    }

    contacts[id] = { name };
    chats[id] = chats[id] || [];
    saveAll();

    showScene("home");
    renderContacts();
}

/* ===== CHAT ===== */
function openChat(id) {
    currentChat = id;
    document.getElementById("chatTitle").textContent = contacts[id].name;
    showScene("chat");
    loadMessages();
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text) return;

    chats[currentChat].push({ from: "me", text });

    if (currentChat === BOT_ID && text.toLowerCase() === "oi") {
        botReply();
    }

    input.value = "";
    saveAll();
    loadMessages();
}

/* ===== BORA BOT RESPOSTA ===== */
function botReply() {
    const d = new Date();
    let reply = "Oi";

    if (d.getMonth() === 11 && (d.getDate() === 24 || d.getDate() === 25))
        reply = "Oi, Feliz Natal!!";
    else if (
        (d.getMonth() === 11 && d.getDate() === 31) ||
        (d.getMonth() === 0 && d.getDate() === 1)
        )
        reply = "Oi, Feliz ano-novo!!!";

    chats[BOT_ID].push({ from: BOT_ID, text: reply });
}

/* ===== MENSAGENS ===== */
function loadMessages() {
    const box = document.getElementById("messages");
    box.innerHTML = "";

    (chats[currentChat] || []).forEach(msg => {
        const div = document.createElement("div");
        div.className = "bubble " + (msg.from === "me" ? "right" : "left");

        if (msg.text.length > 50) {
            const short = msg.text.slice(0, 50);
            div.textContent = formatText(short);

            const more = document.createElement("div");
            more.className = "read-more";
            more.textContent = "Ler mais";
            more.onclick = () => {
                div.textContent = formatText(msg.text);
            };
            div.appendChild(more);
        } else {
            div.textContent = formatText(msg.text);
        }

        box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
}

function formatText(text) {
    let out = "";
    for (let i = 0; i < text.length; i += 27) {
        out += text.slice(i, i + 27) + "\n";
    }
    return out.trim();
}

/* ===== SAVE ===== */
function saveAll() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
    localStorage.setItem("chats", JSON.stringify(chats));
}
