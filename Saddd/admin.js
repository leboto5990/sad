import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc, doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ADD COURSE */
window.addCourse = async function() {
  const title = document.getElementById("title").value;
  const capacity = parseInt(document.getElementById("capacity").value);

  if (!title || !capacity) {
    alert("Please fill all fields");
    return;
  }

  await addDoc(collection(db, "courses"), {
    title,
    capacity,
    currentEnrollment: 0
  });

  document.getElementById("title").value = "";
  document.getElementById("capacity").value = "";
  loadCourses();
  alert("Course added!");
};

/* LOAD COURSES LIST */
window.loadCourses = async function() {
  const snapshot = await getDocs(collection(db, "courses"));
  const list = document.getElementById("list");
  list.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const c = docSnap.data();
    const id = docSnap.id;

    list.innerHTML += `
      <div class="course">
        <strong>${c.title}</strong> 
        (${c.currentEnrollment}/${c.capacity})
        <button onclick="deleteCourse('${id}')">Delete</button>
      </div>
    `;
  });
};

/* DELETE COURSE */
window.deleteCourse = async function(id) {
  if (confirm("Delete this course?")) {
    await deleteDoc(doc(db, "courses", id));
    loadCourses();
  }
};

/* LOAD DATA */
async function loadAnalytics() {
  const snapshot = await getDocs(collection(db, "courses"));

  let labels = [];
  let data = [];

  snapshot.forEach(doc => {
    const c = doc.data();
    labels.push(c.title);
    data.push(c.currentEnrollment);
  });

  // BAR
  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels, datasets: [{ label: "Students", data }] }
  });

  // PIE
  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: { labels, datasets: [{ data }] }
  });

  // LINE
  new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: { labels, datasets: [{ label: "Trend", data }] }
  });
}

/* PDF REPORT */
window.generatePDF = async function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const snapshot = await getDocs(collection(db, "courses"));

  let y = 10;
  doc.text("Course Report", 10, y);
  y += 10;

  snapshot.forEach(docSnap => {
    const c = docSnap.data();
    doc.text(`${c.title} - ${c.currentEnrollment}/${c.capacity}`, 10, y);
    y += 10;
  });

  doc.save("report.pdf");
};

/* ADMIN LOGOUT */
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "admin-login.html";
  });
};

loadAnalytics();
loadCourses();
