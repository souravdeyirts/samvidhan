const fs=require('fs');const P=process.argv[2];global.window={};
require(P+'/data/constitution-text.js');require(P+'/data/themes.js');require(P+'/data/structure.js');
const d=window.COI_TEXT;const ids=new Set(d.articles.map(a=>a.id));
const bad=[];window.COI_THEMES.forEach(t=>t.articles.forEach(a=>{if(!ids.has(a))bad.push(t.id+':'+a)}));
window.COI_PARTS.forEach(p=>{[p.from,p.to].forEach(x=>{if(!ids.has(x))bad.push('part '+p.id+':'+x)});(p.chapters||[]).forEach(c=>[c.from,c.to].forEach(x=>{if(!ids.has(x))bad.push('ch '+c.title+':'+x)}))});
console.log('bad ids',bad);
const edges={};
for(const a of d.articles){const t=a.text.replace(/⟦\d+⟧/g,'');const set=new Set();
 const re=/\b[Aa]rticles?\s+((?:\d{1,3}[A-Z]{0,2}(?:\s*\([0-9a-z]+\))*(?:\s*(?:,|and|or|to)\s*)?)+)/g;let m;
 while((m=re.exec(t))){const list=m[1];const nums=list.match(/\d{1,3}[A-Z]{0,2}(?!\))/g)||[];
  // handle ranges "X to Y" by including endpoints only
  for(const n of nums){if(ids.has(n)&&n!==a.id)set.add(n)}}
 if(set.size)edges[a.id]=[...set];}
const n=Object.values(edges).reduce((s,x)=>s+x.length,0);console.log('xref edges',n,'21->',edges['21'],'32->',edges['32'],'368->',edges['368'],'356->',edges['356']);
fs.writeFileSync(P+'/data/xrefs.js','/* Auto-extracted cross-references: article -> articles it mentions in its text. */\nwindow.COI_XREFS='+JSON.stringify(edges)+';\n');
