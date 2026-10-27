#!/usr/bin/env python3
"""Сигнал: збирає статті з signal/src/*.html + signal/posts.json у готові сторінки,
список signal/index.html, feed.xml, тизер на головній, записи в sitemap.xml і llms.txt.
Запуск: python3 tools/signal.py (з кореня репо)."""
import json, re, html, datetime, pathlib, urllib.parse
ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = 'https://alexbentsa.com/'
MU = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня']
def d_uk(d):
    y,m,dd = d.split('-'); return f'{int(dd)} {MU[int(m)-1]} {y}'
posts = json.loads((ROOT/'signal/posts.json').read_text(encoding='utf-8'))
posts.sort(key=lambda p: p['date'])
# header/modal/tail з about/index.html (шляхи ../ ті самі)
about = (ROOT/'about/index.html').read_text(encoding='utf-8')
header = re.search(r'<header class="site-header">.*?</header>', about, re.S).group(0)
modal = about[about.index('<div class="modal"'):about.index('<div class="lightbox"')].rstrip()
tail = about[about.index('<div class="lightbox"'):]
tmpl = (ROOT/'tools/post-template.html').read_text(encoding='utf-8')
def nav_link(p, cls, label):
    if not p: return f'<a class="{cls} empty"><span>{label}</span><b>—</b></a>'
    return f'<a class="{cls}" href="{p["slug"]}.html"><span>{label}</span><b>{html.escape(p["title"])}</b></a>'
