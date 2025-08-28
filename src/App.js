import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithCredential, // Important pour les connexions sociales
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    writeBatch
} from 'firebase/firestore';
// --- CORRECTION DE L'IMPORT POUR LE PLUGIN SOCIAL LOGIN ---
import { SocialLogin } from '@capgo/capacitor-social-login';
import { storage } from './storage';
import DashboardScreen from './screens/DashboardScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import FavoritesListScreen from './screens/FavoritesListScreen';
import CompareScreen from './screens/CompareScreen';
import ProfileManagementScreen from './screens/ProfileManagementScreen';
import FriendsScreen from './screens/FriendsScreen';
import NameDetailScreen from './screens/NameDetailScreen';
import AuthScreen from './screens/AuthScreen';


// --- CONFIGURATION FIREBASE (REMPLIR AVEC VOS INFORMATIONS) ---
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "babynameapp-cc1a5.firebaseapp.com",
    projectId: "babynameapp-cc1a5",
    storageBucket: "babynameapp-cc1a5.firebasestorage.app",
    messagingSenderId: "76951829437",
    appId: "1:76951829437:web:ebb9cd839090e87d1070d4",
    measurementId: "G-Q1T430WRXS"
};

// --- INITIALISATION DE FIREBASE ---
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


// --- ICONS (Identiques à la version précédente) ---
const HomeIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const SearchIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const HeartIcon = ({ className = 'h-6 w-6', isLiked, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} ${isLiked ? 'heartbeat' : ''}`} viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);
const CompareIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const AccountIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MaleSymbolIcon = ({ className = 'h-5 w-5' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M9.5 2a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V2.707L9.354 7.854a.5.5 0 1 1-.708-.708L13.293 2H9.5zM6 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-2 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" /></svg>;
const FemaleSymbolIcon = ({ className = 'h-5 w-5' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 5a5 5 0 1 1 5.5 4.975V12h2a.5.5 0 0 1 0 1h-2v2.5a.5.5 0 0 1-1 0V13h-2a.5.5 0 0 1 0-1h2V9.975A5 5 0 0 1 3 5z" /></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l4-4m-4 4l4 4" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L12 14.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 016 17v-2.586L3.293 6.707A1 1 0 013 6V4z" /></svg>;
const TrashIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DragHandleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const EyeIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const SunIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const TrophyIcon = ({ className = 'h-6 w-6', color }) => (
    <svg className={className} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 17.77L18.18 21.5l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 5.23L5.82 21.5 12 17.77z" />
    </svg>
);
const LogoutIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const UserPlusIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const UsersIcon = ({ className = 'h-6 w-6' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

// --- AUTHENTICATION CONTEXT ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                const publicUserRef = doc(db, 'users_public', firebaseUser.uid);

                const [userSnap, publicUserSnap] = await Promise.all([
                    getDoc(userRef),
                    getDoc(publicUserRef)
                ]);

                if (!userSnap.exists()) {
                    // Case for a brand new user
                    const displayName = firebaseUser.displayName || firebaseUser.email.split('@')[0];
                    const photoURL = firebaseUser.photoURL;

                    const privateData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: displayName,
                        photoURL: photoURL,
                        createdAt: new Date(),
                        lastName: '',
                        likedNames: [],
                        seenNames: [],
                        history: [],
                    };

                    const publicData = {
                        uid: firebaseUser.uid,
                        displayName: displayName,
                        photoURL: photoURL,
                    };

                    const batch = writeBatch(db);
                    batch.set(userRef, privateData);
                    batch.set(publicUserRef, publicData);
                    await batch.commit();

                } else if (!publicUserSnap.exists()) {
                    // Case for an existing user missing a public profile (backfill)
                    const userData = userSnap.data();
                    const publicData = {
                        uid: userData.uid,
                        displayName: userData.displayName,
                        photoURL: userData.photoURL,
                    };
                    await setDoc(publicUserRef, publicData);
                }
                setUser(firebaseUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const value = { user, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};


// --- HOOKS & HELPERS ---

const pageTitles = {
    dashboard: 'Notre Cocon ✨',
    discover: 'Trouvailles du Jour',
    favorites: 'Nos Petits Trésors',
    compare: 'Accord Parfait ?',
    profile: 'Mon Compte',
    friends: 'Mes Amis',
    detail: 'Détail du Prénom',
};


const getInitialTheme = async () => {
    const storedTheme = await storage.getItem('name_app_theme_v2');
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    return 'light';
};

// --- MAIN LAYOUT COMPONENTS ---
const App = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    return user ? <AppLayout /> : <AuthScreen />;
};

const AppLayout = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [allNames, setAllNames] = useState([]);
    const [userData, setUserData] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [detailedName, setDetailedName] = useState(null);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        getInitialTheme().then(setTheme);
    }, []);

    // State for friends, requests, etc.
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [isFriendsLoading, setIsFriendsLoading] = useState(true);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        storage.setItem('name_app_theme_v2', theme);
    }, [theme]);

    useEffect(() => {
        if (saveError) {
            const timer = setTimeout(() => setSaveError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [saveError]);

    const uniqueOrigins = useMemo(() => {
        const set = new Set();
        allNames.forEach(n => {
            if (n.filtre_global && n.filtre_global.trim() !== '') {
                set.add(n.filtre_global.trim());
            }
        });
        return Array.from(set).sort();
    }, [allNames]);

    useEffect(() => {
        const fetchNames = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('./base_prenoms_final.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const jsonData = await response.json();
                const parsedNames = jsonData.map(entry => ({
                    prénom: entry.prenom,
                    genre: entry.genre.toUpperCase(),
                    signification: entry.signification,
                    origines: [entry.origine_detail].filter(o => o && o.trim() !== ''),
                    filtre_global: entry.filtre_global,
                    id: entry.id
                }));
                setAllNames(parsedNames);
            } catch (error) {
                console.error('Erreur chargement JSON, utilisation données de secours:', error);
                const fallbackNames = [
                    { prénom: "Léo", genre: "M", signification: "Lion", origines: ["Latin"], id: "fb-1" },
                    { prénom: "Emma", genre: "F", signification: "Universelle", origines: ["Germanique"], id: "fb-2" },
                ];
                setAllNames(fallbackNames);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNames();
    }, []);

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const updatedData = {
                    ...data,
                    lastName: data.lastName || '',
                    likedNames: data.likedNames || [],
                    seenNames: data.seenNames || [],
                    history: data.history || [],
                };
                setUserData(updatedData);
            } else {
                const newUserDoc = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL,
                    createdAt: new Date(),
                    lastName: '',
                    likedNames: [],
                    seenNames: [],
                    history: [],
                };
                await setDoc(userRef, newUserDoc);
                setUserData(newUserDoc);
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });

        return () => unsubscribe();
    }, [user]);

    // Friend data fetching moved to AppLayout
    useEffect(() => {
        if (!user) return;
        setIsFriendsLoading(true);
        const q = query(collection(db, "friendships"), where("userIds", "array-contains", user.uid));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const friendships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const accepted = friendships.filter(f => f.status === 'accepted');
            const pendingReceived = friendships.filter(f => f.status === 'pending' && f.receiverId === user.uid);
            const pendingSent = friendships.filter(f => f.status === 'pending' && f.requesterId === user.uid);

            const fetchUsers = async (uids) => {
                if (uids.length === 0) return [];
                const usersQuery = query(collection(db, 'users_public'), where('uid', 'in', uids));
                const usersSnapshot = await getDocs(usersQuery);
                return usersSnapshot.docs.map(doc => doc.data());
            };

            const friendIds = accepted.map(f => f.userIds.find(id => id !== user.uid)).filter(Boolean);
            setFriends(await fetchUsers(friendIds));

            const requesterIds = pendingReceived.map(r => r.requesterId);
            const requestersData = await fetchUsers(requesterIds);
            setRequests(pendingReceived.map(req => ({ ...req, user: requestersData.find(u => u.uid === req.requesterId) })));

            const receiverIds = pendingSent.map(r => r.receiverId);
            const receiversData = await fetchUsers(receiverIds);
            setSentRequests(pendingSent.map(req => ({ ...req, user: receiversData.find(u => u.uid === req.receiverId) })));

            setIsFriendsLoading(false);
        }, (error) => {
            console.error("Error listening to friendships:", error);
            setIsFriendsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const updateUserData = useCallback(async (updatedData, attempt = 0) => {
        if (!user) return;
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, updatedData);
        const publicUpdate = {};
        if (updatedData.displayName) publicUpdate.displayName = updatedData.displayName;
        if (updatedData.photoURL) publicUpdate.photoURL = updatedData.photoURL;
        if (Object.keys(publicUpdate).length > 0) {
            const publicUserRef = doc(db, 'users_public', user.uid);
            batch.update(publicUserRef, publicUpdate);
        }
        try {
            await batch.commit();
            setSaveError(null);
        } catch (error) {
            console.error("Error updating user data:", error);
            setSaveError("Erreur lors de l'enregistrement des données.");
            if (attempt < 1) {
                setTimeout(() => updateUserData(updatedData, attempt + 1), 2000);
            }
        }
    }, [user]);

    const handleNavigate = (page) => {
        setCurrentPage(page);
        setDetailedName(null);
    };

    const renderPage = () => {
        if (isLoading || !userData) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
        if (detailedName) return <NameDetailScreen name={detailedName} profile={userData} updateProfile={updateUserData} onBack={() => setDetailedName(null)} />;

        const pageProps = {
            profile: userData,
            allNames,
            updateProfile: updateUserData,
            setDetailedName,
            origins: uniqueOrigins,
            theme,
            setTheme,
            onNavigate: handleNavigate,
            friends,
            requests,
            sentRequests,
            isFriendsLoading,
            setRequests,
            setFriends,
            setSentRequests,
            currentUser: user,
        };

        const PageComponent = {
            dashboard: DashboardScreen,
            discover: DiscoverScreen,
            favorites: FavoritesListScreen,
            compare: CompareScreen,
            profile: ProfileManagementScreen,
            friends: FriendsScreen,
        }[currentPage];

        return PageComponent ? <PageComponent {...pageProps} /> : null;
    };

    return (
        <div className="bg-background text-text-primary font-nunito min-h-screen flex flex-col h-screen">
            <AnimatedBackground theme={theme} />
            <BackgroundDecorations />
            <TopBar title={pageTitles[detailedName ? 'detail' : currentPage]} onAccountClick={() => handleNavigate('profile')} />
            <main className="flex-1 p-4 overflow-y-auto pb-28">
                {renderPage()}
            </main>
            {saveError && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
                    {saveError}
                </div>
            )}
            <BottomNavBar currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
    );
};

// --- AUTHENTICATION SCREEN (MODIFIED) ---

// --- UI COMPONENTS ---
const LoadingSpinner = ({ small }) => <div className={`border-solid rounded-full animate-spin border-slate-200 dark:border-slate-700 ${small ? 'w-6 h-6 border-2 border-t-white' : 'w-12 h-12 border-4 border-t-lavande-poudre'}`}></div>;
const BackgroundDecorations = () => (<div className="fixed inset-0 z-[-1] opacity-40 dark:opacity-20 overflow-hidden"><svg className="absolute -top-12 -left-12 w-48 h-48 text-lavande-poudre/30" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M62.5,-49.9C77.9,-32.4,85.2,-4.4,80.7,20.5C76.2,45.4,59.9,67.2,39.8,78.5C19.7,89.8,-4.2,90.6,-28.4,80.5C-52.6,70.4,-77.1,49.4,-84.9,24.7C-92.7,0,-83.8,-28.3,-67.2,-46.5C-50.6,-64.7,-25.3,-72.7,-0.2,-72.6C24.9,-72.5,47.1,-67.4,62.5,-49.9Z" transform="translate(100 100)" /></svg><svg className="absolute -bottom-16 -right-12 w-64 h-64 text-rose-saumon/30" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M52.9,-62.9C67.9,-51.9,78.9,-35.8,82.1,-18.2C85.3,-0.6,80.7,18.5,70.4,34.9C60.1,51.3,44.1,65,26.8,72.2C9.5,79.4,-9.1,80.1,-26.8,74.5C-44.5,68.9,-61.2,57,-70.5,41.1C-79.8,25.2,-81.7,5.3,-77.4,-12.8C-73.1,-30.9,-62.6,-47.2,-48.5,-58.5C-34.4,-69.8,-17.2,-76.1,1.5,-77.5C20.2,-78.9,40.4,-73.9,52.9,-62.9Z" transform="translate(100 100)" /></svg></div>);
const TopBar = ({ title, onAccountClick }) => (
    <header className="bg-card-bg/80 backdrop-blur-sm shadow-sm p-4 flex items-center justify-between relative flex-shrink-0 border-b border-subtle-border">
        <div className="w-8"></div>
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
        <button
            onClick={onAccountClick}
            aria-label="Ouvrir le compte"
            className="p-2 rounded-full text-text-secondary hover:bg-lavande-poudre/10 hover:text-lavande-poudre transition-colors"
        >
            <AccountIcon />
        </button>
    </header>
);
const BottomNavBar = ({ currentPage, onNavigate }) => { const navItems = [{ page: 'dashboard', icon: HomeIcon, label: 'Cocon' }, { page: 'discover', icon: SearchIcon, label: 'Trouvailles' }, { page: 'favorites', icon: HeartIcon, label: 'Trésors' }, { page: 'friends', icon: UsersIcon, label: 'Amis' }, { page: 'compare', icon: CompareIcon, label: 'Comparer' },]; return (<nav className="fixed bottom-0 left-0 right-0 bg-card-bg/90 backdrop-blur-sm border-t border-subtle-border flex justify-around z-20 flex-shrink-0 p-2">{navItems.map(({ page, icon: Icon, label }) => { const isActive = currentPage === page; return (<button key={page} onClick={() => onNavigate(page)} className={`flex flex-col items-center p-2 w-full transition-all duration-300 rounded-lg ${isActive ? 'text-lavande-poudre' : 'text-text-secondary hover:bg-hover-bg'}`}><div className={`relative p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-lavande-poudre/10' : ''}`}><Icon className={`h-6 w-6`} />{isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-lavande-poudre rounded-full"></div>}</div><span className={`text-xs mt-1 font-semibold transition-all duration-300`}>{label}</span></button>) })} </nav>); };
const Card = ({ children, className = '', ...props }) => <div className={`bg-card-bg rounded-3xl shadow-soft p-4 sm:p-6 ${className}`} {...props}>{children}</div>;
const Button = ({ children, onClick, color = 'primary', className = '', disabled = false }) => { const colors = { primary: 'bg-lavande-poudre hover:brightness-105', red: 'bg-rose-saumon text-text-primary hover:brightness-105', emerald: 'bg-emerald-500 hover:bg-emerald-600', }; return <button onClick={onClick} disabled={disabled} className={`text-white font-bold py-3 px-6 rounded-xl shadow-sm transform transition-all duration-200 active:scale-95 ${colors[color]} ${className} disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100`}>{children}</button>; };
const Chip = ({ label, selected, onClick, className = '' }) => <button onClick={onClick} className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 text-sm ${selected ? 'bg-lavande-poudre text-white shadow-sm' : 'bg-hover-bg text-text-secondary hover:brightness-95'} ${className}`}>{label}</button>;
const FAB = ({ icon: Icon, onClick, ariaLabel }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="fixed bottom-24 right-6 bg-lavande-poudre text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg z-30 transform transition-transform hover:scale-105 active:scale-95"
    >
        <Icon className="h-8 w-8" />
    </button>
);
const Modal = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
        <div className="bg-card-bg p-6 rounded-2xl shadow-2xl w-full max-w-sm m-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                <button
                    onClick={onClose}
                    aria-label="Fermer"
                    className="text-text-secondary p-1 rounded-full hover:bg-hover-bg"
                >
                    <CloseIcon />
                </button>
            </div>
            {children}
        </div>
    </div>
);
const AnimatedPage = ({ children, className }) => <div className={`animate-fade-in-up ${className}`}>{children}</div>;
const AnimatedBackground = ({ theme }) => {
    const stars = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationName: 'twinkle',
                animationDuration: `${Math.random() * 4 + 2}s`,
                animationDelay: `${Math.random() * 3}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
            };
            return <div key={i} className="absolute rounded-full bg-white/80" style={style}></div>;
        });
    }, []);

    if (theme !== 'dark') return null;
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
            {stars}
        </div>
    );
};

