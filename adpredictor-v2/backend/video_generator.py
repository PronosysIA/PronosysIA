import anthropic
import json
import os
from dotenv import load_dotenv
from ai_analyzer import get_video_metadata, extract_frames, platform_display_name

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY and not ANTHROPIC_API_KEY.startswith("sk-ant-placeholder") else None


def default_generator_brief(result: dict) -> dict:
    return {
        "headline": result.get("title", "Version amelioree prete a tourner"),
        "promise": result.get("concept", "Une version plus claire, plus rapide et plus forte sur la premiere impression."),
        "main_improvement": result.get("estimated_improvement", "Le script renforce le hook, le rythme et la clarte du message."),
    }


def normalize_generation_result(result: dict, category: str, platform_name: str) -> dict:
    script = result.get("script") if isinstance(result.get("script"), list) else []
    hooks = result.get("viral_hooks_alternatives") if isinstance(result.get("viral_hooks_alternatives"), list) else []
    ctas = result.get("cta_options") if isinstance(result.get("cta_options"), list) else []
    editing_tips = result.get("editing_tips") if isinstance(result.get("editing_tips"), list) else []
    first_hook = hooks[0] if hooks else "Montrez le resultat ou la promesse des la premiere seconde."
    first_cta = ctas[0] if ctas else "Terminez par une action simple a demander a votre audience."

    result["quick_brief"] = result.get("quick_brief") if isinstance(result.get("quick_brief"), dict) else default_generator_brief(result)
    result["beginner_checklist"] = result.get("beginner_checklist") if isinstance(result.get("beginner_checklist"), list) and result.get("beginner_checklist") else [
        "Tournez d'abord un hook plus direct que l'original.",
        "Gardez un seul message principal a retenir.",
        "Ajoutez un texte ecran lisible sans surcharger l'image.",
        "Finissez avec un CTA clair et visible.",
    ]
    result["shooting_checklist"] = result.get("shooting_checklist") if isinstance(result.get("shooting_checklist"), list) and result.get("shooting_checklist") else [
        "Verifiez la lumiere et la lisibilite du sujet principal.",
        "Tournez 2 variantes du hook pour comparer la retention.",
        "Prevoyez au moins 3 plans de coupe pour accelerer le montage.",
        "Enregistrez une voix claire ou un son principal propre.",
    ]
    result["pro_tips"] = result.get("pro_tips") if isinstance(result.get("pro_tips"), list) and result.get("pro_tips") else [
        f"Testez '{first_hook}' en version texte seul puis en version face camera.",
        "Structurez le rythme autour d'un micro reveal toutes les 2 a 3 secondes.",
        f"Gardez le CTA '{first_cta}' uniquement si le reste du script cree deja assez de desir.",
    ]
    result["publishing_notes"] = result.get("publishing_notes") if isinstance(result.get("publishing_notes"), list) and result.get("publishing_notes") else [
        f"Ce script est pense pour {platform_name}: gardez un montage nerveux et des textes rapides a lire.",
        "Tournez une version courte et une version legere alternative pour pouvoir retester la mise en ligne.",
        "Gardez l'accroche la plus lisible en miniature et dans les deux premieres secondes.",
    ]
    result["editing_tips"] = editing_tips
    result["viral_hooks_alternatives"] = hooks
    result["cta_options"] = ctas
    result["script"] = script
    return result


