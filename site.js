document.documentElement.classList.add('js-enabled');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const showPage = () => {
    document.body.classList.remove('page-ready', 'page-leaving');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => document.body.classList.add('page-ready'));
    });
};

showPage();
window.addEventListener('pageshow', (event) => {
    if (event.persisted) showPage();
});

document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    const destination = new URL(link.href, window.location.href);
    const sameWebsite = /^https?:$/.test(destination.protocol)
        ? destination.origin === window.location.origin
        : destination.protocol === 'file:' && window.location.protocol === 'file:';
    if (!sameWebsite) return;
    if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;

    event.preventDefault();

    if (reducedMotion.matches) {
        window.location.assign(destination.href);
        return;
    }

    document.body.classList.remove('page-ready');
    document.body.classList.add('page-leaving');
    window.setTimeout(() => window.location.assign(destination.href), 300);
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((section) => revealObserver.observe(section));
