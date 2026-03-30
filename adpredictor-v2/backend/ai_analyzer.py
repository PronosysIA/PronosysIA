import anthropic
import json
import subprocess
import os
import base64
import random
import subprocess
try:
    result = subprocess.run(["ffprobe", "-version"], capture_output=True, text=True)
    print("ffprobe OK:", result.stdout[:50])
except Exception as e:
    print("ffprobe ERREUR:", e)
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY and not ANTHROPIC_API_KEY.startswith("sk-ant-placeholder") else None


def get_video_metadata(file_path: str) -> dict:
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", file_path],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            data = json.loads(result.stdout)
            video_stream = None
            audio_stream = None
            for stream in data.get("streams", []):
                if stream.get("codec_type") == "video" and not video_stream:
                    video_stream = stream
                elif stream.get("codec_type") == "audio" and not audio_stream:
                    audio_stream = stream

            fmt = data.get("format", {})
            duration = float(fmt.get("duration", 0))

            return {
                "duration_seconds": round(duration, 2),
                "width": int(video_stream.get("width", 0)) if video_stream else 0,
                "height": int(video_stream.get("height", 0)) if video_stream else 0,
                "fps": eval(video_stream.get("r_frame_rate", "30/1")) if video_stream else 30,
                "video_codec": video_stream.get("codec_name", "unknown") if video_stream else "unknown",
                "has_audio": audio_stream is not None,
                "audio_codec": audio_stream.get("codec_name", "unknown") if audio_stream else "none",
                "file_size_mb": round(int(fmt.get("size", 0)) / (1024 * 1024), 2),
                "bitrate_kbps": round(int(fmt.get("bit_rate", 0)) / 1000, 0),
                "aspect_ratio": f"{video_stream.get('width', 0)}x{video_stream.get('height', 0)}" if video_stream else "unknown",
                "is_vertical": (int(video_stream.get("height", 0)) > int(video_stream.get("width", 0))) if video_stream else False,
            }
    except Exception as e:
        print(f"Erreur ffprobe: {e}")

    file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
    return {
        "duration_seconds": 0, "width": 0, "height": 0, "fps": 0,
        "video_codec": "unknown", "has_audio": False, "audio_codec": "unknown",
        "file_size_mb": round(file_size / (1024 * 1024), 2), "bitrate_kbps": 0,
        "aspect_ratio": "unknown", "is_vertical": False,
    }


def extract_frames(file_path: str, num_frames: int = 4) -> list:
    frames = []
    try:
        meta = get_video_metadata(file_path)
        duration = meta.get("duration_seconds", 0)
        if duration <= 0:
            return frames
        for i in range(num_frames):
            timestamp = (duration / (num_frames + 1)) * (i + 1)
            output_path = f"{file_path}_frame_{i}.jpg"
            subprocess.run(
                ["ffmpeg", "-y", "-ss", str(timestamp), "-i", file_path, "-vframes", "1", "-q:v", "2", output_path],
                capture_output=True, timeout=15
            )
            if os.path.exists(output_path):
                with open(output_path, "rb") as f:
                    frame_data = base64.standard_b64encode(f.read()).decode("utf-8")
                    frames.append({"timestamp": round(timestamp, 1), "base64": frame_data})
                os.remove(output_path)
    except Exception as e:
        print(f"Erreur extraction frames: {e}")
    return frames


def round_views(n: int) -> int:
    if n < 100:
        return max(50, round(n / 10) * 10)
    elif n < 1000:
        return round(n / 50) * 50
    elif n < 10000:
        return round(n / 100) * 100
    elif n < 100000:
        return round(n / 1000) * 1000
    elif n < 1000000:
        return round(n / 5000) * 5000
    else:
        return round(n / 50000) * 50000


