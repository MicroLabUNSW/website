// Shared announcements for the home preview and complete news page.
// Publication announcements are limited to papers first-authored by lab members.
const labNews = [
    {
        date: '2026-06',
        title: 'Pengran Wang joins our lab as an MPhil candidate.',
        url: 'about-us.html',
        linkLabel: 'Meet Pengran Wang'
    },
    {
        date: '2026-03',
        title: 'Yang Zhang and colleagues publish their review of droplet digital CRISPR in Advanced Science.',
        url: 'https://doi.org/10.1002/advs.202517470',
        linkLabel: 'Read the Advanced Science review'
    },
    {
        date: '2026-01',
        title: 'Reza Khodadadi joins our lab as a PhD candidate.',
        url: 'about-us.html',
        linkLabel: 'Meet Reza Khodadadi'
    }
];

document.querySelectorAll('[data-news-list]').forEach((list) => {
    const limit = Number(list.dataset.newsLimit) || labNews.length;
    labNews.slice(0, limit).forEach((news) => {
        const article = document.createElement('article');
        article.className = 'news-text-item';
        const date = document.createElement('p');
        date.className = 'news-date';
        if (news.date) {
            const [year, month] = news.date.split('-');
            const time = document.createElement('time');
            time.dateTime = news.date;
            time.append(new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(year), Number(month) - 1))));
            time.append(document.createElement('br'));
            const strong = document.createElement('strong');
            strong.textContent = year;
            time.append(strong);
            date.append(time);
        }
        const copy = document.createElement('p');
        copy.className = 'news-sentence';
        copy.textContent = news.title;
        const link = document.createElement('a');
        link.href = news.url;
        link.textContent = '↗';
        link.setAttribute('aria-label', news.linkLabel);
        if (news.url.startsWith('https://')) {
            link.target = '_blank';
            link.rel = 'noopener';
        }
        article.append(date, copy, link);
        list.append(article);
    });
});
