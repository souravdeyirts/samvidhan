/* How other constitutions and political systems influenced the Constitution of India.
   Written for this app. The "borrowed features" list follows the conventional account taught in Indian civics,
   with notes on how India adapted each idea and where the conventional attribution is too neat. */
window.COI_INFLUENCES = {
  intro: "The framers studied the constitutions of some sixty countries. B.N. Rau, the Constitutional Adviser, travelled to the United States, Canada, Ireland and Britain in late 1947 to consult judges and scholars. But the Constitution is not a patchwork: Ambedkar told the Assembly that a constitution drafted so late in history could only improve on what was already known, adapting proven ideas to Indian conditions. The largest single source was India's own colonial statute, the Government of India Act, 1935.",

  sources: [
    { id: "gi1935", name: "Government of India Act, 1935", short: "GoI Act 1935", region: "British India", kind: "statute", weight: 5,
      context: "The largest single source, especially for the machinery of government. Introducing the Draft on 4 November 1948, Ambedkar said much of it was taken from the 1935 Act and made no apology for that: the administrative arrangements were already familiar and tested in India. What changed was who held power: an elected Indian government, not the British Crown.",
      features: [
        { f: "Federal scheme with three lists of subjects (Federal, Provincial, Concurrent)", how: "Kept the three-list structure, which the 1935 Act already used, but tilted it towards the Union", articles: ["246"] },
        { f: "Office of Governor", how: "The Governor now normally acts on the advice of elected ministers; the Act's wide personal discretion was largely removed", articles: ["153", "163"] },
        { f: "Federal Court", how: "Replaced by a Supreme Court with far wider powers, including enforcing Fundamental Rights", articles: ["124"] },
        { f: "Public Service Commissions", how: "Continued for the Union and the States", articles: ["315"] },
        { f: "Emergency powers, including the Governor's takeover of a province (Section 93)", how: "Became the President's Rule provision, later limited by the 44th Amendment and S.R. Bommai", articles: ["352", "356"] }
      ] },
    { id: "uk", name: "United Kingdom", short: "UK", region: "Westminster system", kind: "system", weight: 5,
      context: "India took the Westminster model of parliamentary government it had partly experienced under British rule: ministers drawn from and answerable to the legislature, with a formal head of state. The crucial difference: Britain has no written constitution and its Parliament is sovereign. India's Parliament is bound by a written Constitution, enforced by courts with the power of judicial review.",
      features: [
        { f: "Parliamentary government, with a nominal head and a real executive", how: "The head of state is an elected President, not a hereditary monarch", articles: ["74", "75"] },
        { f: "Cabinet system and collective responsibility to the lower House", how: "Written into the text, unlike British convention", articles: ["75"] },
        { f: "Rule of law and equality before the law", how: "Combined with the American guarantee of equal protection of the laws", articles: ["14"] },
        { f: "Single citizenship", how: "One citizenship for the whole country, unlike the American federal-and-state model", articles: ["5", "11"] },
        { f: "Legislative procedure and the office of Speaker", how: "Adapted, with India's own rules on Money Bills and joint sittings", articles: ["93", "107"] },
        { f: "Prerogative writs (habeas corpus, mandamus and others)", how: "Made available as of right: the remedy itself is a Fundamental Right", articles: ["32", "226"] },
        { f: "Parliamentary privileges", how: "First defined by reference to the House of Commons; the 44th Amendment (1978) removed that reference", articles: ["105"] },
        { f: "Bicameral Parliament", how: "The upper House represents the States, not hereditary peers", articles: ["79"] }
      ] },
    { id: "us", name: "United States", short: "USA", region: "Constitution of 1787 and Bill of Rights", kind: "constitution", weight: 4,
      context: "From the United States came the idea of a written constitution that is supreme law, guaranteed rights, and judges who can strike down laws. India deliberately did not take the presidential system, dual citizenship, or separate State constitutions. After advice from US Justice Felix Frankfurter, B.N. Rau also argued against a broad 'due process' clause, fearing it would let judges veto social and land reform.",
      features: [
        { f: "A Preamble declaring the people's authority", how: "“We, the people of India … give to ourselves this Constitution”", articles: ["Preamble"] },
        { f: "Fundamental Rights (the Bill of Rights)", how: "Written with express “reasonable restrictions” instead of absolute wording", articles: ["12", "13", "19"] },
        { f: "Equal protection of the laws (Fourteenth Amendment)", how: "Joined to the British idea of equality before the law", articles: ["14"] },
        { f: "Judicial review and an independent judiciary", how: "Courts can strike down laws, but at first without a 'due process' clause", articles: ["13", "32", "124"] },
        { f: "Impeachment of the President", how: "By two-thirds of the total membership of each House", articles: ["61"] },
        { f: "Removal of judges only for proved misbehaviour or incapacity", how: "By a special majority in each House of Parliament", articles: ["124", "217"] },
        { f: "Vice-President as ex officio chair of the upper House", how: "Mirrors the US Vice-President presiding over the Senate", articles: ["63", "64"] }
      ] },
    { id: "ireland", name: "Ireland", short: "Ireland", region: "Constitution of 1937", kind: "constitution", weight: 3,
      context: "Ireland's Directive Principles of Social Policy (Article 45) gave the framers a way to write social and economic goals into the Constitution without making them enforceable in court. This let the Assembly set ambitious aims (livelihood, education, health, equal pay) that a poor new state could not yet guarantee.",
      features: [
        { f: "Directive Principles of State Policy", how: "Non-justiciable but “fundamental in the governance of the country”", articles: ["36", "37", "38"] },
        { f: "Nominating distinguished persons to the upper House", how: "The President nominates 12 members with special knowledge of literature, science, art and social service; in Ireland the Taoiseach nominates 11 senators", articles: ["80"] },
        { f: "Electing the President by proportional representation (single transferable vote)", how: "India uses it in an indirect election by elected MPs and MLAs, not a popular vote as in Ireland", articles: ["55"] }
      ] },
    { id: "canada", name: "Canada", short: "Canada", region: "Constitution Act, 1867", kind: "constitution", weight: 3,
      context: "Canada showed how to build a federation with a strong centre, and Ambedkar cited it to show that a federation can still be called a 'Union'. India's federation was not formed by independent States agreeing to unite, which is why the Constitution calls India a 'Union of States' and gives no State a right to secede.",
      features: [
        { f: "A federation with a strong Centre: a “Union”", how: "Parliament can even form new States and alter their boundaries", articles: ["1", "3"] },
        { f: "Residuary powers with the Centre", how: "Any subject not listed belongs to Parliament", articles: ["248"] },
        { f: "Governors of the States appointed by the Centre", how: "The President appoints them; they hold office during the President's pleasure", articles: ["155", "156"] },
        { f: "Advisory jurisdiction of the Supreme Court", how: "The President may refer questions of law to the Supreme Court", articles: ["143"] }
      ] },
    { id: "australia", name: "Australia", short: "Australia", region: "Constitution of 1901", kind: "constitution", weight: 2,
      context: "Australia offered solutions for running a federation: shared subjects, free movement of goods across State borders, and a way to break deadlocks between the two Houses.",
      features: [
        { f: "A Concurrent List of shared subjects", how: "Usually credited to Australia, though the 1935 Act already had a concurrent list", articles: ["246"] },
        { f: "Freedom of trade, commerce and intercourse within the country", how: "Subject to reasonable restrictions that Parliament may impose", articles: ["301", "302"] },
        { f: "Joint sitting of the two Houses to resolve deadlock", how: "Called by the President; not available for Money Bills or constitutional amendments", articles: ["108"] }
      ] },
    { id: "japan", name: "Japan", short: "Japan", region: "Constitution of 1946", kind: "constitution", weight: 1,
      context: "Japan's post-war constitution (Article 31) supplied the phrase 'procedure established by law', chosen over the American 'due process of law'. The Supreme Court at first read it narrowly (A.K. Gopalan, 1950), then required the procedure to be fair, just and reasonable (Maneka Gandhi, 1978).",
      features: [
        { f: "“Procedure established by law” for depriving life or liberty", how: "Read by the Supreme Court since 1978 as requiring a fair procedure", articles: ["21"] }
      ] },
    { id: "weimar", name: "Weimar Germany", short: "Weimar", region: "Constitution of 1919", kind: "constitution", weight: 1,
      context: "Article 48 of the Weimar Constitution allowed rights to be suspended in an emergency, a power later abused in Germany. India adopted a similar power; after the 1975–77 Emergency, the 44th Amendment narrowed it and put the rights to life and liberty beyond suspension.",
      features: [
        { f: "Suspension of Fundamental Rights during an emergency", how: "Since 1978, Arts. 20 and 21 can never be suspended", articles: ["358", "359"] }
      ] },
    { id: "ussr", name: "Soviet Union", short: "USSR", region: "Constitution of 1936", kind: "constitution", weight: 2,
      context: "Socialist constitutions influenced the emphasis on social and economic justice, and the duties of citizens. Fundamental Duties were added in 1976 by the 42nd Amendment, on the Swaran Singh Committee's recommendation, and are not enforceable in court.",
      features: [
        { f: "Fundamental Duties of citizens", how: "Added in 1976; a moral guide, not legally enforceable", articles: ["51A"] },
        { f: "The ideal of justice — social, economic and political", how: "Placed in the Preamble alongside liberty and equality", articles: ["Preamble"] }
      ] },
    { id: "france", name: "France", short: "France", region: "1789 Declaration and the Republic", kind: "system", weight: 1,
      context: "The French Revolution's ideals and the idea of a republic, with no hereditary head of state, shaped the Preamble. Ambedkar argued that liberty, equality and fraternity had to be read together, not separately.",
      features: [
        { f: "Republic, and the ideals of liberty, equality and fraternity", how: "India added “assuring the dignity of the individual and the unity and integrity of the Nation” to fraternity", articles: ["Preamble"] }
      ] },
    { id: "southafrica", name: "South Africa", short: "S. Africa", region: "South Africa Act, 1909", kind: "statute", weight: 1,
      context: "Usually credited for the amendment procedure and the election of upper-House members by provincial legislatures. India's three-route amendment procedure, partly rigid and partly flexible, is largely its own design.",
      features: [
        { f: "Procedure for amending the Constitution", how: "India's mix of special majorities and State ratification for federal provisions", articles: ["368"] },
        { f: "Election of upper-House members by State legislatures", how: "Elected MLAs elect each State's members of the Rajya Sabha", articles: ["80"] }
      ] }
  ],

  // the political systems India weighed
  choices: [
    { title: "Parliamentary, not presidential", chose: "Westminster-style responsible government", over: "the American presidential system",
      text: "Ambedkar explained the choice on 4 November 1948: the American system gives more stability, the British more responsibility. The Draft preferred responsibility, with the government answerable to the legislature every day, not only at elections.", link: "#/origins#m-1948-11-04", linkText: "The debate" },
    { title: "A Union with a strong Centre", chose: "a federation with a unitary bias", over: "a compact of sovereign States",
      text: "India is a 'Union of States': no State can secede, Parliament can redraw States, and in emergencies the Union can take over State powers. Courts have since held that federalism is part of the basic structure.", link: "#/visual/union", linkText: "Visual guide" },
    { title: "Judicial review, without 'due process'", chose: "'procedure established by law'", over: "the American 'due process' clause",
      text: "The framers wanted courts to protect rights but not to block land and social reform. The Supreme Court later read fairness into Article 21 (Maneka Gandhi, 1978), bringing in much of what 'due process' would have done.", link: "#/case/maneka-gandhi", linkText: "Maneka Gandhi" },
    { title: "A republic with an elected, nominal head", chose: "an indirectly elected President who acts on ministers' advice", over: "a monarch, or an executive president",
      text: "The President is elected by the elected MPs and MLAs and must act on the Council of Ministers' advice (Art. 74), combining a republic with parliamentary government.", link: "#/article/74", linkText: "Art. 74" },
    { title: "One integrated system", chose: "single citizenship, one integrated judiciary and all-India services", over: "the American dual federal and State systems",
      text: "States do not have their own constitutions or separate court systems; the Supreme Court sits above every High Court, and the IAS and IPS serve both the Union and the States (Art. 312).", link: "#/article/312", linkText: "Art. 312" }
  ],

  // Indian roots
  roots: [
    { year: "1928", title: "Nehru Report", text: "Drafted by an all-parties committee chaired by Motilal Nehru. It proposed a list of fundamental rights and adult suffrage." },
    { year: "1931", title: "Karachi Resolution", text: "The Congress resolution on Fundamental Rights and Economic Policy paired civil liberties with social and economic goals: an early outline of Parts III and IV." },
    { year: "1945", title: "Sapru Committee", text: "Proposed dividing rights into those enforceable in court and those that are not: the split between Fundamental Rights and Directive Principles." },
    { year: "1946", title: "Objectives Resolution", text: "Moved by Nehru in the Constituent Assembly; its ideals became the Preamble.", link: "#/origins#m-1946-12-13" },
    { year: "—", title: "Gandhian ideas", text: "Village panchayats, cottage industries, prohibition and protection of cattle entered the Directive Principles (Arts. 40, 43, 47, 48)." },
    { year: "—", title: "The struggle against caste", text: "Abolishing untouchability (Art. 17) and reservations in education, jobs and legislatures (Arts. 15(4), 16(4), 330, 332) have no foreign model. They answer India's own history of caste discrimination, building on reserved seats that already existed under the 1935 Act and the 1932 Poona Pact." }
  ],

  // features India considered and left out
  notTaken: [
    { f: "A presidential system", why: "Chosen against for responsibility to the legislature" },
    { f: "Dual citizenship (national and State)", why: "One citizenship, to bind a diverse country together" },
    { f: "Separate State constitutions", why: "One Constitution for the Union and every State (Jammu and Kashmir had its own until 2019)" },
    { f: "A 'due process of law' clause", why: "Left out to protect land and social reform, though courts later read in fairness" },
    { f: "Referendums and recall", why: "No direct-democracy devices; change comes through Parliament and the States" },
    { f: "Parliamentary sovereignty", why: "Parliament is bound by the Constitution, and since 1973 by its basic structure" }
  ],

  note: "Lists of 'borrowed features' are a teaching device. Most provisions drew on several sources at once, and every borrowed idea was adapted to Indian conditions."
};
