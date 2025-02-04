import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  lastMessage: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    // Check if the current user is blocked
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
        lastMessage: null,
      });
    }

    // Check if the receiver is blocked by the current user
    if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
        lastMessage: null,
      });
    }

    // Subscribe to Firestore for chat updates
    const unsubscribe = onSnapshot(doc(db, "chats", chatId), (docSnap) => {
      if (docSnap.exists()) {
        const chatData = docSnap.data();
        const lastMsg = chatData?.messages?.length
          ? chatData.messages[chatData.messages.length - 1]
          : null;

        set({ lastMessage: lastMsg });
      }
    });

    set({
      chatId,
      user,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });

    return () => unsubscribe();
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked }));
  },
}));
