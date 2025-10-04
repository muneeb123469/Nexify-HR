import React, { useState, useEffect, useRef } from 'react';
import './OfferLetterGeneration.css';
import { Sidebar } from '../dashboard/HRDashboard';

const OfferLetterGeneration = () => {
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [offerDetails, setOfferDetails] = useState({
    salary: '',
    startDate: '',
    benefits: [],
    additionalNotes: '',
  });
  const [offerSent, setOfferSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  // Fetch shortlisted candidates from the database
  useEffect(() => {
    fetchShortlistedCandidates();
  }, []);

  const fetchShortlistedCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/applications?status=shortlisted');
      if (!response.ok) {
        throw new Error('Failed to fetch shortlisted candidates');
      }
      const applications = await response.json();
      
      // Transform applications to match the expected format
      const candidates = applications.map(app => ({
        id: app._id,
        name: app.name,
        position: app.job?.title || 'Position not specified',
        email: app.email,
        phone: app.phone,
        status: app.offerStatus === 'sent' ? 'offer_sent' : 'pending',
        offerDetails: app.offerDetails || null,
        applicationId: app._id
      }));
      
      setShortlistedCandidates(candidates);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching shortlisted candidates:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSendOffer = async () => {
    if (!selectedCandidate) return;
    try {
      setSending(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/applications/${selectedCandidate.applicationId}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerDetails)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send offer');
      }
      const { application } = await response.json();
      setShortlistedCandidates(prev =>
        prev.map(c => c.id === application._id ? { ...c, status: 'offer_sent', offerDetails: application.offerDetails } : c)
      );
      setOfferSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!previewRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `<!doctype html><html><head><title>Offer Letter</title><style>body{font-family:Arial, sans-serif;padding:24px} h3{margin-top:0}</style></head><body>${previewRef.current.innerHTML}</body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
    <>
      <Sidebar />
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

              <div className="offer-preview" ref={previewRef}>
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
                disabled={sending || !offerDetails.salary || !offerDetails.startDate || offerDetails.benefits.length === 0}
              >
                {sending ? 'Sending...' : 'Send Offer Letter'}
              </button>

              <button
                className="send-offer-button"
                onClick={handleDownloadPdf}
                disabled={!selectedCandidate}
                style={{ backgroundColor: '#3182ce', marginLeft: '0.5rem' }}
              >
                Download PDF
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
    </>
  );
};

export default OfferLetterGeneration; 