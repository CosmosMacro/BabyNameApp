import { AnimatedPage, Card, HeartIcon, SunIcon, MoonIcon } from '../App';
const NameDetailScreen = ({ name, profile, updateProfile, onBack }) => {
    const isLiked = profile.likedNames.includes(name.id);
    const handleLike = () => {
        const currentLiked = new Set(profile.likedNames);
        if (currentLiked.has(name.id)) {
            currentLiked.delete(name.id);
        } else {
            currentLiked.add(name.id);
        }
        updateProfile({ likedNames: Array.from(currentLiked) });
    };
    const genderBg = name.genre === 'M' ? 'bg-bleu-layette-bg' : 'bg-rose-saumon-bg';
    return (
        <AnimatedPage>
            <button onClick={onBack} className="text-lavande-poudre font-semibold flex items-center space-x-2 group mb-4">
                <span className="transform transition-transform group-hover:-translate-x-1">&larr;</span>
                <span>Retour</span>
            </button>
            <Card className={`text-center ${genderBg}`}>
                <h1 className="text-6xl font-bold text-text-primary">
                    {name.prénom}
                    {profile.lastName && <span className="text-5xl ml-3 text-text-secondary">{profile.lastName}</span>}
                </h1>
                <p className="italic text-text-secondary my-4 text-lg">"{name.signification}"</p>
                <p className="text-text-secondary">Origine(s): {name.origines.join(', ')}</p>
                <div className="flex justify-center items-center mt-8 pt-6 border-t border-subtle-border">
                    <button
                        onClick={handleLike}
                        aria-label={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                        <HeartIcon
                            isLiked={isLiked}
                            className={`h-16 w-16 transition-all transform hover:scale-110 active:scale-100 ${isLiked ? 'text-rose-saumon' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                    </button>
                </div>
            </Card>
        </AnimatedPage>
    );
};

export default NameDetailScreen;
