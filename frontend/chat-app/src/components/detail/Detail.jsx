import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../lib/chatStore";
import { auth, db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import { useEffect, useState } from "react";
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrntUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  const [otherUser, setOtherUser] = useState(null);  // State to hold other user's data

  // Fetch other user's details from Firestore
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.id);  // Fetch the other user's document by their ID
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        setOtherUser(userSnapshot.data());  // Set the other user's data to state
      }
    };

    fetchOtherUser();
  }, [user]);

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  // If the other user's data hasn't loaded yet, show a loading message
  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className='detail'>
      {/* Display other user's information */}
      <div className="user">
        <img src={otherUser?.avatar || "./avatar.png"} alt="Other User Avatar" />
        <h2>{otherUser?.username}</h2>
        <p>{otherUser?.about || "No about details provided."}</p> {/* Show other user's about */}
      </div>

      <div className="info">
        {/* Chat and privacy settings */}
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowDown.png" alt="" title="show more"/>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowDown.png" alt="" title="show more"/>
          </div>
        </div>

        {/* Shared media */}
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" title="show more"/>
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="avatar.png" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" title="download"/>
            </div>
          </div>
        </div>

        {/* Block/Unblock user functionality */}
        <button onClick={handleBlock}>{
          isCurrntUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User blocked." : "Block User"
        }</button>

        {/* Logout button */}
        <button className="logout" onClick={()=>auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;
