/**
 * LIFE MEMORY AI — Authentication & Session Guard
 */

const AuthGuard = {
  checkAuth(isPublicPage = false) {
    const token = localStorage.getItem('lifememory_token');
    const user = ApiService.getCurrentUser();

    if (!token && !isPublicPage) {
      // If not authenticated on a protected page, redirect to login
      window.location.href = 'login.html';
      return;
    }

    if (token && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html'))) {
      // If already logged in on auth page, redirect to dashboard
      // window.location.href = 'dashboard.html';
    }

    this.renderUserBadges(user);
  },

  renderUserBadges(user) {
    if (!user) return;
    const avatarEls = document.querySelectorAll('.user-avatar');
    avatarEls.forEach(el => {
      el.textContent = user.avatarText || 'U';
    });

    const nameEls = document.querySelectorAll('.user-name');
    nameEls.forEach(el => {
      el.textContent = user.name || 'Member';
    });

    const roleEls = document.querySelectorAll('.user-role');
    roleEls.forEach(el => {
      el.textContent = user.role || 'Personal Account';
    });
  },

  setupLogoutButtons() {
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out of your Life Memory AI account?')) {
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
