import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage, db } from "./firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from "./userStore";

const upload = async (file, chatId) => {
  const date = new Date();
  const storageRef = ref(storage, `images/${date.getTime()}_${file.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        reject("Something went wrong! " + error.code);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const currentUser = useUserStore.getState().currentUser;

        try {
          const messageData = {
            img: downloadURL,
            senderId: currentUser.id,
            timestamp: new Date().getTime(),
          };

          const chatRef = doc(db, "chats", chatId);
          await updateDoc(chatRef, {
            messages: arrayUnion(messageData),
          });

          resolve(downloadURL);
        } catch (error) {
          reject("Failed to save image message: " + error.message);
        }
      }
    );
  });
};

export default upload;
