from fastapi import FastAPI, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
import os
import stripe
import json
import uuid

from database import engine, get_db, Base
from models import User, Analysis, IPTracker, Generation, ChatSession, ScheduledPost
from schemas import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_user, require_admin,
    is_admin_email, get_client_ip,
)
from ai_analyzer import analyze_with_claude
from video_generator import generate_improved_video
from booster import generate_boost_strategy
from chatbot import chat_with_ai_sync, build_analysis_context

from dotenv import load_dotenv
load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

PRICE_IDS = {
    "pubs_launch_monthly": os.getenv("PRICE_PUBS_LAUNCH_MONTHLY", "price_1T8fldCYNAXNA5JeCYEva4u5"),
    "pubs_launch_yearly": os.getenv("PRICE_PUBS_LAUNCH_YEARLY", "price_1T8fuVCYNAXNA5Jew2SVMVje"),
    "reseaux_launch_monthly": os.getenv("PRICE_RESEAUX_LAUNCH_MONTHLY", "price_1T8fzkCYNAXNA5JeDqq1Rh2E"),
    "reseaux_launch_yearly": os.getenv("PRICE_RESEAUX_LAUNCH_YEARLY", "price_1T8g1LCYNAXNA5JeosOtWy3q"),
    "combo_launch_monthly": os.getenv("PRICE_COMBO_LAUNCH_MONTHLY", "price_1TEWFwCYNAXNA5JeWsUNFbVn"),
    "combo_launch_yearly": os.getenv("PRICE_COMBO_LAUNCH_YEARLY", "price_1T8g73CYNAXNA5JegWJEvfPL"),
    "individual": os.getenv("PRICE_INDIVIDUAL", "price_1T8gBcCYNAXNA5JejwvshLJS"),
}

# ============================================================
# APP (MUST BE BEFORE ANY @app.xxx)
# ============================================================
print("Starting PronosysIA backend...")

app = FastAPI(title="PronosysIA API", version="2.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    Base.metadata.create_all(bind=engine)
    print("DB tables created OK")
except Exception as e:
    print("DB init warning (will retry): " + str(e))

print("App ready, waiting for requests...")

MAX_FREE_ANALYSES = 3
MAX_FREE_GENERATIONS = 1
MAX_FREE_BOOSTS = 1
chatbot_sessions = {}


@app.post("/api/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est deja utilise.")
    user = User(name=req.name, email=req.email.lower(), hashed_password=hash_password(req.password), plan="free", is_admin=is_admin_email(req.email))
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=create_access_token({"sub": str(user.id)}), user=UserResponse.model_validate(user))

@app.post("/api/auth/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")
    return AuthResponse(access_token=create_access_token({"sub": str(user.id)}), user=UserResponse.model_validate(user))

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(require_user)):
    return UserResponse.model_validate(user)


