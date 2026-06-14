"use client";

interface OnlineUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursorPosition?: number;
}

interface OnlineUsersListProps {
  users: OnlineUser[];
  maxDisplay?: number;
}

export function OnlineUsersList({ users, maxDisplay = 5 }: OnlineUsersListProps) {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-semibold shadow-sm cursor-pointer group"
            style={{ backgroundColor: user.color }}
            title={`${user.name || user.email} - 位置: ${user.cursorPosition ?? "?"}`}
          >
            <span className="uppercase">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {user.name || user.email}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold">
            +{remainingCount}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {users.length} 人在线
      </span>
    </div>
  );
}
