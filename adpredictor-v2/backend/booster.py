import anthropic
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from ai_analyzer import get_video_metadata, extract_frames, platform_display_name

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY and not ANTHROPIC_API_KEY.startswith("sk-ant-placeholder") else None


def generate_boost_strategy(category, platform, file_path, filename, preferred_days=None):
    """Genere une strategie de publication optimale."""

    metadata = get_video_metadata(file_path)
    platform_name = platform_display_name(platform)
    frames = extract_frames(file_path, num_frames=2)

    now = datetime.now()
    days_context = ""
    if preferred_days:
        days_context = "\nLe client prefere publier les jours suivants: " + ", ".join(preferred_days)

    prompt = """Tu es un EXPERT en strategie de publication sur les reseaux sociaux et en growth hacking. Tu dois generer la STRATEGIE DE PUBLICATION OPTIMALE pour maximiser les vues et l'engagement de cette video.

INFORMATIONS:
- Plateforme: """ + platform_name + """
- Categorie: """ + ("publicite" if category == "pubs" else "video reseau social") + """
- Duree video: """ + str(metadata.get("duration_seconds", "inconnue")) + """s
- Format: """ + ("vertical" if metadata.get("is_vertical") else "horizontal") + """
- Date actuelle: """ + now.strftime("%A %d %B %Y") + """
- Fuseau horaire: Europe/Paris (France)""" + days_context + """

GENERE:
1. Les 3 MEILLEURS creneaux horaires pour publier cette semaine (jour + heure precise)
2. 20-30 hashtags optimaux (mix trending + niche + moyen volume)
3. 3 versions de description/caption optimisees
4. La strategie de son/musique trending a utiliser
5. Les parametres de publication recommandes
6. Un plan de republication/cross-posting
7. Des actions post-publication pour booster l'engagement

SOURCES pour les creneaux horaires (etudes Later, Hootsuite, Sprout Social 2024-2025):
- TikTok France: Mardi/Jeudi 18h-20h, Vendredi 19h-21h, Samedi 10h-12h
- Instagram Reels France: Lundi-Vendredi 12h-13h et 18h-20h, Dimanche 10h-12h
- YouTube Shorts: Vendredi/Samedi 14h-17h, Dimanche 10h-13h
- Snapchat: Mercredi/Samedi 20h-23h

REGLES STRICTES:
- Les expected_boost doivent etre REALISTES: entre +15% et +45% maximum (pas de +200% ou +300%)
- Base les hashtags sur de VRAIS hashtags qui existent et sont utilises en """ + str(now.year) + """
- Les captions doivent etre adaptees au CONTENU REEL de la video (regarde les frames)
- Sois honnete: si tu n'es pas sur d'une donnee, dis-le
- Ajoute "source": "Etude Later/Hootsuite 2024-2025" dans chaque optimal_slot

Reponds UNIQUEMENT en JSON valide (pas de texte avant ou apres):
{
  "optimal_slots": [
    {
      "day": "<jour de la semaine>",
      "date": "<date format JJ/MM/YYYY>",
      "time": "<HH:MM>",
      "reason": "<pourquoi ce creneau est optimal>",
      "expected_boost": "<pourcentage realiste>",
      "source": "Etude Later/Hootsuite 2024-2025"
    }
  ],
  "hashtags": {
    "trending": ["<5-8 hashtags trending>"],
    "niche": ["<5-8 hashtags de niche>"],
    "medium": ["<5-8 hashtags volume moyen>"],
    "strategy": "<explication strategie>"
  },
  "captions": [
    {
      "version": "Hook emotionnel",
      "text": "<caption complete avec emojis>",
      "why": "<pourquoi>"
    },
    {
      "version": "Question engageante",
      "text": "<caption complete>",
      "why": "<pourquoi>"
    },
    {
      "version": "Storytelling",
      "text": "<caption complete>",
      "why": "<pourquoi>"
    }
  ],
  "sound_strategy": {
    "recommendation": "<son recommande>",
    "alternatives": ["<alt 1>", "<alt 2>"],
    "tip": "<conseil>"
  },
  "publishing_settings": {
    "cover_thumbnail": "<conseil miniature>",
    "first_comment": "<commentaire a poster>",
    "reply_strategy": "<strategie reponse>",
    "share_groups": "<ou partager>"
  },
  "cross_posting_plan": [
    {
      "platform": "<plateforme>",
      "when": "<quand>",
      "adaptation": "<comment adapter>"
    }
  ],
  "post_publication_actions": [
    {
      "timing": "<quand>",
      "action": "<action>",
      "impact": "<impact>"
    }
  ],
  "weekly_plan": [
    {
      "day": "<jour>",
      "action": "<action>"
    }
  ]
}

Sois TRES PRECIS et CONCRET. Donne des heures exactes, des hashtags reels, des strategies actionnables."""

    messages_content = []
    if frames:
        messages_content.append({"type": "text", "text": "Apercu de la video:"})
        for frame in frames:
            messages_content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": frame["base64"]}})
    messages_content.append({"type": "text", "text": prompt})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=3500,
            messages=[{"role": "user", "content": messages_content}],
        )

        response_text = response.content[0].text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        return json.loads(response_text)

    except Exception as e:
        print("Erreur booster: " + str(e))
        return generate_boost_fallback(platform, now)


