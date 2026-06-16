import { useState } from "react";

import Sidebar from "../components/Sidebar";

import ChatArea from "../components/ChatArea";

function Chat() {

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [unreadMessages, setUnreadMessages] =
    useState({});

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">

      <Sidebar
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        unreadMessages={unreadMessages}
        setUnreadMessages={setUnreadMessages}
      />

      <ChatArea
        selectedUser={selectedUser}
        unreadMessages={unreadMessages}
        setUnreadMessages={setUnreadMessages}
      />

    </div>
  );
}

export default Chat;