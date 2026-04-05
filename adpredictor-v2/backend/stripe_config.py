import stripe
import os
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# ============================================================
# PRICE IDS — Tes vrais Price IDs Stripe
# ============================================================

PRICE_IDS = {
    # Premium Pubs
    "pubs_launch_monthly": "price_1T8fldCYNAXNA5JeCYEva4u5",
    "pubs_launch_yearly": "price_1T8fuVCYNAXNA5Jew2SVMVje",
    "pubs_normal_monthly": "price_1T8fxNCYNAXNA5Jeolcm6VP7",
    "pubs_normal_yearly": "price_1T8fyLCYNAXNA5Je0lX9C6dM",

    # Premium Reseaux
    "reseaux_launch_monthly": "price_1T8fzkCYNAXNA5JeDqq1Rh2E",
    "reseaux_launch_yearly": "price_1T8g1LCYNAXNA5JeosOtWy3q",
    "reseaux_normal_monthly": "price_1T8g2ZCYNAXNA5JemUtnXv1t",
    "reseaux_normal_yearly": "price_1T8g40CYNAXNA5JePXPXxU5J",

    # Combo Premium
    "combo_launch_monthly": "price_1TEWFwCYNAXNA5JeWsUNFbVn",
    "combo_launch_yearly": "price_1TEWJfCYNAXNA5JeztL4eyVV",
    "combo_normal_monthly": "price_1T8g8lCYNAXNA5Je9YV15ZDe",
    "combo_normal_yearly": "price_1T8g9aCYNAXNA5JefTCX3uoH",

    # Individuel
    "individual": "price_1T8gBcCYNAXNA5JejwvshLJS",
}

# Mapping price_id -> plan name pour le webhook
PRICE_TO_PLAN = {
    PRICE_IDS["pubs_launch_monthly"]: "premium_pubs",
    PRICE_IDS["pubs_launch_yearly"]: "premium_pubs",
    PRICE_IDS["pubs_normal_monthly"]: "premium_pubs",
    PRICE_IDS["pubs_normal_yearly"]: "premium_pubs",
    PRICE_IDS["reseaux_launch_monthly"]: "premium_reseaux",
    PRICE_IDS["reseaux_launch_yearly"]: "premium_reseaux",
    PRICE_IDS["reseaux_normal_monthly"]: "premium_reseaux",
    PRICE_IDS["reseaux_normal_yearly"]: "premium_reseaux",
    PRICE_IDS["combo_launch_monthly"]: "premium_combo",
    PRICE_IDS["combo_launch_yearly"]: "premium_combo",
    PRICE_IDS["combo_normal_monthly"]: "premium_combo",
    PRICE_IDS["combo_normal_yearly"]: "premium_combo",
}

# Prix de lancement (pour savoir si c'est un tarif launch)
LAUNCH_PRICES = {
    PRICE_IDS["pubs_launch_monthly"],
    PRICE_IDS["pubs_launch_yearly"],
    PRICE_IDS["reseaux_launch_monthly"],
    PRICE_IDS["reseaux_launch_yearly"],
    PRICE_IDS["combo_launch_monthly"],
    PRICE_IDS["combo_launch_yearly"],
}

# Offre de lancement active ou non
LAUNCH_OFFER_ACTIVE = True


def get_available_prices(plan_type: str, billing: str) -> str:
    """Retourne le bon price_id selon le plan, la periode et si l'offre de lancement est active."""
    if LAUNCH_OFFER_ACTIVE:
        key = f"{plan_type}_launch_{billing}"
    else:
        key = f"{plan_type}_normal_{billing}"

    return PRICE_IDS.get(key, "")


def create_checkout_session(user_id: int, user_email: str, plan_type: str, billing: str, frontend_url: str = "") -> str:
    """Cree une session Stripe Checkout et retourne l'URL."""
    base = frontend_url.rstrip("/") if frontend_url else os.getenv("FRONTEND_URL", "https://pronosysia.vercel.app")

    if plan_type == "individual":
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            customer_email=user_email,
            line_items=[{"price": PRICE_IDS["individual"], "quantity": 1}],
            metadata={"user_id": str(user_id), "plan_type": "individual"},
            success_url=f"{base}/dashboard?payment=success",
            cancel_url=f"{base}/dashboard/subscription?payment=cancel",
        )
    else:
        price_id = get_available_prices(plan_type, billing)
        if not price_id:
            raise ValueError(f"Prix introuvable pour {plan_type}/{billing}")

        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            customer_email=user_email,
            line_items=[{"price": price_id, "quantity": 1}],
            metadata={
                "user_id": str(user_id),
                "plan_type": plan_type,
                "billing": billing,
                "is_launch": str(LAUNCH_OFFER_ACTIVE),
            },
            success_url=f"{base}/dashboard?payment=success",
            cancel_url=f"{base}/dashboard/subscription?payment=cancel",
        )

    return session.url


def create_customer_portal_session(stripe_customer_id: str, frontend_url: str = "") -> str:
    """Cree une session de portail client Stripe pour gerer l'abonnement."""
    base = frontend_url.rstrip("/") if frontend_url else os.getenv("FRONTEND_URL", "https://pronosysia.vercel.app")
    session = stripe.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url=f"{base}/dashboard/subscription",
    )
    return session.url