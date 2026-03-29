// Main connection script - bridges UI to backend
console.log('🚀 Smart Evaluation - Connecting UI to Backend...');

// Test backend connection
async function testBackendConnection() {
  try {
    const response = await fetch('http://localhost:5002/api/health');
    const data = await response.json();
    console.log('✅ Backend connected:', data);
    return true;
  } catch (error) {
    console.log('❌ Backend not connected:', error.message);
    return false;
  }
}

// Real evaluation function
async function submitAnswer(answerText, subject = 'Mathematics') {
  if (!answerText || answerText.trim() === '') {
    alert('Please enter an answer to evaluate');
    return;
  }

  try {
    console.log('📤 Sending to backend:', { answer: answerText, subject });
    
    const response = await fetch('http://localhost:5002/api/evaluate/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        answer: answerText,
        subject: subject,
        studentId: currentUser?.id || 'demo-student'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Backend response:', data);
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Evaluation failed');
    }
    
  } catch (error) {
    console.error('❌ Evaluation error:', error);
    alert('Backend error: ' + error.message);
    return null;
  }
}

// Real file upload function
async function uploadAnswerFiles(files, subject = 'Mathematics') {
  if (!files || files.length === 0) {
    alert('Please select files to upload');
    return;
  }

  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('subject', subject);
    formData.append('studentId', currentUser?.id || 'demo-student');

    console.log('📤 Uploading files:', files.length, 'files');
    
    const response = await fetch('http://localhost:5002/api/evaluate/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Upload response:', data);
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    alert('Upload error: ' + error.message);
    return null;
  }
}

// Get real evaluation results
async function getEvaluationResults(studentId) {
  try {
    const response = await fetch(`http://localhost:5002/api/evaluate/results/${studentId || 'demo-student'}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Results:', data);
    
    return data.success ? data.data : [];
    
  } catch (error) {
    console.error('❌ Get results error:', error);
    return [];
  }
}

// Initialize connection
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🌐 Testing backend connection...');
  const isBackendConnected = await testBackendConnection();
  
  if (isBackendConnected) {
    console.log('✅ System ready - UI connected to backend');
  } else {
    console.log('⚠️ Backend not available - using demo mode');
  }
});

// Make functions global for onclick handlers
window.submitAnswer = submitAnswer;
window.uploadAnswerFiles = uploadAnswerFiles;
window.getEvaluationResults = getEvaluationResults;
