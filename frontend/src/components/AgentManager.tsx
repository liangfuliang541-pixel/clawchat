import { useState, useCallback } from 'react';
import { hermesApi, type HermesAgentConfig } from '../lib/api';

export const AgentManager = () => {
  const [agents, setAgents] = useState<
    Pick<HermesAgentConfig, '_id' | 'name' | 'enabled' | 'autoReply'>[]
  >([]);
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    baseUrl: 'http://localhost:8642/v1',
    apiKey: '',
    model: 'hermes-agent',
    autoReply: false,
    systemPrompt: '',
  });

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await hermesApi.listAgents();
      setAgents(list);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleExpand = () => {
    if (!expanded) {
      loadAgents();
    }
    setExpanded(!expanded);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.apiKey.trim()) return;
    try {
      await hermesApi.registerAgent({
        name: form.name.trim(),
        baseUrl: form.baseUrl.trim(),
        apiKey: form.apiKey.trim(),
        model: form.model.trim() || undefined,
        enabled: true,
        autoReply: form.autoReply,
        systemPrompt: form.systemPrompt.trim() || undefined,
      });
      setShowForm(false);
      setForm({
        name: '',
        baseUrl: 'http://localhost:8642/v1',
        apiKey: '',
        model: 'hermes-agent',
        autoReply: false,
        systemPrompt: '',
      });
      loadAgents();
    } catch (err: any) {
      alert(err.message || '注册失败');
    }
  };

  return (
    <div className="border-t border-hermes-cream-dark">
      <button
        onClick={toggleExpand}
        className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold text-hermes-brown hover:bg-hermes-parchment transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>🐎</span>
          <span>Hermes Agents</span>
          {agents.length > 0 && (
            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-hermes-orange px-1 text-[10px] font-bold text-white">
              {agents.length}
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-hermes-ink-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-4">
          {loading && agents.length === 0 && (
            <div className="py-2 text-center text-xs text-hermes-ink-muted">加载中…</div>
          )}

          {agents.length === 0 && !loading && (
            <div className="py-2 text-center text-xs text-hermes-ink-muted">暂无已注册的 Agent</div>
          )}

          <div className="space-y-2">
            {agents.map((a) => (
              <div
                key={a._id || a.name}
                className="flex items-center justify-between rounded-lg border border-hermes-cream-dark bg-hermes-parchment px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🤖</span>
                  <span className="text-xs font-semibold text-hermes-brown">{a.name}</span>
                  {a.autoReply && (
                    <span className="rounded bg-hermes-orange/10 px-1 text-[9px] text-hermes-orange">
                      auto
                    </span>
                  )}
                </div>
                <span
                  className={`h-2 w-2 rounded-full ${a.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                />
              </div>
            ))}
          </div>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 w-full rounded-lg border border-dashed border-hermes-gold py-2 text-xs font-semibold text-hermes-gold transition-colors hover:bg-hermes-gold/10"
            >
              + 添加 Hermes Agent
            </button>
          ) : (
            <form onSubmit={handleRegister} className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Agent 名称"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="input-hermes w-full text-xs"
              />
              <input
                type="url"
                placeholder="Base URL"
                value={form.baseUrl}
                onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                required
                className="input-hermes w-full text-xs"
              />
              <input
                type="password"
                placeholder="API Key"
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                required
                className="input-hermes w-full text-xs"
              />
              <input
                type="text"
                placeholder="Model (默认 hermes-agent)"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                className="input-hermes w-full text-xs"
              />
              <textarea
                placeholder="System Prompt (可选)"
                value={form.systemPrompt}
                onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
                rows={2}
                className="input-hermes w-full resize-none text-xs"
              />
              <label className="flex items-center gap-2 text-xs text-hermes-ink-muted">
                <input
                  type="checkbox"
                  checked={form.autoReply}
                  onChange={(e) => setForm((f) => ({ ...f, autoReply: e.target.checked }))}
                  className="rounded border-hermes-cream-dark"
                />
                自动回复
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-hermes flex-1 py-1.5 text-xs">
                  注册
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-hermes-cream-dark px-3 py-1.5 text-xs text-hermes-ink-muted hover:bg-hermes-cream"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
