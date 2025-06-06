import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, push, onValue, update, remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7S2lc0hN_Nq3uFwTmNAsiECL1fT3tqbo",
  authDomain: "raven-1dc3b.firebaseapp.com",
  databaseURL: "https://raven-1dc3b-default-rtdb.firebaseio.com",
  projectId: "raven-1dc3b",
  storageBucket: "raven-1dc3b.firebasestorage.app",
  messagingSenderId: "711244469403",
  appId: "1:711244469403:web:9afcffc774ce0c1054623e",
  measurementId: "G-H0K0N10MGV"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const studentRef = ref(db, "students");
let currentEditKey = null;

// Show form for adding/editing student
window.showForm = function (key = null) {
  document.getElementById("studentForm").classList.remove("hidden");
  if (key) {
    currentEditKey = key;
    const student = document.querySelector(`[data-key="${key}"]`).dataset;
    document.getElementById("formTitle").textContent = "Edit Student";
    document.getElementById("name").value = student.name;
    document.getElementById("phone").value = student.phone;
    document.getElementById("gender").value = student.gender;
    document.getElementById("heightFeet").value = student.height;
    document.getElementById("weight").value = student.weight;
  } else {
    currentEditKey = null;
    document.getElementById("formTitle").textContent = "Add Student";
    document.querySelectorAll('#studentForm input').forEach(i => i.value = "");
  }
}

// Hide form
window.hideForm = function () {
  document.getElementById("studentForm").classList.add("hidden");
}

// Calculate BMI status
function getBMIStatus(bmi) {
  if (bmi < 18.5) return { text: "Underweight", class: "underweight" };
  if (bmi < 25) return { text: "Normal", class: "normal" };
  if (bmi < 30) return { text: "Overweight", class: "overweight" };
  return { text: "Obese", class: "obese" };
}

// Save new or edited student
window.saveStudent = function () {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const gender = document.getElementById("gender").value.trim();
  const heightFeet = parseFloat(document.getElementById("heightFeet").value);
  const weight = parseFloat(document.getElementById("weight").value);
  
  if (!name || !phone || !gender || isNaN(heightFeet) || isNaN(weight)) {
    alert("Please fill all fields correctly.");
    return;
  }
  
  const heightInMeters = heightFeet * 0.3048;
  if (heightInMeters <= 0 || weight <= 0) {
    alert("Height and weight must be positive numbers.");
    return;
  }
  
  const bmi = weight / (heightInMeters * heightInMeters);
  const status = getBMIStatus(bmi);
  const student = { name, phone, gender, height: heightInMeters, weight, bmi, status };
  
  if (currentEditKey) {
    update(ref(db, `students/${currentEditKey}`), student);
  } else {
    push(studentRef, student);
  }
  hideForm();
}

// Delete student
window.deleteStudent = function (key) {
  if (confirm("Are you sure you want to delete this student?")) {
    remove(ref(db, `students/${key}`));
  }
}

// Render table with student data
function renderTable(students) {
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = "";
  if (!students) return;
  Object.entries(students).forEach(([key, s]) => {
    const row = document.createElement("tr");
    row.setAttribute("data-key", key);
    row.dataset.name = s.name;
    row.dataset.phone = s.phone;
    row.dataset.gender = s.gender;
    row.dataset.height = s.height;
    row.dataset.weight = s.weight;
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.gender}</td>
      <td>${s.phone}</td>
      <td>${(s.height / 0.3048).toFixed(2)}</td>
      <td>${s.weight}</td>
      <td>${s.bmi.toFixed(2)}</td>
      <td><span class="status ${s.status.class}">${s.status.text}</span></td>
      <td>
        <button onclick="showForm('${key}')">Edit</button>
        <button onclick="deleteStudent('${key}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Firebase data listener
onValue(studentRef, (snapshot) => {
  const data = snapshot.val();
  renderTable(data);
});
</script>
</body>
</html>
