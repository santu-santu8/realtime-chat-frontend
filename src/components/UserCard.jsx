function UserCard({
  user,
  isOnline,
  unreadCount,
}) {

  return (
    <div
      className="
      w-full
      bg-zinc-800
      hover:bg-zinc-700
      transition-all
      duration-300
      p-4
      rounded-2xl
      cursor-pointer
      overflow-hidden
      "
    >

      <div className="flex items-center justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0 flex-1">

          {/* AVATAR */}
          <div className="relative shrink-0">

            <div
              className="
              w-12
              h-12
              rounded-full
              bg-green-500
              flex
              items-center
              justify-center
              text-black
              font-bold
              text-xl
              shadow-md
              "
            >
              {user?.username?.[0]
                ?.toUpperCase()}
            </div>

            {/* ONLINE DOT */}
            <div
              className={`
              absolute
              bottom-0
              right-0
              w-4
              h-4
              rounded-full
              border-2
              border-zinc-800
              transition-all
              duration-300
              ${
                isOnline
                  ? "bg-green-400 shadow-[0_0_10px_#4ade80]"
                  : "bg-gray-500"
              }
              `}
            ></div>

          </div>

          {/* USER INFO */}
          <div className="min-w-0 flex-1">

            <h2
              className="
              font-semibold
              text-lg
              text-white
              truncate
              "
            >
              {user.username}
            </h2>

            <p
              className={`
              text-sm
              truncate
              ${
                isOnline
                  ? "text-green-400"
                  : "text-gray-400"
              }
              `}
            >
              {isOnline
                ? "Online"
                : "Offline"}
            </p>

          </div>

        </div>

        {/* UNREAD BADGE */}
        {unreadCount > 0 && (

          <div
            className="
            shrink-0
            min-w-[26px]
            h-[26px]
            px-2
            rounded-full
            bg-green-500
            text-black
            text-xs
            font-bold
            flex
            items-center
            justify-center
            shadow-md
            animate-pulse
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </div>

        )}

      </div>

    </div>
  );
}

export default UserCard;