def generate_improved_video(category: str, platform: str, file_path: str, filename: str, analysis_result: dict = None) -> dict:
    """Genere un script video ameliore base sur l'analyse reelle de la video uploadee."""

    metadata = get_video_metadata(file_path)
    platform_name = platform_display_name(platform)
    cat_label = "publicite" if category == "pubs" else "video reseau social"

    frames = extract_frames(file_path, num_frames=5)

    analysis_context = ""
    if analysis_result:
        analysis_context = f"""
ANALYSE PRECEDENTE:
- Score: {analysis_result.get('global_score', 'N/A')}/100
- Lecture rapide: {analysis_result.get('quick_take', '')}
- Points forts: {json.dumps(analysis_result.get('strengths', []), ensure_ascii=False)}
- Points faibles: {json.dumps(analysis_result.get('weaknesses', []), ensure_ascii=False)}
- Priorites: {json.dumps(analysis_result.get('priority_actions', []), ensure_ascii=False)}
"""

    prompt = f"""Tu es un EXPERT en creation de contenu viral. Le client t'a envoye sa video et tu dois creer un script AMELIORE.

ETAPE 1 - ANALYSE OBLIGATOIRE DE LA VIDEO DU CLIENT:
Regarde attentivement les captures d'ecran de la video du client. Tu dois:
- Decrire exactement ce que tu vois (personnes, decor, actions, style, couleurs, texte)
- Identifier le sujet/theme de la video
- Identifier le style (face cam, tutoriel, lifestyle, produit, storytelling, etc.)
- Identifier ce qui ne fonctionne pas dans la video actuelle

ETAPE 2 - SCRIPT AMELIORE:
Base sur ce que tu as vu dans la video du client, cree un script qui:
- Garde le meme sujet et le meme style que la video originale
- Garde le meme type de contenu
- Ameliore le hook, le rythme, le CTA, les transitions et la comprehension
- Respecte les codes de viralite de {platform_name}

INFORMATIONS TECHNIQUES:
- Plateforme: {platform_name}
- Categorie: {cat_label}
- Duree originale: {metadata.get('duration_seconds', 'inconnue')}s
- Orientation: {'verticale' if metadata.get('is_vertical') else 'horizontale'}
- Audio: {'present' if metadata.get('has_audio') else 'absent'}
{analysis_context}

IMPORTANT:
- Le script doit etre SPECIFIQUE a cette video. Pas de script generique.
- Reste detaille mais tres lisible: le debutant doit pouvoir tourner, l'expert doit sentir la strategie.
- Donne des formulations actionnables et concretes.

Reponds UNIQUEMENT en JSON:
{{
  "video_analysis": {{
    "what_i_see": "<description detaillee de ce que tu vois dans la video du client>",
    "content_type": "<face cam / tutoriel / lifestyle / produit / storytelling / autre>",
    "subject": "<sujet principal de la video>",
    "current_strengths": ["<ce qui fonctionne deja>"],
    "current_weaknesses": ["<ce qui ne fonctionne pas>"]
  }},
  "quick_brief": {{
    "headline": "<verdict en une ligne>",
    "promise": "<ce que cette nouvelle version va mieux faire>",
    "main_improvement": "<amelioration principale>"
  }},
  "title": "<titre accrocheur pour la version amelioree>",
  "concept": "<description du concept ameliore base sur la video originale - explique ce qui change>",
  "duration_seconds": <duree optimale>,
  "format": "<9:16 vertical | 16:9 horizontal>",
  "target_score": <score vise entre 80 et 95>,
  "beginner_checklist": ["<action simple a executer>"],
  "shooting_checklist": ["<verification tournage>"],
  "pro_tips": ["<insight plus avance>"],
  "publishing_notes": ["<conseil de mise en ligne>"],
  "script": [
    {{
      "timestamp": "<0s-1s>",
      "visual": "<description precise adaptee au contenu reel de la video>",
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
      "why": "<pourquoi elle correspond a ce contenu>"
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
  "ai_generation_prompt": "<prompt en anglais, tres detaille, qui decrit exactement la scene vue dans la video du client pour la recreer en mieux avec un outil IA>",
  "technical_specs": {{
    "resolution": "<recommandation>",
    "fps": <30 ou 60>,
    "bitrate": "<recommandation>",
    "audio_format": "<recommandation>"
  }},
  "viral_hooks_alternatives": [
    "<hook alternatif adapte au sujet de cette video>",
    "<hook alternatif adapte au sujet de cette video>",
    "<hook alternatif adapte au sujet de cette video>"
  ],
  "cta_options": [
    "<CTA adapte au contenu>",
    "<CTA adapte au contenu>",
    "<CTA adapte au contenu>"
  ],
  "hashtags_suggested": ["<hashtag1>", "<hashtag2>", "<hashtag3>", "<hashtag4>", "<hashtag5>", "<hashtag6>", "<hashtag7>", "<hashtag8>"],
  "estimated_improvement": "<explication precise de pourquoi cette version est meilleure, en se referant aux problemes identifies dans la video originale>"
}}

Le script doit avoir 8-15 etapes. Chaque element doit etre SPECIFIQUE au contenu de la video du client. Rien de generique."""

    messages_content = []

    if frames:
        messages_content.append({
            "type": "text",
            "text": "Voici la video du client. Analyse chaque capture attentivement avant de repondre."
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
                "text": f"(Capture {i + 1}/{len(frames)} a {frame['timestamp']}s de la video)"
            })
    else:
        messages_content.append({
            "type": "text",
            "text": "Attention: impossible d'extraire des frames de la video. Base-toi sur les metadonnees techniques pour faire des recommandations pertinentes."
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
        return normalize_generation_result(result, category, platform_name)

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

    return normalize_generation_result({
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
            {"timestamp": "0s-1s", "visual": "Ouverture choc avec un element visuel surprenant", "text_overlay": "ATTENDEZ...", "audio": "Son fort + effet d'impact", "transition": "Cut rapide", "note": "La premiere seconde doit stopper le scroll."},
            {"timestamp": "1s-3s", "visual": "Revelation du sujet avec mouvement dynamique", "text_overlay": "Ce que personne ne vous dit...", "audio": "Musique montante", "transition": "Zoom rapide", "note": "Creer la curiosite avant de livrer la valeur."},
            {"timestamp": "3s-8s", "visual": "Contenu principal", "text_overlay": "Sous-titres dynamiques", "audio": "Voix off + musique", "transition": "Coupes rapides", "note": "Zero temps mort pour conserver la retention."},
            {"timestamp": "8s-12s", "visual": "Preuve ou resultat", "text_overlay": "Chiffres en gros", "audio": "Build-up musical", "transition": "Transitions fluides", "note": "La preuve rend le message credible."},
            {"timestamp": "12s-14s", "visual": "CTA visuel fort", "text_overlay": "FOLLOW pour la suite", "audio": "Son de conclusion", "transition": "Zoom CTA", "note": "Le CTA doit etre impossible a manquer."},
            {"timestamp": "14s-15s", "visual": "Boucle vers le debut", "text_overlay": None, "audio": "Retour du son du debut", "transition": "Loop", "note": "Une fin qui boucle peut favoriser le revisionnage."},
        ],
        "music_recommendations": [
            {"name": "Son trending du moment", "platform": platform_name, "why": "Maximise la portee si la tendance reste cohérente avec le contenu."},
            {"name": "Musique libre energique", "platform": "Epidemic Sound", "why": "Alternative plus sure pour une diffusion multi-plateforme."},
        ],
        "text_overlays_style": {"font": "Bold Sans", "color": "Blanc casse", "position": "Centre-bas", "animation": "Mot par mot"},
        "editing_tips": [
            "Coupez toutes les 1 a 2 secondes sur les moments faibles.",
            "Ajoutez des sous-titres dynamiques mot par mot.",
            "Placez le texte dans la zone safe de la plateforme.",
            "Testez au moins 2 hooks differents.",
        ],
        "ai_generation_prompt": f"Create a vertical 9:16 viral video for {platform_name}. Dynamic editing, bold text overlays, high energy, clear first-second hook and loop-friendly ending.",
        "technical_specs": {"resolution": "1080x1920", "fps": 30, "bitrate": "8-12 Mbps", "audio_format": "Stereo AAC 320kbps"},
        "viral_hooks_alternatives": [
            "Question choc: 'Saviez-vous que...'",
            "Montrez le resultat final avant l'explication",
            "POV + texte court qui cree la curiosite",
        ],
        "cta_options": ["Follow pour la suite", "Like si vous etes d'accord", "Envoyez a quelqu'un qui doit voir ca"],
        "hashtags_suggested": ["#fyp", "#viral", "#pourtoi", "#trending", "#astuce", "#france", "#tips", "#growth"],
        "estimated_improvement": "Script optimise avec hook renforce, rythme sans temps mort et CTA strategique. Score vise: 80+/100.",
    }, category, platform_name)
