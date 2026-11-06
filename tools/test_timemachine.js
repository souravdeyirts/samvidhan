const P=process.argv[2];global.window={};
require(P+"/data/constitution-text.js");require(P+"/data/amendments.js");
const TM=require(P+"/js/timemachine.js");
const d=window.COI_TEXT;const note=TM.makeNoteParser({fnAmend:d.fnAmend,amendments:window.COI_AMENDMENTS});
const show=s=>s.replace(//g,"{+").replace(//g,"+}").replace(//g,"[-").replace(//g,"-]").replace(//g,"<<").replace(//g,">>");
const D=s=>new Date(s+"T00:00:00Z");
let fails=0;const expect=(name,cond)=>{console.log((cond?"PASS ":"FAIL ")+name);if(!cond)fails++};
const art=id=>d.articles.find(a=>a.id===id);
let r=TM.renderAsOf(d.preamble.text,d.preamble.fn,D("1950-01-26"),"read",{note});
console.log(show(r.text));
expect("Preamble 1950 says SOVEREIGN DEMOCRATIC REPUBLIC",/SOVEREIGN DEMOCRATIC REPUBLIC and to secure/.test(r.text));
expect("Preamble 1950 says Unity of the Nation",/Unity of the Nation/.test(r.text));
r=TM.renderAsOf(d.preamble.text,d.preamble.fn,D("1977-01-03"),"read",{note});
expect("Preamble 3 Jan 1977 is current",/SOCIALIST SECULAR/.test(r.text)&&!/Unity of the Nation/.test(r.text));
r=TM.renderAsOf(d.preamble.text,d.preamble.fn,D("1960-01-01"),"diff",{note});console.log(show(r.text).slice(0,260));
r=TM.renderAsOf(art("19").text,art("19").fn,D("1950-06-01"),"read",{note});console.log("--- 19 @1950\n"+show(r.text).slice(0,900));
expect("19 in 1950 has no co-operative societies",!/co-operative/.test(r.text));
expect("19 in 1950 shows (f) as restored or gap",/\(f\)/.test(r.text)||/<</.test(show(r.text)));
expect("21A not yet in 2000",TM.statusOn(art("21A"),D("2000-01-01"),note).state==="not-yet");
expect("21A in force 2011",TM.statusOn(art("21A"),D("2011-01-01"),note).state==="in-force");
expect("31 existed in 1970",TM.statusOn(art("31"),D("1970-01-01"),note).state==="existed-omitted-later");
expect("31 omitted 1980",TM.statusOn(art("31"),D("1980-01-01"),note).state==="omitted");
expect("338B not yet 2010",TM.statusOn(art("338B"),D("2010-01-01"),note).state==="not-yet");
global.window.COI_PARTS=null;require(P+"/data/structure.js");
const firstOf={};window.COI_PARTS.forEach(p=>{firstOf[p.id]=p.from});
for(const [pid,f] of Object.entries(firstOf)){const pi=TM.partInsertion(art(f),note,pid);if(pi)console.log("Part",pid,"inserted",pi.from&&pi.from.toISOString().slice(0,10),pi.label)}
expect("51A not yet 1970",TM.statusOn(art("51A"),D("1970-01-01"),note,TM.partInsertion(art("51A"),note,"IVA")).state==="not-yet");
expect("243G not yet 1990 (Part IX)",TM.statusOn(art("243G"),D("1990-01-01"),note,TM.partInsertion(art("243"),note,"IX")).state==="not-yet");
expect("243G in force 1994",TM.statusOn(art("243G"),D("1994-01-01"),note,TM.partInsertion(art("243"),note,"IX")).state==="in-force");
expect("330A not yet 2025",TM.statusOn(art("330A"),D("2025-01-01"),note).state==="not-yet");
expect("330A in force 2026-05",TM.statusOn(art("330A"),D("2026-05-01"),note).state==="in-force");
console.log("368 points",TM.changePoints(art("368"),note).map(p=>p.iso+" "+p.labels.join("/")).join(" | "));
r=TM.renderAsOf(art("368").text,art("368").fn,D("1960-01-01"),"read",{note});console.log("--- 368 @1960\n"+show(r.text).slice(0,700));
// global coverage
let ex=0,gp=0,arts=0,artsExact=0;for(const a of d.articles){const r0=TM.renderAsOf(a.text,a.fn,D("1950-01-26"),"read",{note});ex+=r0.stats.exact;gp+=r0.stats.gaps;if(r0.stats.changes.length){arts++;if(!r0.stats.gaps)artsExact++}}
console.log("vs 1950: changes exact",ex,"gaps",gp,"articles changed",arts,"exactly reconstructable",artsExact);
// restored history (historical transcription) — only fills what the official footnotes do not record
require(P+"/data/history-fill.js");
const H=window.COI_HISTORY_FILL;
const noteF=TM.makeNoteParser({fnAmend:d.fnAmend,amendments:window.COI_AMENDMENTS,fills:H.fills});
const plainText=s=>s.replace(/[-]/g,"");
let rf=TM.renderAsOf(art("19").text,art("19").fn,D("1950-01-26"),"read",{note:noteF});
expect("19 in 1950 restores (f) right to property",/to acquire, hold and dispose of property/.test(plainText(rf.text)));
expect("19 in 1950 restores original cl. (2) (libel, slander)",/libel, slander, defamation/.test(plainText(rf.text)));
expect("19 in 1950 has no unrecorded gaps",rf.stats.gaps===0);
rf=TM.renderAsOf(art("19").text,art("19").fn,D("2020-01-01"),"read",{note:noteF});
expect("19 today has nothing restored",rf.stats.restored===0&&rf.stats.changes.length===0);
expect("Art 31 has dated historical versions",H.omitted["31"]&&H.omitted["31"].versions.length>=2&&H.omitted["31"].versions[0].from==="1950-01-26");
expect("Official quotes still win over restored text (Preamble 1950)",/SOVEREIGN DEMOCRATIC REPUBLIC/.test(plainText(TM.renderAsOf(d.preamble.text,d.preamble.fn,D("1950-01-26"),"read",{note:noteF}).text)));
// hand-checked historical wording (tools/history-overrides.json) and dated versions
const at=(id,dt)=>plainText(TM.renderAsOf(art(id).text,art(id).fn,D(dt),"read",{note:noteF}).text);
expect("101(3)(b) before 33rd lacks 'resignation is accepted'",/addressed to the Chairman or the Speaker, as the case may be,/.test(at("101","1974-01-01"))&&!/resignation is accepted/.test(at("101","1974-01-01")));
expect("105(3) in 1970 refers to the House of Commons",/House of Commons of the Parliament of the United Kingdom/.test(at("105","1970-01-01")));
expect("240(1) in 1960 has no Goa entry",!/Goa/.test(at("240","1960-01-01")));
expect("240(1) in 1970 lists Goa, Daman and Diu",/\(d\) Goa, Daman and Diu;/.test(at("240","1970-01-01")));
expect("240(1) in 1990 lists Daman and Diu separately",/\(d\) Daman and Diu;/.test(at("240","1990-01-01"))&&!/Goa/.test(at("240","1990-01-01")));
expect("240(1)(b) in 1970 is Laccadive, Minicoy and Amindivi",/Laccadive, Minicoy and Amindivi Islands/.test(at("240","1970-01-01")));
expect("356 Punjab proviso Dec 1990 says four years",/four years/.test(at("356","1990-12-01")));
expect("71 in 1960 has three clauses (no vacancy clause)",!/vacancy for whatever reason/.test(at("71","1960-01-01")));
expect("71 in 1965 has the 11th Amendment vacancy clause",/vacancy for whatever reason/.test(at("71","1965-01-01"))&&/decided by the Supreme Court/.test(at("71","1965-01-01")));
expect("71 in 1977 is the 39th Amendment version",/such authority or body/.test(at("71","1977-01-01")));
expect("371(1) in 1960 covers Andhra Pradesh or Punjab",/Andhra Pradesh or Punjab, provide for the constitution and functions of regional committees/.test(at("371","1960-01-01")));
expect("371(1) in 1970 covers Andhra Pradesh only",/State of Andhra Pradesh, provide for/.test(at("371","1970-01-01")));
expect("332(5) in 1960 has the Shillong exception",/cantonment and municipality of Shillong/.test(at("332","1960-01-01")));
let gapsAll=0;for(const a of d.articles){gapsAll+=TM.renderAsOf(a.text,a.fn,TM.ORIGIN,"read",{note:noteF}).stats.gaps}
expect("no unrecorded gaps remain against the 1950 text",gapsAll===0);
console.log(fails?fails+" FAILURES":"ALL PASS");
