
import {
  useEffect,
  useState,
  useRef,
} from "react";

import API from "../services/api";
import socket from "../socket";
import MessageBubble from "./MessageBubble";

import EmojiPicker from "emoji-picker-react";

function ChatArea({
  selectedUser,
}) {

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [typing, setTyping] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [lastSeen, setLastSeen] =
    useState("");

  const [
    showEmojiPicker,
    setShowEmojiPicker,
  ] = useState(false);

  const [
    replyingMessage,
    setReplyingMessage,
  ] = useState(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const messagesEndRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  const emojiPickerRef =
    useRef(null);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const notificationSound =
    useRef(
      new Audio("/notification.mp3")
    );

  // ======================
  // JOIN SOCKET
  // ======================

  useEffect(() => {

    if (!socket.connected) {

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

        console.log(
          "ONLINE USERS:",
          users
        );

        setOnlineUsers(
          users.map((id) =>
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
  // AUTO SCROLL
  // ======================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // ======================
  // FETCH MESSAGES
  // ======================

  useEffect(() => {

    if (
      selectedUser
    ) {

      fetchMessages();
    }

  }, [selectedUser]);

  const fetchMessages =
    async () => {

      try {

        const res =
          await API.get(
            `/messages/${currentUser.id}/${selectedUser.id}`
          );

        setMessages(
          res.data
        );

        // LAST SEEN
        if (
          res.data.length > 0
        ) {

          const lastMsg =
            res.data[
              res.data.length - 1
            ];

          const lastTime =
            new Date(
              lastMsg.created_at
            );

          setLastSeen(
            formatLastSeen(
              lastTime
            )
          );
        }

        // IMPORTANT
        // MARK READ INSTANTLY

        socket.emit(
          "mark_read",
          {
            sender_id:
              selectedUser.id,

            receiver_id:
              currentUser.id,
          }
        );

      } catch (error) {

        console.log(error);

      }
    };

  // ======================
  // FORMAT LAST SEEN
  // ======================

  const formatLastSeen =
    (date) => {

      const now =
        new Date();

      const diff =
        Math.floor(
          (now - date) / 1000
        );

      if (diff < 60) {

        return "Last seen just now";
      }

      if (diff < 3600) {

        const mins =
          Math.floor(
            diff / 60
          );

        return `Last seen ${mins} min ago`;
      }

      if (diff < 86400) {

        const hrs =
          Math.floor(
            diff / 3600
          );

        return `Last seen ${hrs} hr ago`;
      }

      const days =
        Math.floor(
          diff / 86400
        );

      return `Last seen ${days} day ago`;
    };

  // ======================
  // FILE CHANGE
  // ======================

  const handleFileChange =
    (e) => {

      setSelectedFile(
        e.target.files[0]
      );
    };

  // ======================
  // START RECORDING
  // ======================

  const startRecording =
    async () => {

      try {

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

        const mediaRecorder =
          new MediaRecorder(stream);

        mediaRecorderRef.current =
          mediaRecorder;

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable =
          (event) => {

            audioChunksRef.current.push(
              event.data
            );
          };

        mediaRecorder.onstop =
          async () => {
            
            stream.getTracks().forEach(
              track => track.stop()
            );

            const audioBlob =
              new Blob(
                audioChunksRef.current,
                {
                  type:
                    "audio/webm",
                }
              );

            const formData =
              new FormData();

            formData.append(
              "file",
              audioBlob,
              "voice.webm"
            );

          try {

            const uploadRes =
              await API.post(
                "/upload",
                formData,
                {
                  headers: {
                    "Content-Type":
                      "multipart/form-data",
                  },
                }
              );

            const voiceUrl =
              uploadRes.data.fileUrl;

            socket.emit(
              "send_message",
              {
                sender_id:
                  currentUser.id,

                receiver_id:
                  selectedUser.id,

                message: "",

                file_url:
                  voiceUrl,

                reply_to:
                  replyingMessage?.id ||
                  null,
              }
            );

            setReplyingMessage(null);

          } catch (err) {

            console.log(err);

          }
        };

        mediaRecorder.start(100);

        setIsRecording(true);

      } catch (err) {

        console.log(err);

      }
    };

  // ======================
  // STOP RECORDING
  // ======================

  const stopRecording =
    () => {

      if (
        mediaRecorderRef.current
      ) {

        mediaRecorderRef.current.stop();

        setIsRecording(false);
      }
    };

  // ======================
  // EMOJI SELECT
  // ======================

  const handleEmojiClick =
    (emojiData) => {

      setMessage(
        (prev) =>
          prev +
          emojiData.emoji
      );
    };

  // ======================
  // CLOSE EMOJI PICKER
  // ======================

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(
            event.target
          )
        ) {

          setShowEmojiPicker(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  // ======================
  // SEND MESSAGE
  // ======================

  const sendMessage =
    async () => {

      if (
        !message.trim() &&
        !selectedFile
      ) return;

      let fileUrl = null;

      if (
        selectedFile
      ) {

        const formData =
          new FormData();

        formData.append(
          "file",
          selectedFile
        );

        try {

          const uploadRes =
            await API.post(
              "/upload",
              formData,
              {
                headers: {
                  "Content-Type":
                    "multipart/form-data",
                },
              }
            );

          fileUrl =
            uploadRes.data.fileUrl;

        } catch (error) {

          console.log(error);
          return;

        }
      }

      const messageData = {

        sender_id:
          currentUser.id,

        receiver_id:
          selectedUser.id,

        message:
          message.trim(),

        file_url:
          fileUrl,

        reply_to:
          replyingMessage?.id || null,

      };

      socket.emit(
        "send_message",
        messageData
      );

      setMessage("");

      setSelectedFile(null);

      setShowEmojiPicker(false);

      setReplyingMessage(null);
    };

  // ======================
  // RECEIVE MESSAGE
  // ======================

  useEffect(() => {

    const receiveMessageHandler =
      (data) => {

        // --- QUICK TEST REPLACEMENT BLOCK START ---
        if (
          data.sender_id !==
          currentUser.id
        ) {

          console.log("NEW MESSAGE RECEIVED");

          socket.emit(
            "message_received",
            {
              message_id:
                data.id,
            }
          );
        }
        // --- QUICK TEST REPLACEMENT BLOCK END ---

        const isCurrentChat =
          selectedUser &&
          (
            data.sender_id ===
              selectedUser.id ||

            data.receiver_id ===
              selectedUser.id
          );

        if (
          isCurrentChat
        ) {

          setMessages(
            (prev) => {

              const exists =
                prev.some(
                  (msg) =>
                    msg.id ===
                    data.id
                );

              if (exists)
                return prev;

              return [
                ...prev,
                data,
              ];
            }
          );

          // IMPORTANT
          // AUTO BLUE TICK

          if (
            data.sender_id !==
            currentUser.id
          ) {

            socket.emit(
              "mark_read",
              {
                sender_id:
                  data.sender_id,

                receiver_id:
                  currentUser.id,
              }
            );
          }
        }
      };

    socket.on(
      "receive_message",
      receiveMessageHandler
    );

    return () => {

      socket.off(
        "receive_message",
        receiveMessageHandler
      );

    };

  }, [
    selectedUser,
  ]);

  // ======================
  // REALTIME BLUE TICKS
  // ======================

  useEffect(() => {

    const seenHandler =
      ({
        sender_id,
        receiver_id,
      }) => {

        console.log(
          "MESSAGES SEEN"
        );

        setMessages(
          (prev) =>
            prev.map(
              (msg) => {

                if (

                  msg.sender_id.toString() ===
                  sender_id.toString()

                  &&

                  msg.receiver_id.toString() ===
                  receiver_id.toString()

                ) {

                  return {
                    ...msg,
                    is_read: true,
                  };
                }

                return msg;
              }
            )
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
  // DELETE MESSAGE
  // ======================

  useEffect(() => {

    const deleteHandler =
      ({
        message_id,
      }) => {

        setMessages(
          (prev) =>
            prev.filter(
              (msg) =>
                msg.id !==
                message_id
            )
        );
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

  const deleteMessage =
    (msg) => {

      socket.emit(
        "delete_message",
        {
          message_id:
            msg.id,

          sender_id:
            msg.sender_id,

          receiver_id:
            msg.receiver_id,
        }
      );
    };

  // ======================
  // TYPING
  // ======================

  const handleTyping =
    (e) => {

      setMessage(
        e.target.value
      );

      if (
        selectedUser
      ) {

        socket.emit(
          "typing",
          {
            sender_id:
              currentUser.id,

            receiver_id:
              selectedUser.id,
          }
        );

        clearTimeout(
          typingTimeoutRef.current
        );

        typingTimeoutRef.current =
          setTimeout(() => {

            socket.emit(
              "stop_typing",
              {
                sender_id:
                  currentUser.id,

                receiver_id:
                  selectedUser.id,
              }
            );

          }, 1000);
      }
    };

  // ======================
  // RECEIVE TYPING
  // ======================

  useEffect(() => {

    const typingHandler =
      (data) => {

        if (
          data.sender_id ===
          selectedUser?.id
        ) {

          setTyping(true);
        }
      };

    const stopTypingHandler =
      (data) => {

        if (
          data.sender_id ===
          selectedUser?.id
        ) {

          setTyping(false);
        }
      };

    socket.on(
      "typing",
      typingHandler
    );

    socket.on(
      "stop_typing",
      stopTypingHandler
    );

    return () => {

      socket.off(
        "typing",
        typingHandler
      );

      socket.off(
        "stop_typing",
        stopTypingHandler
      );

    };

  }, [selectedUser]);

  // ======================
  // ONLINE STATUS
  // ======================

  const isUserOnline =
    selectedUser &&
    onlineUsers.includes(
      selectedUser.id.toString()
    );

  // ======================
  // NO USER
  // ======================

  if (
    !selectedUser
  ) {

    return (

      <div className="flex-1 bg-black flex items-center justify-center text-gray-500 text-2xl">

        Select a user to start chatting

      </div>

    );
  }

  // ======================
  // UI
  // ======================

  return (

    <div className="flex-1 bg-black flex flex-col relative overflow-hidden">

      {/* HEADER */}

      <div className="h-[80px] border-b border-zinc-800 flex flex-col justify-center px-6 shrink-0">

        <h2 className="text-2xl font-semibold text-white">

          {selectedUser.username}

        </h2>

        <p className="text-sm text-gray-400">

          {isUserOnline ? (

            <span className="text-green-400">

              ● Online

            </span>

          ) : (

            lastSeen

          )}

        </p>

        {typing && (

          <p className="text-green-400 text-sm animate-pulse">

            typing...

          </p>

        )}

      </div>

      {/* MESSAGES */}

      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto overflow-x-hidden min-w-0">

        {messages.map(
          (msg, index) => (

            <div
              key={
                msg.id || index
              }
              className={`flex w-full ${
                msg.sender_id ===
                currentUser.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div className="relative group w-fit max-w-[75%] min-w-0">

                <MessageBubble
                  ownMessage={
                    msg.sender_id ===
                    currentUser.id
                  }
                  text={
                    msg.message
                  }
                  fileUrl={
                    msg.file_url
                  }
                  isRead={
                    msg.is_read
                  }
                  isDelivered={
                    msg.is_delivered
                  }
                  createdAt={
                    msg.created_at
                  }
                  messageId={
                    msg.id
                  }
                  senderId={
                    msg.sender_id
                  }
                  receiverId={
                    msg.receiver_id
                  }
                  replyMessage={
                    msg.reply_message
                  }
                />

                <div className="hidden group-hover:flex gap-2 mt-1">

                  <button
                    onClick={() =>
                      setReplyingMessage(
                        msg
                      )
                    }
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-1 rounded"
                  >
                    Reply
                  </button>

                  {msg.sender_id ===
                    currentUser.id && (

                    <button
                      onClick={() =>
                        deleteMessage(
                          msg
                        )
                      }
                      className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>

                  )}

                </div>

              </div>

            </div>

          )
        )}

        <div
          ref={messagesEndRef}
        />

      </div>

      {/* INPUT */}

      <div className="border-t border-zinc-800 p-4 flex flex-col gap-3 relative shrink-0">

        <div className="flex items-center gap-3 relative">

          <input
            type="file"
            onChange={
              handleFileChange
            }
            className="hidden"
            id="fileInput"
          />

          <label
            htmlFor="fileInput"
            className="cursor-pointer text-2xl shrink-0"
          >
            📎
          </label>

          <button
            onClick={() =>
              setShowEmojiPicker(
                !showEmojiPicker
              )
            }
            className="text-2xl hover:scale-110 transition-all shrink-0"
          >
            😊
          </button>

          {showEmojiPicker && (

            <div
              ref={emojiPickerRef}
              className="absolute bottom-20 left-16 z-50"
            >

              <EmojiPicker
                onEmojiClick={
                  handleEmojiClick
                }
                theme="dark"
                height={400}
                width={320}
              />

            </div>

          )}

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={
              handleTyping
            }
            onKeyDown={(e) => {

              if (
                e.key ===
                "Enter"
              ) {

                sendMessage();
              }
            }}
            className="flex-1 min-w-0 bg-zinc-900 rounded-xl px-4 py-3 outline-none text-white"
          />

          <button
            disabled={!selectedUser}
            onClick={
              isRecording
                ? stopRecording
                : startRecording
            }
            className={`px-4 py-3 rounded-xl font-semibold text-white ${
              isRecording
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {isRecording
              ? "⏹ Stop"
              : "🎤 Voice"}
          </button>

          <button
            onClick={sendMessage}
            className="bg-green-500 hover:bg-green-400 transition-all duration-300 text-black px-6 py-3 rounded-xl font-semibold shrink-0"
          >
            Send
          </button>

        </div>
        
        {isRecording && (
          <p className="text-red-400 text-sm animate-pulse">
            Recording voice...
          </p>
        )}

      </div>

    </div>

  );
}

export default ChatArea;
