import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { evaluationService } from '../services/evaluationService';
import UploadBox from '../components/UploadBox';
import { FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

const EvaluationPage = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (formData) => {
    setUploading(true);
    setError('');
    
    try {
      const response = await evaluationService.uploadAnswerSheet(formData);
      setResults(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadReport = () => {
    if (!results) return;
    
    const reportData = {
      evaluationId: results.id,
      studentName: results.studentName,
      subject: results.subject,
      score: results.score,
      feedback: results.feedback,
      strengths: results.strengths,
      weaknesses: results.weaknesses,
      date: new Date().toLocaleDateString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Evaluation</h1>
          <p className="text-gray-600">
            Upload answer sheets for instant AI-powered evaluation and feedback
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {!results ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Answer Sheets</h2>
              <p className="text-gray-600">
                Supported formats: Images (JPG, PNG), PDF files up to 10MB
              </p>
            </div>
            
            <UploadBox onUpload={handleUpload} loading={uploading} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Evaluation Complete</h2>
                    <p className="text-gray-600">Results are ready for review</p>
                  </div>
                </div>
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Student Name</p>
                  <p className="font-semibold text-gray-800">{results.studentName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Subject</p>
                  <p className="font-semibold text-gray-800">{results.subject}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Score</p>
                  <p className={`font-bold text-2xl ${
                    results.score >= 80 ? 'text-green-600' : 
                    results.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {results.score}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Overall Feedback</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {results.feedback}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                    <ul className="space-y-1">
                      {results.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-700 mb-2">Areas for Improvement</h3>
                    <ul className="space-y-1">
                      {results.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span className="text-gray-700">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setResults(null);
                  setError('');
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Evaluate Another Paper
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationPage;
