import json
import os
import requests as req
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """Tu es l'assistant IA de PronosysIA, expert mondial en creation de contenu viral et marketing digital.

TON ROLE:
1. Tu recois les resultats d'analyse de la video du client
2. Tu poses 2 a 3 questions maximum pour comprendre ses contraintes reelles
3. Tu generes un STORYBOARD ULTRA DETAILLE qui corrige toutes les faiblesses identifiees
4. Chaque recommandation de l'analyse doit etre appliquee dans le script

COMMENT TU GENERES LE SCRIPT:
- Tu lis chaque faiblesse identifiee par l'analyse
- Pour chaque faiblesse, tu integres une correction concrete dans le script
- Tu lis chaque suggestion et tu l'appliques
- Le script doit viser un score de 90+/100
- Le script est seconde par seconde, avec pour chaque etape:
  * Le timing exact
  * La description visuelle precise
  * Le texte a afficher a l'ecran
  * L'audio
  * L'emotion visee
  * Le mouvement de camera
  * La transition avec le plan suivant
  * Un conseil de tournage concret

REGLES:
- Reponds toujours en francais
- Sois conversationnel, enthousiaste et professionnel
- Apres 1 a 2 echanges max, propose directement le script complet
- Le script doit etre actionnable: le client peut le suivre comme un mode d'emploi
- Pas de jargon technique inutile: reste accessible mais ambitieux
- Garde un niveau de lecture double: utile pour debutant, pertinent pour expert

QUAND TU GENERES UN SCRIPT, ajoute ce bloc JSON a la fin:
<SCRIPT_JSON>
{
  "title": "titre accrocheur",
  "duration_seconds": 15,
  "format": "9:16 vertical",
  "target_score": 92,
  "quick_brief": {
    "headline": "verdict en une ligne",
    "promise": "ce que cette version va faire mieux",
    "main_improvement": "amelioration principale"
  },
  "beginner_checklist": ["action simple a executer"],
  "pro_tips": ["insight plus avance"],
  "publish_ready_notes": ["conseil de publication ou de tournage"],
  "corrections_applied": ["liste des faiblesses corrigees"],
  "script": [
    {
      "timestamp": "0s-1s",
      "visual": "description visuelle ultra precise",
      "camera": "type de plan ou mouvement",
      "text_overlay": "texte exact a afficher ou null",
      "text_style": "taille, couleur, animation du texte",
      "audio": "musique, son ou voix off",
      "emotion": "emotion visee",
      "transition": "transition vers le plan suivant",
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

IMPORTANT:
Le client va recreer la video lui-meme en suivant ton script. Sois ultra precis et pratique. Comme un realisateur qui donne des instructions a son equipe.
"""


def normalize_script_data(script_data: dict) -> dict:
    if not isinstance(script_data, dict):
        return None

    quick_brief = script_data.get("quick_brief")
    if not isinstance(quick_brief, dict):
        quick_brief = {
            "headline": script_data.get("title", "Storyboard optimise"),
            "promise": script_data.get("improvement_details", "Une version plus forte sur le hook, le rythme et la clarte."),
            "main_improvement": "Le storyboard corrige les faiblesses principales detectees dans l'analyse.",
        }

    script_data["quick_brief"] = quick_brief
    if not isinstance(script_data.get("beginner_checklist"), list) or not script_data.get("beginner_checklist"):
        script_data["beginner_checklist"] = [
            "Tournez d'abord le hook et le CTA avant le reste.",
            "Gardez un texte ecran simple et lisible.",
            "Supprimez tout passage qui n'apporte ni valeur ni emotion.",
        ]
    if not isinstance(script_data.get("pro_tips"), list) or not script_data.get("pro_tips"):
        script_data["pro_tips"] = [
            "Prevoyez 2 versions du hook pour comparer la retention.",
            "Utilisez les plans de coupe pour accelerer le rythme sans perdre la comprehension.",
            "Gardez une version plus courte pour un second test de publication.",
        ]
    if not isinstance(script_data.get("publish_ready_notes"), list) or not script_data.get("publish_ready_notes"):
        script_data["publish_ready_notes"] = [
            "Verifiez que la premiere frame fonctionne aussi en miniature.",
            "Preparez la caption et les hashtags avant de publier.",
            "Bloquez du temps pour animer la premiere heure.",
        ]
    return script_data


