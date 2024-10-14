import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import upload from "../lib/upload";

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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrntUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

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

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
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
    transition: 'background-color 0.3s ease'
  }}
  onMouseDown={(e) => e.target.style.backgroundColor = 'lightblue'}
  onMouseUp={(e) => e.target.style.backgroundColor = 'blue'}
>
  Cancel
</button>
 {/* Cancel button */}
        </div>
      )}

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="" onClick={openCamera} /> {/* Open camera */}
          <img src="./mic.png" alt="" onClick={openMic} /> {/*Mic On*/}
        </div>
        <input
          type="text"
          placeholder={isCurrntUserBlocked || isReceiverBlocked ? "You can't send messages" : "Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrntUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled={isCurrntUserBlocked || isReceiverBlocked}>
          Send
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} /> {/* Hidden canvas for image capturing */}
    </div>
  );
};

export default Chat;
