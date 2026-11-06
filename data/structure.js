/* Structure of the Constitution: Parts, Chapters and sub-headings.
   `from`/`to` are article ids; membership is resolved by the order of articles in COI_TEXT. */
window.COI_PARTS = [
  { id: "I", title: "The Union and its Territory", from: "1", to: "4",
    summary: "Declares that India, that is Bharat, is a Union of States and gives Parliament the power to admit, create, merge, split or rename States by ordinary law." },
  { id: "II", title: "Citizenship", from: "5", to: "11",
    summary: "Settles who became a citizen when the Constitution began in 1950 (including people affected by Partition) and leaves all later citizenship rules to Parliament." },
  { id: "III", title: "Fundamental Rights", from: "12", to: "35",
    summary: "The enforceable rights of the people against the State: equality, the six freedoms, life and personal liberty, protection against exploitation, freedom of religion, minority rights, and the right to go straight to the Supreme Court to enforce them.",
    chapters: [
      { title: "General", from: "12", to: "13" },
      { title: "Right to Equality", from: "14", to: "18" },
      { title: "Right to Freedom", from: "19", to: "22" },
      { title: "Right against Exploitation", from: "23", to: "24" },
      { title: "Right to Freedom of Religion", from: "25", to: "28" },
      { title: "Cultural and Educational Rights", from: "29", to: "31" },
      { title: "Saving of Certain Laws", from: "31A", to: "31D" },
      { title: "Right to Constitutional Remedies", from: "32", to: "35" }
    ] },
  { id: "IV", title: "Directive Principles of State Policy", from: "36", to: "51",
    summary: "Goals the State must keep in mind while governing — welfare, fair wages, health, education, a uniform civil code, environment, separation of judiciary and executive. They cannot be enforced in court but are 'fundamental in the governance of the country'." },
  { id: "IVA", title: "Fundamental Duties", from: "51A", to: "51A",
    summary: "Eleven duties of every citizen, added in 1976 — respecting the Constitution and national symbols, protecting the environment, developing scientific temper, and ensuring children get an education." },
  { id: "V", title: "The Union", from: "52", to: "151",
    summary: "The Union government: the President and Vice-President, the Prime Minister and Council of Ministers, Parliament and how it makes laws and passes budgets, the President's ordinance power, the Supreme Court, and the Comptroller and Auditor-General.",
    chapters: [
      { title: "Chapter I — The Executive", from: "52", to: "78" },
      { title: "Chapter II — Parliament", from: "79", to: "122" },
      { title: "Chapter III — Legislative Powers of the President", from: "123", to: "123" },
      { title: "Chapter IV — The Union Judiciary", from: "124", to: "147" },
      { title: "Chapter V — Comptroller and Auditor-General of India", from: "148", to: "151" }
    ] },
  { id: "VI", title: "The States", from: "152", to: "237",
    summary: "Mirrors Part V for the States: the Governor, Chief Minister and Council of Ministers, State Legislatures, the Governor's ordinance power, High Courts and subordinate courts.",
    chapters: [
      { title: "Chapter I — General", from: "152", to: "152" },
      { title: "Chapter II — The Executive", from: "153", to: "167" },
      { title: "Chapter III — The State Legislature", from: "168", to: "212" },
      { title: "Chapter IV — Legislative Power of the Governor", from: "213", to: "213" },
      { title: "Chapter V — The High Courts in the States", from: "214", to: "232" },
      { title: "Chapter VI — Subordinate Courts", from: "233", to: "237" }
    ] },
  { id: "VII", title: "The States in Part B of the First Schedule (Omitted)", from: "238", to: "238",
    summary: "Dealt with the former princely-state unions (Part B States). Omitted in 1956 when the Seventh Amendment abolished the A/B/C/D classification of States." },
  { id: "VIII", title: "The Union Territories", from: "239", to: "242",
    summary: "How Union Territories are governed — through an administrator appointed by the President — with special arrangements for Puducherry, Jammu & Kashmir (as a UT) and the National Capital Territory of Delhi." },
  { id: "IX", title: "The Panchayats", from: "243", to: "243O",
    summary: "Added by the 73rd Amendment (1992): a constitutional mandate for elected village, intermediate and district panchayats every five years, with reserved seats for SCs, STs and women, and State Election and Finance Commissions." },
  { id: "IXA", title: "The Municipalities", from: "243P", to: "243ZG",
    summary: "Added by the 74th Amendment (1992): elected urban local bodies — Nagar Panchayats, Municipal Councils and Municipal Corporations — with reservations, ward committees and district/metropolitan planning committees." },
  { id: "IXB", title: "The Co-operative Societies", from: "243ZH", to: "243ZT",
    summary: "Added by the 97th Amendment (2011) to govern co-operative societies. In 2021 the Supreme Court held this Part operative only for multi-State co-operative societies." },
  { id: "X", title: "The Scheduled and Tribal Areas", from: "244", to: "244A",
    summary: "Special administration of Scheduled Areas (Fifth Schedule) and tribal areas in Assam, Meghalaya, Tripura and Mizoram (Sixth Schedule) to protect tribal land, customs and self-government." },
  { id: "XI", title: "Relations between the Union and the States", from: "245", to: "263",
    summary: "The heart of Indian federalism: who can make laws on what (the Union, State and Concurrent Lists), what happens when laws conflict, how the Union may direct States, inter-State water disputes and inter-State councils.",
    chapters: [
      { title: "Chapter I — Legislative Relations", from: "245", to: "255" },
      { title: "Chapter II — Administrative Relations", from: "256", to: "263" }
    ] },
  { id: "XII", title: "Finance, Property, Contracts and Suits", from: "264", to: "300A",
    summary: "Taxation and revenue-sharing between the Union and States (including GST and the GST Council), the Finance Commission, the Consolidated and Contingency Funds, borrowing, government property and contracts, and the right to property.",
    chapters: [
      { title: "Chapter I — Finance", from: "264", to: "291" },
      { title: "Chapter II — Borrowing", from: "292", to: "293" },
      { title: "Chapter III — Property, Contracts, Rights, Liabilities, Obligations and Suits", from: "294", to: "300" },
      { title: "Chapter IV — Right to Property", from: "300A", to: "300A" }
    ] },
  { id: "XIII", title: "Trade, Commerce and Intercourse within the Territory of India", from: "301", to: "307",
    summary: "Makes India a single economic market: trade and commerce are free throughout the country, subject to reasonable restrictions in the public interest." },
  { id: "XIV", title: "Services under the Union and the States", from: "308", to: "323",
    summary: "The civil services: tenure at the pleasure of the President/Governor, protections against arbitrary dismissal, the All-India Services, and the Union and State Public Service Commissions.",
    chapters: [
      { title: "Chapter I — Services", from: "308", to: "314" },
      { title: "Chapter II — Public Service Commissions", from: "315", to: "323" }
    ] },
  { id: "XIVA", title: "Tribunals", from: "323A", to: "323B",
    summary: "Added in 1976: lets Parliament and States create tribunals for service matters, taxation, land reform, elections and similar subjects." },
  { id: "XV", title: "Elections", from: "324", to: "329A",
    summary: "An independent Election Commission superintends elections; one general electoral roll; universal adult suffrage; limited court interference in the middle of an election." },
  { id: "XVI", title: "Special Provisions relating to certain Classes", from: "330", to: "342A",
    summary: "Reservation of seats for SCs, STs and (from the 106th Amendment) women in legislatures, claims to public services, and the National Commissions for SCs, STs and Backward Classes." },
  { id: "XVII", title: "Official Language", from: "343", to: "351",
    summary: "Hindi in Devanagari script as the official language of the Union, with English continuing; regional languages; languages of the courts; and protections for linguistic minorities.",
    chapters: [
      { title: "Chapter I — Language of the Union", from: "343", to: "344" },
      { title: "Chapter II — Regional Languages", from: "345", to: "347" },
      { title: "Chapter III — Language of the Supreme Court, High Courts, etc.", from: "348", to: "349" },
      { title: "Chapter IV — Special Directives", from: "350", to: "351" }
    ] },
  { id: "XVIII", title: "Emergency Provisions", from: "352", to: "360",
    summary: "National Emergency (war, external aggression, armed rebellion), failure of constitutional machinery in a State (President's Rule) and Financial Emergency — with the safeguards added after the 1975–77 Emergency." },
  { id: "XIX", title: "Miscellaneous", from: "361", to: "367",
    summary: "Immunities of the President and Governors, protection for publishing parliamentary proceedings, disqualification of defectors from paid political posts, and key definitions." },
  { id: "XX", title: "Amendment of the Constitution", from: "368", to: "368",
    summary: "How the Constitution is amended — by special majority in Parliament, plus ratification by half the States for federal provisions. Limited by the judicially created 'basic structure' doctrine." },
  { id: "XXI", title: "Temporary, Transitional and Special Provisions", from: "369", to: "392",
    summary: "Article 370 (Jammu & Kashmir), and special provisions for many States under Articles 371 to 371J (Maharashtra, Gujarat, Nagaland, Assam, Manipur, Andhra Pradesh/Telangana, Sikkim, Mizoram, Arunachal Pradesh, Goa, Karnataka), plus transitional rules from 1950." },
  { id: "XXII", title: "Short Title, Commencement, Authoritative Text in Hindi and Repeals", from: "393", to: "395",
    summary: "Names the Constitution, sets its commencement (26 January 1950), provides for the authoritative Hindi text, and repeals the Government of India Act, 1935 and the Indian Independence Act, 1947." }
];

