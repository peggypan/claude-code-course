/**
 * CLAUDE CODE COURSE — REDesIGNED Animation Engine
 * Handles scroll-triggered animations and visibility
 */

(function () {
  'use strict';

  // Wait for DOM to be ready
  function init() {
    setupScrollAnimations();
    setupNavigation();
    setupInteractions();
  }

  // ── SCROLL TRIGGERED ANIMATIONS ────────────────────────────────
  function setupScrollAnimations() {
    const observerOptions = {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all screens and animate-in elements
    document.querySelectorAll('.screen, .animate-in').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(el);
    });

    // Also observe module headers
    document.querySelectorAll('.module-header').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
      observer.observe(el);
    });
  }

  // ── NAVIGATION ─────────────────────────────────────────────────
  function setupNavigation() {
    const progressBar = document.getElementById('progress-bar');
    const navDots = document.querySelectorAll('.nav-dot');
    const modules = document.querySelectorAll('.module');

    if (!progressBar) return;

    // Update progress bar and active dot
    function updateProgress() {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      progressBar.style.width = progress + '%';
      progressBar.setAttribute('aria-valuenow', Math.round(progress));

      // Update active nav dot
      const scrollMid = window.scrollY + window.innerHeight / 2;
      modules.forEach((mod, i) => {
        const dot = navDots[i];
        if (!dot) return;

        const top = mod.offsetTop;
        const bottom = top + mod.offsetHeight;

        if (scrollMid >= top && scrollMid < bottom) {
          dot.classList.add('active');
          dot.classList.remove('visited');
        } else if (window.scrollY + window.innerHeight > top) {
          dot.classList.remove('active');
          dot.classList.add('visited');
        } else {
          dot.classList.remove('active', 'visited');
        }
      });
    }

    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial update
    updateProgress();

    // Nav dot click handlers
    navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── INTERACTIONS ───────────────────────────────────────────────
  function setupInteractions() {
    // Screen navigation buttons
    document.querySelectorAll('.nav-button[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextScreen = btn.dataset.next;
        const currentScreen = btn.closest('.screen');

        if (currentScreen) {
          currentScreen.style.opacity = '0';
          currentScreen.style.transform = 'translateY(-30px)';

          setTimeout(() => {
            currentScreen.style.display = 'none';
            const nextScreenEl = document.querySelector(`.screen[data-screen="${nextScreen}"]`);

            if (nextScreenEl) {
              nextScreenEl.style.display = 'block';
              // Force reflow
              nextScreenEl.offsetHeight;
              nextScreenEl.style.opacity = '1';
              nextScreenEl.style.transform = 'translateY(0)';
              nextScreenEl.classList.add('visible');
            }
          }, 300);
        }
      });
    });

    // Show first screen of each module
    document.querySelectorAll('.module').forEach(module => {
      const firstScreen = module.querySelector('.screen[data-screen="1"]');
      if (firstScreen && !firstScreen.classList.contains('visible')) {
        setTimeout(() => {
          firstScreen.classList.add('visible');
          firstScreen.style.opacity = '1';
          firstScreen.style.transform = 'translateY(0)';
        }, 100);
      }
    });

    // Setup term tooltips
    setupTooltips();

    // Setup pattern cards hover effect
    setupPatternCards();

    // Setup quiz interactions
    setupQuizzes();
  }

  // ── TOOLTIPS ───────────────────────────────────────────────────
  function setupTooltips() {
    let activeTooltip = null;

    document.querySelectorAll('.term').forEach(term => {
      const tip = document.createElement('span');
      tip.className = 'term-tooltip';
      tip.textContent = term.dataset.definition;

      function showTooltip(e) {
        if (activeTooltip && activeTooltip !== tip) {
          activeTooltip.classList.remove('visible');
          setTimeout(() => activeTooltip.remove(), 150);
        }

        document.body.appendChild(tip);
        positionTooltip(term, tip);

        requestAnimationFrame(() => {
          tip.classList.add('visible');
        });

        activeTooltip = tip;
        e.stopPropagation();
      }

      function hideTooltip() {
        tip.classList.remove('visible');
        setTimeout(() => {
          if (!tip.classList.contains('visible')) {
            tip.remove();
          }
        }, 150);
        if (activeTooltip === tip) {
          activeTooltip = null;
        }
      }

      term.addEventListener('mouseenter', showTooltip);
      term.addEventListener('mouseleave', hideTooltip);
      term.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tip.classList.contains('visible')) {
          hideTooltip();
        } else {
          showTooltip(e);
        }
      });
    });

    // Close tooltip on click outside
    document.addEventListener('click', () => {
      if (activeTooltip) {
        activeTooltip.classList.remove('visible');
        setTimeout(() => {
          if (!activeTooltip.classList.contains('visible')) {
            activeTooltip.remove();
          }
        }, 150);
        activeTooltip = null;
      }
    });

    function positionTooltip(term, tip) {
      const rect = term.getBoundingClientRect();
      const tipWidth = 300;
      let left = rect.left + rect.width / 2 - tipWidth / 2;
      left = Math.max(10, Math.min(left, window.innerWidth - tipWidth - 10));

      tip.style.left = left + 'px';
      tip.style.top = (rect.top - tip.offsetHeight - 8) + 'px';
    }
  }

  // ── PATTERN CARDS ──────────────────────────────────────────────
  function setupPatternCards() {
    document.querySelectorAll('.pattern-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px) scale(1.02)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // ── QUIZ SYSTEM ────────────────────────────────────────────────
  function setupQuizzes() {
    // Quiz option selection
    document.querySelectorAll('.quiz-option').forEach(option => {
      option.addEventListener('click', function() {
        const block = this.closest('.quiz-question-block');
        block.querySelectorAll('.quiz-option').forEach(o => {
          o.classList.remove('selected');
        });
        this.classList.add('selected');
      });
    });
  }

  // ── INITIALIZE ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ── CHAT WINDOW ANIMATION ───────────────────────────────────────
(function() {
  'use strict';

  function initChatWindow(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const messages = container.querySelectorAll('.chat-message');
    const typingIndicator = container.querySelector('.chat-typing');
    const nextBtn = container.querySelector('.chat-next-btn');
    const allBtn = container.querySelector('.chat-all-btn');
    const resetBtn = container.querySelector('.chat-reset-btn');
    const progressDisplay = container.querySelector('.chat-progress');

    let currentIndex = 0;
    let animationInterval = null;

    function updateProgress() {
      if (progressDisplay) {
        progressDisplay.textContent = `${currentIndex} / ${messages.length} 条消息`;
      }
    }

    function showMessage(index) {
      if (index >= messages.length) return;

      // Show typing indicator first
      if (typingIndicator) {
        typingIndicator.style.display = 'flex';
      }

      setTimeout(() => {
        // Hide typing indicator
        if (typingIndicator) {
          typingIndicator.style.display = 'none';
        }

        // Show the message
        const message = messages[index];
        message.style.display = 'flex';
        message.style.animation = 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

        currentIndex++;
        updateProgress();
      }, 600);
    }

    function showNext() {
      showMessage(currentIndex);
    }

    function showAll() {
      if (animationInterval) return;

      animationInterval = setInterval(() => {
        if (currentIndex >= messages.length) {
          clearInterval(animationInterval);
          animationInterval = null;
          return;
        }
        showMessage(currentIndex);
      }, 1500);
    }

    function reset() {
      // Clear any running animation
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
      }

      // Reset index
      currentIndex = 0;
      updateProgress();

      // Hide all messages
      messages.forEach(msg => {
        msg.style.display = 'none';
        msg.style.animation = '';
      });

      // Hide typing indicator
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
    }

    // Bind button events
    if (nextBtn) {
      nextBtn.addEventListener('click', showNext);
    }

    if (allBtn) {
      allBtn.addEventListener('click', showAll);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', reset);
    }

    // Initial progress update
    updateProgress();
  }

  // Initialize all chat windows when DOM is ready
  function initAllChatWindows() {
    initChatWindow('chat-demo-1');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllChatWindows);
  } else {
    initAllChatWindows();
  }
})();