@app.get("/api/free-usage")
def get_free_usage(request: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(request)
    tracker = db.query(IPTracker).filter(IPTracker.ip_address == ip).first()
    used = tracker.analysis_count if tracker else 0
    return {"used": used, "remaining": max(0, MAX_FREE_ANALYSES - used), "max_free": MAX_FREE_ANALYSES}

def check_and_increment_free_usage(ip, db):
    tracker = db.query(IPTracker).filter(IPTracker.ip_address == ip).first()
    if not tracker:
        db.add(IPTracker(ip_address=ip, analysis_count=1))
        db.commit()
        return True
    if tracker.analysis_count >= MAX_FREE_ANALYSES:
        return False
    tracker.analysis_count += 1
    tracker.last_analysis_at = datetime.now(timezone.utc)
    db.commit()
    return True

def can_user_analyze(user, category, ip, db):
    if user and user.is_admin:
        return True
    if user and user.plan == "premium_pubs":
        if category == "reseaux":
            raise HTTPException(status_code=403, detail="Votre plan Premium Power ne donne acces qu'aux analyses Pubs.")
        return True
    if user and user.plan == "premium_reseaux":
        if category == "pubs":
            raise HTTPException(status_code=403, detail="Votre plan Premium Creator ne donne acces qu'aux analyses Reseaux.")
        return True
    if user and user.plan == "premium_combo":
        return True
    if user and user.plan == "individual" and user.individual_credits > 0:
        user.individual_credits -= 1
        db.commit()
        return True
    if user:
        total = db.query(Analysis).filter(Analysis.user_id == user.id).count()
        if total >= MAX_FREE_ANALYSES:
            raise HTTPException(status_code=403, detail="Limite de 3 analyses atteinte. Passez a Premium.")
        return True
    return check_and_increment_free_usage(ip, db)

def can_user_generate(user, ip, db):
    if user and user.is_admin:
        return True
    if user and user.plan in ("premium_pubs", "premium_reseaux", "premium_combo"):
        return True
    if user:
        count = db.query(Generation).filter(Generation.user_id == user.id).count()
        if count >= MAX_FREE_GENERATIONS:
            raise HTTPException(status_code=403, detail="Generation gratuite utilisee. Passez a Premium.")
        return True
    tracker = db.query(IPTracker).filter(IPTracker.ip_address == ip).first()
    if not tracker:
        return True
    return (getattr(tracker, "generation_count", 0) or 0) < MAX_FREE_GENERATIONS

def can_user_boost(user, ip, db):
    if user and user.is_admin:
        return True
    if user and user.plan in ("premium_pubs", "premium_reseaux", "premium_combo"):
        return True
    if user:
        return True
    tracker = db.query(IPTracker).filter(IPTracker.ip_address == ip).first()
    if not tracker:
        return True
    return (getattr(tracker, "boost_count", 0) or 0) < MAX_FREE_BOOSTS


@app.post("/api/analyze")
async def analyze_video(request: Request, video: UploadFile = File(...), category: str = Form(...), platform: str = Form(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if category not in ("pubs", "reseaux"):
        raise HTTPException(status_code=400, detail="Categorie invalide.")
    if video.content_type not in ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]:
        raise HTTPException(status_code=400, detail="Format non supporte.")
    ip = get_client_ip(request)
    can_user_analyze(user, category, ip, db)
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, datetime.now().strftime("%Y%m%d%H%M%S") + "_" + video.filename)
    content = await video.read()
    with open(file_path, "wb") as f:
        f.write(content)
    analysis = Analysis(user_id=user.id if user else None, ip_address=ip, category=category, platform=platform, filename=video.filename, file_size=len(content), status="processing")
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    is_premium = user and (user.is_admin or user.plan in ("premium_pubs", "premium_reseaux", "premium_combo"))
    try:
        result = analyze_with_claude(category, platform, file_path, video.filename)
    except Exception as e:
        print("Erreur analyse: " + str(e))
        from ai_analyzer import analyze_fallback, get_video_metadata
        result = analyze_fallback(category, platform, get_video_metadata(file_path), video.filename)
    analysis.global_score = result.get("global_score", 50)
    analysis.criteria_scores = result.get("criteria", [])
    analysis.summary = result.get("summary", "")
    analysis.tags = result.get("tags", [])
    analysis.strengths = result.get("strengths", []) if is_premium else None
    analysis.weaknesses = result.get("weaknesses", []) if is_premium else None
    analysis.suggestions = result.get("suggestions", []) if is_premium else None
    analysis.views_prediction = result.get("views_prediction")
    analysis.status = "completed"
    db.commit()
    db.refresh(analysis)
    try:
        os.remove(file_path)
    except OSError:
        pass
    return {
        "id": analysis.id, "category": analysis.category, "platform": analysis.platform,
        "filename": analysis.filename, "global_score": analysis.global_score,
        "criteria_scores": result.get("criteria", []), "summary": analysis.summary,
        "tags": result.get("tags", []),
        "strengths": result.get("strengths", []) if is_premium else None,
        "weaknesses": result.get("weaknesses", []) if is_premium else None,
        "suggestions": result.get("suggestions", []) if is_premium else None,
        "views_prediction": result.get("views_prediction"),
        "status": analysis.status, "created_at": analysis.created_at.isoformat()
    }


@app.post("/api/generate")
async def generate_video_script(request: Request, video: UploadFile = File(...), category: str = Form(...), platform: str = Form(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if video.content_type not in ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]:
        raise HTTPException(status_code=400, detail="Format non supporte.")
    ip = get_client_ip(request)
    can_user_generate(user, ip, db)
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, "gen_" + datetime.now().strftime("%Y%m%d%H%M%S") + "_" + video.filename)
    content = await video.read()
    with open(file_path, "wb") as f:
        f.write(content)
    try:
        result = generate_improved_video(category, platform, file_path, video.filename)
    except Exception as e:
        from video_generator import generate_fallback
        from ai_analyzer import get_video_metadata
        result = generate_fallback(category, platform, get_video_metadata(file_path))
    gen = Generation(
        user_id=user.id if user else None, ip_address=ip, category=category, platform=platform,
        filename=video.filename, title=result.get("title"), concept=result.get("concept"),
        content_type=result.get("video_analysis", {}).get("content_type") if isinstance(result.get("video_analysis"), dict) else None,
        subject=result.get("video_analysis", {}).get("subject") if isinstance(result.get("video_analysis"), dict) else None,
        target_score=result.get("target_score"), duration_seconds=result.get("duration_seconds"),
        video_analysis=result.get("video_analysis"), script=result.get("script"),
        music_recommendations=result.get("music_recommendations"), editing_tips=result.get("editing_tips"),
        viral_hooks=result.get("viral_hooks_alternatives"), hashtags=result.get("hashtags_suggested"),
        ai_prompt=result.get("ai_generation_prompt"), estimated_improvement=result.get("estimated_improvement"),
        full_result=result,
    )
    db.add(gen)
    db.commit()
    if not (user and (user.is_admin or user.plan in ("premium_pubs", "premium_reseaux", "premium_combo"))):
        tracker = db.query(IPTracker).filter(IPTracker.ip_address == ip).first()
        if tracker:
            tracker.generation_count = (getattr(tracker, "generation_count", 0) or 0) + 1
            db.commit()
        else:
            db.add(IPTracker(ip_address=ip, analysis_count=0, generation_count=1))
            db.commit()
    try:
        os.remove(file_path)
    except OSError:
        pass
    return result


@app.post("/api/boost")
async def boost_publication(request: Request, video: UploadFile = File(...), category: str = Form(...), platform: str = Form(...), preferred_days: str = Form(""), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if video.content_type not in ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]:
        raise HTTPException(status_code=400, detail="Format non supporte.")
    ip = get_client_ip(request)
    if not can_user_boost(user, ip, db):
        raise HTTPException(status_code=403, detail="Boost gratuit utilise. Passez a Premium.")
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, "boost_" + datetime.now().strftime("%Y%m%d%H%M%S") + "_" + video.filename)
    content = await video.read()
    with open(file_path, "wb") as f:
        f.write(content)
    days_list = [d.strip() for d in preferred_days.split(",") if d.strip()] if preferred_days else None
    try:
        result = generate_boost_strategy(category, platform, file_path, video.filename, days_list)
    except Exception as e:
        from booster import generate_boost_fallback
        result = generate_boost_fallback(platform, datetime.now())
    if not (user and (user.is_admin or user.plan in ("premium_pubs", "premium_reseaux", "premium_combo"))):
        tracker = db.query(IPTracker).filter(IPTracker.ip_address == ip).first()
        if tracker:
            tracker.boost_count = (getattr(tracker, "boost_count", 0) or 0) + 1
            db.commit()
        else:
            db.add(IPTracker(ip_address=ip, analysis_count=0, boost_count=1))
            db.commit()
    try:
        os.remove(file_path)
    except OSError:
        pass
    return result


