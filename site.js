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

// Mobile home: every section and card is a vertical swipe destination.
if (document.body.matches('.home-page:not(.inner-page)')) {
    const mobileHome = window.matchMedia('(max-width: 760px)');
    const header = document.querySelector('.site-header');
    const peopleContainer = document.querySelector('#students > .site-container');
    const spotlight = peopleContainer?.querySelector('.pi-spotlight');
    const membersHeading = peopleContainer?.querySelector('.section-heading-row');
    const bioParagraphs = [...(spotlight?.querySelectorAll('.pi-career-bio, .pi-research-bio') || [])];
    const bioPanels = [];
    let leadershipPanel;
    const cardGrids = [...document.querySelectorAll('.research-hover-grid, .featured-pub-grid, #students .student-grid')];

    const updateCardPanels = () => cardGrids.forEach((grid) => {
        const section = grid.closest('section');
        if (mobileHome.matches && !grid.classList.contains('mobile-card-stack')) {
            const heading = section.querySelector('.section-heading-row');
            [...grid.children].forEach((card, index) => {
                const panel = document.createElement('div');
                panel.className = 'mobile-card-panel';
                card.before(panel);
                if (index === 0 && !grid.matches('.student-grid')) {
                    const panelHeading = heading.cloneNode(true);
                    panelHeading.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
                    panel.append(panelHeading);
                }
                panel.append(card);
            });
            grid.classList.add('mobile-card-stack');
            section.classList.add('mobile-card-section');
        } else if (!mobileHome.matches && grid.classList.contains('mobile-card-stack')) {
            [...grid.children].forEach((panel) => panel.replaceWith(panel.lastElementChild));
            grid.classList.remove('mobile-card-stack');
            section.classList.remove('mobile-card-section');
        }
    });

    const updateMobileHome = () => {
        document.documentElement.classList.toggle('mobile-home-snap', mobileHome.matches);
        updateCardPanels();
        if (mobileHome.matches && spotlight && !leadershipPanel) {
            leadershipPanel = document.createElement('section');
            leadershipPanel.id = 'mobile-leadership';
            leadershipPanel.className = 'section-block people-home';
            leadershipPanel.setAttribute('aria-label', 'Principal investigator');
            const container = document.createElement('div');
            container.className = 'site-container';
            if (membersHeading) container.append(membersHeading);
            container.append(spotlight);
            leadershipPanel.append(container);
            document.querySelector('#students').before(leadershipPanel);
            bioParagraphs.forEach((paragraph, index) => {
                const panel = document.createElement('section');
                panel.className = 'section-block mobile-pi-bio-panel';
                const content = document.createElement('div');
                content.className = 'site-container';
                const title = document.createElement('h2');
                title.textContent = index === 0 ? 'Ming Li · Biography' : 'Ming Li · Research';
                content.append(title, paragraph);
                panel.append(content);
                panel.style.order = '4';
                document.querySelector('#students').before(panel);
                bioPanels.push(panel);
            });
        } else if (!mobileHome.matches && leadershipPanel) {
            if (membersHeading) peopleContainer.prepend(membersHeading, spotlight);
            else peopleContainer.prepend(spotlight);
            const links = spotlight.querySelector('.profile-links');
            bioParagraphs.forEach((paragraph) => links.before(paragraph));
            bioPanels.splice(0).forEach((panel) => panel.remove());
            leadershipPanel.remove();
            leadershipPanel = null;
        }
        document.documentElement.style.setProperty('--mobile-header-height', `${header.getBoundingClientRect().height}px`);
    };
    mobileHome.addEventListener('change', updateMobileHome);
    new ResizeObserver(() => {
        document.documentElement.style.setProperty('--mobile-header-height', `${header.getBoundingClientRect().height}px`);
    }).observe(header);
    updateMobileHome();
}
