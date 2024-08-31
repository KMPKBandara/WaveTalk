import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { useUserStore } from "./userStore";

export const useChatStore = create( (set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    changeChat: (chatId,user)=>{
        const currentUser=useUserStore.getState().currentUser

        //CHECK IF CURRENT USER IS BLOCKED
        //CHECK IF RECEIVER IS BLOCKED
    }

    
}));