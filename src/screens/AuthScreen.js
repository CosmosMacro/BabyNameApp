import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { auth, Card, Button, LoadingSpinner, BackgroundDecorations } from '../App';
const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(getFriendlyAuthError(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setError('');
        try {
            // 1. Appeler le plugin natif
            const result = await SocialLogin.signIn({ provider });

            let credential;
            // 2. Créer la bonne "credential" Firebase en fonction du fournisseur
            if (provider === 'google') {
                credential = GoogleAuthProvider.credential(result.token);
            } else if (provider === 'facebook') {
                credential = FacebookAuthProvider.credential(result.token);
            } else {
                throw new Error("Fournisseur non supporté");
            }

            // 3. Se connecter à Firebase
            await signInWithCredential(auth, credential);

        } catch (err) {
            console.error(err);
            setError(`La connexion avec ${provider} a échoué.`);
        }
    };

    const getFriendlyAuthError = (code) => {
        switch (code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Email ou mot de passe incorrect.';
            case 'auth/email-already-in-use':
                return 'Cette adresse email est déjà utilisée.';
            case 'auth/weak-password':
                return 'Le mot de passe doit contenir au moins 6 caractères.';
            case 'auth/invalid-email':
                return 'Adresse email invalide.';
            default:
                return 'Une erreur est survenue. Veuillez réessayer.';
        }
    };

    return (
        <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 font-nunito">
            <BackgroundDecorations />
            <div className="w-full max-w-sm text-center">
                <h1 className="text-4xl font-bold text-lavande-poudre mb-2">BabyNames</h1>
                <p className="text-text-secondary mb-8">Trouvez le prénom parfait, ensemble.</p>

                <Card className="text-left">
                    <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">{isLogin ? 'Connexion' : 'Inscription'}</h2>
                    {error && <p className="bg-rose-saumon/20 text-rose-saumon-dark p-3 rounded-lg mb-4 text-center text-sm">{error}</p>}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse email" required className="w-full px-4 py-3 border border-subtle-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-lavande-poudre" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" required className="w-full px-4 py-3 border border-subtle-border bg-background text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-lavande-poudre" />
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <LoadingSpinner small /> : (isLogin ? 'Se connecter' : "S'inscrire")}
                        </Button>
                    </form>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-subtle-border"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-card-bg text-text-secondary">OU</span></div>
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-subtle-border rounded-lg hover:bg-hover-bg transition-colors">
                            <img src="https://www.google.com/favicon.ico" alt="Google icon" className="h-5 w-5" />
                            <span className="font-semibold text-text-primary">Continuer avec Google</span>
                        </button>
                        <button onClick={() => handleSocialLogin('facebook')} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-subtle-border rounded-lg hover:bg-hover-bg transition-colors">
                            <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>
                            <span className="font-semibold text-text-primary">Continuer avec Facebook</span>
                        </button>
                    </div>
                    <p className="text-center mt-6 text-sm">
                        <span className="text-text-secondary">{isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}</span>
                        <button onClick={() => { setIsLogin(!isLogin); setError('') }} className="font-semibold text-lavande-poudre hover:underline ml-1">
                            {isLogin ? "S'inscrire" : 'Se connecter'}
                        </button>
                    </p>
                </Card>
            </div>
        </div>
    );
};



export default AuthScreen;
