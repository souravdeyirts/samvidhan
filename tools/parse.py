"""Parse the official Constitution of India text into JSON.
Usage:
  pdftotext <official.pdf> coi.txt
  python -I tools/parse.py coi.txt parsed.json
  node tools/build_text.js parsed.json data
  node tools/build_xref.js .
"""
import re, sys, json

src, out = sys.argv[1], sys.argv[2]
raw = open(src, encoding='utf-8', errors='replace').read()
pages = raw.split('\f')

# locate body start: the page containing the second 'PREAMBLE' heading followed by WE, THE PEOPLE
start = next(i for i, p in enumerate(pages) if 'WE, THE PEOPLE OF INDIA' in p and 'PREAMBLE' in p)
# appendix start (stop before Appendix I)
end = next(i for i, p in enumerate(pages) if i > start and re.search(r'^APPENDIX I\s*$', p, re.M))

import os
VALID_IDS = set(json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'article_ids.json'))))
footnotes = {}  # global id -> text
fn_counter = 0
stream_parts = []

HEADER_RE = re.compile(r'^(THE CONSTITUTION OF INDIA|\(.*?\)|\d{1,4})\s*$')

for pi in range(start, end):
    p = pages[pi]
    lines = p.split('\n')
    # split off footnotes
    body_lines, fn_lines, in_fn = [], [], False
    for ln in lines:
        if re.match(r'^_{10,}', ln.strip()):
            in_fn = True
            continue
        (fn_lines if in_fn else body_lines).append(ln)
    # strip header lines at top of page (page nos, running header, part header)
    while body_lines and (not body_lines[0].strip() or HEADER_RE.match(body_lines[0].strip())):
        body_lines.pop(0)
    # strip trailing page numbers
    def strip_tail(ls):
        while ls and (not ls[-1].strip() or re.fullmatch(r'\d{1,4}', ls[-1].strip())):
            ls.pop()
        return ls
    body_lines = strip_tail(body_lines)
    fn_lines = strip_tail(fn_lines)
    # parse footnotes: "1. Subs. by ... 2. Ins. by ..."
    fn_text = ' '.join(l.strip() for l in fn_lines if l.strip())
    fn_text = re.sub(r'\s+', ' ', fn_text)
    local = {}
    if fn_text:
        # split at "N. " where N increments from 1
        pos = []
        k = 1
        idx = 0
        while True:
            m = re.compile(r"(?:^|\s)(%d)(?:\.\s+|\.(?=[A-Za-z\x22\x27“\[*])|\s+(?=[A-Z\x22\x27“\[*]))" % k).search(fn_text, idx)
            if not m:
                break
            pos.append((k, m.start(1)))
            idx = m.end()
            k += 1
        for j, (k, s) in enumerate(pos):
            e = pos[j + 1][1] if j + 1 < len(pos) else len(fn_text)
            txt = fn_text[s:e].strip()
            txt = re.sub(r'^%d\.?\s*' % k, '', txt)
            fn_counter += 1
            footnotes[fn_counter] = txt
            local[k] = fn_counter
    body = '\n'.join(body_lines)
    # replace footnote markers N[ , N*** , N*
    def rep(m):
        n = int(m.group(1))
        if n in local:
            return '⟦%d⟧%s' % (local[n], m.group(2))
        return m.group(0)
    if local:
        # glued marker before an article heading, e.g. "731D. [Saving..." = marker 7 + art 31D
        def glued(m):
            whole = m.group(1)
            if whole in VALID_IDS:
                return m.group(0)
            for cut in (1, 2):
                mk, art = whole[:cut], whole[cut:]
                if art in VALID_IDS and int(mk) in local:
                    return '⟦%d⟧[%s.' % (local[int(mk)], art)
            return m.group(0)
        body = re.sub(r'(?m)(?:^|(?<=\s))(\d{2,5}[A-Z]{0,2})\.(?=\s*\[?[A-Z])', glued, body)
        body = re.sub(r'(?<![\d(⟦])(\d{1,2})(\[|\*)', rep, body)
        # footnotes of this page that no marker points to: keep them as page-level notes
        used_here = set(int(x) for x in re.findall(r'⟦(\d+)⟧', body))
        extra = [g for g in local.values() if g not in used_here]
        if extra:
            body = body.rstrip() + ''.join('⟪%d⟫' % g for g in extra)
    stream_parts.append(body)