// --- Reste des composants (inchangés) ---




const SearchFriendModal = ({ onClose, currentUser, friends, onFriendRequestSent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('Recherchez des utilisateurs par leur nom d\'utilisateur.');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim().length < 3) {
            setMessage('Veuillez entrer au moins 3 caractères.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const usersRef = collection(db, 'users_public');
            const q = query(usersRef, 
                where('displayName', '>=', searchTerm.trim()),
                where('displayName', '<=', searchTerm.trim() + '\uf8ff')
            );
            const querySnapshot = await getDocs(q);
            const foundUsers = querySnapshot.docs.map(doc => doc.data()).filter(u => u.uid !== currentUser.uid);
            setResults(foundUsers);
            if (foundUsers.length === 0) setMessage('Aucun utilisateur trouvé.');
        } catch (error) {
            console.error("Error searching users:", error);
            setMessage('Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (receiverUser) => {
        const userIds = [currentUser.uid, receiverUser.uid].sort();
        const friendshipId = userIds.join('_');
        const friendshipRef = doc(db, 'friendships', friendshipId);
        const docSnap = await getDoc(friendshipRef);

        if (docSnap.exists()) {
            setMessage('Une demande existe déjà avec cet utilisateur.');
            return;
        }

        const newRequestData = {
            requesterId: currentUser.uid,
            receiverId: receiverUser.uid,
            status: 'pending',
            createdAt: new Date(),
            userIds: userIds
        };

        await setDoc(friendshipRef, newRequestData);
        
        onFriendRequestSent({ 
            id: friendshipId, 
            ...newRequestData, 
            user: receiverUser 
        });
    };

    return (
        <Modal title="Ajouter un ami" onClose={onClose}>
            <p className="text-text-secondary mb-4 text-sm">Recherchez un ami par son nom d\'utilisateur.</p>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Nom d\'utilisateur" className="flex-grow px-4 py-2 border border-subtle-border bg-hover-bg text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-lavande-poudre" autoFocus />
                <Button type="submit" disabled={loading}>{loading ? <LoadingSpinner small /> : 'Rechercher'}</Button>
            </form>
            {message && <p className="text-center text-sm text-text-secondary mt-4">{message}</p>}
            <ul className="mt-4 space-y-2">
                {results.map(userResult => {
                    const isFriend = friends.some(f => f.uid === userResult.uid);
                    return (
                        <li key={userResult.uid} className="flex items-center justify-between p-2 bg-hover-bg rounded-lg">
                            <div className="flex items-center gap-3">
                                <img src={userResult.photoURL || `https://i.pravatar.cc/150?u=${userResult.uid}`} alt={userResult.displayName} className="h-10 w-10 rounded-full" />
                                <span className="font-semibold text-text-primary">{userResult.displayName}</span>
                            </div>
                            <Button onClick={() => sendFriendRequest(userResult)} disabled={isFriend} className="!py-1 !px-3 text-sm">
                                {isFriend ? 'Déjà ami' : 'Ajouter'}
                            </Button>
                        </li>
                    );
                })}
            </ul>
        </Modal>
    );
};




const SwipeableCard = ({ name, lastName, onSwipe, isTop, style }) => { const cardRef = useRef(); const nameRef = useRef(); const [feedback, setFeedback] = useState(null); const startPoint = useRef({ x: 0, y: 0 }); const isDragging = useRef(false); useEffect(() => { const resizeText = () => { const textEl = nameRef.current; const containerEl = textEl?.parentElement; if (!textEl || !containerEl) return; requestAnimationFrame(() => { const containerWidth = containerEl.offsetWidth; if (containerWidth <= 0) return; let fontSize = 64; textEl.style.fontSize = `${fontSize}px`; while (textEl.scrollWidth > containerWidth - 8 && fontSize > 16) { fontSize--; textEl.style.fontSize = `${fontSize}px`; } }); }; resizeText(); window.addEventListener('resize', resizeText); return () => { window.removeEventListener('resize', resizeText); }; }, [name.prénom, lastName]); const handleGestureStart = (e) => { if (!isTop) return; startPoint.current = { x: e.clientX ?? e.touches[0].clientX, y: e.clientY ?? e.touches[0].clientY }; isDragging.current = true; if (cardRef.current) { cardRef.current.style.transition = 'transform 0.1s'; } }; const handleGestureMove = (e) => { if (!isDragging.current || !isTop || !cardRef.current) return; const currentX = e.clientX ?? e.touches[0].clientX; const deltaX = currentX - startPoint.current.x; const rotation = deltaX / 20; cardRef.current.style.transform = `${style.transform} translateX(${deltaX}px) rotate(${rotation}deg)`; if (deltaX > 20) setFeedback('like'); else if (deltaX < -20) setFeedback('nope'); else setFeedback(null); }; const handleGestureEnd = (e) => { if (!isDragging.current || !isTop || !cardRef.current) return; isDragging.current = false; const deltaX = (e.clientX ?? e.changedTouches[0].clientX) - startPoint.current.x; if (Math.abs(deltaX) > 100) { const direction = deltaX > 0 ? 'right' : 'left'; const flyOutX = (deltaX > 0 ? 1 : -1) * (window.innerWidth); const rotation = deltaX / 15; cardRef.current.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out'; cardRef.current.style.transform = `translateX(${flyOutX}px) rotate(${rotation * 2}deg)`; cardRef.current.style.opacity = '0'; setTimeout(() => onSwipe(direction), 500); } else { cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; cardRef.current.style.transform = style.transform; setFeedback(null); } }; const triggerSwipe = (direction) => { if (!isTop || !cardRef.current) return; const flyOutX = (direction === 'right' ? 1 : -1) * window.innerWidth; const rotation = direction === 'right' ? 15 : -15; setFeedback(direction === 'right' ? 'like' : 'nope'); cardRef.current.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.6s ease-out'; cardRef.current.style.transform = `translateX(${flyOutX}px) rotate(${rotation}deg)`; cardRef.current.style.opacity = '0'; setTimeout(() => onSwipe(direction), 600); }; const genderBg = name.genre === 'M' ? 'bg-bleu-layette-bg' : 'bg-rose-saumon-bg'; return (<div ref={cardRef} className={`absolute touch-none ${isTop ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}`} style={style} onMouseDown={handleGestureStart} onMouseMove={handleGestureMove} onMouseUp={handleGestureEnd} onMouseLeave={handleGestureEnd} onTouchStart={handleGestureStart} onTouchMove={handleGestureMove} onTouchEnd={handleGestureEnd}><Card className={`w-80 h-[450px] flex flex-col justify-between items-center relative overflow-hidden border border-subtle-border ${genderBg}`}><div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${feedback === 'like' ? 'opacity-100' : 'opacity-0'}`}><div className="border-8 border-vert-menthe rounded-lg transform -rotate-12"><h3 className="text-vert-menthe text-4xl font-black p-2 tracking-widest">OUI !</h3></div></div><div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${feedback === 'nope' ? 'opacity-100' : 'opacity-0'}`}><div className="border-8 border-rose-saumon rounded-lg transform rotate-12"><h3 className="text-rose-saumon text-4xl font-black p-2 tracking-widest">NON</h3></div></div><div className="text-center pt-8 px-4 overflow-hidden flex-grow flex flex-col w-full"><div className="w-full flex justify-center items-center h-28"><h2 ref={nameRef} className="font-bold text-text-primary leading-none whitespace-nowrap text-center">{name.prénom}{lastName && <span className="text-[0.8em] font-semibold ml-2 text-text-secondary">{lastName}</span>}</h2></div><div className="w-full flex-grow my-4 overflow-y-auto description-scroll pr-2"><p className="italic text-text-secondary text-base">"{name.signification}"</p></div></div><div className="w-full px-4 pb-4 flex-shrink-0"><div className="flex justify-center items-center mb-4"><div className="flex items-center space-x-2 text-text-secondary bg-card-bg/50 px-3 py-1 rounded-full border border-subtle-border">{name.genre === 'M' ? <MaleSymbolIcon className="h-4 w-4 text-bleu-layette" /> : <FemaleSymbolIcon className="h-4 w-4 text-rose-saumon" />}<p className="text-sm">Origine: {name.origines.join(', ')}</p></div></div><div className="flex justify-around w-full"><button onClick={() => triggerSwipe('left')} className="p-4 bg-card-bg rounded-full shadow-soft transform transition hover:scale-110 active:scale-95"><TrashIcon className="h-9 w-9 text-rose-saumon" /></button><button onClick={() => triggerSwipe('right')} className="p-4 bg-card-bg rounded-full shadow-soft transform transition hover:scale-110 active:scale-95"><HeartIcon className="h-9 w-9 text-vert-menthe" /></button></div></div></Card></div>); };
const RangeSlider = ({ min, max, currentMin, currentMax, onChange }) => { const minValRef = useRef(currentMin); const maxValRef = useRef(currentMax); const range = useRef(null); const getPercent = useCallback((value) => Math.round(((value - min) / (max - min)) * 100), [min, max]); useEffect(() => { minValRef.current = currentMin; maxValRef.current = currentMax; }, [currentMin, currentMax]); useEffect(() => { const minPercent = getPercent(currentMin); const maxPercent = getPercent(currentMax); if (range.current) { range.current.style.left = `${minPercent}%`; range.current.style.width = `${maxPercent - minPercent}%`; } }, [currentMin, currentMax, getPercent]); return (<div className="w-full pt-4"> <div className="relative h-10 flex items-center justify-center"> <input type="range" min={min} max={max} value={currentMin} onChange={(event) => { const value = Math.min(Number(event.target.value), maxValRef.current - 1); onChange({ min: value, max: maxValRef.current }); }} className="thumb thumb--left" style={{ zIndex: currentMin > max - 100 ? '5' : '3' }} /> <input type="range" min={min} max={max} value={currentMax} onChange={(event) => { const value = Math.max(Number(event.target.value), minValRef.current + 1); onChange({ min: minValRef.current, max: value }); }} className="thumb thumb--right" /> <div className="relative w-full"> <div className="slider__track" /> <div ref={range} className="slider__range" /> <div className="slider__left-value">{currentMin}</div> <div className="slider__right-value">{currentMax}</div> </div> </div> <div className="flex justify-between text-xs text-text-secondary mt-2"> <span>{min} lettres</span> <span>{max} lettres</span> </div> </div>); };
const FavoriteItem = ({ name, lastName, index, onRemove, onViewDetails, onDragStart, onDragOver, onDrop, onDragEnd, isBeingDragged }) => {
    const medalColors = ['#FFD700', '#C4C4C4', '#D9A77A'];
    const isTopThree = index < 3;
    const genderBg = name.genre === 'M' ? 'bg-bleu-layette-bg' : 'bg-rose-saumon-bg';

    return (
        <li
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`favorite-item relative p-4 rounded-2xl shadow-soft flex items-center justify-between cursor-grab ${genderBg} ${isBeingDragged ? 'dragging' : ''}`}
        >
            <div className="flex items-center space-x-3">
                <DragHandleIcon />
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    {isTopThree && <TrophyIcon color={medalColors[index]} className="h-6 w-6" />}
                </div>
                <p className="font-bold text-text-primary">
                    <span className="text-lg">{name.prénom}</span>
                    {lastName && <span className="text-base ml-2 text-text-secondary">{lastName}</span>}
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onViewDetails(name)}
                    aria-label="Voir les détails du prénom"
                    className="text-text-secondary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <InfoIcon />
                </button>
                <button
                    onClick={() => onRemove(name.id)}
                    aria-label="Retirer le prénom de la liste"
                    className="text-rose-saumon p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </li>
    );
};
const CompareRow = ({ name, lastName, isLiked, onToggleLike }) => { const genderBg = name.genre === 'M' ? 'bg-bleu-layette-bg' : 'bg-rose-saumon-bg'; return (<div className={`flex justify-between items-center p-3 rounded-xl ${genderBg}`}><p className="font-semibold text-text-primary">{name.prénom}{lastName && <span className="ml-2 font-normal text-text-secondary">{lastName}</span>}</p><button onClick={() => onToggleLike(name.id)}><HeartIcon className={`w-7 h-7 transition-all duration-200 transform ${isLiked ? 'text-rose-saumon scale-100' : 'text-slate-300 dark:text-slate-500 scale-90 hover:text-rose-saumon/70 hover:scale-110'}`} /></button></div>); };
const ThemeToggle = ({ theme, setTheme }) => { const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light'); return (<div className="flex items-center justify-between"><span className="text-text-primary font-semibold">Mode Sombre</span><button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-lavande-poudre focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${theme === 'dark' ? 'bg-lavande-poudre' : 'bg-gray-200'}`}><span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}><span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${theme === 'dark' ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'}`}><SunIcon className="h-3 w-3 text-gray-400" /></span><span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${theme === 'dark' ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'}`}><MoonIcon className="h-3 w-3 text-lavande-poudre" /></span></span></button></div>); };


