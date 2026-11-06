// Build data/constitution-text.js and data/amendment-index.js from parsed.json
const fs=require('fs');const [,,src,outDir]=process.argv;
const d=JSON.parse(fs.readFileSync(src,'utf8'));
// layout normalisation (whitespace/line structure only; see layout.js)
const LAYOUT=require('./layout.js');
d.preamble.text=LAYOUT.normaliseArticle(d.preamble.text);
d.articles.forEach(a=>{a.text=LAYOUT.normaliseArticle(a.text);});
d.schedules.forEach(s=>{s.text=LAYOUT.normaliseSchedule(s.text);});
// insert 238 (omitted with Part VII)
const i237=d.articles.findIndex(a=>a.id==='237');
d.articles.splice(i237+1,0,{id:'238',title:'Application of provisions of Part VI to States in Part B of the First Schedule',text:'Omitted by the Constitution (Seventh Amendment) Act, 1956, s. 29 and Sch. (w.e.f. 1-11-1956). [Part VII — "The States in Part B of the First Schedule" — was omitted in its entirety.]',omitted:true,section:null,fn:{},notes:{},headNotes:[]});
const words='First Second Third Fourth Fifth Sixth Seventh Eighth Ninth Tenth Eleventh Twelfth Thirteenth Fourteenth Fifteenth Sixteenth Seventeenth Eighteenth Nineteenth'.split(' ');
const tens={Twenty:20,Thirty:30,Forty:40,Fifty:50,Sixty:60,Seventy:70,Eighty:80,Ninety:90};
const units={First:1,Second:2,Third:3,Fourth:4,Fifth:5,Sixth:6,Seventh:7,Eighth:8,Ninth:9};
const ORD=(()=>{const o='first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth'.split(' ');
const tn=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];const tnth=['','','twentieth','thirtieth','fortieth','fiftieth','sixtieth','seventieth','eightieth','ninetieth'];
const m={};for(let n=1;n<=110;n++){let r=n%100,name;if(r===0)name='';else if(r<20)name=o[r-1];else{const t=Math.floor(r/10),u=r%10;name=u?tn[t]+o[u-1]:tnth[t];}
 if(n>=100)name=(r===0?'onehundredth':'onehundredand'+name);m[name]=n;}return m;})();
function ordToNum(s){return ORD[s.toLowerCase().replace(/[^a-z]/g,'')]||null;}
const amendIdx={};const art2amend={};
function scan(owner,fn){let lastAmend=null;for(const [k,t] of Object.entries(fn||{})){const m=t.match(/Constitution \(([A-Za-z\- ]+?) Amendment\) Act,\s*(\d{4})/);let n=null;
 if(m){n=ordToNum(m[1].replace(/One-hundred/i,'One Hundred'));lastAmend=n;} else if(/ibid/.test(t)&&lastAmend){n=lastAmend;}
 if(n){(amendIdx[n]=amendIdx[n]||new Set()).add(owner);(art2amend[owner]=art2amend[owner]||new Set()).add(n);}}}
// footnotes numbering is page-local-ordered; 'ibid' refers to previous footnote; approximate by global order
const allFn={};d.articles.forEach(a=>Object.assign(allFn,a.fn,a.notes||{}));Object.assign(allFn,d.preamble.fn,d.preamble.notes||{});d.schedules.forEach(s=>Object.assign(allFn,s.fn,s.notes||{}));
const fnAmend={};let last=null;for(const k of Object.keys(allFn).map(Number).sort((a,b)=>a-b)){const t=allFn[k];const m=t.match(/Constitution \(([A-Za-z\- ]+?) Amendment\) Act,?\s*(\d{4})/);if(m){last=ordToNum(m[1].replace(/One-hundred/i,'One Hundred'));fnAmend[k]=last;}else if(/ibid/i.test(t)&&last){fnAmend[k]=last;}}
function own(o,fn){for(const k of Object.keys(fn||{})){const n=fnAmend[k];if(n){(amendIdx[n]=amendIdx[n]||new Set()).add(o);(art2amend[o]=art2amend[o]||new Set()).add(n);}}}
d.articles.forEach(a=>{own(a.id,a.fn);own(a.id,a.notes);});own('Preamble',d.preamble.fn);d.schedules.forEach(s=>{own('Sch-'+s.id,s.fn);own('Sch-'+s.id,s.notes);});
const unk=Object.keys(allFn).filter(k=>!fnAmend[k]).length;
const idx={};for(const [k,v] of Object.entries(amendIdx))idx[k]=[...v];
const a2={};for(const [k,v] of Object.entries(art2amend))a2[k]=[...v].sort((x,y)=>x-y);
d.fnAmend=fnAmend;
fs.writeFileSync(outDir+'/constitution-text.js','/* Verbatim text: '+d.source+'. Footnote markers ⟦n⟧ refer to the official editorial footnotes. */\nwindow.COI_TEXT='+JSON.stringify(d)+';\n');
fs.writeFileSync(outDir+'/amendment-index.js','/* Auto-derived from the official footnotes: which provisions each amendment touched. */\nwindow.COI_AMEND_INDEX='+JSON.stringify({byAmendment:idx,byArticle:a2})+';\n');
console.log('amendments found',Object.keys(idx).length,'missing',Array.from({length:106},(_,i)=>i+1).filter(n=>!idx[n]).join(','),'fn w/o amend',unk);
console.log('42nd touched',idx[42].length,idx[42].slice(0,40).join(' '));console.log('art 21 amends',a2['21'],'368',a2['368'],'pre',a2['Preamble']);
