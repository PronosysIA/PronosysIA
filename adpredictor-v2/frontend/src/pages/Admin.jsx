import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState("analyses");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (sRes.status === 403) { setError("Acces refuse"); setLoading(false); return; }
      setStats(await sRes.json()); setUsers(await uRes.json());
    } catch { setError("Erreur chargement."); }
    finally { setLoading(false); }
  };

  const viewUser = async (user) => {
    setSelectedUser(user); setDetailLoading(true); setTab("analyses");
    try {
      const res = await fetch(`/api/admin/user/${user.id}/details`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUserDetail(await res.json());
      else setUserDetail({ analyses: [], generations: [], chat_sessions: [] });
    } catch { setUserDetail({ analyses: [], generations: [], chat_sessions: [] }); }
    finally { setDetailLoading(false); }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/user/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setUsers(users.filter(u => u.id !== userId)); setSelectedUser(null); setConfirmDelete(null); }
    } catch { alert("Erreur suppression."); }
  };

  const changePlan = async (userId, newPlan) => {
    try {
      const res = await fetch(`/api/admin/user/${userId}/plan`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan: newPlan }) });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
        if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, plan: newPlan });
      }
    } catch { alert("Erreur."); }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const scoreColor = (s) => s >= 75 ? "#4ADE80" : s >= 50 ? "#C6A15B" : "#F87171";

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="card p-14 text-center"><p className="text-white font-medium mb-2">Acces refuse</p><p className="text-sm" style={{ color: "#555" }}>Compte admin requis.</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-12 animate-fadeInUp"><h1 className="font-display text-3xl italic text-white">Admin.</h1><p className="mt-2 text-sm" style={{ color: "#555" }}>Gestion complete de la plateforme PronosysIA</p></div>

      {/* Stats */}
      {stats && <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-12 stagger-children">
        {[
          { l: "Utilisateurs", v: stats.total_users, c: "#C6A15B" },
          { l: "Analyses", v: stats.total_analyses, c: "white" },
          { l: "Generations", v: stats.total_generations, c: "white" },
          { l: "Conversations", v: stats.total_chat_sessions || 0, c: "white" },
          { l: "Premium", v: stats.premium_users, c: "#4ADE80" },
          { l: "IPs trackees", v: stats.free_ips_tracked, c: "white" },
        ].map((s, i) => <div key={i} className="card p-4 animate-fadeInUp"><p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "#555" }}>{s.l}</p><p className="text-xl font-bold" style={{ color: s.c }}>{s.v}</p></div>)}
      </div>}

      {/* User detail modal */}
      {selectedUser && (
        <div className="card p-8 mb-8 animate-scaleIn">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#1A1A1A", color: "#C6A15B", border: "1px solid #222" }}>{selectedUser.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-white font-medium">{selectedUser.name}</p>
                <p className="text-xs" style={{ color: "#555" }}>{selectedUser.email}</p>
              </div>
              <span className="tag text-[10px]" style={selectedUser.plan !== "free" ? { color: "#C6A15B", borderColor: "rgba(198,161,91,0.15)" } : {}}>{selectedUser.plan}</span>
              {selectedUser.is_admin && <span className="text-xs" style={{ color: "#C6A15B" }}>👑 Admin</span>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedUser(null)} className="btn-outline text-xs py-1.5 px-4">Fermer</button>
              {!selectedUser.is_admin && (
                <button onClick={() => setConfirmDelete(selectedUser.id)} className="text-xs px-4 py-1.5 rounded-lg transition-all" style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}>Supprimer</button>
              )}
            </div>
          </div>

          {/* Confirm delete */}
          {confirmDelete === selectedUser.id && (
            <div className="p-5 rounded-lg mb-6" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <p className="text-sm mb-3" style={{ color: "#F87171" }}>Supprimer {selectedUser.name} ? Cette action est irreversible.</p>
              <div className="flex gap-3">
                <button onClick={() => deleteUser(selectedUser.id)} className="text-xs px-4 py-2 rounded-lg text-white" style={{ background: "#F87171" }}>Confirmer la suppression</button>
                <button onClick={() => setConfirmDelete(null)} className="btn-outline text-xs py-2 px-4">Annuler</button>
              </div>
            </div>
          )}

          {/* Change plan */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "#555" }}>Changer le plan</p>
            <div className="flex flex-wrap gap-2">
              {["free", "premium_pubs", "premium_reseaux", "premium_combo"].map(plan => (
                <button key={plan} onClick={() => changePlan(selectedUser.id, plan)}
                  className="px-4 py-2 rounded-lg text-xs transition-all"
                  style={selectedUser.plan === plan ? { background: "rgba(198,161,91,0.1)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { color: "#555", border: "1px solid #1C1C1C" }}>
                  {plan}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            {["analyses", "generations", "conversations"].map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-lg text-xs transition-all capitalize"
                style={tab === t ? { background: "rgba(198,161,91,0.08)", color: "#C6A15B", border: "1px solid rgba(198,161,91,0.2)" } : { color: "#555", border: "1px solid #1C1C1C" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          {detailLoading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#1C1C1C", borderTopColor: "#C6A15B" }} /></div>
          ) : userDetail && (
            <div>
              {tab === "analyses" && (
                <div className="space-y-2">
                  {(userDetail.analyses || []).length === 0 && <p className="text-sm py-4" style={{ color: "#555" }}>Aucune analyse.</p>}
                  {(userDetail.analyses || []).map(a => (
                    <div key={a.id} className="p-4 rounded-lg flex items-center justify-between" style={{ background: "#0E0E0E" }}>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold" style={{ color: scoreColor(a.global_score) }}>{a.global_score ? Math.round(a.global_score) : "?"}</span>
                        <div><p className="text-white text-xs">{a.filename}</p><p className="text-[10px]" style={{ color: "#555" }}>{a.platform} · {formatDate(a.created_at)}</p></div>
                      </div>
                      <span className="tag text-[10px]">{a.category}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "generations" && (
                <div className="space-y-2">
                  {(userDetail.generations || []).length === 0 && <p className="text-sm py-4" style={{ color: "#555" }}>Aucune generation.</p>}
                  {(userDetail.generations || []).map(g => (
                    <div key={g.id} className="p-4 rounded-lg" style={{ background: "#0E0E0E" }}>
                      <p className="text-white text-xs">{g.title || g.filename}</p>
                      <p className="text-[10px] mt-1" style={{ color: "#555" }}>{g.platform} · {formatDate(g.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === "conversations" && (
                <div className="space-y-2">
                  {(userDetail.chat_sessions || []).length === 0 && <p className="text-sm py-4" style={{ color: "#555" }}>Aucune conversation.</p>}
                  {(userDetail.chat_sessions || []).map(s => (
                    <div key={s.id} className="p-4 rounded-lg" style={{ background: "#0E0E0E" }}>
                      <p className="text-white text-xs">{s.filename || "Conversation"}</p>
                      <p className="text-[10px] mt-1" style={{ color: "#555" }}>{(s.messages || []).length} messages · {formatDate(s.created_at)} · {s.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 animate-fadeInUp delay-200"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..." className="input-dark max-w-sm" /></div>

      {/* Users table */}
      <div className="card overflow-hidden animate-fadeInUp delay-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: "1px solid #1C1C1C" }}>
              <th className="text-left p-4 text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>Utilisateur</th>
              <th className="text-left p-4 text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>Plan</th>
              <th className="text-center p-4 text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>Analyses</th>
              <th className="text-center p-4 text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>Gens</th>
              <th className="text-center p-4 text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>Chats</th>
              <th className="text-left p-4 text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>Inscrit</th>
              <th className="text-right p-4 text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #141414" }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#1A1A1A", color: "#C6A15B", border: "1px solid #222" }}>{u.name?.charAt(0).toUpperCase()}</div>
                      <div><p className="text-white text-xs">{u.name}</p><p className="text-[10px]" style={{ color: "#555" }}>{u.email}</p></div>
                      {u.is_admin && <span className="text-[9px]" style={{ color: "#C6A15B" }}>👑</span>}
                    </div>
                  </td>
                  <td className="p-4"><span className="tag text-[10px]" style={u.plan !== "free" ? { color: "#C6A15B", borderColor: "rgba(198,161,91,0.15)" } : {}}>{u.plan}</span></td>
                  <td className="p-4 text-center text-xs" style={{ color: "#888" }}>{u.analyses_count}</td>
                  <td className="p-4 text-center text-xs" style={{ color: "#888" }}>{u.generations_count}</td>
                  <td className="p-4 text-center text-xs" style={{ color: "#888" }}>{u.chat_sessions_count || 0}</td>
                  <td className="p-4 text-[10px]" style={{ color: "#555" }}>{formatDate(u.created_at)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => viewUser(u)} className="text-xs px-3 py-1 rounded-lg transition-all mr-2" style={{ color: "#C6A15B", border: "1px solid rgba(198,161,91,0.15)" }}>Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}