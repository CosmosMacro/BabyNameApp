import { useState } from 'react';
import { doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { AnimatedPage, Card, Button, Modal, LoadingSpinner, UserPlusIcon, TrashIcon, db } from '../App';
const FriendsScreen = ({
    friends,
    requests,
    sentRequests,
    isFriendsLoading,
    onNavigate,
    setRequests,
    setFriends,
    currentUser,
    setSentRequests
}) => {
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);

    const handleRequestAction = async (friendshipId, newStatus) => {
        const request = requests.find(r => r.id === friendshipId);
        if (!request || !request.user) return;

        setRequests(prev => prev.filter(req => req.id !== friendshipId));
        if (newStatus === 'accepted') {
            setFriends(prev => [...prev, request.user]);
        }

        const friendshipRef = doc(db, 'friendships', friendshipId);
        try {
            if (newStatus === 'accepted') {
                await updateDoc(friendshipRef, { status: 'accepted' });
            } else {
                await deleteDoc(friendshipRef);
            }
        } catch (error) {
            console.error("Erreur lors de l'action sur la demande d'ami:", error);
        }
    };

    const cancelSentRequest = async (friendshipId) => {
        setSentRequests(prev => prev.filter(req => req.id !== friendshipId));
        const friendshipRef = doc(db, 'friendships', friendshipId);
        try {
            await deleteDoc(friendshipRef);
        } catch (error) {
            console.error("Erreur lors de l'annulation de la demande:", error);
        }
    };

    const addSentRequestOptimistically = (sentRequest) => {
        setSentRequests(currentSentRequests => [sentRequest, ...currentSentRequests]);
        setSearchModalOpen(false);
    };

    const removeFriend = async (friendId) => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet ami ?");
        if (!confirmed) return;
        
        setFriends(prev => prev.filter(f => f.uid !== friendId));
        
        try {
            const userIds = [currentUser.uid, friendId].sort();
            const friendshipId = userIds.join('_');
            const friendshipRef = doc(db, 'friendships', friendshipId);
            await deleteDoc(friendshipRef);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'ami:", error);
        }
    };

    if (isFriendsLoading) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Mes Amis</h1>
                <Button onClick={() => setSearchModalOpen(true)} className="flex items-center gap-2">
                    <UserPlusIcon /> Ajouter
                </Button>
            </div>

            {requests.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-text-primary">Demandes d'amis</h2>
                    <ul className="space-y-3">
                        {requests.map(req => (
                            <li key={req.id} className="flex items-center justify-between p-3 bg-hover-bg rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={req.user?.photoURL || `https://i.pravatar.cc/150?u=${req.user?.uid}`} alt={req.user?.displayName} className="h-10 w-10 rounded-full" />
                                    <span className="font-semibold text-text-primary">{req.user?.displayName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleRequestAction(req.id, 'accepted')} color="emerald" className="!py-2 !px-4">Accepter</Button>
                                    <Button onClick={() => handleRequestAction(req.id, 'declined')} color="red" className="!py-2 !px-4">Refuser</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {sentRequests.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-text-primary">Demandes envoyées</h2>
                    <ul className="space-y-3">
                        {sentRequests.map(req => (
                            <li key={req.id} className="flex items-center justify-between p-3 bg-hover-bg rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={req.user?.photoURL || `https://i.pravatar.cc/150?u=${req.user?.uid}`} alt={req.user?.displayName} className="h-10 w-10 rounded-full" />
                                    <div>
                                        <span className="font-semibold text-text-primary">{req.user?.displayName}</span>
                                        <p className="text-sm text-text-secondary">En attente</p>
                                    </div>
                                </div>
                                <Button onClick={() => cancelSentRequest(req.id)} color="red" className="!py-2 !px-4">Annuler</Button>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Ma liste d'amis</h2>
                {friends.length > 0 ? (
                    <ul className="space-y-3">
                        {friends.map(friend => (
                            <li key={friend.uid} className="flex items-center justify-between p-3 bg-hover-bg rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={friend.photoURL || `https://i.pravatar.cc/150?u=${friend.uid}`} alt={friend.displayName} className="h-10 w-10 rounded-full" />
                                    <span className="font-semibold text-text-primary">{friend.displayName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => onNavigate('compare')} className="!py-2 !px-4">Comparer</Button>
                                    <button
                                        onClick={() => removeFriend(friend.uid)}
                                        aria-label="Supprimer l'ami"
                                        className="text-rose-saumon p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-secondary text-center py-4">Vous n'avez pas encore d'amis. Ajoutez-en pour commencer à comparer !</p>
                )}
            </Card>

            {isSearchModalOpen && <SearchFriendModal onClose={() => setSearchModalOpen(false)} currentUser={currentUser} friends={friends} onFriendRequestSent={addSentRequestOptimistically} />}
        </AnimatedPage>
    );
};


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





export default FriendsScreen;