// --- STYLE INJECTION ---
const StyleInjector = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
            html { overflow-x: hidden; }
            :root { color-scheme: light; --background: #FAF9F6; --card-bg: #FFFFFF; --hover-bg: #F0EEF9; --subtle-border: #EAE6F5; --text-primary: #3C3C3C; --text-secondary: #7a7a9b; --lavande-poudre: #D8C9EB; --rose-saumon: #FCD9D9; --bleu-layette: #BFD8EF; --vert-menthe: #BDE5C8; --vert-menthe-dark: #3a8d5a; --rose-saumon-dark: #b56a6a; --bleu-layette-bg: #EBF4FA; --rose-saumon-bg: #FEF0F0; }
            html.dark { color-scheme: dark; --background: #1a1a2e; --card-bg: #1f1f38; --hover-bg: #2a2a4a; --subtle-border: #2e2e50; --text-primary: #e0e0ff; --text-secondary: #a0a0c0; --lavande-poudre: #a093c7; --rose-saumon: #d4a8a8; --bleu-layette: #a3b8d0; --vert-menthe: #a2c7b1; --vert-menthe-dark: #bde5c8; --rose-saumon-dark: #fcd9d9; --bleu-layette-bg: #2a3a4a; --rose-saumon-bg: #4a2a3a; }
            body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background-color: var(--background); overflow-x: hidden; }
            .font-nunito { font-family: 'Nunito', sans-serif; }
            .bg-background { background-color: var(--background); } .bg-card-bg { background-color: var(--card-bg); } .bg-hover-bg { background-color: var(--hover-bg); } .text-text-primary { color: var(--text-primary); } .text-text-secondary { color: var(--text-secondary); } .border-subtle-border { border-color: var(--subtle-border); } .bg-lavande-poudre { background-color: var(--lavande-poudre); } .text-lavande-poudre { color: var(--lavande-poudre); } .bg-rose-saumon { background-color: var(--rose-saumon); } .text-rose-saumon { color: var(--rose-saumon); } .bg-bleu-layette { background-color: var(--bleu-layette); } .bg-vert-menthe { background-color: var(--vert-menthe); } .text-vert-menthe { color: var(--vert-menthe); } .border-vert-menthe { border-color: var(--vert-menthe); } .text-vert-menthe-dark { color: var(--vert-menthe-dark); } .border-rose-saumon { border-color: var(--rose-saumon); } .text-rose-saumon-dark { color: var(--rose-saumon-dark); } .bg-bleu-layette-bg { background-color: var(--bleu-layette-bg); } .bg-rose-saumon-bg { background-color: var(--rose-saumon-bg); }
            .shadow-soft { box-shadow: 0 4px 15px -3px rgba(120, 120, 150, 0.07); }
            html.dark .shadow-soft { box-shadow: 0 4px 20px -3px rgba(0, 0, 0, 0.2); }
            .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes heartbeat { 0% { transform: scale(1); } 10% { transform: scale(1.3); } 20% { transform: scale(1); } 30% { transform: scale(1.3); } 40% { transform: scale(1); } }
            .heartbeat { animation: heartbeat 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            @keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.2); } }
            .description-scroll::-webkit-scrollbar { width: 4px; } .description-scroll::-webkit-scrollbar-track { background: transparent; } .description-scroll::-webkit-scrollbar-thumb { background: var(--subtle-border); border-radius: 4px; } .description-scroll::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }
            .favorite-item { transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease; } .favorite-item.dragging { opacity: 0.7; box-shadow: 0 10px 20px -5px rgba(120, 120, 150, 0.2); transform: scale(1.03); cursor: grabbing !important; } html.dark .favorite-item.dragging { box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
            .thumb { -webkit-appearance: none; -moz-appearance: none; appearance: none; pointer-events: none; position: absolute; height: 0; width: 100%; outline: none; background-color: transparent; } .thumb--left { z-index: 3; } .thumb--right { z-index: 4; } .thumb::-webkit-slider-thumb { -webkit-appearance: none; -webkit-tap-highlight-color: transparent; pointer-events: all; cursor: pointer; height: 24px; width: 24px; border-radius: 50%; border: 3px solid var(--lavande-poudre); background-color: var(--card-bg); margin-top: 4px; transition: box-shadow 0.2s; } .thumb::-webkit-slider-thumb:hover { box-shadow: 0 0 0 4px var(--lavande-poudre); opacity: 0.5; } .thumb::-moz-range-thumb { pointer-events: all; cursor: pointer; height: 24px; width: 24px; border-radius: 50%; border: 3px solid var(--lavande-poudre); background-color: var(--card-bg); transition: box-shadow 0.2s; } .thumb::-moz-range-thumb:hover { box-shadow: 0 0 0 4px var(--lavande-poudre); opacity: 0.5; }
            .slider__track, .slider__range { position: absolute; border-radius: 3px; height: 6px; top: 50%; transform: translateY(-50%); } .slider__track { background-color: var(--subtle-border); width: 100%; z-index: 1; } .slider__range { background-color: var(--lavande-poudre); z-index: 2; } .slider__left-value, .slider__right-value { position: absolute; top: -30px; font-size: 14px; font-weight: 600; color: var(--text-primary); background-color: var(--hover-bg); padding: 2px 8px; border-radius: 6px; } .slider__left-value { left: 0; } .slider__right-value { right: 0; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);
    return null;
}
export { AnimatedPage, Card, EyeIcon, HeartIcon, TrophyIcon, UndoIcon, FilterIcon, SwipeableCard, FavoriteItem, Button, LoadingSpinner, ThemeToggle, LogoutIcon, UserPlusIcon, Modal, Chip, FAB, SearchIcon, RangeSlider, BackgroundDecorations, SunIcon, MoonIcon, TrashIcon };

// --- FINAL APP EXPORT ---
const EnhancedApp = () => (
    <AuthProvider>
        <StyleInjector />
        <App />
    </AuthProvider>
);

export default EnhancedApp;
