import{useEffect, useState} from "react";
import './chatlist.css';
import AddUser from "./addUser/addUser";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";

const ChatList = () => {
  const[chats,setChats]= useState([]);
  const[addMode,setAddMode]= useState(false);

  const {currentUser} = useUserStore();
  const {chatId,changeChat} = useChatStore();

  useEffect(() => {
      const unSub = onSnapshot(
        doc(db,"userchats", currentUser.id),
        async(res) =>{
      const item = res.data().chats;

      const promises = item.map(async(item) => {
        const userDocRef = doc(db,"users",item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data();

        return {...item, user};
      });

      const chatData = await Promise.all(promises);

      setChats(chatData.sort((a,b)=> b.updatedAt - a.updatedAt));
    }
  );
    
    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (Chat)=>{
  
    const userChats = chats.map((item) => {
      const {user, ...rest} = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === Chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef,{
        chats: userChats,
      });
      changeChat(Chat.chatId,Chat.user);
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src='./search.png' alt=''/>
          <input type="text" placeholder='Search'/>
        </div>
        <img 
          src={addMode ? "./minus.png" : "./plus.png"}
          alt='' className='add'
          onClick={() => setAddMode((prev) => !prev)}
          />
      </div>

      {chats.map((Chat) => (
      <div className="item" key={Chat.chatId} onClick={()=>handleSelect(Chat)}
      style={{
        backgroundColor: Chat?.isSeen ? "transparent" : "#5183fe",
      }}
      >
        <img src={Chat.user.avatar || "./avatar.png"} alt="" />
        <div className="texts">
          <span>{Chat.user.username}</span>
          <p>{Chat.lastMessage}</p>
        </div>
      </div>
      ))};

      {addMode && <AddUser/>}

    </div>
  );
};

export default ChatList;