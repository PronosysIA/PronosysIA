from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Analysis, Feedback
import json


def get_learning_context(db: Session, category: str, platform: str, limit: int = 20) -> str:
    """Construit un contexte d'apprentissage base sur les feedbacks reels des utilisateurs.
    
    Ce contexte est envoye a Claude pour ameliorer ses predictions.
    """
    
    # Recuperer les analyses avec feedback sur la meme plateforme
    feedbacks_data = (
        db.query(Analysis, Feedback)
        .join(Feedback, Feedback.analysis_id == Analysis.id)
        .filter(Analysis.category == category)
        .filter(Feedback.real_views.isnot(None))
        .order_by(Feedback.created_at.desc())
        .limit(limit)
        .all()
    )
    
    if not feedbacks_data:
        return ""
    
    # Construire le contexte
    context_lines = []
    context_lines.append("DONNEES D'APPRENTISSAGE — Resultats reels de videos analysees precedemment:")
    context_lines.append(f"({len(feedbacks_data)} feedbacks disponibles pour la categorie '{category}')")
    context_lines.append("")
    
    total_predicted_min = 0
    total_predicted_max = 0
    total_real_views = 0
    accurate_count = 0
    
    for analysis, feedback in feedbacks_data:
        predicted_views = analysis.views_prediction or {}
        pred_min = predicted_views.get("views_min", 0)
        pred_max = predicted_views.get("views_max", 0)
        real_views = feedback.real_views or 0
        
        total_predicted_min += pred_min
        total_predicted_max += pred_max
        total_real_views += real_views
        
        # La prediction etait-elle dans la fourchette ?
        in_range = pred_min <= real_views <= pred_max
        if in_range:
            accurate_count += 1
        
        context_lines.append(f"- Score predit: {analysis.global_score}/100 | Vues predites: {pred_min}-{pred_max} | Vues reelles: {real_views} | {'CORRECT' if in_range else 'HORS FOURCHETTE'} | Plateforme: {analysis.platform} | Note client: {feedback.rating}/5")
    
    # Stats globales
    accuracy_rate = (accurate_count / len(feedbacks_data) * 100) if feedbacks_data else 0
    avg_real_views = total_real_views / len(feedbacks_data) if feedbacks_data else 0
    
    context_lines.append("")
    context_lines.append(f"STATS GLOBALES:")
    context_lines.append(f"- Precision des predictions: {accuracy_rate:.0f}% dans la fourchette")
    context_lines.append(f"- Vues reelles moyennes: {avg_real_views:.0f}")
    
    # Tendances identifiees
    if total_real_views > 0 and total_predicted_max > 0:
        ratio = total_real_views / ((total_predicted_min + total_predicted_max) / 2)
        if ratio > 1.3:
            context_lines.append(f"- TENDANCE: Les predictions sous-estiment les vues de {((ratio-1)*100):.0f}%. Ajuste tes predictions a la hausse.")
        elif ratio < 0.7:
            context_lines.append(f"- TENDANCE: Les predictions surestiment les vues de {((1-ratio)*100):.0f}%. Ajuste tes predictions a la baisse.")
        else:
            context_lines.append(f"- TENDANCE: Les predictions sont calibrees correctement.")
    
    # Top patterns des videos qui performent
    high_performers = [
        (a, f) for a, f in feedbacks_data 
        if f.real_views and f.real_views > avg_real_views * 1.5
    ]
    
    if high_performers:
        context_lines.append("")
        context_lines.append("PATTERNS DES VIDEOS QUI PERFORMENT LE MIEUX:")
        for analysis, feedback in high_performers[:5]:
            criteria = analysis.criteria_scores or []
            top_criteria = sorted(criteria, key=lambda c: c.get("score", 0), reverse=True)[:3]
            top_names = [c.get("label", "") for c in top_criteria]
            context_lines.append(f"  - {feedback.real_views} vues | Score {analysis.global_score}/100 | Points forts: {', '.join(top_names)}")
    
    # Videos qui sous-performent
    low_performers = [
        (a, f) for a, f in feedbacks_data 
        if f.real_views and f.real_views < avg_real_views * 0.5
    ]
    
    if low_performers:
        context_lines.append("")
        context_lines.append("PATTERNS DES VIDEOS QUI SOUS-PERFORMENT:")
        for analysis, feedback in low_performers[:5]:
            criteria = analysis.criteria_scores or []
            low_criteria = sorted(criteria, key=lambda c: c.get("score", 0))[:3]
            low_names = [c.get("label", "") for c in low_criteria]
            context_lines.append(f"  - {feedback.real_views} vues | Score {analysis.global_score}/100 | Points faibles: {', '.join(low_names)}")
    
    context_lines.append("")
    context_lines.append("UTILISE CES DONNEES pour affiner tes scores et predictions de vues. Sois plus precis en te basant sur les resultats reels observes.")
    
    return "\n".join(context_lines)


def get_platform_stats(db: Session, platform: str) -> dict:
    """Recupere les stats moyennes par plateforme basees sur les feedbacks."""
    
    stats = (
        db.query(
            func.count(Feedback.id).label("total"),
            func.avg(Feedback.real_views).label("avg_views"),
            func.avg(Feedback.rating).label("avg_rating"),
            func.avg(Analysis.global_score).label("avg_score"),
        )
        .join(Analysis, Feedback.analysis_id == Analysis.id)
        .filter(Analysis.platform == platform)
        .filter(Feedback.real_views.isnot(None))
        .first()
    )
    
    return {
        "total_feedbacks": stats.total or 0,
        "avg_real_views": round(stats.avg_views, 0) if stats.avg_views else 0,
        "avg_rating": round(stats.avg_rating, 1) if stats.avg_rating else 0,
        "avg_score": round(stats.avg_score, 1) if stats.avg_score else 0,
    }