package com.anshumaan.tradingpractice;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.core.content.FileProvider;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import org.json.JSONObject;
import java.util.concurrent.Executors;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/*
 * Trading Interview Practice, packed into the app. Pages load from a fixed https address inside the app
 * (appassets.androidplatform.net), so saved progress (localStorage, IndexedDB) belongs to the same origin in every
 * version and survives updates installed over the old app.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/index.html";
    private static final int REQ_FILES = 1, REQ_SAVE = 2;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private Uri photoUri;
    private String pendingData;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/assets/", new AssetHandler())
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return loader.shouldInterceptRequest(req.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException e) { /* nothing to open it with */ }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                return openChooser(params);
            }
        });

        web.addJavascriptInterface(new Bridge(), "WBAndroid");
        edgeAll();
        if (state != null) web.restoreState(state);
        else web.loadUrl(START);
    }

    /* Files (backups, question packs); the camera is offered too when a page asks for images. */
    private boolean openChooser(WebChromeClient.FileChooserParams params) {
        Intent pick = params.createIntent();
        pick.addCategory(Intent.CATEGORY_OPENABLE);
        if (params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        List<Intent> extra = new ArrayList<>();
        photoUri = null;
        String[] types = params.getAcceptTypes();
        boolean images = types == null || types.length == 0;
        if (types != null) for (String t : types) if (t == null || t.isEmpty() || t.startsWith("image")) images = true;
        if (images) {
            try {
                File dir = new File(getCacheDir(), "photos");
                if (!dir.exists()) dir.mkdirs();
                File f = File.createTempFile("photo", ".jpg", dir);
                photoUri = FileProvider.getUriForFile(this, "com.anshumaan.tradingpractice.files", f);
                Intent cam = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                cam.putExtra(MediaStore.EXTRA_OUTPUT, photoUri);
                cam.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                if (cam.resolveActivity(getPackageManager()) != null) extra.add(cam);
            } catch (IOException e) { photoUri = null; }
        }
        Intent chooser;
        if (params.isCaptureEnabled() && !extra.isEmpty()) chooser = extra.get(0);
        else {
            chooser = Intent.createChooser(pick, null);
            if (!extra.isEmpty()) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, extra.toArray(new Intent[0]));
        }
        try { startActivityForResult(chooser, REQ_FILES); return true; }
        catch (ActivityNotFoundException e) { fileCallback = null; return false; }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILES) {
            Uri[] out = null;
            if (res == RESULT_OK) {
                if (data != null && data.getClipData() != null) {
                    int n = data.getClipData().getItemCount();
                    out = new Uri[n];
                    for (int i = 0; i < n; i++) out[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data != null && data.getData() != null) out = new Uri[]{data.getData()};
                else if (photoUri != null) out = new Uri[]{photoUri};
            }
            if (fileCallback != null) fileCallback.onReceiveValue(out);
            fileCallback = null;
            return;
        }
        if (req == REQ_SAVE) {
            String d = pendingData;
            pendingData = null;
            if (res != RESULT_OK || data == null || data.getData() == null || d == null) return;
            try (OutputStream o = getContentResolver().openOutputStream(data.getData())) {
                o.write(d.getBytes(StandardCharsets.UTF_8));
                toastWeb("Backup saved");
            } catch (Exception e) {
                toastWeb("Couldn't save the backup");
            }
            return;
        }
        super.onActivityResult(req, res, data);
    }

    private void toastWeb(String msg) {
        web.evaluateJavascript("window.wbToast&&window.wbToast(" + org.json.JSONObject.quote(msg) + ")", null);
    }

    /* Export Backup: the page hands over the JSON, and Android asks where to save it. */
    private class Bridge {
        @JavascriptInterface
        public void saveFile(final String name, final String data) {
            runOnUiThread(() -> {
                pendingData = data;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/json");
                i.putExtra(Intent.EXTRA_TITLE, name);
                try { startActivityForResult(i, REQ_SAVE); }
                catch (ActivityNotFoundException e) { pendingData = null; Toast.makeText(MainActivity.this, "No app can save files", Toast.LENGTH_LONG).show(); }
            });
        }

        /* Google sign-in (27 Nov): Google blocks its sign-in page inside a WebView, so Android's own account picker
           (Credential Manager) gets a Google ID token and hands it to the page, which signs in to Firebase with it. */
        /* sign-in screens (27 Nov): the navy backdrop runs edge to edge, behind the status and button bars */
        @JavascriptInterface
        public void setBars(boolean light) { runOnUiThread(() -> bars(light)); }
        @JavascriptInterface
        public void setEdge(boolean on) { runOnUiThread(() -> bars(on)); }

        @JavascriptInterface
        public void googleSignIn() {
            runOnUiThread(() -> {
                GetSignInWithGoogleOption opt = new GetSignInWithGoogleOption.Builder(WEB_CLIENT_ID).build();
                GetCredentialRequest req = new GetCredentialRequest.Builder().addCredentialOption(opt).build();
                CredentialManager.create(MainActivity.this).getCredentialAsync(MainActivity.this, req, null, Executors.newSingleThreadExecutor(),
                    new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                        @Override public void onResult(GetCredentialResponse r) {
                            Credential c = r.getCredential();
                            if (c instanceof CustomCredential && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(c.getType())) {
                                String tok = GoogleIdTokenCredential.createFrom(c.getData()).getIdToken();
                                toPage("wbGoogleIdToken", tok);
                            } else toPage("wbGoogleError", "Google sign-in didn't return an account.");
                        }
                        @Override public void onError(GetCredentialException e) {
                            toPage("wbGoogleError", e instanceof GetCredentialCancellationException ? "" : "Google sign-in failed. Check you have a Google account on this phone, or use email.");
                        }
                    });
            });
        }
    }

    private static final String WEB_CLIENT_ID = "671680895091-olrct43e9ui7sc9o27qd0278t8v420tc.apps.googleusercontent.com";

    private void toPage(String fn, String arg) {
        final String js = "window." + fn + "&&window." + fn + "(" + JSONObject.quote(arg) + ")";
        runOnUiThread(() -> web.evaluateJavascript(js, null));
    }

    /* Serves the packed site from assets/site with the right content types (.wasm for the C++ compiler and Python). */
    /* edge to edge everywhere (27 Nov): the page draws behind the status and button bars; the bars are see-through
       and the page gets their heights as --sat / --sab. The page picks light or dark bar icons (setBars). */
    private boolean lightIcons = true;
    private void edgeAll() {
        android.view.Window w = getWindow();
        w.setStatusBarColor(android.graphics.Color.TRANSPARENT); w.setNavigationBarColor(android.graphics.Color.TRANSPARENT);
        if (android.os.Build.VERSION.SDK_INT >= 29) { w.setStatusBarContrastEnforced(false); w.setNavigationBarContrastEnforced(false); }
        if (android.os.Build.VERSION.SDK_INT >= 28) w.getAttributes().layoutInDisplayCutoutMode = android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        flags();
        w.getDecorView().setOnApplyWindowInsetsListener((v, in) -> { web.post(this::sendInsets); return v.onApplyWindowInsets(in); });
    }
    private void flags() {
        int f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
        if (!lightIcons) f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | (android.os.Build.VERSION.SDK_INT >= 26 ? View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : 0);
        getWindow().getDecorView().setSystemUiVisibility(f);
    }
    private void bars(boolean light) { lightIcons = light; flags(); sendInsets(); }
    /* the bars' heights, in CSS pixels */
    private void sendInsets() {
        android.view.WindowInsets in = getWindow().getDecorView().getRootWindowInsets(); if (in == null || web == null) return;
        float dp = getResources().getDisplayMetrics().density;
        web.evaluateJavascript("document.documentElement.style.setProperty('--sat','" + Math.round(in.getSystemWindowInsetTop() / dp) + "px');"
            + "document.documentElement.style.setProperty('--sab','" + Math.round(in.getSystemWindowInsetBottom() / dp) + "px')", null);
    }

    private class AssetHandler implements WebViewAssetLoader.PathHandler {
        @Override
        public WebResourceResponse handle(String path) {
            try {
                InputStream in = getAssets().open("site/" + (path.isEmpty() ? "index.html" : path));
                return new WebResourceResponse(mime(path), mime(path).startsWith("text") || mime(path).endsWith("json") || mime(path).endsWith("javascript") ? "utf-8" : null, in);
            } catch (IOException e) {
                return null;
            }
        }
    }

    private static String mime(String p) {
        String l = p.toLowerCase();
        if (l.endsWith(".html") || l.isEmpty()) return "text/html";
        if (l.endsWith(".js") || l.endsWith(".mjs")) return "text/javascript";
        if (l.endsWith(".css")) return "text/css";
        if (l.endsWith(".json") || l.endsWith(".webmanifest")) return "application/json";
        if (l.endsWith(".png")) return "image/png";
        if (l.endsWith(".svg")) return "image/svg+xml";
        if (l.endsWith(".woff2")) return "font/woff2";
        if (l.endsWith(".wasm")) return "application/wasm";
        if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
        if (l.endsWith(".md")) return "text/plain";
        return "application/octet-stream";
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }
}