@app.post("/api/chatbot/start")
def chatbot_start(request_data: dict, user: User = Depends(require_user), db: Session = Depends(get_db)):
    if not user.is_admin and user.plan != "premium_combo":
        raise HTTPException(status_code=403, detail="Le Chatbot Video IA est reserve au plan Combo Elite.")
    analysis_data = request_data.get("analysis_data", {})
    context = build_analysis_context(analysis_data)
    session_id = str(uuid.uuid4())
    initial_messages = [{"role": "user", "content": "J'ai uploade ma video et voici l'analyse. Aide-moi a creer une version amelioree qui vise un score de 90+. Commence par me poser des questions sur mon contenu."}]
    result = chat_with_ai_sync(initial_messages, context)
    chatbot_sessions[session_id] = {"user_id": user.id, "analysis_context": context, "analysis_data": analysis_data}
    all_msgs = initial_messages + [{"role": "assistant", "content": result["response"]}]
    chat_db = ChatSession(session_id=session_id, user_id=user.id, filename=analysis_data.get("filename"), platform=analysis_data.get("platform"), analysis_score=analysis_data.get("global_score"), messages=all_msgs, script_data=result.get("script_data"), status="active")
    db.add(chat_db)
    db.commit()
    return {"session_id": session_id, "response": result["response"], "script_data": result.get("script_data")}