def platform_display_name(platform: str) -> str:
    names = {
        "tiktok": "TikTok", "instagram": "Instagram Reels", "youtube_shorts": "YouTube Shorts",
        "snapchat": "Snapchat Spotlight", "other_social": "Reseaux sociaux",
        "meta": "Meta Ads", "google": "Google/YouTube Ads", "tiktok_ads": "TikTok Ads",
        "snapchat_ads": "Snapchat Ads", "other_ads": "Publicite",
    }
    return names.get(platform, platform)


def estimate_views(global_score: int, category: str, platform: str) -> dict:
    """Estime une fourchette de vues REALISTE.
    Base sur un compte moyen (500-5000 followers).
    """
    base_ranges = {
        "tiktok": {"min": 300, "max": 2000}, "instagram": {"min": 150, "max": 1500},
        "youtube_shorts": {"min": 200, "max": 3000}, "snapchat": {"min": 100, "max": 800},
        "other_social": {"min": 150, "max": 1200},
        "meta": {"min": 500, "max": 5000}, "google": {"min": 300, "max": 4000},
        "tiktok_ads": {"min": 400, "max": 5000}, "snapchat_ads": {"min": 200, "max": 2000},
        "other_ads": {"min": 300, "max": 3000},
    }

    base = base_ranges.get(platform, {"min": 200, "max": 2000})

    if global_score >= 90:
        mult_min, mult_max = 25, 100
    elif global_score >= 80:
        mult_min, mult_max = 8, 25
    elif global_score >= 65:
        mult_min, mult_max = 2.5, 8
    elif global_score >= 50:
        mult_min, mult_max = 1.0, 2.5
    elif global_score >= 30:
        mult_min, mult_max = 0.5, 1.0
    else:
        mult_min, mult_max = 0.3, 0.5

    views_min = int(base["min"] * mult_min * random.uniform(0.85, 1.15))
    views_max = int(base["max"] * mult_max * random.uniform(0.9, 1.2))

    if views_min >= views_max:
        views_max = views_min + int(views_min * 0.5)

    views_min = round_views(views_min)
    views_max = round_views(views_max)

    if global_score >= 85:
        potential, confidence = "Viral probable", "haute"
    elif global_score >= 70:
        potential, confidence = "Bon potentiel", "moyenne-haute"
    elif global_score >= 50:
        potential, confidence = "Potentiel moyen", "moyenne"
    elif global_score >= 30:
        potential, confidence = "Potentiel faible", "moyenne-basse"
    else:
        potential, confidence = "Tres faible", "basse"

    return {
        "views_min": views_min,
        "views_max": views_max,
        "potential_label": potential,
        "confidence": confidence,
        "note": f"Estimation pour un compte moyen (500-5K followers) sur {platform_display_name(platform)}. Les vues reelles dependent de votre audience, du timing et de l'algorithme."
    }


