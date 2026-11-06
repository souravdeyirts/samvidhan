"""Build data/drafting.js: for each Article, its counterpart in the Draft Constitution of 1948 and the
dates on which the Constituent Assembly debated and adopted it.

Input: article pages from constitutionofindia.net (Centre for Law and Policy Research), saved as HTML.
Only facts are extracted (draft article numbers, dates) plus the text of the 1948 Draft, which is a
public document. The site's own summaries are not copied.

Usage: python -I tools/build_drafting.py <pages-dir> <url-list> <out.js>
"""
import html, json, os, re, sys

pages_dir, url_list, out = sys.argv[1], sys.argv[2], sys.argv[3]
MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
MON = '(' + '|'.join(m.title() for m in MONTHS) + ')'


def text_of(raw):
    raw = re.sub(r'<script.*?</script>|<style.*?</style>|<noscript.*?</noscript>', ' ', raw, flags=re.S | re.I)
    raw = re.sub(r'<br\s*/?>|</p>|</div>|</h\d>|</li>', '\n', raw, flags=re.I)
    s = html.unescape(re.sub(r'<[^>]+>', '', raw))
    s = s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    s = re.sub(r'[ \t ]+', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n', s)
    return s


def iso(d, m, y):
    return '%04d-%02d-%02d' % (int(y), MONTHS.index(m.lower()) + 1, int(d))


def dates_in(sentence):
    """'6 and 13 December 1948', '29, 30 November and 1 December 1948', '13 December 1948' -> ISO dates"""
    found = []
    # groups like "6, 7 and 13 December 1948"
    for m in re.finditer(r'((?:\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*|\s+and\s+|\s*&\s*))*\d{1,2}(?:st|nd|rd|th)?)\s+' + MON + r'(?:,)?(?:\s+(\d{4}))?', sentence):
        days = re.findall(r'\d{1,2}', m.group(1))
        found.append((days, m.group(2), m.group(3)))
    # fill missing years from the next group that has one
    out_dates, year = [], None
    for days, mon, y in reversed(found):
        year = y or year
        if not year:
            continue
        for d in days:
            out_dates.append(iso(d, mon, year))
    return sorted(set(out_dates))


def slug_to_id(slug):
    m = re.match(r'article-(\d+)([a-z]{0,2})(?:-|$)', slug)
    return (m.group(1) + m.group(2).upper()) if m else None


urls = [u.strip() for u in open(url_list, encoding='utf-8') if u.strip()]
result, stats = {}, {'pages': 0, 'draft': 0, 'debated': 0, 'notDebated': 0, 'noDraft': 0}
for u in urls:
    slug = u.rstrip('/').split('/')[-1]
    aid = slug_to_id(slug)
    path = os.path.join(pages_dir, slug + '.html')
    if not aid or not os.path.exists(path) or os.path.getsize(path) < 5000:
        continue
    stats['pages'] += 1
    s = text_of(open(path, encoding='utf-8', errors='replace').read())
    rec = {'url': u}
    m = re.search(r'Article\s+([0-9]+(?:-?[A-Z]{1,2})?)((?:\s*\([^)\n]{1,6}\)|\s*(?:to|and|,)\s*\([^)\n]{1,6}\))*)\s*,\s*Draft Constitution(?: of Indian?)?,?\s*\(?1948\)?\s*\n(.*?)\n\s*(?:Version\s*\d|Summary)', s, re.S | re.I)
    if m:
        rec['draft'] = (m.group(1) + (' ' + re.sub(r'\s+', ' ', m.group(2)).strip(' ,') if m.group(2).strip(' ,') else '')).replace('-', '')
        dt = m.group(3).strip()
        if 20 < len(dt) < 6000:
            rec['draftText'] = re.sub(r'\s*\n\s*', '\n', dt)
        stats['draft'] += 1
    parts = re.split(r'\n\s*Summary\s*\n', s, maxsplit=1, flags=re.I)
    summ = parts[1] if len(parts) > 1 else ''
    summ = summ.split('We are a not-for-profit', 1)[0]
    sentences = re.split(r'(?<=[.;])\s+', summ.replace('\n', ' '))
    debated, adopted = [], []
    for sen in sentences:
        low = sen.lower()
        if 'debated' in low or 'discussed' in low or 'discussion' in low or 'took up' in low or 'taken up' in low:
            if re.search(r'\bnot (?:debated|discussed)\b|without debate', low):
                rec['notDebated'] = True
            else:
                debated += dates_in(sen)
        if re.search(r'\b(passed|adopted|accepted)\b', low) and 'amendment' not in low.split('passed')[0][-40:]:
            adopted += dates_in(sen)
    if re.search(r'\bnot debated\b|\bwithout (?:any )?debate\b', summ.lower()):
        rec['notDebated'] = True
    if debated:
        rec['debated'] = sorted(set(debated))
        rec.pop('notDebated', None)   # "part of it was not debated" does not mean the article was not debated
        stats['debated'] += 1
    if adopted:
        rec['adopted'] = sorted(set(adopted))[-1]
        if debated and rec['adopted'] < max(debated):
            del rec['adopted']
    if rec.get('notDebated') and not debated:
        stats['notDebated'] += 1
    if 'draft' not in rec and not re.search(r'not a standalone provision', summ, re.I):
        sm = re.search(r'Draft Article\s+([0-9]+(?:-?[A-Z]{1,2})?)((?:\s*\([^)]{1,6}\))?(?:\s*(?:to|and)\s*\([^)]{1,6}\))?)\s*\(\s*Article\s+' + re.escape(aid) + r'\s*\)', summ)
        if sm:
            rec['draft'] = (sm.group(1) + (' ' + sm.group(2).strip() if sm.group(2).strip() else '')).replace('-', '')
    if 'draft' not in rec:
        pm = re.search(r'not a standalone provision.{0,120}?(?:included|part of|contained) in Draft Article\s+([0-9]+[A-Z]{0,2})', summ, re.S | re.I)
        if pm:
            rec['partOf'] = pm.group(1)
        stats['noDraft'] += 1
    if re.search(r'not (?:a )?part of the Draft Constitution|was not in the Draft Constitution|was not included in the Draft Constitution', summ, re.I) and not re.search(r'not a standalone provision', summ, re.I):
        rec['addedLater'] = True
    if 'draft' not in rec:
        if re.search(r'not (?:part of|in|included in) the Draft Constitution|was not in the Draft|introduced (?:by|in) the Drafting Committee|added by the Drafting Committee', summ, re.I):
            rec['addedLater'] = True
    result[aid] = rec

with open(out, 'w', encoding='utf-8') as f:
    f.write('/* Draft Constitution (1948) counterparts and Constituent Assembly debate dates.\n'
            '   Facts extracted from constitutionofindia.net (Centre for Law and Policy Research); see tools/build_drafting.py. */\n')
    f.write('window.COI_DRAFTING=' + json.dumps(result, ensure_ascii=False) + ';\n')
print(json.dumps(stats))
for k in ['21', '32', '14', '44', '368', '343', '17', '1']:
    r = result.get(k)
    if r:
        print(k, {x: (v if x != 'draftText' else v[:60]) for x, v in r.items() if x != 'url'})
