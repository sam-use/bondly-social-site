import React from "react";

const SuggestedUser = ({ user }) => {
  return (
    <div className="suggested-user">
      <img src={user.profilePicture} alt={user.name} />
      <div className="user-info">
        <h4>{user.name}</h4>
        <p>{user.bio}</p>
      </div>
    </div>
  );
};

export default SuggestedUser;
