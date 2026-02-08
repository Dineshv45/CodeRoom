export const validatePassword = (password) =>{
    if(password.length < 0){
        return "Password must be at least 8 characters long";
    }

    // at least one character
    if(!/[a-zA-z]/.test(password)){
        return "Password must be at least 8 characters long";
    }

    if(!/[0-9]/.test(password)){
        return "Password must contain at least one number";
    }

    return null;
}

