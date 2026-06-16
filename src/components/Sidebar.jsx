import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

import socket from "../socket";

import UserCard from "./UserCard";

function Sidebar({
  selectedUser,
  setSelectedUser,
  unreadMessages,
  setUnreadMessages,
}) {

  const [users, setUsers] =
    useState([]);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [lastMessages, setLastMessages] =
    useState({});

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  // ======================
  // FETCH USERS
  // ======================

  useEffect(() => {

    fetchUsers();

    fetchUnreadCounts();

  }, []);

  const fetchUsers = async () => {

    try {

      const res =
        await API.get("/users");

      const filteredUsers =
        res.data.filter(
          (user) =>
            user.id !==
            currentUser.id
        );

      setUsers(filteredUsers);

      // ======================
      // FETCH LAST MESSAGES
      // ======================

      filteredUsers.forEach(
        async (user) => {

          try {

            const msgRes =
              await API.get(
                `/messages/${currentUser.id}/${user.id}`
              );

            const msgs =
              msgRes.data;

            if (
              msgs.length > 0
            ) {

              const lastMsg =
                msgs[
                  msgs.length - 1
                ];

              setLastMessages(
                (prev) => ({
                  ...prev,
                  [user.id]:
                    lastMsg,
                })
              );

            } else {

              setLastMessages(
                (prev) => ({
                  ...prev,
                  [user.id]:
                    null,
                })
              );
            }

          } catch (error) {

            console.log(error);

          }
        }
      );

    } catch (error) {

      console.log(error);

    }
  };

  // ======================
  // FETCH UNREAD COUNTS
  // ======================

  const fetchUnreadCounts =
    async () => {

      try {

        const res =
          await API.get(
            `/unread/${currentUser.id}`
          );

        const unreadObj = {};

        res.data.forEach(
          (item) => {

            unreadObj[
              item.sender_id
            ] = parseInt(
              item.unread_count
            );
          }
        );

        setUnreadMessages(
          unreadObj
        );

      } catch (error) {

        console.log(error);

      }
    };

  // ======================
  // SOCKET CONNECT
  // ======================

  useEffect(() => {

    if (
      !socket.connected
    ) {

      socket.connect();

    }

    if (
      currentUser?.id
    ) {

      socket.emit(
        "join",
        currentUser.id.toString()
      );
    }

  }, []);

  // ======================
  // ONLINE USERS
  // ======================

  useEffect(() => {

    const onlineHandler =
      (users) => {

        setOnlineUsers(
          users.map(
            (id) =>
              id.toString()
          )
        );
      };

    socket.on(
      "online_users",
      onlineHandler
    );

    return () => {

      socket.off(
        "online_users",
        onlineHandler
      );

    };

  }, []);

  // ======================
  // RECEIVE MESSAGE
  // ======================

  useEffect(() => {

    const receiveHandler =
      (data) => {

        const otherUserId =
          data.sender_id ===
          currentUser.id
            ? data.receiver_id
            : data.sender_id;

        // UPDATE LAST MESSAGE

        setLastMessages(
          (prev) => ({
            ...prev,
            [otherUserId]:
              data,
          })
        );

        // UPDATE UNREAD

        if (
          data.sender_id !==
            currentUser.id &&
          selectedUser?.id !==
            data.sender_id
        ) {

          setUnreadMessages(
            (prev) => ({
              ...prev,
              [data.sender_id]:
                (
                  prev[
                    data.sender_id
                  ] || 0
                ) + 1,
            })
          );
        }
      };

    socket.on(
      "receive_message",
      receiveHandler
    );

    return () => {

      socket.off(
        "receive_message",
        receiveHandler
      );

    };

  }, [selectedUser]);

  // ======================
  // MESSAGE SEEN
  // ======================

  useEffect(() => {

    const seenHandler =
      ({
        sender_id,
        receiver_id,
      }) => {

        setLastMessages(
          (prev) => {

            const updated = {
              ...prev,
            };

            Object.keys(updated).forEach(
              (key) => {

                const msg =
                  updated[key];

                if (
                  msg &&
                  msg.sender_id === sender_id &&
                  msg.receiver_id === receiver_id
                ) {

                  updated[key] = {
                    ...msg,
                    is_read: true,
                  };
                }
              }
            );

            return updated;
          }
        );
      };

    socket.on(
      "messages_seen",
      seenHandler
    );

    return () => {

      socket.off(
        "messages_seen",
        seenHandler
      );

    };

  }, []);

  // ======================
  // MESSAGE DELIVERED
  // ======================

  useEffect(() => {

    const deliveredHandler =
      ({
        message_id,
      }) => {

        setLastMessages(
          (prev) => {

            const updated = {
              ...prev,
            };

            Object.keys(updated).forEach(
              (key) => {

                const msg =
                  updated[key];

                if (
                  msg &&
                  msg.id ===
                    message_id
                ) {

                  updated[key] = {
                    ...msg,
                    is_delivered: true,
                  };
                }
              }
            );

            return updated;
          }
        );
      };

    socket.on(
      "message_delivered",
      deliveredHandler
    );

    return () => {

      socket.off(
        "message_delivered",
        deliveredHandler
      );

    };

  }, []);

  // ======================
  // MESSAGE DELETE
  // ======================

  useEffect(() => {

    const deleteHandler =
      async ({
        message_id,
        sender_id,
        receiver_id,
        decrease_unread,
      }) => {

        const otherUserId =
          sender_id ===
          currentUser.id
            ? receiver_id
            : sender_id;

        // DECREASE UNREAD

        if (
          decrease_unread &&
          sender_id !==
            currentUser.id
        ) {

          setUnreadMessages(
            (prev) => ({

              ...prev,

              [sender_id]:
                Math.max(
                  (
                    prev[
                      sender_id
                    ] || 0
                  ) - 1,
                  0
                ),

            })
          );
        }

        // REFRESH LAST MESSAGE

        try {

          const res =
            await API.get(
              `/messages/${currentUser.id}/${otherUserId}`
            );

          const msgs =
            res.data;

          if (
            msgs.length > 0
          ) {

            setLastMessages(
              (prev) => ({
                ...prev,
                [otherUserId]:
                  msgs[
                    msgs.length - 1
                  ],
              })
            );

          } else {

            setLastMessages(
              (prev) => ({
                ...prev,
                [otherUserId]:
                  null,
              })
            );
          }

        } catch (error) {

          console.log(error);

        }
      };

    socket.on(
      "message_deleted",
      deleteHandler
    );

    return () => {

      socket.off(
        "message_deleted",
        deleteHandler
      );

    };

  }, []);

  // ======================
  // SELECT USER
  // ======================

  const handleSelectUser =
    async (user) => {

      setSelectedUser(user);

      try {

        await API.put(
          "/unread/mark-read",
          {
            sender_id:
              user.id,
            receiver_id:
              currentUser.id,
          }
        );

      } catch (error) {

        console.log(error);

      }

      // CLEAR BADGE

      setUnreadMessages(
        (prev) => ({
          ...prev,
          [user.id]: 0,
        })
      );
    };

  // ======================
  // LOGOUT
  // ======================

  const handleLogout = () => {

    socket.emit(
      "logout",
      currentUser.id
    );

    socket.disconnect();

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href =
      "/login";
  };

  // ======================
  // FORMAT MESSAGE
  // ======================

  const formatMessage =
    (msg) => {

      if (!msg)
        return "No messages yet";

      if (msg.file_url) {

        return "📎 File";

      }

      if (
        !msg.message
      ) {

        return "Message";
      }

      return msg.message;
    };

  // ======================
  // FORMAT TIME
  // ======================

  const formatTime =
    (dateString) => {

      if (!dateString)
        return "";

      const date =
        new Date(dateString);

      return date.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute:
            "2-digit",
        }
      );
    };

  // ======================
  // SORT USERS
  // ======================

  const sortedUsers =
    [...users].sort(
      (a, b) => {

        const aMsg =
          lastMessages[a.id];

        const bMsg =
          lastMessages[b.id];

        if (!aMsg) return 1;

        if (!bMsg) return -1;

        return (
          new Date(
            bMsg.created_at
          ) -
          new Date(
            aMsg.created_at
          )
        );
      }
    );

  // ======================
  // UI
  // ======================

  return (

    <div className="w-[30%] bg-zinc-900 border-r border-zinc-800 h-full p-4 overflow-y-auto">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-3xl font-bold text-green-400">
          Chats
        </h1>

        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

      </div>

      {/* USERS */}

      <div className="space-y-3">

        {sortedUsers.map(
          (user) => {

            const lastMsg =
              lastMessages[
                user.id
              ];

            return (

              <div
                key={user.id}
                onClick={() =>
                  handleSelectUser(
                    user
                  )
                }
                className={`cursor-pointer rounded-2xl transition-all duration-300 p-3 ${
                  selectedUser?.id ===
                  user.id
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800/50"
                }`}
              >

                {/* USER CARD */}

                <div className="flex items-start justify-between">

                  <div className="flex-1">

                    <UserCard
                      user={user}
                      isOnline={onlineUsers.includes(
                        user.id.toString()
                      )}
                      unreadCount={
                        unreadMessages[
                          user.id
                        ] || 0
                      }
                    />

                  </div>

                  {/* TIME */}

                  <div className="text-xs text-gray-500 mt-1">

                    {formatTime(
                      lastMsg?.created_at
                    )}

                  </div>

                </div>

                {/* LAST MESSAGE */}

                <div className="ml-16 mt-1 flex items-center justify-between gap-2">

                  <p className="text-sm text-gray-400 truncate max-w-[180px]">

                    {formatMessage(
                      lastMsg
                    )}

                  </p>

                  {/* UNREAD BADGE */}

                  {unreadMessages[
                    user.id
                  ] > 0 && (

                    <div className="min-w-[22px] h-[22px] px-1 rounded-full bg-green-500 text-black text-xs font-bold flex items-center justify-center">

                      {
                        unreadMessages[
                          user.id
                        ]
                      }

                    </div>

                  )}

                </div>

              </div>

            );
          }
        )}

      </div>

      {/* LOGOUT */}

      <button
        onClick={handleLogout}
        className="w-full mt-6 bg-red-500 hover:bg-red-400 transition-all duration-300 p-3 rounded-xl font-semibold"
      >
        Logout
      </button>

    </div>

  );
}

export default Sidebar;