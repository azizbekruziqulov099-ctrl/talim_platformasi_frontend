package uz.talimkabutar.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.OpenableColumns
import android.webkit.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import java.io.ByteArrayInputStream
import java.net.URLEncoder

/**
 * Ta'lim AI — talimkabutar.uz ilovasi.
 * Telegram yoki boshqa ilovadan kelgan hujjat (PDF, Word, Excel, PowerPoint) baytlari ilova xotirasida saqlanadi
 * va sahifa https://talimkabutar.uz/__ilova_fayl manzilidan so'raganda WebView'ning o'zi qaytaradi — fayl serverga yuborilmaydi.
 */
class MainActivity : AppCompatActivity() {
    private lateinit var web: WebView
    private var faylBayt: ByteArray? = null
    private var faylNomi: String = "hujjat"
    private var faylTuri: String = "application/octet-stream"
    private var tanlashChaqiruvi: ValueCallback<Array<Uri>>? = null
    private var kutilayotganRuxsat: PermissionRequest? = null

    private val faylTanlash = registerForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        tanlashChaqiruvi?.onReceiveValue(uris.toTypedArray()); tanlashChaqiruvi = null
    }
    private val ruxsatSorash = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { natija ->
        val r = kutilayotganRuxsat ?: return@registerForActivityResult
        val ber = r.resources.filter { (it == PermissionRequest.RESOURCE_AUDIO_CAPTURE && natija[Manifest.permission.RECORD_AUDIO] == true) ||
            (it == PermissionRequest.RESOURCE_VIDEO_CAPTURE && natija[Manifest.permission.CAMERA] == true) }
        if (ber.isNotEmpty()) r.grant(ber.toTypedArray()) else r.deny()
        kutilayotganRuxsat = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        setContentView(web)
        with(web.settings) {
            javaScriptEnabled = true; domStorageEnabled = true; databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false; allowFileAccess = false; allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            userAgentString = "$userAgentString TalimAI-Android/1.0"
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                val u = request.url
                if (u.host == "talimkabutar.uz" && u.path == "/__ilova_fayl") {
                    val b = faylBayt ?: return WebResourceResponse("text/plain", "utf-8", 404, "Not found", mapOf(), ByteArrayInputStream(ByteArray(0)))
                    return WebResourceResponse(faylTuri, null, 200, "OK", mapOf("x-fayl-nomi" to URLEncoder.encode(faylNomi, "UTF-8"), "Cache-Control" to "no-store"), ByteArrayInputStream(b))
                }
                return null
            }
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val u = request.url
                if (u.host == "talimkabutar.uz" || u.host?.endsWith(".talimkabutar.uz") == true) return false
                return try { startActivity(Intent(Intent.ACTION_VIEW, u)); true } catch (e: Exception) { false }   // tashqi havolalar — brauzerda
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(w: WebView, cb: ValueCallback<Array<Uri>>, p: FileChooserParams): Boolean {
                tanlashChaqiruvi?.onReceiveValue(null); tanlashChaqiruvi = cb
                val tur = p.acceptTypes.firstOrNull { it.isNotBlank() }?.let { if (it.startsWith(".")) "*/*" else it } ?: "*/*"
                faylTanlash.launch(tur); return true
            }
            override fun onPermissionRequest(r: PermissionRequest) {
                val kerak = mutableListOf<String>()
                if (r.resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) kerak += Manifest.permission.RECORD_AUDIO
                if (r.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) kerak += Manifest.permission.CAMERA
                val yoq = kerak.filter { ContextCompat.checkSelfPermission(this@MainActivity, it) != PackageManager.PERMISSION_GRANTED }
                if (yoq.isEmpty()) r.grant(r.resources) else { kutilayotganRuxsat = r; ruxsatSorash.launch(yoq.toTypedArray()) }
            }
        }
        web.setDownloadListener { url, ua, cd, mime, _ ->
            try {
                val so = DownloadManager.Request(Uri.parse(url)).setMimeType(mime).addRequestHeader("User-Agent", ua)
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, cd, mime))
                (getSystemService(DOWNLOAD_SERVICE) as DownloadManager).enqueue(so)
            } catch (e: Exception) { }
        }
        if (!hujjatniOch(intent)) web.loadUrl(intent?.data?.takeIf { it.host == "talimkabutar.uz" }?.toString() ?: "https://talimkabutar.uz/")
    }

    override fun onNewIntent(intent: Intent) { super.onNewIntent(intent); setIntent(intent)
        if (!hujjatniOch(intent)) intent.data?.takeIf { it.host == "talimkabutar.uz" }?.let { web.loadUrl(it.toString()) } }

    /** VIEW yoki SEND bilan kelgan faylni o'qib, hujjat ko'ruvchini ochadi. */
    private fun hujjatniOch(i: Intent?): Boolean {
        val uri: Uri = when (i?.action) {
            Intent.ACTION_VIEW -> i.data?.takeIf { it.scheme == "content" || it.scheme == "file" }
            Intent.ACTION_SEND -> @Suppress("DEPRECATION") (i.getParcelableExtra(Intent.EXTRA_STREAM) as? Uri)
            else -> null
        } ?: return false
        return try {
            contentResolver.query(uri, null, null, null, null)?.use { c -> val k = c.getColumnIndex(OpenableColumns.DISPLAY_NAME); if (k >= 0 && c.moveToFirst()) faylNomi = c.getString(k) ?: faylNomi }
            faylTuri = contentResolver.getType(uri) ?: i?.type ?: faylTuri
            faylBayt = contentResolver.openInputStream(uri)?.use { it.readBytes() }
            web.loadUrl("https://talimkabutar.uz/?hujjat=ilova&nom=" + URLEncoder.encode(faylNomi, "UTF-8"))
            true
        } catch (e: Exception) { false }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() { if (web.canGoBack()) web.goBack() else @Suppress("DEPRECATION") super.onBackPressed() }
}
