import { useEffect, useState } from "react";
import "./chatlist.css";
import AddUser from "./addUser/addUser";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const chatData = res.data()?.chats || [];

      const promises = chatData.map(async (chat) => {
        const userDocRef = doc(db, "users", chat.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const chatDocRef = doc(db, "chats", chat.chatId);
        const chatDocSnap = await getDoc(chatDocRef);
        const messages = chatDocSnap.exists() ? chatDocSnap.data()?.messages || [] : [];

        return { ...chat, user: userDocSnap.data(), lastMessage: messages.length ? messages[messages.length - 1] : null };
      });

      const updatedChats = await Promise.all(promises);
      setChats(updatedChats.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unSub();
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map(({ user, ...rest }) => rest);
    const chatIndex = userChats.findIndex((c) => c.chatId === chat.chatId);

    if (chatIndex !== -1) {
      userChats[chatIndex].isSeen = true;

      const userChatsRef = doc(db, "userchats", currentUser.id);
      try {
        await updateDoc(userChatsRef, { chats: userChats });
        changeChat(chat.chatId, chat.user);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="Search Icon" />
          <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)} />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Toggle Add User"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
          title={addMode ? "Remove" : "Add"}
        />
      </div>

      {filteredChats.map((chat) => {
        const lastMsg = chat.lastMessage;
        let displayMessage = "No messages yet";

        if (lastMsg) {
          displayMessage = lastMsg.text || (lastMsg.img ? "Image Sent" : "No messages yet");
        }

        return (
          <div
            className="item"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}
          >
            <img
              src={chat.user.blocked?.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"}
              alt="User Avatar"
            />
            <div className="texts">
              <span>{chat.user.blocked?.includes(currentUser.id) ? "User" : chat.user.username}</span>
              <p>{displayMessage}</p>
            </div>
          </div>
        );
      })}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
