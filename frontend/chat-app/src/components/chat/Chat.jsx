import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import upload from "../lib/upload";
import Tesseract from "tesseract.js";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false); // Track camera state
  const [isListening, setIsListening] = useState(false); // Track mic state
  const [otherUser, setOtherUser] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrntUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch the chat data
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  // Fetch the other user's details
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.id);  // Fetch the other user's document by their ID
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setOtherUser(userSnapshot.data());  // Set the other user's data to state
        }
      }
    };

    fetchOtherUser();
  }, [user]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return; // Don't send empty messages

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          userChatsData.chats[chatIndex].lastMessage = text || imgUrl ? "Image sent" : "";
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }

    setImg({ file: null, url: "" });
    setText(""); // Clear input after sending
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Error accessing the camera", err);
      setIsCameraOpen(false); // Close camera if there's an error
    }
  };

  const takePicture = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setImg({
          file,
          url: URL.createObjectURL(blob),
        });
        await handleSend(); // Send the picture after capturing
      }
    }, "image/jpeg");

    // Stop the camera stream
    const stream = video.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop each track
    }

    setIsCameraOpen(false); // Close camera after taking picture
  };

  const cancelPicture = () => {
    // Stop the camera and clear any captured image data
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOpen(false); // Close camera
    setImg({ file: null, url: "" }); // Clear captured image data
  };

  const openMic = () => {
    setIsListening(true); // Set mic state to listening
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new window.SpeechRecognition();
    recognition.interimResults = true;

    recognition.addEventListener("result", (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join(" ");

      // Set the transcript as the chat message and send it directly
      setText(transcript);

      if (e.results[0].isFinal) {
        handleSend(); // Send the message immediately once speech recognition is done
      }
    });

    recognition.addEventListener("end", () => {
      setIsListening(false); 
    });

    recognition.start();
  };

const scanText = async () => {
  if (!chat?.messages?.length && !img.url) {
    console.log("No images found for scanning.");
    return;
  }

  // Get the last image message
  const lastImageMessage = chat?.messages
    ?.filter((message) => message.img) // Only images
    ?.pop(); // Get the last one

  const imageUrl = lastImageMessage?.img || img.url;

  if (!imageUrl) {
    console.log("No valid image URL found.");
    return;
  }

  console.log("Scanning image:", imageUrl); // Debug log

  try {
    setText("Scanning..."); // Temporary UI feedback

    const { data } = await Tesseract.recognize(imageUrl, "eng");

    console.log("Extracted text:", data.text); // Debugging output

    setText(data.text.trim() || "No text found.");
  } catch (error) {
    console.error("Error scanning text:", error);
    setText("Scan failed. Try again.");
  }
};


  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{otherUser?.about || "No about details provided."}</p> {/* Show other user's about details */}
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" title="call" />
          <img src="./video.png" alt="" title="video call"/>
          <img src="./info.png" alt="" title="more details" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      {isCameraOpen && (
        <div className="camera">
          <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />
          <button 
            onClick={takePicture} 
            style={{
              backgroundColor: 'blue', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              cursor: 'pointer', 
              marginRight: '20px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseDown={(e) => e.target.style.backgroundColor = 'lightblue'}
            onMouseUp={(e) => e.target.style.backgroundColor = 'blue'}
          >
            Take Picture
          </button>

          <button 
            onClick={cancelPicture} 
            style={{
              backgroundColor: 'blue', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              cursor: 'pointer', 
              marginRight: '20px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseDown={(e) => e.target.style.backgroundColor = 'lightblue'}
            onMouseUp={(e) => e.target.style.backgroundColor = 'blue'}
          >
            Cancel
          </button>
        </div>
      )}

<div className="bottom">
  <div className="icons">
    <label htmlFor="file">
      <img src="./img.png" alt="" title="open files" />
    </label>
    <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
    
    <img 
      src="./camera.png" 
      alt="camera" 
      onClick={openCamera} 
      title="open camera" 
    />
    
    <img 
      src="./mic.png" 
      alt="microphone" 
      onClick={openMic} 
      title="open mic" 
    />

<img 
      src="./scan.png" 
      alt="scan text" 
      onClick={scanText} 
      title="scan text" 
    />

  </div>

  <input
    type="text"
    placeholder={isCurrntUserBlocked || isReceiverBlocked ? "You can't send messages" : "Type a message..."}
    value={text}
    onChange={(e) => setText(e.target.value)}
    disabled={isCurrntUserBlocked || isReceiverBlocked}
  />

  <div className="emoji">
    <img 
      src="./emoji.png" 
      alt="send emoji" 
      onClick={() => setOpen((prev) => !prev)} 
      title="send emoji" 
    />
    {open && (
      <div className="picker">
        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
      </div>
    )}
  </div>

  <button className="sendButton" onClick={handleSend} disabled={isCurrntUserBlocked || isReceiverBlocked}>
    Send
  </button>
</div>

    </div>
  );
};

export default Chat;