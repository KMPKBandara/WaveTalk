import React, { useState } from 'react';
import { useUserStore } from "../../lib/userStore";
import { db } from "../../lib/firebase"; 
import { doc, updateDoc } from "firebase/firestore"; 
import "./userinfo.css";

const Userinfo = () => {
  const { currentUser } = useUserStore();  // Get current user from store
  const [isPopupOpen, setIsPopupOpen] = useState(false);  // Popup state
  const [aboutDetails, setAboutDetails] = useState(currentUser.about || ""); // Pre-populate with current details
  const [editDetails, setEditDetails] = useState({ username: currentUser.username, about: aboutDetails });

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);  // Toggle the popup on/off
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userRef = doc(db, "users", currentUser.id);  // Reference to current user doc in Firestore

      // Update the user's details in Firestore
      await updateDoc(userRef, {
        username: editDetails.username,
        about: editDetails.about,
      });

      console.log("User Details Updated:", editDetails);
      togglePopup();  // Close the popup after submission
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  return (
    <div className="userInfo">
      {/* Display current user info */}
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{currentUser.username}</h2>
      </div>

      {/* Icons for actions */}
      <div className="icons">
        <img src="./more.png" alt="More" title="more" />
        <img 
          src="./edit.png" 
          alt="Edit" 
          onClick={togglePopup} 
          title="Edit Details"
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Popup for editing user details */}
      {isPopupOpen && (
        <div
          className="popup"
          style={{
            position: "absolute",
            top: "120px",  
            left: "150px",
            backgroundColor: "#fff",
            padding: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            width: "300px",
            height: "150px",
            zIndex: 1000,
          }}
        >
          <div className="popup-content">
            <h3 style={{ marginBottom: "10px", color: "#333" }}>Edit User Details</h3>
            <form onSubmit={handleSubmit}>
              {/* Username input */}
              <input
                type="text"
                name="username"
                value={editDetails.username}
                onChange={handleInputChange}
                placeholder="Username"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />

              {/* About input (textarea) */}
              <textarea
                name="about"
                value={editDetails.about}
                onChange={handleInputChange}
                placeholder="Enter about details"
                rows="4"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              />

              {/* Buttons */}
              <div
                className="button-container"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#2196F3",  
                    color: "#fff",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={togglePopup}
                  style={{
                    backgroundColor: "#2196F3",  
                    color: "#fff",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Userinfo;
