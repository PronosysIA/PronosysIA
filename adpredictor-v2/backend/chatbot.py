import json
import os
import requests as req
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """Tu es l'assistant IA de PronosysIA, expert MONDIAL en creation de contenu viral et marketing digital.

TON ROLE:
1. Tu recois les resultats d'analyse de la video du client (score, criteres, faiblesses, suggestions)
2. Tu poses 2-3 questions cles pour comprendre ses besoins specifiques
3. Tu generes un STORYBOARD ULTRA-DETAILLE qui corrige TOUTES les faiblesses identifiees
4. Chaque recommandation de l'analyse DOIT etre appliquee dans le script

COMMENT TU GENERES LE SCRIPT:
- Tu lis CHAQUE faiblesse identifiee par l'analyse
- Pour CHAQUE faiblesse, tu integres une correction concrete dans le script
- Tu lis CHAQUE suggestion et tu l'appliques
- Le script doit viser un score de 90+/100
- Le script est seconde par seconde, avec pour chaque etape:
  * Le timing exact (0s-1s, 1s-3s, etc.)
  * La description visuelle PRECISE (angle camera, mouvement, transition, couleurs)
  * Le texte a afficher a l'ecran (taille, position, police, animation)
  * L'audio (musique, voix off, son)
  * L'emotion visee (curiosite, surprise, urgence, etc.)
  * Le mouvement de camera (zoom, pan, tracking, fixe)
  * La transition avec le plan suivant (cut, fondu, swipe, etc.)
  * Un conseil de tournage concret

REGLES:
- Reponds TOUJOURS en francais
- Sois conversationnel, enthousiaste et professionnel
- Apres 1-2 echanges max, propose directement le script complet
- Le script doit etre ACTIONNABLE: le client peut le suivre comme un mode d'emploi
- Inclus des references a des tendances ACTUELLES de la plateforme
- Propose des musiques/sons trending specifiques (pas generiques)
- Chaque decision du script doit etre JUSTIFIEE par un critere de viralite

QUAND TU GENERES UN SCRIPT, ajoute ce bloc JSON a la fin:
<SCRIPT_JSON>
{
  "title": "titre accrocheur",
  "duration_seconds": 15,
  "format": "9:16 vertical",
  "target_score": 92,
  "corrections_applied": ["liste des faiblesses corrigees"],
  "script": [
    {
      "timestamp": "0s-1s",
      "visual": "description visuelle ultra-precise",
      "camera": "type de plan/mouvement",
      "text_overlay": "texte exact a afficher ou null",
      "text_style": "taille, couleur, animation du texte",
      "audio": "musique/son/voix off",
      "emotion": "emotion visee",
      "transition": "type de transition vers le plan suivant",
      "viralite_tip": "pourquoi ce choix booste la viralite",
      "note": "conseil de tournage pratique"
    }
  ],
  "musique_recommandee": {"nom": "titre", "artiste": "artiste", "timing": "quel moment utiliser", "alternative": "autre option"},
  "hashtags": ["#hashtag1", "#hashtag2"],
  "caption_suggestion": "caption optimisee pour la publication",
  "best_posting_time": "jour et heure recommandes",
  "equipement_minimum": "ce dont le client a besoin pour tourner",
  "estimated_score": 92,
  "improvement_details": "explication detaillee de pourquoi cette version sera meilleure"
}
</SCRIPT_JSON>

IMPORTANT: Le client va RECREER la video lui-meme en suivant ton script. 
Donc sois ULTRA PRECIS et PRATIQUE. Comme un realisateur qui donne des instructions a son equipe.
Pas de jargon technique inutile — reste accessible mais professionnel.
"""