def chat_with_ai_sync(messages, analysis_context=""):
    """Appel 100% synchrone a l'API Anthropic via requests."""

    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY.startswith("sk-ant-placeholder"):
        return {"response": "API IA non configuree.", "script_data": None, "generate_video": None}

    system = SYSTEM_PROMPT
    if analysis_context:
        system += "\n\nANALYSE COMPLETE DE LA VIDEO DU CLIENT (tu dois corriger chaque faiblesse):\n" + analysis_context

    claude_messages = []
    for message in messages:
        claude_messages.append({"role": message["role"], "content": message["content"]})

    try:
        response = req.post(
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

        if response.status_code != 200:
            error_msg = "Erreur API"
            try:
                error_data = response.json()
                error_msg = error_data.get("error", {}).get("message", f"Erreur HTTP {response.status_code}")
            except Exception:
                error_msg = f"Erreur HTTP {response.status_code}"
            return {"response": error_msg, "script_data": None, "generate_video": None}

        data = response.json()
        response_text = data["content"][0]["text"]

        script_data = None
        if "<SCRIPT_JSON>" in response_text and "</SCRIPT_JSON>" in response_text:
            try:
                json_str = response_text.split("<SCRIPT_JSON>")[1].split("</SCRIPT_JSON>")[0].strip()
                script_data = normalize_script_data(json.loads(json_str))
                response_text = response_text.split("<SCRIPT_JSON>")[0].strip()
            except (json.JSONDecodeError, IndexError):
                script_data = None

        generate_video = None
        if "<GENERATE_VIDEO>" in response_text and "</GENERATE_VIDEO>" in response_text:
            try:
                json_str = response_text.split("<GENERATE_VIDEO>")[1].split("</GENERATE_VIDEO>")[0].strip()
                generate_video = json.loads(json_str)
                response_text = response_text.split("<GENERATE_VIDEO>")[0].strip()
            except (json.JSONDecodeError, IndexError):
                generate_video = None

        return {"response": response_text, "script_data": script_data, "generate_video": generate_video}

    except req.exceptions.Timeout:
        return {"response": "L'IA met trop de temps a repondre. Reessayez.", "script_data": None, "generate_video": None}
    except Exception as e:
        print(f"Erreur chatbot: {e}")
        return {"response": f"Erreur: {str(e)}", "script_data": None, "generate_video": None}


def build_analysis_context(analysis_data):
    """Construit le contexte complet d'analyse pour le chatbot."""
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
    lines.append(f"Lecture rapide: {analysis_data.get('quick_take', 'N/A')}")

    criteria = analysis_data.get("criteria_scores")
    if criteria and isinstance(criteria, list):
        lines.append("\nCRITERES DETAILLES:")
        for criterion in criteria:
            if isinstance(criterion, dict):
                score = criterion.get("score", 0)
                status = "BON" if score >= 70 else "MOYEN" if score >= 40 else "FAIBLE"
                lines.append(f"  {status} {criterion.get('label', '')}: {score}/100")
                if criterion.get("description"):
                    lines.append(f"    -> {criterion.get('description')}")

    tags = analysis_data.get("tags")
    if tags and isinstance(tags, list):
        positive = [tag.get("label", "") for tag in tags if isinstance(tag, dict) and tag.get("type") == "positive"]
        negative = [tag.get("label", "") for tag in tags if isinstance(tag, dict) and tag.get("type") in ("warning", "negative")]
        if positive:
            lines.append(f"\nPOINTS POSITIFS: {', '.join(positive)}")
        if negative:
            lines.append(f"POINTS NEGATIFS: {', '.join(negative)}")

    strengths = analysis_data.get("strengths")
    if strengths and isinstance(strengths, list):
        lines.append("\nFORCES (a garder dans le nouveau script):")
        for strength in strengths:
            lines.append(f"  + {strength}")

    weaknesses = analysis_data.get("weaknesses")
    if weaknesses and isinstance(weaknesses, list):
        lines.append("\nFAIBLESSES (a corriger dans le nouveau script):")
        for weakness in weaknesses:
            lines.append(f"  - {weakness}")

    suggestions = analysis_data.get("suggestions")
    if suggestions and isinstance(suggestions, list):
        lines.append("\nSUGGESTIONS DE L'IA (a appliquer):")
        for suggestion in suggestions:
            lines.append(f"  -> {suggestion}")

    priority_actions = analysis_data.get("priority_actions")
    if priority_actions and isinstance(priority_actions, list):
        lines.append("\nACTIONS PRIORITAIRES:")
        for action in priority_actions:
            if isinstance(action, dict):
                lines.append(
                    f"  P{action.get('priority', '?')} {action.get('title', '')} | pourquoi: {action.get('why', '')} | comment: {action.get('how', '')}"
                )

    beginner_take = analysis_data.get("beginner_take")
    if beginner_take and isinstance(beginner_take, dict):
        lines.append("\nLECTURE DEBUTANT:")
        lines.append(f"  - Ce que ca veut dire: {beginner_take.get('what_it_means', '')}")
        lines.append(f"  - Premier focus: {beginner_take.get('first_focus', '')}")
        lines.append(f"  - Erreur a eviter: {beginner_take.get('mistake_to_avoid', '')}")

    expert_take = analysis_data.get("expert_take")
    if expert_take and isinstance(expert_take, dict):
        lines.append("\nLECTURE EXPERT:")
        lines.append(f"  - Diagnostic: {expert_take.get('diagnosis', '')}")
        lines.append(f"  - Levier: {expert_take.get('leverage', '')}")
        lines.append(f"  - Test: {expert_take.get('test_to_run', '')}")

    watchouts = analysis_data.get("watchouts")
    if watchouts and isinstance(watchouts, list):
        lines.append("\nPOINTS A SURVEILLER:")
        for item in watchouts:
            lines.append(f"  - {item}")

    views_prediction = analysis_data.get("views_prediction")
    if views_prediction and isinstance(views_prediction, dict):
        lines.append(
            f"\nPREDICTION DE VUES: {views_prediction.get('views_min', 0)} - {views_prediction.get('views_max', 0)} ({views_prediction.get('potential_label', '')})"
        )
        if views_prediction.get("note"):
            lines.append(f"  Note: {views_prediction.get('note')}")

    lines.append("\n" + "=" * 50)
    lines.append("MISSION: Cree un script qui corrige chaque faiblesse ci-dessus")
    lines.append("et applique chaque suggestion pour viser 90+/100")
    lines.append("=" * 50)

    return "\n".join(lines)
