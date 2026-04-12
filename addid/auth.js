// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAJBge8NM51f7IvwaE5X1fXsC8H-0Tlv0",
    authDomain: "project-k21n.firebaseapp.com",
    projectId: "project-k21n",
    storageBucket: "project-k21n.firebasestorage.app",
    messagingSenderId: "266081318769",
    appId: "1:266081318769:web:a7893c55b5b30a8dd768d0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Pre-authorized admin emails (only these can access)
const ALLOWED_ADMIN_EMAILS = [
    "admin@imbuga.com"
];

// Check if user is authorized admin
function isAuthorizedAdmin(user) {
    return user && ALLOWED_ADMIN_EMAILS.includes(user.email);
}

// Protect a page - redirect to login if not authenticated
function protectPage() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user && isAuthorizedAdmin(user)) {
                resolve(user);
            } else {
                // Clear any old session storage
                sessionStorage.removeItem("auth");
                // Redirect to login page
                window.location.href = "index.html";
                reject(new Error("Not authenticated"));
            }
        });
    });
}

// Login function
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!isAuthorizedAdmin(user)) {
            await signOut(auth);
            throw new Error("You are not authorized to access the admin panel.");
        }
        
        sessionStorage.setItem("auth", "true");
        return { success: true, user };
    } catch (error) {
        console.error("Login error:", error);
        let message = "Login failed. ";
        if (error.code === "auth/user-not-found") {
            message += "User not found.";
        } else if (error.code === "auth/wrong-password") {
            message += "Wrong password.";
        } else if (error.code === "auth/invalid-email") {
            message += "Invalid email format.";
        } else {
            message += error.message;
        }
        return { success: false, message };
    }
}

// Logout function
async function logout() {
    try {
        await signOut(auth);
        sessionStorage.removeItem("auth");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout error:", error);
    }
}

// Get current user
function getCurrentUser() {
    return auth.currentUser;
}

export { auth, protectPage, login, logout, getCurrentUser, isAuthorizedAdmin };
