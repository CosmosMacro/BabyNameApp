import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth, auth, AnimatedPage, Card, Button, ThemeToggle, LogoutIcon } from '../App';
const ProfileManagementScreen = ({ profile, updateProfile, theme, setTheme }) => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [lastName, setLastName] = useState('');

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName);
            setLastName(profile.lastName || '');
        }
    }, [profile]);

    const handleProfileInfoSave = () => {
        if (profile) updateProfile({ displayName, lastName });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AnimatedPage className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Mon Compte</h2>
                <div className="flex items-center space-x-4 mb-6">
                    <img src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt="User" className="h-16 w-16 rounded-full" />
                    <div>
                        <p className="font-bold text-text-primary">{user.displayName}</p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                </div>
                <Button color="red" onClick={handleLogout} className="w-full mb-6 flex items-center justify-center gap-2"><LogoutIcon /> Se déconnecter</Button>
            </Card>
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Informations</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="display-name" className="block text-sm font-medium text-text-secondary mb-1">Nom d'utilisateur</label>
                        <input id="display-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-3 border border-subtle-border bg-hover-bg text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-lavande-poudre" />
                    </div>
                    <div>
                        <label htmlFor="last-name" className="block text-sm font-medium text-text-secondary mb-1">Nom de famille (pour les matchs)</label>
                        <input id="last-name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 border border-subtle-border bg-hover-bg text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-lavande-poudre" />
                    </div>
                    <Button onClick={handleProfileInfoSave} className="w-full">Enregistrer</Button>
                </div>
            </Card>
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Préférences</h2>
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </Card>
        </AnimatedPage>
    );
};


export default ProfileManagementScreen;