def build_analysis_prompt(category, platform, metadata, filename, learning_context=""):
    platform_name = platform_display_name(platform)
    cat_label = "publicite" if category == "pubs" else "video reseau social"

    if category == "pubs":
        criteria_list = """
1. Hook (3 premieres secondes) - L'accroche capte-t-elle l'attention?
2. Call-to-Action (CTA) - Clair, visible, bien place?
3. Duree optimale - Adaptee? (Meta: 15-30s, YouTube: 15-60s, TikTok Ads: 9-15s)
4. Rythme et montage - Dynamique? Baisses de rythme?
5. Clarte du message - Compris en moins de 5 secondes?
6. Potentiel emotionnel - Declenche une emotion?
7. Tendance marche - En phase avec le marche actuel?
8. Qualite visuelle - Pro? Resolution, eclairage, branding?"""
    else:
        criteria_list = """
1. Hook (1ere seconde) - Stoppe le scroll?
2. Call-to-Action - CTA present (follow, like, partage)?
3. Duree optimale - TikTok: 7-15s, Reels: 7-30s, Shorts: 15-60s
4. Son et musique - Trending? Bien synchronise?
5. Format tendance - POV, storytime, transition?
6. Potentiel de partage - Element wow/surprise?
7. Rythme et transitions - Fluides et dynamiques?
8. Engagement prevu - Genere des commentaires?"""

    prompt = f"""Tu es un expert en marketing digital et viralite. Tu analyses des {cat_label}s.

VIDEO:
- Fichier: {filename}
- Plateforme: {platform_name}
- Duree: {metadata.get('duration_seconds', 'inconnue')}s
- Resolution: {metadata.get('aspect_ratio', 'inconnue')}
- Orientation: {'verticale' if metadata.get('is_vertical') else 'horizontale'}
- Audio: {'oui' if metadata.get('has_audio') else 'non'}
- Taille: {metadata.get('file_size_mb', 0)} MB

CRITERES (note sur 100):
{criteria_list}

PREDICTION DE VUES - SOIS TRES REALISTE:
- Compte moyen (500-5000 followers) sur {platform_name}
- La majorite des videos font 200-5000 vues
- Score 50-65 = 500-3000 vues
- Score 65-80 = 2000-15000 vues  
- Score 80-90 = 10000-50000 vues
- Score 90+ = 50000-500000 vues (rare)
- Ne surestime JAMAIS

{learning_context}

Reponds UNIQUEMENT en JSON:
{{
  "global_score": <0-100>,
  "summary": "<2-3 phrases>",
  "tags": [{{"label": "<tag>", "type": "<positive|warning|negative>"}}],
  "criteria": [{{"label": "<emoji + nom>", "score": <0-100>, "description": "<1 phrase>"}}],
  "strengths": ["<point fort>"],
  "weaknesses": ["<point faible>"],
  "suggestions": ["<suggestion>"],
  "views_prediction": {{
    "views_min": <nombre REALISTE>,
    "views_max": <nombre REALISTE>,
    "potential_label": "<Viral probable|Bon potentiel|Potentiel moyen|Potentiel faible|Tres faible>",
    "confidence": "<haute|moyenne-haute|moyenne|moyenne-basse|basse>",
    "note": "<explication courte>"
  }}
}}

8 criteres, 3-5 tags, 2-4 forces, 2-3 faiblesses, 3-5 suggestions. Scores varies et realistes."""
    return prompt


def analyze_with_claude(category, platform, file_path, filename, learning_context=""):
    metadata = get_video_metadata(file_path)

    if not client:
        print("Pas de cle API Anthropic, mode demo.")
        return analyze_fallback(category, platform, metadata, filename)

    prompt = build_analysis_prompt(category, platform, metadata, filename, learning_context)
    messages_content = []

    frames = extract_frames(file_path, num_frames=3)
    if frames:
        messages_content.append({"type": "text", "text": "Captures extraites de la video:"})
        for i, frame in enumerate(frames):
            messages_content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": frame["base64"]}})
            messages_content.append({"type": "text", "text": f"(Capture a {frame['timestamp']}s)"})

    messages_content.append({"type": "text", "text": prompt})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2500,
            messages=[{"role": "user", "content": messages_content}],
        )

        response_text = response.content[0].text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        result = json.loads(response_text)

        if "views_prediction" not in result:
            result["views_prediction"] = estimate_views(result.get("global_score", 50), category, platform)

        return result

    except json.JSONDecodeError as e:
        print(f"Erreur parsing JSON: {e}")
        return analyze_fallback(category, platform, metadata, filename)
    except Exception as e:
        print(f"Erreur API Claude: {e}")
        return analyze_fallback(category, platform, metadata, filename)


