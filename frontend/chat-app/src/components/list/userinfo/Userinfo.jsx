import React, { useState } from 'react';
import { useUserStore } from "../../lib/userStore"; 
import "./userinfo.css";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [aboutDetails, setAboutDetails] = useState("");

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleInputChange = (e) => {
    setAboutDetails(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to save the about details goes here.
    // For example, update the user info in the store or database.
    console.log("About Details Submitted:", aboutDetails);
    togglePopup(); // Close the popup after submitting
  };

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" onClick={togglePopup} title="more" />
        <img src="./edit.png" alt="" onClick={togglePopup} title="edit" />
      </div>
      
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Edit About Details</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={aboutDetails}
                onChange={handleInputChange}
                placeholder="Enter about details"
                rows="4"
                style={{ width: "100%" }}
              />
              <div className="button-container">
                <button type="submit">Save</button>
                <button type="button" onClick={togglePopup}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Userinfo;
