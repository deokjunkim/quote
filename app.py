# app.py
from flask import Flask, render_template, request, jsonify, make_response
from markupsafe import Markup
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev_only_change_me")

# Salesforce에서만 프레임 삽입 허용 (CSP)
SF_FRAME_ANCESTORS = "https://*.my.salesforce.com https://*.lightning.force.com"

@app.after_request
def set_security_headers(resp):
    resp.headers["Content-Security-Policy"] = (
        f"default-src 'self'; "
        f"script-src 'self' https://cdnjs.cloudflare.com; "
        f"style-src 'self' 'unsafe-inline'; "
        f"img-src 'self' data:; "
        f"connect-src 'self'; "
        f"frame-ancestors {SF_FRAME_ANCESTORS};"
    )
    # iFrame 쿠키 사용 시 필요
    resp.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    resp.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return resp

@app.route("/")
def index():
    # 간단한 템플릿 렌더. 버전은 헤더/배지로 노출
    return render_template("CreateQuote.html", VERSION="0.1")

@app.post("/api/save")
def save_design():
    # TODO: CSRF 검증 + dom sanitize (서버측 추가 필터링 권장)
    data = request.get_json(force=True)
    # 여기서는 메모리 저장/에코만 (v0.1)
    return jsonify({"ok": True, "echo": data})

@app.post("/api/sf-push")
def push_to_salesforce():
    # Salesforce로 전달할 payload 수신 → 추후 SF API 연동 지점
    payload = request.get_json(force=True)
    # TODO: OAuth/JWT 연결
    return jsonify({"ok": True, "sent": payload})

if __name__ == "__main__":
    app.run(debug=True)
