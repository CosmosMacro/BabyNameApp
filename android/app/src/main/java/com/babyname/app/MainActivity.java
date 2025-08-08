package com.babyname.app;

import android.os.Bundle;
import android.view.View;
import ee.forgr.capacitor.social.login.SocialLogin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(ee.forgr.capacitor.social.login.SocialLogin.class);
    }


    /**
     * Cette méthode est appelée chaque fois que la fenêtre de l'application gagne ou perd le focus.
     * C'est le meilleur endroit pour appliquer le mode immersif, car il sera rétabli même
     * si l'utilisateur quitte temporairement l'application (par exemple, pour une boîte de dialogue de permission).
     */
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    private void hideSystemUI() {
        // Active le mode immersif "sticky".
        // Le mode "sticky" signifie que même si l'utilisateur fait apparaître les barres
        // en swipant, elles disparaîtront à nouveau après quelques secondes.
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        // Affiche le contenu de l'application derrière les barres système
                        // pour éviter que le contenu ne se redimensionne lorsque les barres apparaissent/disparaissent.
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        // Masque la barre de navigation et la barre de statut.
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }
}
