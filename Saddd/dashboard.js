import { db, auth } from "./firebase.js";
import {
  collection, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

async function welcomeUser() {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "users", user.uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    document.querySelector(".navbar h2").innerText = `🎓 Welcome, ${snap.data().email}`;
  }
}

/* LOAD COURSES */
window.loadCourses = async function() {
  const snapshot = await getDocs(collection(db, "courses"));
  const container = document.getElementById("courses");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const c = docSnap.data();

    container.innerHTML += `
      <div class="course">
        ${c.title} (${c.currentEnrollment}/${c.capacity})
        <button onclick="register('${docSnap.id}')">Register</button>
      </div>
    `;
  });
};

/* REGISTER */
window.register = async function(courseId) {
  const ref = doc(db, "courses", courseId);
  const snap = await getDoc(ref);
  const c = snap.data();

  if (c.currentEnrollment >= c.capacity) {
    alert("Course full");
    return;
  }

  await addDoc(collection(db, "enrollments"), {
    studentId: auth.currentUser.uid,
    courseId
  });

  await updateDoc(ref, {
    currentEnrollment: c.currentEnrollment + 1
  });

  alert("Registered!");
  loadCourses();
};

/* LOAD MY COURSES */
window.loadMyCourses = async function() {
  const q = query(collection(db, "enrollments"), 
    where("studentId", "==", auth.currentUser.uid)
  );

  const snapshot = await getDocs(q);
  const container = document.getElementById("myCourses");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    container.innerHTML += `
      <div class="course">
        ${docSnap.data().courseId}
        <button onclick="drop('${docSnap.id}')">Drop</button>
      </div>
    `;
  });
};

/* DROP COURSE */
window.drop = async function(id) {
  await deleteDoc(doc(db, "enrollments", id));
  alert("Dropped");
  loadMyCourses();
};

/* PAYMENT */
window.makePayment = async function() {
  await addDoc(collection(db, "payments"), {
    studentId: auth.currentUser.uid,
    amount: 12000
  });

  alert("Payment done");
};

/* LOGOUT */
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "student-login.html";
  });
};

// Init
onAuthStateChanged(auth, () => {
  welcomeUser();
  loadCourses();
});
