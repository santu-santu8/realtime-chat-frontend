import socket from "../socket";

function MessageBubble({
  ownMessage,
  text,
  fileUrl,
  isRead,
  isDelivered,
  createdAt,
  messageId,
  senderId,
  receiverId,
  replyMessage,
}) {

  // ======================
  // FORMAT TIME
  // ======================

  const formatTime = (time) => {

    if (!time) return "";

    return new Date(time).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ======================
  // FILE URL
  // ======================

  const fullFileUrl =
    fileUrl
      ? `https://realtime-chat-backend-5kgp.onrender.com${fileUrl}`
      : "";

  // ======================
  // CHECK FILE TYPES
  // ======================

  const isImage = fileUrl
    ? /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)
    : false;

  const isVoiceMessage = fileUrl
    ? /\.(webm|mp3|wav|ogg|m4a)$/i.test(fileUrl)
    : false;

  // ======================
  // GET FILE NAME
  // ======================

  const getFileName = () => {

    if (!fileUrl) return "File";

    return fileUrl.split("/").pop();
  };

  // ======================
  // STATUS ICON
  // ======================

  const renderStatus = () => {

    if (isRead) {

      return (
        <span className="text-blue-400 ml-1">
          ✓✓
        </span>
      );
    }

    if (isDelivered) {

      return (
        <span className="text-gray-300 ml-1">
          ✓✓
        </span>
      );
    }

    return (
      <span className="text-gray-400 ml-1">
        ✓
      </span>
    );
  };

  // ======================
  // DELETE MESSAGE
  // ======================

  const handleDelete = () => {

    const confirmDelete =
      window.confirm(
        "Delete this message?"
      );

    if (!confirmDelete) return;

    socket.emit(
      "delete_message",
      {
        message_id: messageId,
        sender_id: senderId,
        receiver_id: receiverId,
      }
    );
  };

  return (

    <div
      className={`flex w-full mb-3 ${
        ownMessage
          ? "justify-end"
          : "justify-start"
      }`}
    >

      <div
        className={`
          relative
          group
          w-fit
          max-w-[75%]
          min-w-[120px]
          px-4
          py-3
          rounded-2xl
          shadow-md
          overflow-hidden
          ${
            ownMessage
              ? "bg-green-500 text-black rounded-br-sm"
              : "bg-zinc-800 text-white rounded-bl-sm"
          }
        `}
      >

        {/* DELETE BUTTON */}
        {ownMessage && (

          <button
            onClick={handleDelete}
            className="
              absolute
              -top-2
              -right-2
              hidden
              group-hover:flex
              bg-red-500
              text-white
              text-xs
              w-6
              h-6
              rounded-full
              items-center
              justify-center
              z-20
            "
          >
            ✕
          </button>

        )}

        {/* REPLY MESSAGE */}
        {replyMessage && (

          <div className="bg-black/20 rounded-lg p-2 mb-2 border-l-4 border-white">

            <p className="text-xs opacity-70 mb-1">
              Replying to
            </p>

            <div
              className="text-sm italic"
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {replyMessage.message ||
               (
                 replyMessage.file_url
                   ? (
                       /\.(jpg|jpeg|png|gif|webp)$/i.test(replyMessage.file_url)
                         ? "📷 Image"
                         : /\.(webm|mp3|wav|ogg|m4a)$/i.test(replyMessage.file_url)
                           ? "🎤 Voice Message"
                           : "📎 Attachment"
                     )
                   : "Message"
               )}
            </div>

          </div>

        )}

        {/* IMAGE */}
        {isImage && (

          <a
            href={fullFileUrl}
            target="_blank"
            rel="noreferrer"
          >

            <img
              src={fullFileUrl}
              alt="chat-img"
              className="
                rounded-xl
                mb-2
                max-h-[320px]
                max-w-full
                object-cover
                cursor-pointer
                hover:opacity-90
                transition-all
              "
              onError={(e) => {

                e.target.style.display =
                  "none";
              }}
            />

          </a>

        )}

        {/* VOICE MESSAGE */}
        {isVoiceMessage && (

          <div className="mt-2">

            <audio
              controls
              preload="metadata"
              className="w-full max-w-[260px] h-9 outline-none"
            >
              <source src={fullFileUrl} />
              Your browser does not support audio.
            </audio>

          </div>

        )}

        {/* FILE */}
        {fileUrl &&
         !isImage &&
         !isVoiceMessage && (

          <a
            href={fullFileUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="
              flex
              items-center
              gap-3
              bg-black/20
              hover:bg-black/30
              transition-all
              p-3
              rounded-xl
              mt-2
              break-all
            "
          >

            <div className="text-2xl">
              📎
            </div>

            <div className="flex flex-col">

              <span className="text-sm font-medium">
                {getFileName()}
              </span>

              <span className="text-xs opacity-70">
                Click to open
              </span>

            </div>

          </a>

        )}

        {/* TEXT */}
        {text && (

          <div
            className="
              mt-2
              text-[15px]
              leading-6
            "
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              display: "block",
              width: "100%",
            }}
          >
            {text}
          </div>

        )}

        {/* TIME + STATUS */}
        <div className="flex items-center justify-end mt-2 text-[11px]">

          <span className="opacity-70">
            {formatTime(createdAt)}
          </span>

          {ownMessage &&
            renderStatus()}

        </div>

      </div>

    </div>

  );
}

export default MessageBubble;