for i, p in enumerate(posts):
    body = (ROOT/f'signal/src/{p["slug"]}.html').read_text(encoding='utf-8')
    ld = {"@context":"https://schema.org","@graph":[
        {"@type":"BlogPosting","headline":p['title'],"description":p['deck'],"datePublished":p['date'],"dateModified":p.get('updated',p['date']),"inLanguage":"uk","url":BASE+f'signal/{p["slug"]}.html',"mainEntityOfPage":BASE+f'signal/{p["slug"]}.html',"image":BASE+p['cover'],"keywords":", ".join(p.get('tags',[])),"wordCount":len(re.sub(r'<[^>]+>',' ',body).split()),"author":{"@type":"Person","@id":BASE+"#person","name":"Олександр Бенца","url":BASE+"about/"},"publisher":{"@type":"Person","name":"Олександр Бенца"},"isPartOf":{"@type":"Blog","@id":BASE+"signal/","name":"Сигнал"}},
        {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Головна","item":BASE},{"@type":"ListItem","position":2,"name":"Сигнал","item":BASE+"signal/"},{"@type":"ListItem","position":3,"name":p['title'],"item":BASE+f'signal/{p["slug"]}.html'}]}]}
    out = tmpl
    for k, v in {'title':html.escape(p['title']),'deck':html.escape(p['deck']),'slug':p['slug'],'date':p['date'],'date_uk':d_uk(p['date']),'minutes':str(p['minutes']),'number':p['number'],'cover':p['cover'],'ld':json.dumps(ld,ensure_ascii=False),'header':header,'modal':modal,'tail':tail,'body':body,'title_enc':urllib.parse.quote(p['title']),'prev':nav_link(posts[i-1] if i>0 else None,'prev','Попередня'),'next':nav_link(posts[i+1] if i+1<len(posts) else None,'next','Наступна')}.items():
        out = out.replace('{{'+k+'}}', v)
    (ROOT/f'signal/{p["slug"]}.html').write_text(out, encoding='utf-8')
# список
rows = '\n'.join(f'''      <a class="post-row" href="{p["slug"]}.html">
        <span class="post-n">{p["number"]}</span>
        <div class="post-main"><span class="post-meta">{d_uk(p["date"])} · {p["minutes"]} хв</span><h2>{html.escape(p["title"])}</h2><p>{html.escape(p["deck"])}</p></div>
        <span class="post-arrow" aria-hidden="true">→</span>
      </a>''' for p in reversed(posts))
idx_head = about[:about.index('<main id="main">')]
idx_head = re.sub(r'<title[^>]*>.*?</title>','<title data-i18n="signal.ptitle">Сигнал · думки Олександра Бенци про системи, ШІ і бізнес</title>',idx_head)
idx_head = re.sub(r'<meta name="description"[^>]*>','<meta name="description" data-i18n-content="signal.desc" content="Сигнал: статті Олександра Бенци про бізнес-системи, ШІ-агентів і те, як перенести звичайний бізнес у майбутнє. Без води, з прикладами з живих систем.">',idx_head)
idx_head = idx_head.replace('https://alexbentsa.com/about/','https://alexbentsa.com/signal/')
idx_head = re.sub(r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="Сигнал · Олександр Бенца">',idx_head)
idx_head = re.sub(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="Думки про бізнес-системи, ШІ-агентів і бізнес, який можна перенести в майбутнє. Без води.">',idx_head)
idx_head = re.sub(r'<meta name="twitter:title" content="[^"]*">','<meta name="twitter:title" content="Сигнал · Олександр Бенца">',idx_head)
idx_head = re.sub(r'<meta name="twitter:description" content="[^"]*">','<meta name="twitter:description" content="Думки про бізнес-системи, ШІ-агентів і бізнес, який можна перенести в майбутнє.">',idx_head)
idx_head = idx_head.replace('<meta property="og:type" content="profile">\n  <meta property="profile:first_name" content="Олександр">\n  <meta property="profile:last_name" content="Бенца">','<meta property="og:type" content="website">')
idx_head = re.sub(r'<link rel="preload" as="image"[^>]*>\n','',idx_head)
idx_head = re.sub(r'  <script type="application/ld\+json">.*?</script>\n','',idx_head,flags=re.S)
ld_idx = {"@context":"https://schema.org","@graph":[{"@type":"Blog","@id":BASE+"signal/","name":"Сигнал","url":BASE+"signal/","inLanguage":"uk","author":{"@type":"Person","@id":BASE+"#person","name":"Олександр Бенца"},"blogPost":[{"@type":"BlogPosting","headline":p['title'],"url":BASE+f'signal/{p["slug"]}.html',"datePublished":p['date']} for p in posts]},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Головна","item":BASE},{"@type":"ListItem","position":2,"name":"Сигнал","item":BASE+"signal/"}]}]}
idx_head = idx_head.replace('</head>','  <link rel="alternate" type="application/rss+xml" title="Сигнал · Олександр Бенца" href="https://alexbentsa.com/signal/feed.xml">\n  <script type="application/ld+json">\n  '+json.dumps(ld_idx,ensure_ascii=False)+'\n  </script>\n</head>',1)
idx = idx_head + f'''<main id="main">
  <section class="signal-hero" id="top">
    <div class="hero-sky" aria-hidden="true"><i></i><i></i></div>
    <div class="wrap">
      <p class="eyebrow" data-i18n="signal.eyebrow">Сигнал · думки, не новини</p>
      <h1 data-words>Сигнал</h1>
      <p class="lead" data-i18n="signal.lead">Те, що я думаю про бізнес-системи, ШІ-агентів і бізнес, який можна перенести в майбутнє. Без води, з прикладами з живих систем. Читається з телефона за п'ять хвилин.</p>
      <div class="signal-sub">
        <a href="https://t.me/alexbentsa" target="_blank" rel="me noopener"><img src="../assets/logos/telegram.svg" alt="" width="16" height="16"><span data-i18n="signal.tg">Нове в Telegram</span></a>
        <a href="feed.xml">RSS</a>
      </div>
    </div>
  </section>
  <section class="section" id="posts">
    <div class="wrap">
    <div class="posts">
{rows}
    </div>
    </div>
  </section>
</main>

{modal}

{tail}'''
(ROOT/'signal/index.html').write_text(idx, encoding='utf-8')
# feed
items = ''.join(f'''
  <item>
    <title>{html.escape(p["title"])}</title>
    <link>{BASE}signal/{p["slug"]}.html</link>
    <guid isPermaLink="true">{BASE}signal/{p["slug"]}.html</guid>
    <pubDate>{datetime.datetime.strptime(p["date"],"%Y-%m-%d").strftime("%a, %d %b %Y 09:00:00 +0200")}</pubDate>
    <description>{html.escape(p["deck"])}</description>
  </item>''' for p in reversed(posts))
(ROOT/'signal/feed.xml').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Сигнал · Олександр Бенца</title>
  <link>{BASE}signal/</link>
  <atom:link href="{BASE}signal/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Думки про бізнес-системи, ШІ-агентів і бізнес, який можна перенести в майбутнє.</description>
  <language>uk</language>{items}
</channel>
</rss>
''', encoding='utf-8')
# тизер на головній
home = (ROOT/'index.html').read_text(encoding='utf-8')
teaser = '\n'.join(f'''      <a class="post-row" href="signal/{p["slug"]}.html">
        <div class="post-main"><span class="post-meta">№{p["number"]} · {d_uk(p["date"])} · {p["minutes"]} хв</span><h3>{html.escape(p["title"])}</h3><p>{html.escape(p["deck"])}</p></div>
      </a>''' for p in list(reversed(posts))[:2])
home = re.sub(r'(<!-- signal:start -->).*?(<!-- signal:end -->)', lambda m: m.group(1)+'\n'+teaser+'\n      '+m.group(2), home, flags=re.S)
(ROOT/'index.html').write_text(home, encoding='utf-8')
# sitemap
sm = (ROOT/'sitemap.xml').read_text(encoding='utf-8')
def url(loc, date, cf, pr, img):
    return f'''  <url>
    <loc>{loc}</loc>
    <lastmod>{date}</lastmod>
    <changefreq>{cf}</changefreq>
    <priority>{pr}</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="{loc}"/>
    <image:image><image:loc>{img}</image:loc></image:image>
  </url>
'''
block = url(BASE+'signal/', posts[-1]['date'], 'weekly', '0.9', BASE+'assets/og.png') + ''.join(url(BASE+f'signal/{p["slug"]}.html', p.get('updated',p['date']), 'monthly', '0.7', BASE+p['cover']) for p in posts)
sm = re.sub(r'<!-- signal:start -->.*?<!-- signal:end -->', '<!-- signal:start -->\n'+block+'<!-- signal:end -->', sm, flags=re.S)
(ROOT/'sitemap.xml').write_text(sm, encoding='utf-8')
# llms
ll = (ROOT/'llms.txt').read_text(encoding='utf-8')
lines = '\n'.join(f'- [{p["title"]}]({BASE}signal/{p["slug"]}.html): {p["deck"]}' for p in reversed(posts))
ll = re.sub(r'<!-- signal:start -->.*?<!-- signal:end -->', '<!-- signal:start -->\n'+lines+'\n<!-- signal:end -->', ll, flags=re.S)
(ROOT/'llms.txt').write_text(ll, encoding='utf-8')
print('signal:', len(posts), 'posts')