def generate_boost_fallback(platform, now):
    """Fallback basique."""
    platform_name = platform_display_name(platform)

    slots = []
    for i in range(3):
        target_date = now + timedelta(days=i + 1)
        day_name = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][target_date.weekday()]
        slots.append({
            "day": day_name,
            "date": target_date.strftime("%d/%m/%Y"),
            "time": "18:30" if target_date.weekday() < 5 else "11:00",
            "reason": "Pic d'activite sur " + platform_name + " - audience maximale",
            "expected_boost": "+20-35% vs horaire aleatoire",
            "source": "Etude Later/Hootsuite 2024-2025",
        })

    return {
        "optimal_slots": slots,
        "hashtags": {
            "trending": ["#fyp", "#viral", "#trending", "#pourtoi", "#foryou"],
            "niche": ["#contentcreator", "#socialmedia", "#growth", "#marketing", "#business"],
            "medium": ["#tips", "#howto", "#motivation", "#lifestyle", "#france"],
            "strategy": "Mix de 3-5 trending + 5-8 niche + 3-5 moyen volume. Total: 15-20 hashtags max.",
        },
        "captions": [
            {"version": "Hook emotionnel", "text": "Cette technique a change ma vie... (et elle va changer la votre) \n\nSave ce post pour plus tard\n\n#fyp #viral", "why": "Cree de la curiosite et incite a sauvegarder"},
            {"version": "Question engageante", "text": "Vous faites encore cette erreur ?\n\nCommentez OUI si vous voulez la solution", "why": "Genere des commentaires qui boostent l'algo"},
            {"version": "Storytelling", "text": "Il y a 3 mois, je ne savais meme pas que c'etait possible...\n\nAujourd'hui, les resultats parlent d'eux-memes", "why": "Le storytelling cree une connexion emotionnelle"},
        ],
        "sound_strategy": {
            "recommendation": "Utilisez un son trending de la semaine",
            "alternatives": ["Musique libre Epidemic Sound", "Son original avec voix off"],
            "tip": "Verifiez les sons trending dans l'onglet Decouverte de l'app",
        },
        "publishing_settings": {
            "cover_thumbnail": "Choisissez le frame le plus impactant comme miniature",
            "first_comment": "Epinglez un commentaire avec un CTA ou une question",
            "reply_strategy": "Repondez a CHAQUE commentaire dans la premiere heure",
            "share_groups": "Partagez dans 2-3 groupes/communautes lies a votre niche",
        },
        "cross_posting_plan": [
            {"platform": "Instagram Reels", "when": "24h apres la publication originale", "adaptation": "Meme video, ajustez les hashtags pour Instagram"},
            {"platform": "YouTube Shorts", "when": "48h apres", "adaptation": "Ajoutez un titre accrocheur et une description SEO"},
        ],
        "post_publication_actions": [
            {"timing": "0-15 min apres", "action": "Repondez aux premiers commentaires", "impact": "Signal fort pour l'algorithme"},
            {"timing": "1h apres", "action": "Partagez en story avec un sondage", "impact": "Redirige du trafic vers la video"},
            {"timing": "24h apres", "action": "Postez un commentaire Mise a jour ou repondez a un commentaire populaire", "impact": "Relance la video dans l'algorithme"},
        ],
        "weekly_plan": [
            {"day": "Jour 1", "action": "Publication + engagement actif (1h)"},
            {"day": "Jour 2", "action": "Cross-post sur Instagram Reels + story"},
            {"day": "Jour 3", "action": "Cross-post YouTube Shorts + interaction commentaires"},
            {"day": "Jour 5", "action": "Analyser les stats et preparer la prochaine video"},
        ],
    }