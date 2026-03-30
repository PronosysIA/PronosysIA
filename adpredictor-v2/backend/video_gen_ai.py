import fal_client
import os
import time
import requests
import subprocess
import json
from dotenv import load_dotenv

load_dotenv()

FAL_KEY = os.getenv("FAL_KEY", "")
os.environ["FAL_KEY"] = FAL_KEY


def extract_best_frame(video_path: str) -> str:
    """Extrait la meilleure frame de la video (1/3 de la duree, la plus nette)."""
    try:
        # Obtenir la duree
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path],
            capture_output=True, text=True, timeout=15
        )
        duration = 2.0  # fallback
        if result.returncode == 0:
            data = json.loads(result.stdout)
            duration = float(data.get("format", {}).get("duration", 2.0))

        # Extraire 3 frames a differents moments et garder la meilleure
        frames = []
        timestamps = [duration * 0.2, duration * 0.4, duration * 0.6]

        for i, ts in enumerate(timestamps):
            output_path = f"{video_path}_bestframe_{i}.jpg"
            subprocess.run(
                ["ffmpeg", "-y", "-ss", str(ts), "-i", video_path,
                 "-vframes", "1", "-q:v", "1", output_path],
                capture_output=True, timeout=15
            )
            if os.path.exists(output_path):
                size = os.path.getsize(output_path)
                frames.append({"path": output_path, "size": size, "timestamp": ts})

        if not frames:
            # Fallback: extraire la premiere frame
            output_path = f"{video_path}_frame0.jpg"
            subprocess.run(
                ["ffmpeg", "-y", "-i", video_path, "-vframes", "1", "-q:v", "1", output_path],
                capture_output=True, timeout=15
            )
            return output_path if os.path.exists(output_path) else ""

        # La frame la plus lourde est generalement la plus detaillee/nette
        best = max(frames, key=lambda f: f["size"])

        # Nettoyer les autres
        for f in frames:
            if f["path"] != best["path"]:
                try:
                    os.remove(f["path"])
                except OSError:
                    pass

        print(f"Meilleure frame extraite: {best['path']} ({best['size']} bytes, t={best['timestamp']}s)")
        return best["path"]

    except Exception as e:
        print(f"Erreur extraction frame: {e}")
        return ""


def generate_video_from_prompt(prompt: str, duration: int = 5, aspect_ratio: str = "9:16") -> dict:
    """Genere une video a partir d'un prompt texte."""
    if not FAL_KEY:
        return {"error": "Cle API Fal.ai non configuree.", "video_url": None}

    try:
        print(f"Generation video (text-to-video)... Prompt: {prompt[:100]}...")

        result = fal_client.subscribe(
            "fal-ai/veo2",
            arguments={
                "prompt": prompt,
                "duration": "8s",
                "aspect_ratio": aspect_ratio,
            },
            with_logs=True,
        )

        video_url = extract_video_url(result)

        if video_url:
            local_path = download_video(video_url)
            return {"video_url": video_url, "local_path": local_path, "duration": 8, "aspect_ratio": aspect_ratio, "model": "veo2", "status": "completed"}
        else:
            return {"error": "Pas de video generee.", "video_url": None}

    except Exception as e:
        print(f"Erreur generation: {e}")
        return {"error": str(e), "video_url": None}


def generate_video_from_image(image_path: str, prompt: str, duration: int = 8, aspect_ratio: str = "9:16") -> dict:
    """Genere une video a partir d'une image + prompt (image-to-video)."""
    if not FAL_KEY:
        return {"error": "Cle API Fal.ai non configuree.", "video_url": None}

    try:
        print(f"Generation video (image-to-video)... Image: {image_path}")
        print(f"Prompt: {prompt[:150]}...")

        # Upload l'image sur Fal
        image_url = fal_client.upload_file(image_path)
        print(f"Image uploadee: {image_url}")

        result = fal_client.subscribe(
            "fal-ai/veo2/image-to-video",
            arguments={
                "image_url": image_url,
                "prompt": prompt,
                "duration": "8s",
                "aspect_ratio": aspect_ratio,
            },
            with_logs=True,
        )

        video_url = extract_video_url(result)

        if video_url:
            local_path = download_video(video_url)
            return {"video_url": video_url, "local_path": local_path, "duration": 8, "aspect_ratio": aspect_ratio, "model": "veo2-i2v", "status": "completed"}
        else:
            print(f"Reponse brute: {result}")
            return {"error": "Pas de video generee.", "video_url": None}

    except Exception as e:
        print(f"Erreur image-to-video: {e}")
        return {"error": str(e), "video_url": None}


def generate_improved_video(video_path: str, prompt: str, aspect_ratio: str = "9:16") -> dict:
    """Extrait la meilleure frame de la video du client et genere une version amelioree."""

    # Extraire la meilleure frame
    best_frame = extract_best_frame(video_path)

    if not best_frame or not os.path.exists(best_frame):
        print("Impossible d'extraire une frame, fallback text-to-video")
        return generate_video_from_prompt(prompt, 8, aspect_ratio)

    # Generer via image-to-video
    result = generate_video_from_image(best_frame, prompt, 8, aspect_ratio)

    # Nettoyer la frame
    try:
        os.remove(best_frame)
    except OSError:
        pass

    return result


def extract_video_url(result) -> str:
    """Extrait l'URL de la video depuis la reponse Fal.ai."""
    if not isinstance(result, dict):
        return ""

    # Essayer differents formats de reponse
    if "video" in result:
        if isinstance(result["video"], dict):
            return result["video"].get("url", "")
        elif isinstance(result["video"], str):
            return result["video"]

    if "output" in result:
        if isinstance(result["output"], dict):
            return result["output"].get("url", "")
        elif isinstance(result["output"], str):
            return result["output"]

    if "url" in result:
        return result["url"]

    # Chercher dans les listes
    for key in ["videos", "outputs"]:
        if key in result and isinstance(result[key], list) and len(result[key]) > 0:
            item = result[key][0]
            if isinstance(item, dict):
                return item.get("url", "")
            elif isinstance(item, str):
                return item

    return ""


def download_video(video_url: str) -> str:
    """Telecharge la video generee localement."""
    try:
        output_dir = "generated_videos"
        os.makedirs(output_dir, exist_ok=True)

        filename = f"gen_{int(time.time())}.mp4"
        local_path = os.path.join(output_dir, filename)

        response = requests.get(video_url, stream=True, timeout=180)
        response.raise_for_status()

        with open(local_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Video telechargee: {local_path}")
        return local_path

    except Exception as e:
        print(f"Erreur telechargement: {e}")
        return ""