@app.post("/api/chatbot/message")
def chatbot_message(request_data: dict, user: User = Depends(require_user), db: Session = Depends(get_db)):
    session_id = request_data.get("session_id", "")
    messages = request_data.get("messages", [])
    analysis_data = request_data.get("analysis_data", {})
    context = ""
    if session_id in chatbot_sessions:
        context = chatbot_sessions[session_id]["analysis_context"]
    elif analysis_data:
        context = build_analysis_context(analysis_data)
    result = chat_with_ai_sync(messages, context)
    all_msgs = messages + [{"role": "assistant", "content": result["response"]}]
    chat_db = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if chat_db:
        chat_db.messages = all_msgs
        if result.get("script_data"):
            chat_db.script_data = result["script_data"]
        if result.get("generate_video"):
            chat_db.status = "video_requested"
        db.commit()
    return {"response": result["response"], "script_data": result.get("script_data"), "generate_video": result.get("generate_video")}

@app.post("/api/chatbot/generate-video")
def chatbot_generate_video(request_data: dict, user: User = Depends(require_user)):
    return {"error": False, "message": "La generation video IA sera bientot disponible.", "video_url": None}

@app.get("/api/chat-sessions")
def get_chat_sessions(user: User = Depends(require_user), db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(ChatSession.created_at.desc()).all()
    return {
        "sessions": [{"id": s.id, "session_id": s.session_id, "filename": s.filename, "platform": s.platform, "analysis_score": s.analysis_score, "messages": s.messages, "script_data": s.script_data, "video_url": s.video_url, "status": s.status, "created_at": s.created_at.isoformat()} for s in sessions],
        "total": len(sessions)
    }


@app.post("/api/feedback")
def submit_feedback(request_data: dict, user: User = Depends(require_user), db: Session = Depends(get_db)):
    return {"status": "ok", "message": "Merci pour votre feedback !"}

@app.get("/api/feedback/{analysis_id}")
def get_feedback(analysis_id: int, user: User = Depends(require_user)):
    return {"feedbacks": []}


@app.post("/api/stripe/create-checkout")
def stripe_create_checkout(request: Request, request_data: dict, user: User = Depends(require_user)):
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Paiement non configure (cle Stripe manquante).")
    plan_type = request_data.get("plan_type")
    billing = request_data.get("billing", "monthly")
    if plan_type not in ("pubs", "reseaux", "combo", "individual"):
        raise HTTPException(status_code=400, detail="Plan invalide.")
    price_key = plan_type + "_launch_" + billing if plan_type != "individual" else "individual"
    price_id = PRICE_IDS.get(price_key)
    if not price_id:
        raise HTTPException(status_code=400, detail="Configuration de prix manquante.")
    try:
        mode = "payment" if plan_type == "individual" else "subscription"
        origin = request.headers.get("origin", "")
        frontend = origin if origin and origin.startswith("http") else os.getenv("FRONTEND_URL", "https://pronosysia.vercel.app")
        session = stripe.checkout.Session.create(
            mode=mode, payment_method_types=["card"], customer_email=user.email,
            line_items=[{"price": price_id, "quantity": 1}],
            metadata={"user_id": str(user.id), "plan_type": plan_type, "billing": billing, "is_launch": "True"},
            success_url=frontend + "/dashboard?payment=success",
            cancel_url=frontend + "/dashboard/subscription",
            allow_promotion_codes=True,
        )
        return {"checkout_url": session.url}
    except stripe.error.AuthenticationError:
        raise HTTPException(status_code=503, detail="Cle Stripe invalide. Contacte le support.")
    except stripe.error.InvalidRequestError as e:
        print("Stripe InvalidRequest: " + str(e))
        raise HTTPException(status_code=400, detail="Erreur de configuration Stripe.")
    except Exception as e:
        print("Erreur Stripe: " + str(e))
        raise HTTPException(status_code=500, detail="Erreur paiement: " + str(e)[:120])

@app.post("/api/stripe/customer-portal")
def stripe_customer_portal(request: Request, user: User = Depends(require_user)):
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="Aucun abonnement.")
    try:
        origin = request.headers.get("origin", "")
        frontend = origin if origin and origin.startswith("http") else os.getenv("FRONTEND_URL", "https://pronosysia.vercel.app")
        session = stripe.billing_portal.Session.create(customer=user.stripe_customer_id, return_url=frontend + "/dashboard/subscription")
        return {"portal_url": session.url}
    except Exception:
        raise HTTPException(status_code=500, detail="Erreur portail.")

