import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc,
  addDoc, collection, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 CONFIG FIREBASE */
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let user = null;
let currentChat = null;

/* GERAR ID GLOBAL */
function generateID() {
    return Math.floor(100000000 + Math.random()*900000000).toString();
}

window.confirmName = async function() {
    const name = nameInput.value.trim();
    if (!name) return;

    const id = generateID();
    user = { name, id };

    await setDoc(doc(db, "users", id), user);
    showHome();
}

/* HOME */
function showHome() {
    login.classList.add("hidden");
    home.classList.remove("hidden");
    loadContacts();
}

async function loadContacts() {
    contacts.innerHTML = "";
    const q = collection(db, "users");

    onSnapshot(q, snap => {
        contacts.innerHTML = "";
        snap.forEach(docu => {
            if (docu.id !== user.id) {
                const div = document.createElement("div");
                div.className = "contact";
                div.textContent = docu.data().name;
                div.onclick = () => openChat(docu.id, docu.data().name);
                contacts.appendChild(div);
            }
        });
    });
}

/* CHAT */
function openChat(id, name) {
    currentChat = id;
    home.classList.add("hidden");
    chat.classList.remove("hidden");
    chatName.textContent = name;
    loadMessages();
}

window.goHome = function() {
    chat.classList.add("hidden");
    home.classList.remove("hidden");
}

/* MENSAGENS */
function loadMessages() {
    messages.innerHTML = "";
    const q = query(
        collection(db, "chats", chatID(), "messages"),
        orderBy("time")
    );

    onSnapshot(q, snap => {
        messages.innerHTML = "";
        snap.forEach(m => {
            const msg = m.data();
            const div = document.createElement("div");
            div.className = "bubble " + (msg.from === user.id ? "right" : "left");
            div.textContent = msg.text;
            messages.appendChild(div);
        });
        messages.scrollTop = messages.scrollHeight;
    });
}

window.sendMessage = async function() {
    const text = messageInput.value.trim();
    if (!text) return;

    await addDoc(
        collection(db, "chats", chatID(), "messages"),
        { text, from: user.id, time: Date.now() }
    );

    messageInput.value = "";
}

function chatID() {
    return [user.id, currentChat].sort().join("_");
}
