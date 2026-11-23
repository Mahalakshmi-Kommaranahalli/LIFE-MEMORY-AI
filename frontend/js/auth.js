/**
 * LIFE MEMORY AI — Authentication & Session Guard
 */

const AuthGuard = {
  checkAuth(isPublicPage = false) {
    const token = localStorage.getItem('lifememory_token');
    const user = ApiService.getCurrentUser();

    if (!token && !isPublicPage) {
      // In development / demo mode, auto-initialize if not set, or redirect
      // To provide smooth experience out of the box:
      localStorage.setItem('lifememory_token', 'mock_jwt_token_active');
    }

    if (token && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html'))) {
      // already logged in, redirect to dashboard
      // window.location.href = 'dashboard.html';
    }

    this.renderUserBadges(user);
  },

  renderUserBadges(user) {
    if (!user) return;
    const avatarEls = document.querySelectorAll('.user-avatar');
    avatarEls.forEach(el => {
      el.textContent = user.avatarText || 'MK';
    });

    const nameEls = document.querySelectorAll('.user-name');
    nameEls.forEach(el => {
      el.textContent = user.name || 'Mahalakshmi K';
    });

    const roleEls = document.querySelectorAll('.user-role');
    roleEls.forEach(el => {
      el.textContent = user.role || 'CSE Student & AI Engineer';
    });
  },

  setupLogoutButtons() {
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out of Life Memory AI?')) {
          ApiService.logout();
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const isPublic = window.location.pathname.endsWith('index.html') || 
                   window.location.pathname.endsWith('login.html') || 
                   window.location.pathname.endsWith('register.html') ||
                   window.location.pathname === '/' ||
                   window.location.pathname === '';
  AuthGuard.checkAuth(isPublic);
  AuthGuard.setupLogoutButtons();
});