@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
        else:
            event = json.loads(payload)
    except Exception:
        raise HTTPException(status_code=400, detail="Signature invalide.")
    data = event.get("data", {}).get("object", {})
    if event.get("type") == "checkout.session.completed":
        meta = data.get("metadata", {})
        user_id = meta.get("user_id")
        if user_id:
            u = db.query(User).filter(User.id == int(user_id)).first()
            if u:
                if meta.get("plan_type") == "individual":
                    u.individual_credits += 2
                else:
                    plan_map = {"pubs": "premium_pubs", "reseaux": "premium_reseaux", "combo": "premium_combo"}
                    u.plan = plan_map.get(meta.get("plan_type"), u.plan)
                    u.is_launch_price = meta.get("is_launch") == "True"
                    u.stripe_customer_id = data.get("customer")
                    u.stripe_subscription_id = data.get("subscription")
                db.commit()
    elif event.get("type") == "customer.subscription.deleted":
        u = db.query(User).filter(User.stripe_subscription_id == data.get("id")).first()
        if u:
            u.plan = "free"
            u.stripe_subscription_id = None
            db.commit()
    return {"status": "ok"}


@app.get("/api/analyses")
def get_analyses(user: User = Depends(require_user), db: Session = Depends(get_db)):
    analyses = db.query(Analysis).filter(Analysis.user_id == user.id).order_by(Analysis.created_at.desc()).all()
    return {
        "analyses": [{"id": a.id, "category": a.category, "platform": a.platform, "filename": a.filename, "global_score": a.global_score, "summary": a.summary, "tags": a.tags, "criteria_scores": a.criteria_scores, "strengths": a.strengths, "weaknesses": a.weaknesses, "suggestions": a.suggestions, "views_prediction": a.views_prediction, "status": a.status, "created_at": a.created_at.isoformat()} for a in analyses],
        "total": len(analyses)
    }

@app.get("/api/generations")
def get_generations(user: User = Depends(require_user), db: Session = Depends(get_db)):
    gens = db.query(Generation).filter(Generation.user_id == user.id).order_by(Generation.created_at.desc()).all()
    return {
        "generations": [{"id": g.id, "category": g.category, "platform": g.platform, "filename": g.filename, "title": g.title, "concept": g.concept, "content_type": g.content_type, "subject": g.subject, "target_score": g.target_score, "duration_seconds": g.duration_seconds, "full_result": g.full_result, "created_at": g.created_at.isoformat()} for g in gens],
        "total": len(gens)
    }


