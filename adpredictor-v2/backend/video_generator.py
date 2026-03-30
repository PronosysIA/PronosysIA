import anthropic
import json
import os
from dotenv import load_dotenv
from ai_analyzer import get_video_metadata, extract_frames, platform_display_name

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY and not ANTHROPIC_API_KEY.startswith("sk-ant-placeholder") else None


def generate_improved_video(category: str, platform: str, file_path: str, filename: str, analysis_result: dict = None) -> dict:
    """Genere un script video ameliore base sur l'analyse REELLE de la video uploadee."""

    metadata = get_video_metadata(file_path)
    platform_name = platform_display_name(platform)
    cat_label = "publicite" if category == "pubs" else "video reseau social"

    frames = extract_frames(file_path, num_frames=5)

    analysis_context = ""
    if analysis_result:
        analysis_context = f"""
ANALYSE PRECEDENTE:
- Score: {analysis_result.get('global_score', 'N/A')}/100
- Points forts: {json.dumps(analysis_result.get('strengths', []), ensure_ascii=False)}
- Points faibles: {json.dumps(analysis_result.get('weaknesses', []), ensure_ascii=False)}
"""

    prompt = f"""Tu es un EXPERT en creation de contenu viral. Le client t'a envoye sa video et tu dois creer un script AMELIORE.

ETAPE 1 — ANALYSE OBLIGATOIRE DE LA VIDEO DU CLIENT:
Regarde ATTENTIVEMENT les captures d'ecran de la video du client. Tu DOIS:
- Decrire EXACTEMENT ce que tu vois (personnes, decor, actions, style, couleurs, texte)
- Identifier le SUJET/THEME de la video
- Identifier le STYLE (face cam, tutoriel, lifestyle, produit, storytelling, etc.)
- Identifier ce qui NE FONCTIONNE PAS dans la video actuelle

ETAPE 2 — SCRIPT AMELIORE:
Base sur ce que tu as vu dans la video du client, cree un script qui:
- GARDE LE MEME SUJET et le meme style que la video originale
- GARDE LE MEME TYPE DE CONTENU (si c'est une face cam, le script doit etre pour une face cam)
- AMELIORE TOUT: le hook, le rythme, le CTA, les transitions
- RESPECTE les codes de viralite de {platform_name}

INFORMATIONS TECHNIQUES:
- Plateforme: {platform_name}
- Duree originale: {metadata.get('duration_seconds', 'inconnue')}s
- Orientation: {'verticale' if metadata.get('is_vertical') else 'horizontale'}
- Audio: {'present' if metadata.get('has_audio') else 'absent'}
{analysis_context}

IMPORTANT: Le script doit etre SPECIFIQUE a cette video. PAS de script generique. Si tu vois une personne qui parle a la camera, le script doit etre pour une personne qui parle a la camera. Si tu vois un produit, le script doit etre centre sur ce produit. ADAPTE-TOI a ce que tu vois.

Reponds UNIQUEMENT en JSON:
{{
  "video_analysis": {{
    "what_i_see": "<description detaillee de ce que tu vois dans la video du client>",
    "content_type": "<face cam / tutoriel / lifestyle / produit / storytelling / autre>",
    "subject": "<sujet principal de la video>",
    "current_strengths": ["<ce qui fonctionne deja>"],
    "current_weaknesses": ["<ce qui ne fonctionne pas>"]
  }},
  "title": "<titre accrocheur pour la version amelioree>",
  "concept": "<description du concept ameliore base sur la video originale — explique ce qui change>",
  "duration_seconds": <duree optimale>,
  "format": "<9:16 vertical | 16:9 horizontal>",
  "target_score": <score vise entre 80 et 95>,
  "script": [
    {{
      "timestamp": "<0s-1s>",
      "visual": "<description precise adaptee au contenu REEL de la video>",
      "text_overlay": "<texte ou null>",
      "audio": "<son/voix/musique>",
      "transition": "<transition ou null>",
      "note": "<pourquoi c'est mieux que l'original>"
    }}
  ],
  "music_recommendations": [
    {{
      "name": "<musique specifique recommandee>",
      "platform": "<ou la trouver>",
      "why": "<pourquoi elle correspond a CE contenu>"
    }}
  ],
  "text_overlays_style": {{
    "font": "<police>",
    "color": "<couleur>",
    "position": "<position>",
    "animation": "<animation>"
  }},
  "editing_tips": [
    "<conseil specifique a cette video>",
    "<conseil specifique a cette video>",
    "<conseil specifique a cette video>"
  ],
  "ai_generation_prompt": "<prompt EN ANGLAIS, TRES DETAILLE, qui decrit EXACTEMENT la scene vue dans la video du client pour la recreer en mieux avec un outil IA>",
  "technical_specs": {{
    "resolution": "<recommandation>",
    "fps": <30 ou 60>,
    "bitrate": "<recommandation>",
    "audio_format": "<recommandation>"
  }},
  "viral_hooks_alternatives": [
    "<hook alternatif adapte au SUJET de cette video>",
    "<hook alternatif adapte au SUJET de cette video>",
    "<hook alternatif adapte au SUJET de cette video>"
  ],
  "cta_options": [
    "<CTA adapte au contenu>",
    "<CTA adapte au contenu>",
    "<CTA adapte au contenu>"
  ],
  "hashtags_suggested": ["<hashtag1>", "<hashtag2>", "<hashtag3>", "<hashtag4>", "<hashtag5>", "<hashtag6>", "<hashtag7>", "<hashtag8>"],
  "estimated_improvement": "<explication precise de pourquoi cette version est meilleure, en se referant aux problemes identifies dans la video originale>"
}}

Le script doit avoir 8-15 etapes. CHAQUE element doit etre SPECIFIQUE au contenu de la video du client. RIEN de generique."""

    messages_content = []

    if frames:
        messages_content.append({
            "type": "text",
            "text": "VOICI LA VIDEO DU CLIENT — Analyse CHAQUE capture attentivement avant de repondre:"
        })
        for i, frame in enumerate(frames):
            messages_content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": frame["base64"],
                }
            })
            messages_content.append({
                "type": "text",
                "text": f"(Capture {i+1}/{len(frames)} — a {frame['timestamp']}s de la video)"
            })
    else:
        messages_content.append({
            "type": "text",
            "text": "ATTENTION: Impossible d'extraire des frames de la video. Base-toi sur les metadonnees techniques pour faire des recommandations pertinentes."
        })

    messages_content.append({"type": "text", "text": prompt})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": messages_content}],
        )

        response_text = response.content[0].text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        result = json.loads(response_text)
        return result

    except json.JSONDecodeError as e:
        print(f"Erreur parsing JSON generateur: {e}")
        print(f"Reponse brute: {response_text[:500] if 'response_text' in dir() else 'N/A'}")
        return generate_fallback(category, platform, metadata)
    except Exception as e:
        print(f"Erreur API Claude generateur: {e}")
        return generate_fallback(category, platform, metadata)