def analyze_fallback(category: str, platform: str, metadata: dict, filename: str) -> dict:
    duration = metadata.get("duration_seconds", 0)
    is_vertical = metadata.get("is_vertical", False)
    has_audio = metadata.get("has_audio", False)

    if category == "pubs":
        duration_score = min(95, 60 + int((1 - abs(duration - 22) / 22) * 35)) if 10 <= duration <= 45 else (max(20, 60 - int(abs(duration - 22) * 2)) if duration > 0 else random.randint(40, 70))
        criteria = [
            {"label": "🎯 Hook (3 premieres sec.)", "score": random.randint(45, 90), "description": "Evaluation de l'accroche initiale."},
            {"label": "📣 Call-to-Action", "score": random.randint(30, 85), "description": "Presence et efficacite du CTA."},
            {"label": "⏱️ Duree optimale", "score": duration_score, "description": f"Duree de {duration}s."},
            {"label": "🎵 Rythme et montage", "score": random.randint(40, 85), "description": "Dynamisme du montage."},
            {"label": "💡 Clarte du message", "score": random.randint(45, 90), "description": "Comprehension du message."},
            {"label": "🔥 Potentiel emotionnel", "score": random.randint(35, 80), "description": "Emotion declenchee."},
            {"label": "📊 Tendance marche", "score": random.randint(50, 85), "description": "Alignement tendances."},
            {"label": "🎨 Qualite visuelle", "score": (85 if is_vertical else 70) + random.randint(-15, 10), "description": "Qualite technique."},
        ]
    else:
        duration_score = min(95, 65 + int((1 - abs(duration - 15) / 15) * 30)) if 5 <= duration <= 35 else (max(15, 55 - int(abs(duration - 15) * 2)) if duration > 0 else random.randint(40, 70))
        vertical_bonus = 15 if is_vertical else -10
        criteria = [
            {"label": "🎯 Hook (1ere seconde)", "score": random.randint(50, 92), "description": "Impact premiere seconde."},
            {"label": "📣 Call-to-Action", "score": random.randint(25, 75), "description": "CTA social."},
            {"label": "⏱️ Duree optimale", "score": duration_score, "description": f"Duree de {duration}s."},
            {"label": "🎵 Son et musique", "score": (75 if has_audio else 30) + random.randint(-10, 15), "description": f"Audio {'present' if has_audio else 'absent'}."},
            {"label": "📈 Format tendance", "score": min(95, 60 + vertical_bonus + random.randint(0, 15)), "description": f"Format {'vertical' if is_vertical else 'horizontal'}."},
            {"label": "🔥 Potentiel partage", "score": random.randint(35, 85), "description": "Probabilite de partage."},
            {"label": "✂️ Rythme et transitions", "score": random.randint(45, 88), "description": "Dynamisme transitions."},
            {"label": "💬 Engagement prevu", "score": random.randint(35, 80), "description": "Potentiel commentaires."},
        ]

    global_score = round(sum(c["score"] for c in criteria) / len(criteria))
    tags = []
    if global_score >= 75: tags.append({"label": "Fort potentiel", "type": "positive"})
    elif global_score >= 50: tags.append({"label": "Potentiel moyen", "type": "warning"})
    else: tags.append({"label": "Faible potentiel", "type": "negative"})
    if criteria[0]["score"] >= 75: tags.append({"label": "Hook efficace", "type": "positive"})
    if criteria[1]["score"] < 50: tags.append({"label": "CTA faible", "type": "warning"})

    cat_label = "publicite" if category == "pubs" else "video"
    summary = f"Votre {cat_label} obtient {global_score}/100."
    strengths = [c["label"] + " — " + c["description"] for c in criteria if c["score"] >= 70] or ["Format compatible."]
    weaknesses = [c["label"] + " — " + c["description"] for c in criteria if c["score"] < 50] or ["Aucun point faible majeur."]
    suggestions = ["Renforcez le hook.", "Ajoutez un CTA clair.", "Ajoutez des sous-titres."]

    views = estimate_views(global_score, category, platform)

    return {
        "global_score": global_score, "summary": summary, "tags": tags[:5],
        "criteria": criteria, "strengths": strengths[:4], "weaknesses": weaknesses[:3],
        "suggestions": suggestions[:5], "views_prediction": views,
    }