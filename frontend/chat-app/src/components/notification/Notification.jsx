import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Importing the default styling for toast notifications

const Notification = () => {
  return (
    <div className=''>
        <ToastContainer position="bottom-right"/>
    </div>
  )
}

export default Notification // Exporting the Notification component for use in other parts of the application
