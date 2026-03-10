export const setUserProfileImage = (user, image) => {
  if (user) {
    return {
      id: 1,
      uid: user.id,
      displayName: user.username,
      email: user.username,
      photoURL: image,
      role: user.role,
      permission: user.permission,
    };
  }

  return user;
};

export const getUserFromJwtAuth = (user) => {
  if (user)
    return {
      id: 1,
      uid: user.id,
      branchAccess: user.branchAccess,
      displayName: user.username,
      email: user.username,
      photoURL: user.profileimage,
      role: user.role,
      permission: user.permission,
    };
  return user;
};
