import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/list";
import Login from "./components/login/Login";
<<<<<<< HEAD
import Notification from "./components/notification/notification";

=======
import Notification from "./components/notification/Notification";
>>>>>>> 75a9489f9808b5f1dc2a40eb0275780916a33903


const App = () => {
  const user = true;

  return (
    <div className="container">
      {user ? (
          <>
          <List />
          <Chat />
          <Detail />
          </>
        ) : (
        <Login />
      )}
      <Notification/>
    </div>
  );
};

export default App;