def chat_with_ai_sync(messages, analysis_context=""):
    """Appel 100% synchrone a l'API Anthropic via requests."""

    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY.startswith("sk-ant-placeholder"):
        return {"response": "API IA non configuree.", "script_data": None, "generate_video": None}

    system = SYSTEM_PROMPT
    if analysis_context:
        system += "\n\nANALYSE COMPLETE DE LA VIDEO DU CLIENT (tu DOIS corriger chaque faiblesse):\n" + analysis_context

    claude_messages = []
    for m in messages:
        claude_messages.append({"role": m["role"], "content": m["content"]})

    try:
        r = req.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4000,
                "system": system,
                "messages": claude_messages,
            },
            timeout=120,
        )

        if r.status_code != 200:
            error_msg = "Erreur API"
            try:
                error_data = r.json()
                error_msg = error_data.get("error", {}).get("message", f"Erreur HTTP {r.status_code}")
            except Exception:
                error_msg = f"Erreur HTTP {r.status_code}"
            return {"response": error_msg, "script_data": None, "generate_video": None}

        data = r.json()
        response_text = data["content"][0]["text"]

        # Extraire script JSON
        script_data = None
        if "<SCRIPT_JSON>" in response_text and "</SCRIPT_JSON>" in response_text:
            try:
                json_str = response_text.split("<SCRIPT_JSON>")[1].split("</SCRIPT_JSON>")[0].strip()
                script_data = json.loads(json_str)
                response_text = response_text.split("<SCRIPT_JSON>")[0].strip()
            except (json.JSONDecodeError, IndexError):
                pass

        # Extraire commande generation video (garde pour compatibilite)
        generate_video = None
        if "<GENERATE_VIDEO>" in response_text and "</GENERATE_VIDEO>" in response_text:
            try:
                json_str = response_text.split("<GENERATE_VIDEO>")[1].split("</GENERATE_VIDEO>")[0].strip()
                generate_video = json.loads(json_str)
                response_text = response_text.split("<GENERATE_VIDEO>")[0].strip()
            except (json.JSONDecodeError, IndexError):
                pass

        return {"response": response_text, "script_data": script_data, "generate_video": generate_video}

    except req.exceptions.Timeout:
        return {"response": "L'IA met trop de temps a repondre. Reessayez.", "script_data": None, "generate_video": None}
    except Exception as e:
        print(f"Erreur chatbot: {e}")
        return {"response": f"Erreur: {str(e)}", "script_data": None, "generate_video": None}


def build_analysis_context(analysis_data):
    """Construit le contexte COMPLET d'analyse pour le chatbot."""
    if not analysis_data:
        return ""
    
    lines = []
    lines.append("=" * 50)
    lines.append("RESULTATS D'ANALYSE")
    lines.append("=" * 50)
    lines.append(f"Score global: {analysis_data.get('global_score', 'N/A')}/100")
    lines.append(f"Categorie: {analysis_data.get('category', 'N/A')}")
    lines.append(f"Plateforme: {analysis_data.get('platform', 'N/A')}")
    lines.append(f"Fichier: {analysis_data.get('filename', 'N/A')}")
    lines.append(f"Resume: {analysis_data.get('summary', 'N/A')}")
    
    # Criteres detailles
    criteria = analysis_data.get("criteria_scores")
    if criteria and isinstance(criteria, list):
        lines.append("\nCRITERES DETAILLES:")
        for c in criteria:
            if isinstance(c, dict):
                score = c.get("score", 0)
                status = "✅ BON" if score >= 70 else "⚠️ MOYEN" if score >= 40 else "❌ FAIBLE"
                lines.append(f"  {status} {c.get('label', '')}: {score}/100")
                if c.get("description"):
                    lines.append(f"    → {c.get('description')}")
    
    # Tags
    tags = analysis_data.get("tags")
    if tags and isinstance(tags, list):
        positive = [t.get("label", "") for t in tags if isinstance(t, dict) and t.get("type") == "positive"]
        negative = [t.get("label", "") for t in tags if isinstance(t, dict) and t.get("type") in ("warning", "negative")]
        if positive:
            lines.append(f"\nPOINTS POSITIFS: {', '.join(positive)}")
        if negative:
            lines.append(f"POINTS NEGATIFS: {', '.join(negative)}")

    # Forces et faiblesses
    strengths = analysis_data.get("strengths")
    if strengths and isinstance(strengths, list):
        lines.append("\nFORCES (a garder dans le nouveau script):")
        for s in strengths:
            lines.append(f"  + {s}")
    
    weaknesses = analysis_data.get("weaknesses")
    if weaknesses and isinstance(weaknesses, list):
        lines.append("\nFAIBLESSES (a CORRIGER dans le nouveau script):")
        for w in weaknesses:
            lines.append(f"  - {w}")
    
    # Suggestions
    suggestions = analysis_data.get("suggestions")
    if suggestions and isinstance(suggestions, list):
        lines.append("\nSUGGESTIONS DE L'IA (a APPLIQUER):")
        for s in suggestions:
            lines.append(f"  → {s}")
    
    # Predictions de vues
    vp = analysis_data.get("views_prediction")
    if vp and isinstance(vp, dict):
        lines.append(f"\nPREDICTION DE VUES: {vp.get('views_min', 0)} - {vp.get('views_max', 0)} ({vp.get('potential_label', '')})")
        if vp.get("note"):
            lines.append(f"  Note: {vp.get('note')}")
    
    lines.append("\n" + "=" * 50)
    lines.append("MISSION: Cree un script qui corrige CHAQUE faiblesse ci-dessus")
    lines.append("et applique CHAQUE suggestion pour viser 90+/100")
    lines.append("=" * 50)
    
    return "\n".join(lines)