stream = '\n'.join(stream_parts)
# keep paragraph breaks: lines starting with clause markers start new paragraphs
stream = stream.replace(chr(13), '').replace('371-I.', '371I.').replace('2 4 3 ZI .', '243ZI.')

# split off schedules
sch_idx = stream.find('FIRST SCHEDULE [Articles 1 and 4]')
# back up to include marker prefix
pre = stream.rfind('\n', 0, sch_idx)
articles_stream, schedules_stream = stream[:pre], stream[pre:]

# ---- articles ----
HEAD = re.compile(r'(?:⟦\d+⟧)?\[?(?<![\w(])(\d{1,5}[A-Z]{0,2})\.\s*((?:⟦\d+⟧|\d{1,2}(?=\[))?\[?[A-Z](?:(?!--)[\s\S]){0,260}?[.\]]\]?\.?)\s*--?')

def key(a):
    m = re.fullmatch(r'(\d+)([A-Z]*)', a)
    n, s = int(m.group(1)), m.group(2)
    return (n, s)

def ok(k, last):
    return k > last and k[0] - last[0] <= 14

found = []
last = (0, 0, '')
pos = 0
while True:
    m = HEAD.search(articles_stream, pos)
    if not m:
        break
    pos = m.start() + 1
    num = m.group(1)
    title = re.sub(r'^\d{1,2}(?=\[)', '', m.group(2))
    if '\n(' in title or re.search(r'\(\d\)', title) or re.search(r'PART [IVX]|CHAPTER|\d+[A-Z]*\.\s+[A-Z\[]', title):
        continue
    pre = articles_stream[max(0, m.start()-12):m.start()].lower()
    if re.search(r'\b(article|articles|art\.|arts\.|and|of|to|or)\s*$|,\s*$', pre):
        continue
    if not re.search(r'[.\]]\s*\]?\.?$', title.strip()):
        continue
    cand = None
    for strip in (0, 1, 2):
        n2 = num[strip:]
        if not n2 or not n2[0].isdigit() or n2[0] == '0':
            continue
        if ok(key(n2), last):
            cand = n2
            break
    if not cand:
        continue
    hm = re.match(r'⟦(\d+)⟧', m.group(0))
    found.append((m.start(), m.end(), cand, title, hm.group(1) if hm else None))
    pos = m.end()
    last = key(cand)

pre_text = articles_stream[:found[0][0]]
articles = []
for i, (s, e, num, title, headfn) in enumerate(found):
    nxt = found[i + 1][0] if i + 1 < len(found) else len(articles_stream)
    body = articles_stream[e:nxt]
    title = title.strip()
    omitted = bool(re.match(r'^\s*Omitted', body)) or 'Omitted by' in body[:200] and len(body) < 400
    if headfn:
        body = '⟦' + headfn + '⟧[' + body.lstrip()
    articles.append({'num': num, 'title': title, 'raw': body, 'omitted': omitted, 'start': s})

# capture PART / CHAPTER / subheading text that leaked into the end of an article body
STRUCT = re.compile(r'\s*(PART [IVXL]+[A-Z]?\b.*|CHAPTER [IVX]+\..*)$', re.S)
heading_carry = []
for a in articles:
    b = a['raw']
    if heading_carry:
        # notes attached to a PART / CHAPTER heading belong with the first article that follows it
        b = ''.join('⟪%s⟫' % n for n in heading_carry) + b
        a['head_notes'] = [int(n) for n in heading_carry]
        heading_carry = []
    m = STRUCT.search(b)
    removed = ''
    if m:
        removed = b[m.start():]
        b = b[:m.start()]
    t = re.search(r'\s*(⟦\d+⟧)?\[?\s*\d{0,2}\s*$', b)
    removed = b[t.start():] + removed
    b = b[:t.start()]
    heading_carry = re.findall(r'⟦(\d+)⟧', removed)
    a['raw'] = b

# preamble
pm = re.search(r'PREAMBLE\s*(WE, THE PEOPLE.*?CONSTITUTION\.)', pre_text, re.S)
preamble = pm.group(1) if pm else ''