@app.get("/api/subscription")
def get_subscription(user: User = Depends(require_user)):
    return {"plan": user.plan, "is_launch_price": user.is_launch_price, "individual_credits": user.individual_credits, "is_admin": user.is_admin, "stripe_customer_id": user.stripe_customer_id is not None}

@app.get("/api/dashboard-stats")
def get_dashboard_stats(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ip = get_client_ip(request)
    if user:
        total = db.query(Analysis).filter(Analysis.user_id == user.id).count()
        avg = db.query(func.avg(Analysis.global_score)).filter(Analysis.user_id == user.id, Analysis.global_score.isnot(None)).scalar()
        avg = round(avg, 1) if avg else None
        if user.is_admin or user.plan in ("premium_pubs", "premium_reseaux", "premium_combo"):
            remaining = "illimite"
        elif user.plan == "individual":
            remaining = user.individual_credits
        else:
            remaining = max(0, MAX_FREE_ANALYSES - total)
        labels = {"free": "Gratuit", "premium_pubs": "Premium Power", "premium_reseaux": "Premium Creator", "premium_combo": "Combo Elite", "individual": "Individuel"}
        return {"total_analyses": total, "remaining": remaining, "avg_score": avg, "plan": "Admin" if user.is_admin else labels.get(user.plan, "Gratuit"), "is_admin": user.is_admin}
    else:
        t = db.query(IPTracker).filter(IPTracker.ip_address == ip).first()
        used = t.analysis_count if t else 0
        return {"total_analyses": used, "remaining": max(0, MAX_FREE_ANALYSES - used), "avg_score": None, "plan": "Gratuit", "is_admin": False}


@app.get("/api/admin/users")
def admin_get_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "plan": u.plan, "is_admin": u.is_admin, "individual_credits": u.individual_credits, "analyses_count": db.query(Analysis).filter(Analysis.user_id == u.id).count(), "generations_count": db.query(Generation).filter(Generation.user_id == u.id).count(), "chat_sessions_count": db.query(ChatSession).filter(ChatSession.user_id == u.id).count(), "created_at": u.created_at.isoformat()} for u in users]

@app.get("/api/admin/stats")
def admin_get_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {"total_users": db.query(User).count(), "total_analyses": db.query(Analysis).count(), "total_generations": db.query(Generation).count(), "total_chat_sessions": db.query(ChatSession).count(), "premium_users": db.query(User).filter(User.plan != "free").count(), "free_ips_tracked": db.query(IPTracker).count()}