def generate_fallback(category: str, platform: str, metadata: dict) -> dict:
    """Fallback si Claude API indisponible."""
    platform_name = platform_display_name(platform)
    is_social = category == "reseaux"

    return {
        "video_analysis": {
            "what_i_see": "Impossible d'analyser la video sans l'API IA. Voici des recommandations generales.",
            "content_type": "inconnu",
            "subject": "A determiner",
            "current_strengths": ["Video uploadee avec succes"],
            "current_weaknesses": ["Analyse IA indisponible pour le moment"],
        },
        "title": f"Script optimise pour {platform_name}",
        "concept": f"Version amelioree de votre {'video' if is_social else 'publicite'} avec un hook percutant et un CTA optimise.",
        "duration_seconds": 15 if is_social else 25,
        "format": "9:16 vertical" if is_social else "16:9 horizontal",
        "target_score": 80,
        "script": [
            {"timestamp": "0s-1s", "visual": "Ouverture choc — element visuel surprenant", "text_overlay": "ATTENDEZ...", "audio": "Son trending + effet d'impact", "transition": "Cut rapide", "note": "Premiere seconde cruciale"},
            {"timestamp": "1s-3s", "visual": "Revelation du sujet avec mouvement dynamique", "text_overlay": "Ce que personne ne vous dit...", "audio": "Musique montante", "transition": "Zoom rapide", "note": "Creer la curiosite"},
            {"timestamp": "3s-8s", "visual": "Contenu principal", "text_overlay": "Sous-titres dynamiques", "audio": "Voix off + musique", "transition": "Coupes rapides", "note": "Zero temps mort"},
            {"timestamp": "8s-12s", "visual": "Preuve ou resultat", "text_overlay": "Chiffres en gros", "audio": "Build-up musical", "transition": "Transitions fluides", "note": "Convaincre"},
            {"timestamp": "12s-14s", "visual": "CTA visuel fort", "text_overlay": "FOLLOW pour la suite", "audio": "Son conclusion", "transition": "Zoom CTA", "note": "CTA impossible a manquer"},
            {"timestamp": "14s-15s", "visual": "Boucle vers le debut", "text_overlay": None, "audio": "Retour son debut", "transition": "Loop", "note": "Re-visionnage"},
        ],
        "music_recommendations": [
            {"name": "Son trending du moment", "platform": platform_name, "why": "Maximise la portee"},
            {"name": "Musique libre energique", "platform": "Epidemic Sound", "why": "Alternative safe"},
        ],
        "text_overlays_style": {"font": "Montserrat Bold", "color": "Blanc ombre noire", "position": "Centre-bas", "animation": "Mot par mot"},
        "editing_tips": [
            "Coupez toutes les 1-2 secondes",
            "Sous-titres dynamiques mot par mot",
            "Effets sonores aux transitions",
            "Textes en zone safe",
            "Testez 3 hooks differents",
        ],
        "ai_generation_prompt": f"Create a vertical 9:16 viral video for {platform_name}. Dynamic editing, trending style, bold text overlays, high energy, loop-friendly ending.",
        "technical_specs": {"resolution": "1080x1920", "fps": 30, "bitrate": "8-12 Mbps", "audio_format": "Stereo AAC 320kbps"},
        "viral_hooks_alternatives": [
            "Question choc: 'Saviez-vous que...'",
            "Resultat final d'abord (before/after inverse)",
            "Son viral + texte 'POV: quand vous...'",
        ],
        "cta_options": ["Follow pour la suite", "Like si vous etes d'accord", "Envoyez a quelqu'un qui doit voir ca"],
        "hashtags_suggested": ["#fyp", "#viral", "#pourtoi", "#trending", "#astuce", "#france", "#tips", "#growth"],
        "estimated_improvement": "Script optimise avec hook renforce, rythme sans temps mort et CTA strategique. Score vise: 80+/100.",
    }