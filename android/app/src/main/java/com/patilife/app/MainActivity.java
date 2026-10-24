package com.patilife.app;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.games.PlayGamesSdk;
public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle state) {
        if (!getString(R.string.games_app_id).equals("0")) PlayGamesSdk.initialize(this);
        registerPlugin(GameCenterAndCloudPlugin.class);
        super.onCreate(state);
    }
}