@app.get("/api/admin/user/{user_id}/details")
def admin_get_user_details(user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    analyses = db.query(Analysis).filter(Analysis.user_id == user_id).order_by(Analysis.created_at.desc()).all()
    generations = db.query(Generation).filter(Generation.user_id == user_id).order_by(Generation.created_at.desc()).all()
    chats = db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(ChatSession.created_at.desc()).all()
    return {
        "user": {"id": target.id, "name": target.name, "email": target.email, "plan": target.plan, "is_admin": target.is_admin, "created_at": target.created_at.isoformat()},
        "analyses": [{"id": a.id, "category": a.category, "platform": a.platform, "filename": a.filename, "global_score": a.global_score, "created_at": a.created_at.isoformat()} for a in analyses],
        "generations": [{"id": g.id, "filename": g.filename, "title": g.title, "platform": g.platform, "created_at": g.created_at.isoformat()} for g in generations],
        "chat_sessions": [{"id": s.id, "filename": s.filename, "messages": s.messages, "status": s.status, "created_at": s.created_at.isoformat()} for s in chats],
    }

@app.delete("/api/admin/user/{user_id}")
def admin_delete_user(user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    if target.is_admin:
        raise HTTPException(status_code=403, detail="Impossible de supprimer un admin.")
    db.query(ChatSession).filter(ChatSession.user_id == user_id).delete()
    db.query(Generation).filter(Generation.user_id == user_id).delete()
    db.query(Analysis).filter(Analysis.user_id == user_id).delete()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    return {"status": "deleted", "user_id": user_id}

@app.put("/api/admin/user/{user_id}/plan")
def admin_change_plan(user_id: int, request_data: dict, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    new_plan = request_data.get("plan", "free")
    if new_plan not in ("free", "premium_pubs", "premium_reseaux", "premium_combo"):
        raise HTTPException(status_code=400, detail="Plan invalide.")
    target.plan = new_plan
    db.commit()
    return {"status": "updated", "user_id": user_id, "new_plan": new_plan}


@app.post("/api/scheduled-posts")
def create_scheduled_post(request_data: dict, user: User = Depends(require_user), db: Session = Depends(get_db)):
    platform = request_data.get("platform")
    scheduled_at_str = request_data.get("scheduled_at")
    if not platform or not scheduled_at_str:
        raise HTTPException(status_code=400, detail="Plateforme et date requises.")
    try:
        scheduled_at = datetime.fromisoformat(scheduled_at_str.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=400, detail="Format de date invalide.")
    post = ScheduledPost(user_id=user.id, platform=platform, scheduled_at=scheduled_at, title=request_data.get("title", ""), caption=request_data.get("caption", ""), hashtags=json.dumps(request_data.get("hashtags", "")) if isinstance(request_data.get("hashtags"), list) else request_data.get("hashtags", ""), video_filename=request_data.get("video_filename", ""), status="scheduled")
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"id": post.id, "platform": post.platform, "scheduled_at": post.scheduled_at.isoformat(), "title": post.title, "status": post.status}

@app.get("/api/scheduled-posts")
def get_scheduled_posts(user: User = Depends(require_user), db: Session = Depends(get_db)):
    posts = db.query(ScheduledPost).filter(ScheduledPost.user_id == user.id).order_by(ScheduledPost.scheduled_at.asc()).all()
    return {"posts": [{"id": p.id, "platform": p.platform, "scheduled_at": p.scheduled_at.isoformat(), "title": p.title, "caption": p.caption, "hashtags": p.hashtags, "video_filename": p.video_filename, "status": p.status, "created_at": p.created_at.isoformat()} for p in posts], "total": len(posts)}

@app.get("/api/scheduled-posts/upcoming")
def get_upcoming_posts(user: User = Depends(require_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    soon = now + timedelta(minutes=15)
    posts = db.query(ScheduledPost).filter(ScheduledPost.user_id == user.id, ScheduledPost.scheduled_at >= now, ScheduledPost.scheduled_at <= soon, ScheduledPost.status.in_(["scheduled", "notified_10", "notified_5"])).order_by(ScheduledPost.scheduled_at.asc()).all()
    result = []
    for p in posts:
        minutes_left = (p.scheduled_at - now).total_seconds() / 60
        result.append({"id": p.id, "platform": p.platform, "scheduled_at": p.scheduled_at.isoformat(), "title": p.title, "caption": p.caption, "hashtags": p.hashtags, "video_filename": p.video_filename, "minutes_left": round(minutes_left, 1), "status": p.status})
        if minutes_left <= 5 and p.status != "notified_5":
            p.status = "notified_5"
            db.commit()
        elif minutes_left <= 10 and p.status == "scheduled":
            p.status = "notified_10"
            db.commit()
    return {"posts": result}

@app.put("/api/scheduled-posts/{post_id}/publish")
def mark_as_published(post_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)):
    post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id, ScheduledPost.user_id == user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")
    post.status = "published"
    db.commit()
    return {"status": "published", "id": post.id}

@app.delete("/api/scheduled-posts/{post_id}")
def delete_scheduled_post(post_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)):
    post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id, ScheduledPost.user_id == user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")
    db.delete(post)
    db.commit()
    return {"status": "deleted"}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.1.0", "service": "PronosysIA"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)