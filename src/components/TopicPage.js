import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './TopicPage.css';

// SVG Icons
const AptitudeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm3.75 0h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm-7.5-6h.008v.008H8.25v-.008Zm3.75 0h.008v.008h-.008v-.008Zm3.75 0h.008v.008h-.008v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ReasoningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const ComputerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /></svg>;
const EnglishIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>;

const TopicPage = () => {
  const { topicName } = useParams();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const allTopics = [
      { name: 'Quantitative Aptitude', icon: <AptitudeIcon/> }, 
      { name: 'Reasoning', icon: <ReasoningIcon/> }, 
      { name: 'Computer', icon: <ComputerIcon/> }, 
      { name: 'English', icon: <EnglishIcon/> }
    ];

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/subtopics?topic=${encodeURIComponent(topicName)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        const data = await response.json();
        
        let subtopicsArray = [];
        if (Array.isArray(data)) {
          subtopicsArray = data;
        } else if (data.body) {
          try {
            const parsedBody = JSON.parse(data.body);
            subtopicsArray = Array.isArray(parsedBody) ? parsedBody : parsedBody.subtopics || [];
          } catch (parseError) {
            console.error('Error parsing response body:', parseError);
          }
        }
        setTests(subtopicsArray);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (topicName) {
      fetchTests();
    }
  }, [topicName]);

  const handleConfigureTest = (subtopic) => {
    navigate(`/configure/${encodeURIComponent(topicName)}/${encodeURIComponent(subtopic)}`);
  };
  
  const filteredTests = tests.filter(test =>
    test.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="feedback-container">
          <div className="loading-spinner"></div>
          <p>Loading Practice Tests...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="feedback-container error">
          <h2>Could Not Load Tests</h2>
          <p>{error}</p>
        </div>
      );
    }

    if (tests.length > 0 && filteredTests.length === 0) {
        return (
          <div className="feedback-container">
            <h2>No Matching Sub-topics</h2>
            <p>Your search for "{searchTerm}" did not return any results.</p>
          </div>
        );
      }

    if (filteredTests.length === 0) {
      return (
        <div className="feedback-container">
          <h2>No Tests Available</h2>
          <p>There are currently no practice tests for this sub-topic.</p>
        </div>
      );
    }

    return (
      <div className="subtopics-list">
        {filteredTests.map((test, index) => (
          <div key={index} className="subtopic-row-elite">
            <div className="subtopic-info">
                <h3>{test}</h3>
                <p>Practice key concepts and improve your speed.</p>
            </div>
            <button 
              className="start-btn-elite"
              onClick={() => handleConfigureTest(test)}
            >
              Start Practice
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="topic-page-elite">
      <aside className="topic-sidebar-elite">
        <header className="sidebar-header-elite">
            <h1>TANCET Prep</h1>
        </header>
        <nav className="sidebar-nav-elite">
          {allTopics.map(topic => (
            <Link 
              key={topic.name}
              to={`/topic/${encodeURIComponent(topic.name)}`}
              className={topicName === topic.name ? 'active' : ''}
            >
              {topic.icon}
              {topic.name}
            </Link>
          ))}
        </nav>
        <footer className="sidebar-footer-elite">
            <Link to="/" className="back-home-link-elite">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Dashboard
            </Link>
        </footer>
      </aside>

      <main className="topic-main-content-elite">
        <header className="topic-main-header-elite">
            <div>
                <h2>{topicName}</h2>
                <p>Select a sub-topic to begin your focused practice session.</p>
            </div>
            <div className="search-container-elite">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search sub-topics..."
                    className="search-input-elite"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </header>
        <div className="tests-container-elite">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default TopicPage;
