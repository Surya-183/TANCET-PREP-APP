import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ResultsScreen.css';

const ResultsScreen = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/results/${resultId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch results.');
        }
        const resultData = await response.json();
        setResult(resultData);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId]);

  const calculatePercentage = () => {
    if (!result || !result.totalQuestions) return 0;
    return Math.round((result.correctAnswers / result.totalQuestions) * 100);
  };

  const getScoreColor = () => {
    const percentage = calculatePercentage();
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 50) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <div className="results-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Calculating your results...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-screen">
        <div className="error-container">
          <h2>Error Loading Results</h2>
          <p>{error}</p>
          <Link to="/" className="home-btn">Go Home</Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-screen">
        <div className="error-container">
          <h2>Results not found.</h2>
          <Link to="/" className="home-btn">Go Home</Link>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage();

  return (
    <div className="results-screen">
      {/* Header */}
      <div className="results-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>Test Results</h1>
        <p>Your performance summary</p>
      </div>

      <div className="results-container">
        {/* Score Overview */}
        <div className="score-card">
          <div className="score-circle" style={{ borderColor: getScoreColor() }}>
            <div className="score-value" style={{ color: getScoreColor() }}>
              {percentage}%
            </div>
            <div className="score-label">Overall Score</div>
          </div>
          
          <div className="score-stats">
            <div className="stat-item correct">
              <div className="stat-number">{result.correctAnswers}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-item incorrect">
              <div className="stat-number">{result.incorrectAnswers}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-item unanswered">
              <div className="stat-number">{result.unansweredQuestions}</div>
              <div className="stat-label">Unanswered</div>
            </div>
            <div className="stat-item total">
              <div className="stat-number">{result.totalQuestions}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="performance-grid">
          <div className="metric-card">
            <h3>Accuracy</h3>
            <div className="metric-value" style={{ color: getScoreColor() }}>
              {percentage}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: getScoreColor()
                }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <h3>Time Spent</h3>
            <div className="metric-value">
              {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
            </div>
            <div className="metric-label">
              Out of {result.totalTime ? Math.floor(result.totalTime / 60) : 'N/A'} minutes
            </div>
          </div>

          <div className="metric-card">
            <h3>Score</h3>
            <div className="metric-value">
              {result.correctAnswers}/{result.totalQuestions}
            </div>
            <div className="metric-label">Questions answered correctly</div>
          </div>
        </div>

        {/* Question Review Section */}
        {result.questionReview && result.questionReview.length > 0 && (
          <div className="review-section">
            <div className="review-header">
              <h3>Question Review</h3>
              <button 
                className="toggle-review-btn"
                onClick={() => setShowReview(!showReview)}
              >
                {showReview ? 'Hide Review' : 'View Detailed Review'}
              </button>
            </div>

            {showReview && (
              <div className="questions-review">
                {result.questionReview.map((question, index) => (
                  <div 
                    key={index} 
                    className={`question-review-item ${question.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div className="question-header">
                      <span className="question-number">Question {index + 1}</span>
                      <span className={`question-status ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                        {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    
                    <div className="question-text">
                      <p>{question.question}</p>
                    </div>

                    <div className="answer-info">
                      <div className="answer-row">
                        <span className="answer-label">Your Answer:</span>
                        <span className={`answer-value ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                          {question.userAnswer !== undefined ? question.options?.[question.userAnswer] || 'No answer' : 'Not answered'}
                        </span>
                      </div>
                      
                      {!question.isCorrect && (
                        <div className="answer-row">
                          <span className="answer-label">Correct Answer:</span>
                          <span className="answer-value correct">
                            {question.options?.[question.correctAnswer] || 'Not available'}
                          </span>
                        </div>
                      )}
                    </div>

                    {question.solution && (
                      <div className="solution-section">
                        <h4>Solution:</h4>
                        <p>{question.solution}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions">
          <Link to="/" className="action-btn secondary">
            Take Another Test
          </Link>
          <Link to="/" className="action-btn primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
