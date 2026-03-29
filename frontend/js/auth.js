const users = [
  {
    role: "teacher",
    email: "teacher@edu.com",
    password: "1234",
    name: "Ravi Kumar",
    id: "EDU-0x4f2a"
  },
  {
    role: "student", 
    email: "student@edu.com",
    password: "1234",
    name: "Ananya Sharma",
    id: "STU-0x7c9b"
  }
];

let role = "teacher";

function setRole(r) {
  role = r;
  document.getElementById("rcTeacher").classList.toggle("on", r === "teacher");
  document.getElementById("rcStudent").classList.toggle("on", r === "student");
}

function enterApp() {
  const email = document.querySelector("input[type='email']").value;
  const password = document.querySelector("input[type='password']").value;

  const user = users.find(
    u => u.email === email && u.password === password && u.role === role
  );

  if (!user) {
    alert("Invalid credentials!");
    return;
  }

  // Set UI
  document.getElementById("acName").textContent = user.name;
  document.getElementById("acAddr").textContent = 
    `ID: ${user.id} · ${role === "teacher" ? "Class Admin" : "Class 11B"}`;
  document.getElementById("acRole").textContent = 
    role === "teacher" ? "Teacher" : "Student";
  document.getElementById("walletLabel").textContent = 
    role === "teacher" ? "0xRK…4f2a" : "0xAS…7c9b";

  go("dash");
}
