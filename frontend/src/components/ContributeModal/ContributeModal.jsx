import { useState } from 'react';
import './ContributeModal.css';

export function ContributeModal({ isOpen, onClose }) {
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({
    placeName: '',
    location: '',
    category: '',
    description: '',
    whyEndorse: '',
    localRating: 5,
    culturalSensitivity: '',
  });
  const [touristFormData, setTouristFormData] = useState({
    rating: 0,
    hoveredRating: 0,
    review: '',
    visitDate: '',
    wouldRecommend: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      resetForm();
    }, 2000);
  };

  const handleTouristSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setUserType(null);
    setFormData({
      placeName: '',
      location: '',
      category: '',
      description: '',
      whyEndorse: '',
      localRating: 5,
      culturalSensitivity: '',
    });
    setTouristFormData({
      rating: 0,
      hoveredRating: 0,
      review: '',
      visitDate: '',
      wouldRecommend: '',
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => resetForm(), 300);
  };

  if (!isOpen) return null;

  return (
    <aside className="contributeModalOverlay">
      <article className="contributeModal">
        <header className={`contributeModalHeader ${userType === 'tourist' ? 'contributeModalHeaderTourist' : ''}`}>
          <button
            onClick={handleClose}
            className="contributeModalClose"
            type="button"
            aria-label="Close modal"
          >
            X
          </button>

          {userType && (
            <button
              onClick={() => setUserType(null)}
              className="contributeModalBack"
              type="button"
            >
              ← Back
            </button>
          )}

          <section className="contributeModalHeaderContent">
            <figure className="contributeModalIconWrapper">
            </figure>
            <section>
              <h2 className="contributeModalTitle">
                {!userType && 'Share Your Voice'}
                {userType === 'local' && 'Contribute a Place'}
                {userType === 'tourist' && 'Share Your Experience'}
              </h2>
              <p className="contributeModalSubtitle">
                {!userType && 'Help others discover authentic experiences'}
                {userType === 'local' && 'Share your local knowledge with travelers'}
                {userType === 'tourist' && 'Your feedback helps future travelers'}
              </p>
            </section>
          </section>
        </header>

        <section className="contributeModalBody">
          {isSubmitted ? (
            <section className="contributeModalSuccess">
              <figure className={`contributeModalSuccessIconWrapper ${
                userType === 'tourist' ? 'contributeModalSuccessIconWrapperTourist' : ''
              }`}>
              </figure>
              <h3 className="contributeModalSuccessTitle">Thank You!</h3>
              <p className="contributeModalSuccessMessage">
                {userType === 'local'
                  ? "Your contribution has been submitted for review. We'll notify you once it's published."
                  : "Your review has been submitted and will help future travelers make informed decisions."}
              </p>
            </section>
          ) : !userType ? (
            <section className="contributeModalTypeSelector">
              <h3 className="contributeModalTypeTitle">Are you a local or a tourist?</h3>
              <p className="contributeModalTypeDescription">
                Your perspective matters. Choose your role to contribute in the way that best represents your experience.
              </p>

              <nav className="contributeModalTypeGrid">
                <button
                  onClick={() => setUserType('local')}
                  className="contributeModalTypeButton"
                  type="button"
                >
                  <figure className="contributeModalTypeButtonIconWrapper">
                  </figure>
                  <h4 className="contributeModalTypeButtonTitle">I'm a Local</h4>
                  <p className="contributeModalTypeButtonDescription">
                    Share places from your community that you believe travelers should experience with respect and understanding.
                  </p>
                  <section className="contributeModalTypeButtonInfo">
                    <p className="contributeModalTypeButtonInfoTitle">You'll provide:</p>
                    <ul className="contributeModalTypeButtonList">
                      <li className="contributeModalTypeButtonListItem">• Place details & location</li>
                      <li className="contributeModalTypeButtonListItem">• Cultural context</li>
                      <li className="contributeModalTypeButtonListItem">• Local endorsement (1-10)</li>
                      <li className="contributeModalTypeButtonListItem">• Sensitivity guidelines</li>
                    </ul>
                  </section>
                </button>

                <button
                  onClick={() => setUserType('tourist')}
                  className="contributeModalTypeButton contributeModalTypeButtonTourist"
                  type="button"
                >
                  <figure className="contributeModalTypeButtonIconWrapper contributeModalTypeButtonIconWrapperTourist">
                  </figure>
                  <h4 className="contributeModalTypeButtonTitle">I'm a Tourist</h4>
                  <p className="contributeModalTypeButtonDescription">
                    Share your experience visiting places in Johannesburg to help other travelers make informed decisions.
                  </p>
                  <section className="contributeModalTypeButtonInfo contributeModalTypeButtonInfoTourist">
                    <p className="contributeModalTypeButtonInfoTitle">You'll provide:</p>
                    <ul className="contributeModalTypeButtonList">
                      <li className="contributeModalTypeButtonListItem">• 5-star rating</li>
                      <li className="contributeModalTypeButtonListItem">• Detailed review</li>
                      <li className="contributeModalTypeButtonListItem">• Visit date</li>
                      <li className="contributeModalTypeButtonListItem">• Recommendation level</li>
                    </ul>
                  </section>
                </button>
              </nav>
            </section>
          ) : userType === 'local' ? (
            <>
              <aside className="contributeModalAlert">
                <h3 className="contributeModalAlertTitle">Before You Submit</h3>
                <p className="contributeModalAlertDescription">
                  As a local contributor, your voice shapes how visitors experience our culture. Please only recommend
                  places where you genuinely welcome respectful visitors and feel the culture is represented authentically.
                </p>
              </aside>

              <form onSubmit={handleLocalSubmit} className="contributeModalForm">
                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="placeName" className="contributeModalLabel">
                    Place Name *
                  </label>
                  <input
                    id="placeName"
                    type="text"
                    value={formData.placeName}
                    onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                    placeholder="e.g., Origins Centre Museum"
                    className="contributeModalInput"
                    required
                  />
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="location" className="contributeModalLabel">
                    Location *
                  </label>
                  <section className="contributeModalInputWrapper">
                    <input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Braamfontein, Johannesburg"
                      className="contributeModalInput contributeModalInputWithIcon"
                      required
                    />
                  </section>
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="category" className="contributeModalLabel">
                    Category *
                  </label>
                  <section className="contributeModalInputWrapper">
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="contributeModalSelect contributeModalInputWithIcon"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="museum">Museum</option>
                      <option value="heritage">Heritage Site</option>
                      <option value="market">Market</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="cultural-center">Cultural Center</option>
                      <option value="gallery">Gallery</option>
                    </select>
                  </section>
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="description" className="contributeModalLabel">
                    Description *
                  </label>
                  <section className="contributeModalInputWrapper">
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this place and what makes it special..."
                      rows={4}
                      className="contributeModalTextarea contributeModalInputWithIcon"
                      required
                    />
                  </section>
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="whyEndorse" className="contributeModalLabel">
                    Why Do You Endorse This Place? *
                  </label>
                  <textarea
                    id="whyEndorse"
                    value={formData.whyEndorse}
                    onChange={(e) => setFormData({ ...formData, whyEndorse: e.target.value })}
                    placeholder="Explain why you believe visitors should experience this place and how it represents our culture authentically..."
                    rows={4}
                    className="contributeModalTextarea"
                    required
                  />
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="localRating" className="contributeModalLabel">
                    Your Local Endorsement (1-10) *
                  </label>
                  <section className="contributeModalRangeWrapper">
                    <input
                      id="localRating"
                      type="range"
                      min="1"
                      max="10"
                      value={formData.localRating}
                      onChange={(e) => setFormData({ ...formData, localRating: parseInt(e.target.value) })}
                      className="contributeModalRange"
                      style={{
                        background: `linear-gradient(to right, #8B7355 0%, #8B7355 ${(formData.localRating - 1) * 11.11}%, #E8DCC8 ${(formData.localRating - 1) * 11.11}%, #E8DCC8 100%)`
                      }}
                    />
                    <section className="contributeModalRangeLabels">
                      <span className="contributeModalRangeLabelLeft">Prefer visitors didn't come</span>
                      <output className="contributeModalRangeValue">{formData.localRating}/10</output>
                      <span className="contributeModalRangeLabelRight">Wish they could experience it</span>
                    </section>
                  </section>
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="culturalSensitivity" className="contributeModalLabel">
                    Cultural Sensitivity Notes
                  </label>
                  <textarea
                    id="culturalSensitivity"
                    value={formData.culturalSensitivity}
                    onChange={(e) => setFormData({ ...formData, culturalSensitivity: e.target.value })}
                    placeholder="Are there any cultural protocols, dress codes, or respectful behaviors visitors should know? (Optional)"
                    rows={3}
                    className="contributeModalTextarea"
                  />
                </fieldset>

                <footer className="contributeModalActions">
                  <button
                    type="submit"
                    className="contributeModalSubmit"
                  >
                    Submit Contribution
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="contributeModalCancel"
                  >
                    Cancel
                  </button>
                </footer>
              </form>

              <p className="contributeModalFooterNote">
                * Required fields. All contributions are reviewed to ensure quality and cultural respect.
              </p>
            </>
          ) : (
            <>
              <aside className="contributeModalAlert contributeModalAlertTourist">
                <h3 className="contributeModalAlertTitle">
                  <MessageSquare style={{ width: '1rem', height: '1rem', display: 'inline-block', marginRight: '0.5rem' }} aria-hidden="true" />
                  Tourist Review
                </h3>
                <p className="contributeModalAlertDescription">
                  Share your honest experience to help other travelers. Your feedback on accessibility,
                  facilities, and overall experience is valuable.
                </p>
              </aside>

              <form onSubmit={handleTouristSubmit} className="contributeModalForm">
                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="touristPlaceName" className="contributeModalLabel">
                    Place Name *
                  </label>
                  <input
                    id="touristPlaceName"
                    type="text"
                    placeholder="Which place did you visit?"
                    required
                    className="contributeModalInput"
                  />
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label className="contributeModalLabel">
                    Your Rating *
                  </label>
                  <section className="contributeModalStarRating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTouristFormData({ ...touristFormData, rating: star })}
                        onMouseEnter={() => setTouristFormData({ ...touristFormData, hoveredRating: star })}
                        onMouseLeave={() => setTouristFormData({ ...touristFormData, hoveredRating: 0 })}
                        className="contributeModalStarButton"
                        aria-label={`Rate ${star} stars`}
                      >
                        star
                      </button>
                    ))}
                  </section>
                  <p className="contributeModalStarDescription">
                    {touristFormData.rating === 0 && 'Click to rate your experience'}
                    {touristFormData.rating === 1 && 'Poor - Major issues'}
                    {touristFormData.rating === 2 && 'Below Average - Disappointing'}
                    {touristFormData.rating === 3 && 'Average - Met basic expectations'}
                    {touristFormData.rating === 4 && 'Good - Enjoyable experience'}
                    {touristFormData.rating === 5 && 'Excellent - Highly recommend'}
                  </p>
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="visitDate" className="contributeModalLabel">
                    When Did You Visit? *
                  </label>
                  <input
                    id="visitDate"
                    type="month"
                    value={touristFormData.visitDate}
                    onChange={(e) => setTouristFormData({ ...touristFormData, visitDate: e.target.value })}
                    required
                    className="contributeModalInput"
                  />
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <label htmlFor="review" className="contributeModalLabel">
                    Tell Us About Your Experience *
                  </label>
                  <textarea
                    id="review"
                    value={touristFormData.review}
                    onChange={(e) => setTouristFormData({ ...touristFormData, review: e.target.value })}
                    placeholder="Share details about your visit, what you enjoyed, and any tips for future visitors..."
                    rows={6}
                    required
                    className="contributeModalTextarea"
                  />
                  <p className="contributeModalTextareaHint">
                    Minimum 50 characters. Be specific and helpful to other travelers.
                  </p>
                </fieldset>

                <fieldset className="contributeModalFormGroup">
                  <legend className="contributeModalLabel">
                    Would You Recommend This Place? *
                  </legend>
                  <section className="contributeModalRadioGroup">
                    <label className="contributeModalRadioLabel">
                      <input
                        type="radio"
                        name="recommend"
                        value="yes"
                        checked={touristFormData.wouldRecommend === 'yes'}
                        onChange={(e) => setTouristFormData({ ...touristFormData, wouldRecommend: e.target.value })}
                        className="contributeModalRadio"
                      />
                      <section className="contributeModalRadioTextWrapper">
                        <p className="contributeModalRadioTitle">Yes, I'd recommend it</p>
                        <p className="contributeModalRadioDescription">Worth visiting for most travelers</p>
                      </section>
                    </label>

                    <label className="contributeModalRadioLabel">
                      <input
                        type="radio"
                        name="recommend"
                        value="maybe"
                        checked={touristFormData.wouldRecommend === 'maybe'}
                        onChange={(e) => setTouristFormData({ ...touristFormData, wouldRecommend: e.target.value })}
                        className="contributeModalRadio"
                      />
                      <section className="contributeModalRadioTextWrapper">
                        <p className="contributeModalRadioTitle">Maybe, depends on preferences</p>
                        <p className="contributeModalRadioDescription">Good for specific types of travelers</p>
                      </section>
                    </label>

                    <label className="contributeModalRadioLabel">
                      <input
                        type="radio"
                        name="recommend"
                        value="no"
                        checked={touristFormData.wouldRecommend === 'no'}
                        onChange={(e) => setTouristFormData({ ...touristFormData, wouldRecommend: e.target.value })}
                        className="contributeModalRadio"
                      />
                      <section className="contributeModalRadioTextWrapper">
                        <p className="contributeModalRadioTitle">No, I wouldn't recommend it</p>
                        <p className="contributeModalRadioDescription">Did not meet expectations</p>
                      </section>
                    </label>
                  </section>
                </fieldset>

                <footer className="contributeModalActions">
                  <button
                    type="submit"
                    disabled={touristFormData.rating === 0}
                    className="contributeModalSubmit"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="contributeModalCancel"
                  >
                    Cancel
                  </button>
                </footer>
              </form>

              <p className="contributeModalFooterNote">
                * Required fields. Please be respectful and constructive in your feedback.
              </p>
            </>
          )}
        </section>
      </article>
    </aside>
  );
}

export default ContributeModal;
