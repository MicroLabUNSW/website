// Shared announcements for the home preview and complete news page.
// Publication announcements are limited to papers first-authored by lab members.
const labNews = [
    {
        date: '2026-06',
        title: 'Pengran Wang joins our group as an MPhil candidate.'
    },
    {
        date: '2026-03',
        title: 'Yang Zhang’s review article on droplet digital CRISPR publishes in Advanced Science.'
    },
    {
        date: '2026-01',
        title: 'Reza Khodadadi joins our group as a PhD candidate.'
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
        article.append(date, copy);
        list.append(article);
    });
});
