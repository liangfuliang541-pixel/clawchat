import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../lib/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isLogin
        ? await authApi.login({ email: formData.email, password: formData.password })
        : await authApi.register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });
      setAuth(response.user, response.token);
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hermes-cream px-4">
      <div className="animate-slide-up w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-hermes-orange shadow-lg shadow-hermes-orange/20">
            <span className="text-3xl">🦞</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-hermes-brown">ClawChat</h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-hermes-ink-muted uppercase">
            A Hermès-grade Messenger
          </p>
        </div>

        {/* Card */}
        <div className="card-leather p-8">
          <h2 className="mb-6 text-center text-lg font-semibold text-hermes-brown">
            {isLogin ? '欢迎回来' : '创建账户'}
          </h2>

          {error && (
            <div className="mb-4 animate-fade-in rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="animate-fade-in">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hermes-ink-muted">
                  用户名
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="输入用户名"
                  required={!isLogin}
                  className="input-hermes w-full"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hermes-ink-muted">
                邮箱
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="输入邮箱"
                required
                className="input-hermes w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-hermes-ink-muted">
                密码
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="输入密码"
                required
                minLength={6}
                className="input-hermes w-full"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-hermes mt-2 w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  加载中…
                </span>
              ) : isLogin ? (
                '登录'
              ) : (
                '注册'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-hermes-cream-dark pt-6 text-center">
            <p className="text-sm text-hermes-ink-muted">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 font-semibold text-hermes-orange hover:text-hermes-orange-dark hover:underline transition-colors"
              >
                {isLogin ? '注册' : '登录'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer craft note */}
        <p className="mt-6 text-center text-xs tracking-widest text-hermes-ink-muted/60 uppercase">
          Crafted with care · Est. 2026
        </p>
      </div>
    </div>
  );
};
