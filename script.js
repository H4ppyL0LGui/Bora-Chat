import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore, doc, setDoc, getDoc,
    addDoc, collection, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 CONFIG FIREBASE (OBRIGATÓRIO PREENCHER) */
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ELEMENTOS */
const login = document.getElementById("login");
const home = document.getElementById("home");
const chat = document.getElementById("chat");

const nameInput = document.getElementById("nameInput");
const confirmBtn = document.getElementById("confirmBtn");
const addContactBtn = document.getElementById("addContactBtn");
const contactsDiv = document.getElementById("contacts");

const chatName = document.getElementById("chatName");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const backBtn = document.getElementById("backBtn");

/* ESTADO */
let user = null;
let currentChat = null;

/* EVENTOS */
confirmBtn.onclick = confirmName;
sendBtn.onclick = sendMessage;
backBtn.onclick = goHome;
addContactBtn.onclick = addContact;

/* FUNÇÕES */
function generateID() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

async function confirmName() {
    const name = nameInput.value.trim();
    if (!name) return alert("Digite um nome");

    const id = generateID();
    user = { name, id };

    await setDoc(doc(db, "users", id), user);
    showHome();
}

function showHome() {
    login.classList.add("hidden");
    chat.classList.add("hidden");
    home.classList.remove("hidden");
    loadContacts();
}

function loadContacts() {
    contactsDiv.innerHTML = "";
    const usersRef = collection(db, "users");

    onSnapshot(usersRef, snap => {
        contactsDiv.innerHTML = "";
        snap.forEach(d => {
            if (d.id !== user.id) {
                const div = document.createElement("div");
                div.className = "contact";
                div.textContent = d.data().name;
                div.onclick = () => openChat(d.id, d.data().name);
                contactsDiv.appendChild(div);
            }
        });
    });
}

function addContact() {
    alert("Neste modo global, todos os usuários aparecem automaticamente.");
}

function openChat(id, name) {
    currentChat = id;
    home.classList.add("hidden");
    chat.classList.remove("hidden");
    chatName.textContent = name;
    loadMessages();
}

function goHome() {
    chat.classList.add("hidden");
    home.classList.remove("hidden");
}

function chatID() {
    return [user.id, currentChat].sort().join("_");
}

function loadMessages() {
    messagesDiv.innerHTML = "";
    const q = query(
        collection(db, "chats", chatID(), "messages"),
        orderBy("time")
    );

    onSnapshot(q, snap => {
        messagesDiv.innerHTML = "";
        snap.forEach(d => {
            const msg = d.data();
            const div = document.createElement("div");
            div.className = "bubble " + (msg.from === user.id ? "right" : "left");
            div.textContent = formatText(msg.text);
            messagesDiv.appendChild(div);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentChat) return;

    await addDoc(
        collection(db, "chats", chatID(), "messages"),
        {
            text,
            from: user.id,
            time: Date.now()
        }
    );

    messageInput.value = "";
}

function formatText(text) {
    let out = "";
    for (let i = 0; i < text.length; i += 27) {
        out += text.slice(i, i + 27) + "\n";
    }
    return out.trim();
}
