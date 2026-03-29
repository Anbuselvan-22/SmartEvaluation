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
  
  // Load page-specific data
  if (id === 'upload') {
    setupUploadPage();
  } else if (id === 'eval') {
    loadEvaluationData();
  } else if (id === 'students') {
    loadStudentsData();
  } else if (id === 'feedback') {
    loadFeedbackData();
  }
}

// File upload functionality
let uploadedFiles = [];

function setupUploadPage() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  
  if (dropZone) {
    dropZone.onclick = () => fileInput?.click();
  }
}

async function showFiles() {
  const fileInput = document.getElementById('fileInput');
  const files = fileInput.files;
  
  if (files.length === 0) {
    alert('Please select files to upload');
    return;
  }
  
  uploadedFiles = Array.from(files);
  displayUploadedFiles();
}

function displayUploadedFiles() {
  const fileList = document.getElementById('fileList');
  if (!fileList) return;
  
  fileList.style.display = 'block';
  
  const tbody = fileList.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  uploadedFiles.forEach((file, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="mono">${file.name}</td>
      <td>Student ${index + 1}</td>
      <td>Mathematics</td>
      <td>${(file.size / 1024 / 1024).toFixed(1)} MB</td>
      <td><span class="pill pill-blue">Queued</span></td>
      <td><button class="btn btn-sm btn-g" onclick="removeFile(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  displayUploadedFiles();
}

async function uploadFiles() {
  if (uploadedFiles.length === 0) {
    alert('Please select files to upload');
    return;
  }
  
  try {
    const formData = new FormData();
    uploadedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('subject', 'Mathematics');
    
    // Show loading state
    const uploadBtn = document.querySelector('.btn-o');
    if (uploadBtn) {
      uploadBtn.textContent = 'Uploading...';
      uploadBtn.disabled = true;
    }
    
    const response = await evaluationAPI.uploadFiles(formData);
    
    if (response.success) {
      alert('Files uploaded successfully! Processing started...');
      uploadedFiles = [];
      
      // Go to evaluation page after successful upload
      setTimeout(() => {
        go('eval');
      }, 1500);
    } else {
      throw new Error(response.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed: ' + error.message);
  } finally {
    // Reset button state
    const uploadBtn = document.querySelector('.btn-o');
    if (uploadBtn) {
      uploadBtn.textContent = '⚡ Auto-Evaluate All';
      uploadBtn.disabled = false;
    }
  }
}

// Load evaluation data
async function loadEvaluationData() {
  try {
    // TODO: Load real evaluation data from backend
    console.log('Loading evaluation data...');
  } catch (error) {
    console.error('Error loading evaluation data:', error);
  }
}

// Load students data
async function loadStudentsData() {
  try {
    // TODO: Load real students data from backend
    console.log('Loading students data...');
  } catch (error) {
    console.error('Error loading students data:', error);
  }
}

// Load feedback data
async function loadFeedbackData() {
  try {
    // TODO: Load real feedback data from backend
    console.log('Loading feedback data...');
  } catch (error) {
    console.error('Error loading feedback data:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  go('login');
});
