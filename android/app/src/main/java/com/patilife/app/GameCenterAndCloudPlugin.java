package com.patilife.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** Same JS contract as iOS. Never substitutes a local save for a cloud confirmation. */
@CapacitorPlugin(name = "GameCenterAndCloud")
public class GameCenterAndCloudPlugin extends Plugin {
    private static final String KEY = "patilife_save_data";
    private boolean busy = false;
    private String account = "";
    private boolean configured() { return !getContext().getString(R.string.games_app_id).equals("0"); }
    @PluginMethod public void signIn(PluginCall call) {
        if (!configured()) { call.resolve(new JSObject().put("configured", false).put("supported", true).put("message", "Play Games proje kimliği bu sürümde henüz tanımlı değil.")); return; }
        getActivity().runOnUiThread(() -> {
            var auth = PlayGames.getGamesSignInClient(getActivity());
            var task = call.getBoolean("silent", true) ? auth.isAuthenticated() : auth.signIn();
            task.addOnSuccessListener(result -> {
                if (!result.isAuthenticated()) { call.resolve(new JSObject().put("authenticated", false).put("configured", true)); return; }
                PlayGames.getPlayersClient(getActivity()).getCurrentPlayer().addOnSuccessListener(player -> {
                    account = player.getPlayerId();
                    call.resolve(new JSObject().put("authenticated", true).put("configured", true).put("alias", player.getDisplayName()).put("accountId", account));
                }).addOnFailureListener(error -> call.reject("Oyuncu hesabı alınamadı", error));
            }).addOnFailureListener(error -> call.reject("Play Games bağlantısı kurulamadı", error));
        });
    }
    private String revision(String value) throws Exception {
        if (value == null || value.isEmpty()) return null;
        JSONObject json = new JSONObject(value);
        return json.has("revision") ? json.getString("revision") : "legacy-" + json.getLong("saveTime");
    }
    private String read(Snapshot snapshot) throws Exception {
        return new String(snapshot.getSnapshotContents().readFully(), StandardCharsets.UTF_8);
    }
    private void open(PluginCall call, boolean writing) {
        if (!configured() || account.isEmpty()) { call.reject("Play Games hesabını Ayarlar > Oyun kaydı ve bulut bölümünden bağla."); return; }
        if (!KEY.equals(call.getString("key"))) { call.reject("Geçersiz kayıt anahtarı"); return; }
        if (busy) { call.reject("Diğer kayıt işleminin tamamlanmasını bekle."); return; }
        busy = true;
        getActivity().runOnUiThread(() -> {
            SnapshotsClient client = PlayGames.getSnapshotsClient(getActivity());
            client.open(KEY, true, SnapshotsClient.RESOLUTION_POLICY_MANUAL).addOnSuccessListener(result -> {
                Snapshot snapshot = result.isConflict() ? result.getConflict().getSnapshot() : result.getData();
                try {
                    String current = read(snapshot);
                    String alternate = result.isConflict() ? read(result.getConflict().getConflictingSnapshot()) : null;
                    if (!writing) {
                        client.discardAndClose(snapshot);
                        if (result.isConflict()) client.discardAndClose(result.getConflict().getConflictingSnapshot());
                        busy = false;
                        JSObject response = new JSObject().put("value", current).put("ready", true).put("accountId", account).put("cloudAvailable", true);
                        if (alternate != null) response.put("conflictValue", alternate);
                        call.resolve(response); return;
                    }
                    String expected = call.getString("expectedRevision");
                    if (!java.util.Objects.equals(revision(current), expected) && (alternate == null || !java.util.Objects.equals(revision(alternate), expected))) {
                        client.discardAndClose(snapshot);
                        if (result.isConflict()) client.discardAndClose(result.getConflict().getConflictingSnapshot());
                        busy = false; call.resolve(new JSObject().put("success", false).put("conflict", true).put("value", current)); return;
                    }
                    String value = call.getString("value");
                    if (value == null || value.getBytes(StandardCharsets.UTF_8).length > 950000) throw new Exception("Kayıt boyutu desteklenmiyor");
                    new JSONObject(value);
                    var preferences = getContext().getSharedPreferences("patilife_recovery", 0);
                    preferences.edit().putString("previous-" + account, preferences.getString(account, current)).putString(account, value).apply();
                    if (!snapshot.getSnapshotContents().writeBytes(value.getBytes(StandardCharsets.UTF_8))) throw new Exception("Kayıt yazılamadı");
                    var change = new SnapshotMetadataChange.Builder().setDescription("PatiLife oyun kaydı").build();
                    if (result.isConflict()) {
                        client.resolveConflict(result.getConflict().getConflictId(), snapshot).addOnSuccessListener(resolved -> {
                            if (resolved.isConflict()) { busy=false; call.reject("Kayıt tekrar değişti; yeniden karşılaştır."); return; }
                            client.commitAndClose(resolved.getData(), change).addOnSuccessListener(metadata -> success(call)).addOnFailureListener(error -> failure(call,error));
                        }).addOnFailureListener(error -> failure(call,error));
                    } else client.commitAndClose(snapshot, change).addOnSuccessListener(metadata -> success(call)).addOnFailureListener(error -> failure(call,error));
                } catch (Exception error) { client.discardAndClose(snapshot); failure(call,error); }
            }).addOnFailureListener(error -> failure(call,error));
        });
    }
    private void success(PluginCall call) { busy=false; call.resolve(new JSObject().put("success",true).put("cloudAvailable",true).put("remoteConfirmed",true)); }
    private void failure(PluginCall call, Exception error) { busy=false; call.reject("Play Games kaydı tamamlanamadı. Cihaz kaydın korunuyor.",error); }
    @PluginMethod public void loadFromCloud(PluginCall call) { open(call,false); }
    @PluginMethod public void saveToCloud(PluginCall call) { open(call,true); }
}