window.COI_SCHEDULES_META = {
  First: { title: "States and Union Territories", about: "Lists the States and Union Territories and their territories." },
  Second: { title: "Salaries and allowances", about: "Emoluments of the President, Governors, Speakers, Judges and the CAG." },
  Third: { title: "Forms of oaths and affirmations", about: "Oaths for ministers, legislators, judges, the CAG and election candidates." },
  Fourth: { title: "Allocation of seats in the Rajya Sabha", about: "How many Council of States seats each State and UT gets." },
  Fifth: { title: "Scheduled Areas and Scheduled Tribes", about: "Administration and control of Scheduled Areas; Tribes Advisory Councils." },
  Sixth: { title: "Tribal areas of Assam, Meghalaya, Tripura and Mizoram", about: "Autonomous District and Regional Councils with law-making powers." },
  Seventh: { title: "Union, State and Concurrent Lists", about: "The subjects on which the Union (List I), States (List II) or both (List III) may legislate." },
  Eighth: { title: "Languages", about: "The 22 languages recognised by the Constitution." },
  Ninth: { title: "Validation of certain Acts", about: "Laws shielded from challenge under Article 31B — though since I.R. Coelho (2007) entries after 24 April 1973 can be tested against the basic structure." },
  Tenth: { title: "Anti-defection", about: "Disqualification of legislators on grounds of defection (added 1985)." },
  Eleventh: { title: "Powers of Panchayats", about: "29 subjects that may be devolved to Panchayats (added 1992)." },
  Twelfth: { title: "Powers of Municipalities", about: "18 subjects that may be devolved to Municipalities (added 1992)." }
};
