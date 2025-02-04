import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore"; 
import { useChatStore } from "../lib/chatStore";
import { auth, db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import { useEffect, useState } from "react";
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrntUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  const [otherUser, setOtherUser] = useState(null);
  const [showPrivacyHelp, setShowPrivacyHelp] = useState(false);

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.id);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        setOtherUser(userSnapshot.data());
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

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className='detail'>
      <div className="user">
        <img src={otherUser?.avatar || "./avatar.png"} alt="Other User Avatar" />
        <h2>{otherUser?.username}</h2>
        <p>{otherUser?.about || "No about details provided."}</p>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowDown.png" alt="" title="show more"/>
          </div>
        </div>

        <div className="option">
          <div className="title" onClick={() => setShowPrivacyHelp(!showPrivacyHelp)}>
            <span>Privacy & Help</span>
            <img src="./arrowDown.png" alt="" title="show more" className={showPrivacyHelp ? "rotate" : ""}/>
          </div>
          {showPrivacyHelp && (
            <div className="dropdown">
              <p><strong>Privacy Policy:</strong> Your data is encrypted, and we do not share your personal information with third parties.</p>
              <p><strong>Help Center:</strong> If you encounter issues, please contact our support team at support@example.com.</p>
            </div>
          )}
        </div>

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

        <button onClick={handleBlock}>
          {isCurrntUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "Unblock User" : "Block User"}
        </button>

        <button className="logout" onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;
