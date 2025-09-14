import React, { useState } from 'react';
import './OfferLetterGeneration.css';

const OfferLetterGeneration = () => {
  const [shortlistedCandidates, setShortlistedCandidates] = useState([
    {
      id: 1,
      name: 'John Doe',
      position: 'Senior Software Engineer',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      status: 'pending',
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Product Manager',
      email: 'jane.smith@example.com',
      phone: '+1 234 567 8901',
      status: 'offer_sent',
      offerDetails: {
        salary: '$120,000',
        startDate: '2024-04-01',
        benefits: ['Health Insurance', '401(k)', 'Stock Options'],
      }
    },
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [offerDetails, setOfferDetails] = useState({
    salary: '',
    startDate: '',
    benefits: [],
    additionalNotes: '',
  });
  const [offerSent, setOfferSent] = useState(false);

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    if (candidate.offerDetails) {
      setOfferDetails(candidate.offerDetails);
    } else {
      setOfferDetails({
        salary: '',
        startDate: '',
        benefits: [],
        additionalNotes: '',
      });
    }
    setOfferSent(false);
  };

  const handleOfferDetailChange = (field, value) => {
    setOfferDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBenefitToggle = (benefit) => {
    setOfferDetails(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleSendOffer = () => {
    setShortlistedCandidates(prev =>
      prev.map(candidate =>
        candidate.id === selectedCandidate.id
          ? { ...candidate, status: 'offer_sent', offerDetails }
          : candidate
      )
    );
    setOfferSent(true);
  };

  const availableBenefits = [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    '401(k)',
    'Stock Options',
    'Paid Time Off',
    'Remote Work',
    'Professional Development',
  ];

  return (
    <div className="offer-letter-generation">
      <div className="offer-header">
        <h1>Offer Letter Generation and Sending</h1>
      </div>

      <div className="offer-content">
        <div className="candidates-section">
          <h2>Shortlisted Candidates</h2>
          <div className="candidates-list">
            {shortlistedCandidates.map(candidate => (
              <div
                key={candidate.id}
                className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                onClick={() => handleCandidateSelect(candidate)}
              >
                <div className="candidate-info">
                  <h3>{candidate.name}</h3>
                  <p className="position">{candidate.position}</p>
                  <div className="contact-info">
                    <p>{candidate.email}</p>
                    <p>{candidate.phone}</p>
                  </div>
                  <span className={`status ${candidate.status}`}>
                    {candidate.status === 'offer_sent' ? 'Offer Sent' : 'Pending Offer'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="offer-section">
          {selectedCandidate ? (
            <div className="offer-form">
              <h2>Generate Offer Letter for {selectedCandidate.name}</h2>
              <p className="position">{selectedCandidate.position}</p>

              <div className="offer-details">
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    value={offerDetails.salary}
                    onChange={(e) => handleOfferDetailChange('salary', e.target.value)}
                    placeholder="Enter salary amount"
                    className="salary-input"
                  />
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={offerDetails.startDate}
                    onChange={(e) => handleOfferDetailChange('startDate', e.target.value)}
                    className="date-input"
                  />
                </div>

                <div className="form-group">
                  <label>Benefits</label>
                  <div className="benefits-grid">
                    {availableBenefits.map(benefit => (
                      <label key={benefit} className="benefit-checkbox">
                        <input
                          type="checkbox"
                          checked={offerDetails.benefits.includes(benefit)}
                          onChange={() => handleBenefitToggle(benefit)}
                        />
                        <span>{benefit}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    value={offerDetails.additionalNotes}
                    onChange={(e) => handleOfferDetailChange('additionalNotes', e.target.value)}
                    placeholder="Enter any additional notes or terms..."
                    className="notes-input"
                  />
                </div>
              </div>

              <div className="offer-preview">
                <h3>Offer Letter Preview</h3>
                <div className="preview-content">
                  <p>Dear {selectedCandidate.name},</p>
                  <p>We are pleased to offer you the position of {selectedCandidate.position} at our company.</p>
                  <p>Salary: {offerDetails.salary}</p>
                  <p>Start Date: {offerDetails.startDate}</p>
                  <p>Benefits:</p>
                  <ul>
                    {offerDetails.benefits.map(benefit => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                  {offerDetails.additionalNotes && (
                    <div className="additional-notes">
                      <p>Additional Notes:</p>
                      <p>{offerDetails.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="send-offer-button"
                onClick={handleSendOffer}
                disabled={!offerDetails.salary || !offerDetails.startDate || offerDetails.benefits.length === 0}
              >
                Send Offer Letter
              </button>

              {offerSent && (
                <div className="offer-sent-notification">
                  Offer letter has been sent successfully!
                </div>
              )}
            </div>
          ) : (
            <div className="no-candidate-selected">
              <p>Select a candidate to generate an offer letter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferLetterGeneration; 