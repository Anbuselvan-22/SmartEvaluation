// Mock users for demo (will be replaced by real API)
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

let currentUser = null;
let role = "teacher";

function setRole(r) {
  role = r;
  document.getElementById("rcTeacher").classList.toggle("on", r === "teacher");
  document.getElementById("rcStudent").classList.toggle("on", r === "student");
}

async function enterApp() {
  const email = document.querySelector("input[type='email']").value;
  const password = document.querySelector("input[type='password']").value;

  // Show loading state
  const loginBtn = document.querySelector('.btn-orange');
  const originalText = loginBtn.textContent;
  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;

  try {
    // Try real API first
    const response = await authAPI.login(email, password, role);
    
    if (response.success) {
      currentUser = response.data.user;
      
      // Set UI with real user data
      document.getElementById("acName").textContent = currentUser.name;
      document.getElementById("acAddr").textContent = 
        `ID: ${currentUser.id} · ${role === "teacher" ? "Class Admin" : "Class 11B"}`;
      document.getElementById("acRole").textContent = 
        role === "teacher" ? "Teacher" : "Student";
      document.getElementById("walletLabel").textContent = 
        role === "teacher" ? "0xRK…4f2a" : "0xAS…7c9b";

      // Load dashboard data
      await loadDashboardData();
      
      go("dash");
    } else {
      throw new Error(response.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback to demo users if backend is not available
    const user = users.find(
      u => u.email === email && u.password === password && u.role === role
    );

    if (user) {
      currentUser = user;
      
      // Set UI
      document.getElementById("acName").textContent = user.name;
      document.getElementById("acAddr").textContent = 
        `ID: ${user.id} · ${role === "teacher" ? "Class Admin" : "Class 11B"}`;
      document.getElementById("acRole").textContent = 
        role === "teacher" ? "Teacher" : "Student";
      document.getElementById("walletLabel").textContent = 
        role === "teacher" ? "0xRK…4f2a" : "0xAS…7c9b";

      go("dash");
    } else {
      alert("Invalid credentials! Try:\nTeacher: teacher@edu.com / 1234\nStudent: student@edu.com / 1234");
    }
  } finally {
    // Reset button state
    loginBtn.textContent = originalText;
    loginBtn.disabled = false;
  }
}

// Load dashboard data from backend
async function loadDashboardData() {
  if (!currentUser) return;
  
  try {
    if (role === "teacher") {
      // Load teacher analytics
      const analytics = await teacherAPI.getAnalytics(currentUser.id);
      console.log('Teacher analytics:', analytics);
      
      // Update dashboard with real data
      // TODO: Update dashboard elements with real data
    } else {
      // Load student data
      const marks = await studentAPI.getMarks(currentUser.id);
      const performance = await studentAPI.getPerformance(currentUser.id);
      console.log('Student marks:', marks);
      console.log('Student performance:', performance);
      
      // Update dashboard with real data
      // TODO: Update dashboard elements with real data
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Keep demo data if backend is not available
  }
}