// ── GLOBAL QUIZ FUNCTIONS ───────────────────────────────────────
window.selectOption = function(btn) {
  const block = btn.closest('.quiz-question-block');
  block.querySelectorAll('.quiz-option').forEach(o => {
    o.classList.remove('selected');
  });
  btn.classList.add('selected');
};

window.checkQuiz = function(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.quiz-question-block').forEach(q => {
    const selected = q.querySelector('.quiz-option.selected');
    const feedback = q.querySelector('.quiz-feedback');
    const correct = q.dataset.correct;
    const rightExp = q.dataset.explanationRight || '';
    const wrongExp = q.dataset.explanationWrong || '';

    if (!selected) {
      feedback.textContent = '请先选择一个答案！';
      feedback.className = 'quiz-feedback show warning';
      return;
    }

    q.querySelectorAll('.quiz-option').forEach(o => {
      o.disabled = true;
    });

    if (selected.dataset.value === correct) {
      selected.classList.add('correct');
      feedback.innerHTML = '<strong>完全正确！</strong> ' + rightExp;
      feedback.className = 'quiz-feedback show success';
    } else {
      selected.classList.add('incorrect');
      const correctBtn = q.querySelector(`.quiz-option[data-value="${correct}"]`);
      if (correctBtn) correctBtn.classList.add('correct');
      feedback.innerHTML = '<strong>不太对。</strong> ' + wrongExp;
      feedback.className = 'quiz-feedback show error';
    }
  });
};

window.resetQuiz = function(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.quiz-option').forEach(o => {
    o.classList.remove('selected', 'correct', 'incorrect');
    o.disabled = false;
  });

  container.querySelectorAll('.quiz-feedback').forEach(f => {
    f.className = 'quiz-feedback';
    f.textContent = '';
  });
};
