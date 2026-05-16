import React, { useEffect, useMemo, useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import './OfferLetterGeneration.css';

const STORAGE_KEY = 'nexify_hr_offer_letters';

const createEmptyOfferDetails = () => ({
  salary: '',
  startDate: '',
  benefits: [],
  additionalNotes: '',
});

const getStoredOffers = () => {
  try {
    const savedOffers = localStorage.getItem(STORAGE_KEY);
    const parsedOffers = savedOffers ? JSON.parse(savedOffers) : [];
    return Array.isArray(parsedOffers) ? parsedOffers : [];
  } catch (error) {
    console.error('Failed to read offer letters:', error);
    return [];
  }
};

const saveStoredOffers = (offers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
};

const OfferLetterGeneration = () => {
  const { applications, loading, error, fetchApplications } = useApplications();
  const [offers, setOffers] = useState(getStoredOffers);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [offerDetails, setOfferDetails] = useState(createEmptyOfferDetails);
  const [offerSaved, setOfferSaved] = useState(false);

  const offerCandidates = useMemo(() => {
    const applicationList = Array.isArray(applications) ? applications : [];

    return applicationList
      .filter((application) => application.status?.toLowerCase() === 'hired')
      .map((application) => {
        const existingOffer = offers.find((offer) => offer.applicationId === application._id);

        return {
          id: application._id,
          applicationId: application._id,
          name: application.applicantName || 'Unknown Applicant',
          position: application.jobTitle || 'Unknown Job',
          email: application.email || '',
          phone: application.phone || '',
          status: existingOffer ? 'offer_prepared' : 'pending',
        };
      });
  }, [applications, offers]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (
      selectedCandidate &&
      !offerCandidates.some((candidate) => candidate.id === selectedCandidate.id)
    ) {
      setSelectedCandidate(null);
      setOfferDetails(createEmptyOfferDetails());
      setOfferSaved(false);
    }
  }, [selectedCandidate, offerCandidates]);

  const findOfferForCandidate = (candidate) =>
    offers.find((offer) => offer.applicationId === candidate.applicationId);

  const handleCandidateSelect = (candidate) => {
    const existingOffer = findOfferForCandidate(candidate);

    setSelectedCandidate(candidate);
    setOfferDetails(existingOffer?.offerDetails || createEmptyOfferDetails());
    setOfferSaved(false);
  };

  const handleOfferDetailChange = (field, value) => {
    setOfferDetails(prev => ({
      ...prev,
      [field]: value
    }));
    setOfferSaved(false);
  };

  const handleBenefitToggle = (benefit) => {
    setOfferDetails(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
    setOfferSaved(false);
  };

  const handleSaveOffer = () => {
    if (!selectedCandidate) {
      return;
    }

    const existingOffer = findOfferForCandidate(selectedCandidate);
    const savedOffer = {
      id: existingOffer?.id || `offer_${Date.now()}`,
      applicationId: selectedCandidate.applicationId,
      candidateName: selectedCandidate.name,
      position: selectedCandidate.position,
      email: selectedCandidate.email,
      phone: selectedCandidate.phone,
      offerDetails,
      status: 'offer_prepared',
      createdAt: existingOffer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedOffers = existingOffer
      ? offers.map((offer) => offer.applicationId === selectedCandidate.applicationId ? savedOffer : offer)
      : [...offers, savedOffer];

    setOffers(updatedOffers);
    saveStoredOffers(updatedOffers);
    setOfferSaved(true);
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
        <h1>Offer Letter Generation</h1>
      </div>

      <div className="offer-content">
        <div className="candidates-section">
          <h2>Hired Candidates</h2>
          <div className="candidates-list">
            {loading ? (
              <div className="no-candidate-selected">
                <p>Loading hired applications...</p>
              </div>
            ) : error ? (
              <div className="no-candidate-selected">
                <p>{error}</p>
              </div>
            ) : offerCandidates.length === 0 ? (
              <div className="no-candidate-selected">
                <p>No hired candidates available. Mark a candidate as hired from Candidate Applications first.</p>
              </div>
            ) : (
              offerCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                  onClick={() => handleCandidateSelect(candidate)}
                >
                  <div className="candidate-info">
                    <h3>{candidate.name}</h3>
                    <p className="position">{candidate.position}</p>
                    <div className="contact-info">
                      {candidate.email && <p>{candidate.email}</p>}
                      {candidate.phone && <p>{candidate.phone}</p>}
                    </div>
                    <span className={`status ${candidate.status}`}>
                      {candidate.status === 'offer_prepared' ? 'Offer Prepared' : 'Pending Offer'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="offer-section">
          {selectedCandidate ? (
            <div className="offer-form">
              <h2>Prepare Offer Letter for {selectedCandidate.name}</h2>
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
                onClick={handleSaveOffer}
                disabled={!offerDetails.salary || !offerDetails.startDate || offerDetails.benefits.length === 0}
              >
                Save Offer Letter
              </button>

              <div className="local-demo-note">
                Email sending is not configured in this local demo.
              </div>

              {offerSaved && (
                <div className="offer-sent-notification">
                  Offer letter saved successfully for this candidate.
                </div>
              )}
            </div>
          ) : (
            <div className="no-candidate-selected">
              <p>Select a candidate to prepare an offer letter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferLetterGeneration;
