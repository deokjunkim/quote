from flask import Flask, render_template
import os

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.environ.get("SECRET_KEY", "dev_only_change_me")

SF_FRAME_ANCESTORS = "https://*.my.salesforce.com https://*.lightning.force.com"

@app.after_request
def set_security_headers(resp):
    # 인라인 스크립트/스타일을 안 쓰는 전제 -> unsafe-inline 제거 가능
    resp.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://cdnjs.cloudflare.com; "
        "style-src 'self'; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        f"frame-ancestors {SF_FRAME_ANCESTORS};"
    )
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["Referrer-Policy"] = "no-referrer"
    return resp

@app.get("/")
def index():
    return render_template("create_quote.html", VERSION="0.1")

if __name__ == "__main__":
    app.run(debug=True)
