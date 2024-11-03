import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile, FacebookAuthProvider, GithubAuthProvider } from "firebase/auth";
import initializeAuthentication from '../components/Login/Firebase/Firebase.init';

initializeAuthentication();

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

const useFirebase = () => {
    const [userName, setUserName] = useState('');
    const [user, setUser] = useState({});
    const [isLogin, setisLogin] = useState(true);
    const [mail, setMail] = useState('');
    const [password, setPass] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth();

    const singInUsingGoogle = () => {
        setIsLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const singInUsingFacebook = () => {
        return signInWithPopup(auth, facebookProvider);
    }

    const singInUsingGithub = () => {
        return signInWithPopup(auth, githubProvider);
    }

    useEffect(() => {
        const unsubscribed = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser({});
            }
            setIsLoading(false);
            setisLogin(true);
        });
        return () => unsubscribed();
    }, [auth]); // Added 'auth' to the dependency array

    const logout = () => {
        setIsLoading(true);
        signOut(auth)
            .then(() => {})
            .catch((error) => {
                setUser(error);
            })
            .finally(() => setIsLoading(false));
    }

    const handleRegister = e => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password should be at least 6 characters');
            return;
        }
        if (!/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
            setError('Password should be minimum 6 characters, at least one letter and one number');
            return;
        }
        isLogin ? loginRegisterUser(mail, password) : registeruser(mail, password);
    }

    const registeruser = (mail, password) => {
        createUserWithEmailAndPassword(auth, mail, password)
            .then((result) => {
                verifyUserMail();
                updateUserName();
                setError('');
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    const updateUserName = () => {
        updateProfile(auth.currentUser, {
            displayName: userName
        }).then(() => {})
        .catch((error) => {
            setError(error.message);
        });
    }

    const loginRegisterUser = (mail, password) => {
        signInWithEmailAndPassword(auth, mail, password)
            .then((result) => {
                setError('');
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    const verifyUserMail = () => {
        sendEmailVerification(auth.currentUser)
            .then(() => {
                setError('Verification mail has been sent to your mail');
            });
    }

    const handleUserName = e => {
        setUserName(e.target.value);
    }

    const handleEmail = e => {
        setMail(e.target.value);
    }

    const handlePass = e => {
        setPass(e.target.value);
    }

    const handleConfirmPass = e => {
        const confirmPass = e.target.value;
        if (password === confirmPass) {
            setError('');
        } else {
            setPass('');
            setError('Password is not matched');
        }
    }

    const toggleLogin = e => {
        setisLogin(e);
    }

    const handlePasswordReset = () => {
        sendPasswordResetEmail(auth, mail)
            .then(() => {})
            .catch((error) => {
                setError(error.message);
            });
        setError('Password reset mail is sent');
    }

    return {
        singInUsingGoogle,
        singInUsingFacebook,
        singInUsingGithub,
        user,
        setUser,
        isLogin,
        logout,
        handleRegister,
        handlePasswordReset,
        handleUserName,
        handleEmail,
        handlePass,
        error,
        setError,
        loginRegisterUser,
        handleConfirmPass,
        toggleLogin,
        setIsLoading,
        isLoading,
        mail
    }
}

export default useFirebase;
