import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CustomTestForm.css';

const CustomTestForm = () => {
  const navigate = useNavigate();
  // State to handle multiple topics and granular difficulty counts
  const [selectedTopics, setSelectedTopics] = React.useState([]);
  const [difficultyCounts, setDifficultyCounts] = React.useState({
    Easy: 5,
    Medium: 5,
    Hard: 0
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  const allTopics = ['Quantitative Aptitude', 'Reasoning', 'Computer', 'English'];

  // Calculate total questions dynamically
  const totalQuestions = Object.values(difficultyCounts).reduce((sum, count) => sum + count, 0);

  // Handler for topic checkboxes
  const handleTopicChange = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  // Handler for difficulty number inputs
  const handleDifficultyChange = (difficulty, value) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 0) {
      setDifficultyCounts(prev => ({
        ...prev,
        [difficulty]: count
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTopics.length === 0) {
      setError('Please select at least one topic.');
      return;
    }
    if (totalQuestions === 0) {
      setError('Please specify a number of questions for at least one difficulty level.');
      return;
    }

    setLoading(true);
    setError('');

    // This is the data structure your backend needs to handle
    const requestData = {
      topics: selectedTopics,
      questionCounts: difficultyCounts,
    };

    try {
      // API request must be a POST to send complex data
      const response = await fetch(`${API_BASE_URL}/customised-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        // Try to get a meaningful error message from the server
        const errorData = await response.json().catch(() => ({ message: 'Failed to create custom test. The server returned an invalid response.' }));
        throw new Error(errorData.message || 'Server responded with an error');
      }

      const data = await response.json();
      navigate(`/test/${data.testId}`);
    } catch (error) {
      console.error('Error creating custom test:', error);
      setError(error.message || 'Failed to create custom test. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-test-page">
      <div className="custom-header">
        <Link to="/" className="back-link">← Back to Dashboard</Link>
        <h1>Create Your Custom Test</h1>
        <p>Tailor your practice session to your exact needs.</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="custom-form">
          {error && <div className="error-message">{error}</div>}

          {/* Topic Selection */}
          <div className="form-group">
            <label>Select Topics (Choose one or more)</label>
            <div className="checkbox-group">
              {allTopics.map(topic => (
                <label key={topic} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() => handleTopicChange(topic)}
                  />
                  {topic}
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty and Question Count */}
          <div className="form-group">
            <label>Number of Questions by Difficulty</label>
            <div className="difficulty-inputs">
              {Object.keys(difficultyCounts).map(level => (
                <div key={level} className="difficulty-input-item">
                  <label htmlFor={level}>{level}</label>
                  <input
                    type="number"
                    id={level}
                    min="0"
                    value={difficultyCounts[level]}
                    onChange={(e) => handleDifficultyChange(level, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Test Preview */}
          <div className="test-preview">
            <h3>Test Preview</h3>
            <div className="preview-details">
              <div className="preview-item full-width">
                <span className="preview-label">Topics:</span>
                <span className="preview-value">{selectedTopics.join(', ') || 'Not selected'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Total Questions:</span>
                <span className="preview-value">{totalQuestions}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Duration:</span>
                <span className="preview-value">{Math.ceil(totalQuestions)} minutes</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="create-btn"
            disabled={loading || selectedTopics.length === 0 || totalQuestions === 0}
          >
            {loading ? (
              <span className="loading-content">
                <span className="loading-spinner"></span>
                Creating Test...
              </span>
            ) : (
              'Create & Start Test'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomTestForm;