def clean(t):
    t = t.strip()
    t = re.sub(r'[ \t]+', ' ', t)
    # paragraph breaks before clause markers
    t = re.sub(r'\s*\n\s*', '\n', t)
    # join lines that are not starting a clause / proviso / explanation
    lines = t.split('\n')
    outl = []
    for ln in lines:
        if outl and not re.match(r'^(⟦\d+⟧)?\[?\(?(\d+[A-Z]?|[a-z]{1,3}|[ivxl]+)\)|^(⟦\d+⟧)?\[?(Provided|Explanation|Illustration)', ln):
            outl[-1] += ' ' + ln
        else:
            outl.append(ln)
    t = '\n'.join(outl)
    # split inline clause starts "... (2) The" into new paragraphs when preceded by sentence end
    t = re.sub(r'([.;:\]])\s+((?:⟦\d+⟧)?\[?\((?:\d+[A-Z]?|[a-z]|[ivx]+)\)\s)', r'\1\n\2', t)
    return t.strip()

fn_used = set()
def collect_fns(t):
    return [int(x) for x in re.findall(r'⟦(\d+)⟧', t)]
def collect_notes(t):
    return [int(x) for x in re.findall(r'⟪(\d+)⟫', t)]
def strip_notes(t):
    return re.sub(r'\s*⟪\d+⟫', '', t)

SUB = re.compile(r"(?:^|(?<=[.;:\]]))\s*((?:⟦\d+⟧)?\[?[A-Z][A-Za-z ,\-']{2,90}\]?)\s*$")
carry = None
for a in articles:
    a['notes'] = collect_notes(a['raw']) + collect_notes(a['title'])
    a['raw'] = strip_notes(a['raw'])
    a['title'] = strip_notes(a['title'])
for a in articles:
    a['section'] = carry
    carry = None
    m = SUB.search(a['raw'].strip())
    if m and not re.search(r'[.;:]$', m.group(1)) and len(m.group(1).split()) <= 12:
        carry = re.sub(r'⟦\d+⟧|[\[\]]', '', m.group(1)).strip()
        a['raw'] = a['raw'].strip()[:m.start(1)]
out_articles = []
for a in articles:
    t = clean(a['raw'])
    fns = collect_fns(t) + collect_fns(a['title'])
    out_articles.append({
        'id': a['num'],
        'title': re.sub(r'⟦\d+⟧', '', a['title']).strip(' []').rstrip('.').strip(' []'),
        'text': t,
        'omitted': a['omitted'],
        'section': a['section'],
        'fn': {str(n): footnotes.get(n, '') for n in fns},
        'notes': {str(n): footnotes.get(n, '') for n in a['notes']},
        'headNotes': [str(n) for n in a.get('head_notes', [])],
    })

pre_notes = collect_notes(preamble)
pre_clean = clean(strip_notes(preamble))
pre_fns = collect_fns(pre_clean)

# ---- schedules ----
SCH_NAMES = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH']
schedules = []
positions = []
for nm in SCH_NAMES:
    m = re.search(r'(?:⟦\d+⟧\[)?%s SCHEDULE' % nm, schedules_stream)
    positions.append(m.start() if m else None)
for i, nm in enumerate(SCH_NAMES):
    s = positions[i]
    e = next((positions[j] for j in range(i + 1, len(SCH_NAMES)) if positions[j]), len(schedules_stream))
    txt = schedules_stream[s:e].strip()
    txt = re.sub(r'[ \t]+', ' ', txt)
    sn = collect_notes(txt)
    txt = strip_notes(txt)
    fns = collect_fns(txt)
    schedules.append({'id': nm.title(), 'text': txt, 'fn': {str(n): footnotes.get(n, '') for n in fns}, 'notes': {str(n): footnotes.get(n, '') for n in sn}})

json.dump({'source': 'The Constitution of India [As on 1st May, 2024], Legislative Department, Ministry of Law and Justice, Government of India',
           'preamble': {'text': pre_clean, 'fn': {str(n): footnotes.get(n, '') for n in pre_fns}, 'notes': {str(n): footnotes.get(n, '') for n in pre_notes}},
           'articles': out_articles, 'schedules': schedules}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('articles', len(out_articles), 'footnotes', len(footnotes), 'schedules', [len(s['text']) for s in schedules])

_used = set(int(x) for x in re.findall(r'⟦(\d+)⟧', stream)) | set(int(x) for x in re.findall(r'⟪(\d+)⟫', stream))
_orph = [k for k in footnotes if k not in _used]
print('footnotes', len(footnotes), 'referenced', len(_used & set(footnotes)), 'orphans', len(_orph))
