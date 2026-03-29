const pills = {
  dash: "npDash",
  upload: "npUpload", 
  eval: "npEval",
  students: "npStudents",
  feedback: "npFeedback",
  plan: "npPlan",
};

function go(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-pill").forEach(p => p.classList.remove("active"));

  const pg = document.getElementById("page-" + id);
  if (pg) pg.classList.add("active");

  const pill = document.getElementById(pills[id]);
  if (pill) pill.classList.add("active");

  document.getElementById("floatNav").style.opacity = (id === "login") ? "0" : "1";
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  go('login');
});
