export const requireAuth = async (navigate) => {
  try{
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`,{
      credentials: "include",
    });
    if(!res.ok){
      navigate('/login');
      return false;
    }
    return true;
  }catch(err){
    console.error(err.message);
    navigate('/login');
    return false;
  }
};
