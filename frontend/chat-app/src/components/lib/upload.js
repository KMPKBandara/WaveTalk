import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

// Function to upload a file to Firebase Storage
const upload = async (file) => {
  const date = new Date();  // Create a timestamp for unique file naming
  const storageRef = ref(storage, `images/${date + file.name}`);

// Start the file upload with resumable upload support
  const uploadTask = uploadBytesResumable(storageRef, file);

// Return a Promise to handle asynchronous operations
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        reject("Something went wrong!" + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;
