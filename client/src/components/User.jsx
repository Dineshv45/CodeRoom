import Avatar from "react-avatar";

const COLORS = [
  "#60A5FA", // blue-400
  "#4ADE80", // green-400
  "#A78BFA", // violet-400
  "#FBBF24", // amber-400
  "#F87171", // red-400
  "#22D3EE", // cyan-400
];


function getAvatarColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}


function User({ username }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Avatar name={username} round={true} size="40" color= {getAvatarColor(username)}/>
      <span className="text-xs text-neutral-300 truncate">
        {username}
      </span>
    </div>
  );
}

export default User;
