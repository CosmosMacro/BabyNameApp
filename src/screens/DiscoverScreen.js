import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatedPage, Card, UndoIcon, FilterIcon, SwipeableCard } from '../App';
import FilterScreen from './FilterScreen';
import { storage } from '../storage';
const DiscoverScreen = ({ profile, allNames, updateProfile, origins }) => {
    const [cardStack, setCardStack] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [filter, setFilter] = useState({ gender: 'Tous', origins: [], length: { type: 'Tous', min: 2, max: 15 } });

    useEffect(() => {
        const loadFilter = async () => {
            const stored = await storage.getItem('name_app_filter_v1');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setFilter(parsed);
                } catch (e) {
                    console.error('Failed to parse stored filter', e);
                }
            }
        };
        loadFilter();
    }, []);

    useEffect(() => {
        storage.setItem('name_app_filter_v1', JSON.stringify(filter));
    }, [filter]);

    const memoizedCardStack = useMemo(() => {
        if (allNames.length === 0 || !profile) return [];
        const potentialNames = allNames.filter(n => {
            // --- CORRECTION DE L'ERREUR ---
            const genderMatch = (filter.gender === 'Tous' || n.genre === filter.gender);
            const originMatch = (filter.origins.length === 0 || (n.filtre_global && filter.origins.includes(n.filtre_global)));
            const nameLength = n.prénom.length;
            const { type, min, max } = filter.length;
            let lengthMatch = true;
            switch (type) {
                case 'Court': lengthMatch = nameLength >= 3 && nameLength <= 4; break;
                case 'Moyen': lengthMatch = nameLength >= 5 && nameLength <= 6; break;
                case 'Long': lengthMatch = nameLength >= 7; break;
                case 'Personnalisé': lengthMatch = nameLength >= min && nameLength <= max; break;
                default: lengthMatch = true;
            }
            return !profile.seenNames.includes(n.id) && genderMatch && originMatch && lengthMatch;
        });
        return [...potentialNames].sort(() => Math.random() - 0.5);
    }, [filter, allNames, profile.id]);

    useEffect(() => { setCardStack(memoizedCardStack); setCurrentIndex(0); }, [memoizedCardStack]);

    const swiped = (direction, name) => {
        const wasLikedBeforeSwipe = profile.likedNames.includes(name.id);
        const newHistory = [...profile.history, { nameId: name.id, wasLiked: wasLikedBeforeSwipe }];
        const isLike = direction === 'right';
        const newLikedNames = isLike ? Array.from(new Set([...profile.likedNames, name.id])) : profile.likedNames.filter(id => id !== name.id);
        updateProfile({ history: newHistory, likedNames: newLikedNames, seenNames: Array.from(new Set([...profile.seenNames, name.id])) });
        setCurrentIndex(prev => prev + 1);
    };

    const handleUndo = useCallback(() => {
        if (currentIndex === 0 || profile.history.length === 0) return;
        const lastAction = profile.history[profile.history.length - 1];
        if (!lastAction) return;
        const cardToRestore = cardStack[currentIndex - 1];
        if (!cardToRestore || cardToRestore.id !== lastAction.nameId) { console.error("Undo error"); return; }
        const newHistory = profile.history.slice(0, -1);
        const newSeenNames = profile.seenNames.filter(id => id !== lastAction.nameId);
        let newLikedNames;
        if (lastAction.wasLiked) {
            newLikedNames = Array.from(new Set([...profile.likedNames, lastAction.nameId]));
        } else {
            newLikedNames = profile.likedNames.filter(id => id !== lastAction.nameId);
        }
        updateProfile({ history: newHistory, seenNames: newSeenNames, likedNames: newLikedNames });
        setCurrentIndex(prev => prev - 1);
    }, [currentIndex, profile, cardStack, updateProfile]);

    if (isFilterOpen) {
        return <FilterScreen filter={filter} origins={origins} onSetFilter={setFilter} onLaunch={() => setFilterOpen(false)} allNames={allNames} />;
    }

    const visibleStack = cardStack.slice(currentIndex, currentIndex + 4);

    return (
        <AnimatedPage className="h-full flex flex-col">
            <div className="flex justify-end items-center space-x-3 mb-4">
                <button
                    onClick={handleUndo}
                    aria-label="Annuler le dernier choix"
                    className="p-3 bg-card-bg text-text-primary rounded-full shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-hover-bg"
                    disabled={currentIndex === 0 || profile.history.length === 0}
                >
                    <UndoIcon />
                </button>
                <button
                    onClick={() => setFilterOpen(true)}
                    aria-label="Ouvrir les filtres"
                    className="p-3 bg-card-bg text-text-primary rounded-full shadow-soft transition-all hover:bg-hover-bg"
                >
                    <FilterIcon />
                </button>
            </div>
            <div className="flex-grow relative flex items-center justify-center -mt-8 overflow-hidden">
                {visibleStack.length > 0 ? (
                    visibleStack.reverse().map((name, index) => {
                        const stackIndex = visibleStack.length - 1 - index;
                        const isTop = stackIndex === 0;
                        const style = { zIndex: 100 - stackIndex, transform: `scale(${1 - stackIndex * 0.05}) translateY(-${stackIndex * 10}px)`, opacity: stackIndex > 2 ? 0 : 1, transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease-out', };
                        return (<SwipeableCard key={name.id} name={name} lastName={profile.lastName} onSwipe={(dir) => swiped(dir, name)} isTop={isTop} style={style} />);
                    })
                ) : (
                    <Card className="text-center">
                        <h3 className="text-xl font-semibold text-text-primary">C'est tout pour le moment !</h3>
                        <p className="text-text-secondary mt-2">Essayez de modifier vos filtres pour découvrir de nouveaux prénoms.</p>
                    </Card>
                )}
            </div>
        </AnimatedPage>
    );
};

export default DiscoverScreen;
