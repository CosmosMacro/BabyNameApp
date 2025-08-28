import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { AnimatedPage, Card, Button, LoadingSpinner, db, HeartIcon } from '../App';

const CompareRow = ({ name, lastName, isLiked, onToggleLike }) => {
    const genderBg = name.genre === 'M' ? 'bg-bleu-layette-bg' : 'bg-rose-saumon-bg';
    return (
        <div className={`flex justify-between items-center p-3 rounded-xl ${genderBg}`}>
            <p className="font-semibold text-text-primary">
                {name.prénom}
                {lastName && (
                    <span className="ml-2 font-normal text-text-secondary">{lastName}</span>
                )}
            </p>
            <button onClick={() => onToggleLike(name.id)}>
                <HeartIcon
                    className={`w-7 h-7 transition-all duration-200 transform ${
                        isLiked
                            ? 'text-rose-saumon scale-100'
                            : 'text-slate-300 dark:text-slate-500 scale-90 hover:text-rose-saumon/70 hover:scale-110'
                    }`}
                />
            </button>
        </div>
    );
};

const CompareScreen = ({ profile, allNames, updateProfile, onNavigate, friends, isFriendsLoading }) => {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendData, setFriendData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelectFriend = async (friend) => {
        setLoading(true);
        setSelectedFriend(friend);
        const userRef = doc(db, "users", friend.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setFriendData({
                ...data,
                likedNames: data.likedNames || [],
                lastName: data.lastName || '',
            });
        } else {
            console.error("Friend data not found!");
            setFriendData(null);
        }
        setLoading(false);
    };

    const handleToggleLike = (nameId) => {
        const currentLiked = new Set(profile.likedNames);
        if (currentLiked.has(nameId)) {
            currentLiked.delete(nameId);
        } else {
            currentLiked.add(nameId);
        }
        updateProfile({ likedNames: Array.from(currentLiked) });
    };

    if (isFriendsLoading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    if (!selectedFriend || !friendData) {
        return (
            <AnimatedPage className="space-y-4">
                <h1 className="text-3xl font-bold text-center text-text-primary">Comparer avec...</h1>
                {friends.length > 0 ? friends.map(f => (
                    <Card key={f.uid} onClick={() => handleSelectFriend(f)} className="flex items-center justify-between p-4 transition-all hover:bg-hover-bg cursor-pointer">
                        <div className="flex items-center space-x-4">
                            <img src={f.photoURL || `https://i.pravatar.cc/150?u=${f.uid}`} alt={f.displayName} className="h-12 w-12 rounded-full" />
                            <p className="font-bold text-text-primary">{f.displayName}</p>
                        </div>
                        <span className="text-lavande-poudre font-bold">&rarr;</span>
                    </Card>
                )) : (
                    <Card className="text-center">
                        <p className="text-text-secondary">Vous n'avez pas encore d'amis.</p>
                        <Button onClick={() => onNavigate('friends')} className="mt-4">Ajouter des amis</Button>
                    </Card>
                )}
            </AnimatedPage>
        );
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    const commonLikedNames = profile.likedNames.filter(id => friendData.likedNames.includes(id));
    const myUniqueLiked = profile.likedNames.filter(id => !friendData.likedNames.includes(id));
    const friendUniqueLiked = friendData.likedNames.filter(id => !profile.likedNames.includes(id));
    const getNameById = (id) => allNames.find(n => n.id === id);

    return (
        <AnimatedPage className="space-y-6">
            <button onClick={() => { setSelectedFriend(null); setFriendData(null); }} className="text-lavande-poudre font-semibold flex items-center space-x-2 group mb-4">
                <span className="transform transition-transform group-hover:-translate-x-1">&larr;</span>
                <span>Retour</span>
            </button>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-text-primary">Accord Parfait</h1>
                <p className="text-text-secondary mt-1">Vous et <span className="font-bold">{selectedFriend.displayName}</span></p>
            </div>
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary text-center">💖 Matchs ({commonLikedNames.length})</h2>
                {commonLikedNames.length > 0 ? (
                    <ul className="space-y-2">
                        {commonLikedNames.map(getNameById).filter(Boolean).map(name => <CompareRow key={name.id} name={name} lastName={profile.lastName} isLiked={true} onToggleLike={() => handleToggleLike(name.id)} />)}
                    </ul>
                ) : (
                    <p className="text-text-secondary text-center">Aucun prénom en commun pour l'instant.</p>
                )}
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-text-primary">Vos trésors ({myUniqueLiked.length})</h2>
                    {myUniqueLiked.length > 0 ? (
                        <ul className="space-y-2">
                            {myUniqueLiked.map(getNameById).filter(Boolean).map(name => <CompareRow key={name.id} name={name} lastName={profile.lastName} isLiked={true} onToggleLike={() => handleToggleLike(name.id)} />)}
                        </ul>
                    ) : (
                        <p className="text-text-secondary">...</p>
                    )}
                </Card>
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-text-primary">{friendData.displayName} ({friendUniqueLiked.length})</h2>
                    {friendUniqueLiked.length > 0 ? (
                        <ul className="space-y-2">
                            {friendUniqueLiked.map(getNameById).filter(Boolean).map(name => <CompareRow key={name.id} name={name} lastName={friendData.lastName} isLiked={profile.likedNames.includes(name.id)} onToggleLike={() => handleToggleLike(name.id)} />)}
                        </ul>
                    ) : (
                        <p className="text-text-secondary">...</p>
                    )}
                </Card>
            </div>
        </AnimatedPage>
    );
};


export default CompareScreen;
