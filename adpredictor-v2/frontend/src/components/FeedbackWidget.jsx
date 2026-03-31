import { useState, useEffect } from "react";

export default function FeedbackWidget({ analysisId }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [realViews, setRealViews] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token && analysisId) fetchExistingFeedback();
  }, [analysisId]);

  const fetchExistingFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback/${analysisId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.has_feedback) {
          setExistingFeedback(data);
          setRating(data.rating);
          setRealViews(data.real_views ? String(data.real_views) : "");
          setComment(data.comment || "");
          setSubmitted(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          analysis_id: analysisId,
          rating,
          real_views: realViews ? parseInt(realViews) : null,
          comment,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Affichage quand deja soumis
  if (submitted && !showForm) {
    return (
      <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill={star <= rating ? "#f59e0b" : "none"} stroke={star <= rating ? "#f59e0b" : "#4b5563"} strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <span className="text-gray-400 text-xs">Votre note: {rating}/5</span>
            {realViews && <span className="text-gray-500 text-xs">| Vues reelles: {Number(realViews).toLocaleString()}</span>}
          </div>
          <button onClick={() => setShowForm(true)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            Modifier
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-600/5 to-orange-600/5 border border-amber-500/15 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-amber-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {submitted ? "Modifier votre retour" : "Comment s'est passee la publication ?"}
        </h4>
        {showForm && (
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xs">Annuler</button>
        )}
      </div>

      {/* Etoiles */}
      <div className="mb-4">
        <p className="text-gray-400 text-xs mb-2">La prediction etait-elle utile ?</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill={star <= (hoverRating || rating) ? "#f59e0b" : "none"}
                stroke={star <= (hoverRating || rating) ? "#f59e0b" : "#4b5563"} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          ))}
          {rating > 0 && <span className="text-amber-400 text-sm ml-2 self-center">{rating}/5</span>}
        </div>
      </div>

      {/* Vues reelles */}
      <div className="mb-4">
        <p className="text-gray-400 text-xs mb-2">Combien de vues avez-vous obtenues ? (optionnel)</p>
        <input type="number" value={realViews} onChange={(e) => setRealViews(e.target.value)} placeholder="Ex: 1500"
          className="w-full max-w-xs bg-gray-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all" />
      </div>

      {/* Commentaire */}
      <div className="mb-4">
        <p className="text-gray-400 text-xs mb-2">Un commentaire ? (optionnel)</p>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="La prediction etait pertinente, j'ai applique les suggestions..."
          rows={2} className="w-full bg-gray-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-all resize-none" />
      </div>

      {/* Bouton */}
      <button onClick={handleSubmit} disabled={!rating || loading}
        className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">
        {loading ? "Envoi..." : submitted ? "Mettre a jour" : "Envoyer mon retour"}
      </button>

      <p className="text-gray-600 text-xs mt-2">Vos retours aident notre IA a s'ameliorer pour tous les utilisateurs.</p>
    </div>
  );
}