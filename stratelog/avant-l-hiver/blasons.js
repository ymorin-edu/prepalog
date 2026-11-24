// Stratelog, Avant l'Hiver : les blasons des villes (22 figures, 8 couleurs de fond), validés par Tristan le 21/11/2026.
// Dessins originaux (SVG), dans l'esprit « medieval branding » ; source : /mnt/project-files/stratelog/blasons.html.
// Un blason se décrit par { fig: rang dans FIGURES, teinte: id de TEINTES } ; c'est ce qui est rangé dans la partie.

const ech = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const INK='#1c1a17';
const oeil=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r+1}" fill="${INK}"/><circle cx="${x}" cy="${y}" r="${r}" fill="#f4ece0"/><circle cx="${x+r*.25}" cy="${y+r*.1}" r="${r*.5}" fill="${INK}"/>`;
export const TEINTES=[
  {id:'gueules',nom:'Gueules (rouge)',c:'#9c3a3c'},
  {id:'azur',nom:'Azur (bleu)',c:'#3f4f9a'},
  {id:'sinople',nom:'Sinople (vert)',c:'#5c8a68'},
  {id:'sable',nom:'Sable (noir)',c:'#1f1c19'},
  {id:'pourpre',nom:'Pourpre',c:'#6d3c6a'},
  {id:'tenne',nom:'Tenné (orangé)',c:'#b1664a'},
  {id:'or',nom:'Or',c:'#da9c2f'},
  {id:'argent',nom:'Argent',c:'#eee6e1'},
];

// Contour d'encre : on trace la forme en trait épais, puis la même forme pleine par-dessus.
const sil=(d,f)=>`<path d="${d}" fill="${f}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
const trait=(d,w=1.6)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const barre=(d,w,f)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w+3.4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${f}" stroke-width="${w}" stroke-linecap="round"/>`;
const ronds=(cs,f)=>cs.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r+1.5}" fill="${INK}"/>`).join('')+cs.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`).join('');

export const FIGURES=[
  {nom:'La tour',sens:'Elle veille sur la ville',f:(F,B)=>
    sil('M30 50 V38 H36 V43 H41 V38 H47 V43 H53 V38 H59 V43 H64 V38 H70 V50 H66 V93 H34 V50 Z',F)+
    trait('M34 50 H66')+trait('M38 62 H44 M56 62 H62 M40 73 H47 M53 73 H60 M37 84 H43 M57 84 H63',1.2)+
    `<path d="M45 93 V82 a5 5 0 0 1 10 0 V93 Z" fill="${INK}"/><rect x="48" y="55" width="4" height="9" rx="2" fill="${INK}"/>`},
  {nom:'La gerbe',sens:'La moisson et le grenier',f:(F,B)=>{
    let g='';
    [-34,-17,0,17,34].forEach(a=>{ g+=`<g transform="rotate(${a} 50 78)">${barre('M50 78 L50 44',2.4,F)}${sil('M50 22 C56 28 56 40 50 46 C44 40 44 28 50 22 Z',F)}${trait('M50 27 V42 M46.5 32 L50 35 L53.5 32 M46.5 38 L50 41 L53.5 38',1.1)}</g>`; });
    [-14,-5,5,14].forEach(dx=>{ g+=barre(`M50 78 L${50+dx} 96`,2.2,F); });
    return g+sil('M42 72 H58 V80 H42 Z',F)+trait('M44 76 H56',1.1);}},
  {nom:'La clé',sens:'Celle des greniers',f:(F,B)=>
    `<circle cx="50" cy="37" r="9.5" fill="none" stroke="${INK}" stroke-width="10.5"/><circle cx="50" cy="37" r="9.5" fill="none" stroke="${F}" stroke-width="6.5"/>`+
    sil('M46.5 49 H53.5 V93 H46.5 Z',F)+sil('M53.5 70 H64 V76 H58 V79 H64 V86 H53.5 Z',F)+trait('M44 52 H56',1.4)},
  {nom:'La roue',sens:'Les charrettes du marché',f:(F,B)=>{
    let s=''; for(let i=0;i<8;i++){ const a=i*Math.PI/4; s+=barre(`M${50+6*Math.cos(a)} ${60+6*Math.sin(a)} L${50+20*Math.cos(a)} ${60+20*Math.sin(a)}`,3.2,F); }
    return `<path d="M50 34 a26 26 0 1 1 -0.01 0 Z M50 41 a19 19 0 1 0 0.01 0 Z" fill="${F}" fill-rule="evenodd" stroke="${INK}" stroke-width="3"/>`+s+ronds([[50,60,7]],F)+`<circle cx="50" cy="60" r="2.4" fill="${INK}"/>`;}},
  {nom:'Le moulin',sens:'Le grain devient farine',f:(F,B)=>{
    let a=''; [45,135,225,315].forEach(r=>{ a+=`<g transform="rotate(${r} 50 50)">${sil('M47 47 V20 H54 V47 Z',F)}${trait('M47 27 H54 M47 34 H54 M47 41 H54',1)}</g>`; });
    return sil('M41 93 L45 56 H55 L59 93 Z',F)+sil('M42 57 L50 45 L58 57 Z',F)+a+ronds([[50,50,3.5]],F)+`<path d="M47 93 V85 a3 3 0 0 1 6 0 V93 Z" fill="${INK}"/>`;}},
  {nom:'Les marteaux',sens:'Les bâtisseurs de la ville',f:(F,B)=>
    `<g transform="rotate(-38 50 62)">${sil('M47.5 40 H52.5 V96 H47.5 Z',F)}${sil('M38 30 H62 V42 H38 Z',F)}${trait('M44 30 V42 M56 30 V42',1)}</g>`+
    `<g transform="rotate(38 50 62)">${sil('M47.5 40 H52.5 V96 H47.5 Z',F)}${sil('M38 30 H62 V42 H38 Z',F)}${trait('M44 30 V42 M56 30 V42',1)}</g>`},
  {nom:'La couronne',sens:'Le seigneur et ses vassaux',f:(F,B)=>
    sil('M27 76 L29 46 L39 59 L50 40 L61 59 L71 46 L73 76 Z',F)+sil('M26 75 H74 V86 H26 Z',F)+
    ronds([[29,44,3.4],[50,37,3.8],[71,44,3.4]],F)+`<circle cx="38" cy="80.5" r="2.6" fill="${INK}"/><circle cx="50" cy="80.5" r="2.6" fill="${INK}"/><circle cx="62" cy="80.5" r="2.6" fill="${INK}"/>`},
  {nom:'Le soleil',sens:"L'été et les longues récoltes",f:(F,B)=>{
    let r=''; for(let i=0;i<12;i++){ r+=`<g transform="rotate(${i*30} 50 60)">${sil(i%2?'M47 41 L50 30 L53 41 Z':'M46 41 Q44 33 50 26 Q56 33 54 41 Z',F)}</g>`; }
    return r+sil('M50 43 a17 17 0 1 1 -0.01 0 Z',F)+oeil(44,57,3)+oeil(56,57,3)+trait('M43 65 Q50 71 57 65',1.6)+trait('M50 58 V63',1.2);}},
  {nom:'Le chêne',sens:'La forêt et le bois',f:(F,B)=>
    sil('M45 94 L47 70 L41 62 L46 63 L50 56 L54 63 L59 62 L53 70 L55 94 Z',F)+
    ronds([[50,40,13],[37,48,11],[63,48,11],[42,62,10],[58,62,10],[50,55,11],[34,60,7],[66,60,7]],F)+
    trait('M44 44 q3 -3 6 0 M54 50 q3 -3 6 0 M40 56 q3 -3 6 0 M51 62 q3 -3 6 0',1.1)},
  {nom:'Le poisson',sens:'La rivière et le quai',f:(F,B)=>
    sil('M24 60 Q42 38 64 56 L80 44 L76 60 L80 76 L64 64 Q42 82 24 60 Z',F)+
    oeil(34,57,3.6)+trait('M27 62 l3 -1 l2 2 l2 -2',1)+trait('M40 52 V68',1.4)+trait('M46 56 q3 4 0 8 M52 55 q3 5 0 10 M58 57 q2 3 0 6',1.1)+
    sil('M46 47 Q50 38 57 47 Z',F)},
  {nom:'Le corbeau',sens:'Il voit tout depuis le guet',f:(F,B)=>
    barre('M50 74 L49 90 M56 71 L57 90',2,F)+trait('M45 90 H53 M53 90 H61',1.6)+
    sil('M72 42 L84 46 L72 49 Z',F)+
    sil('M22 86 L34 70 Q32 58 43 52 Q53 46 62 48 Q61 40 68 39 Q75 39 74 47 Q73 60 63 68 Q53 76 41 75 L29 90 Z',F)+
    trait('M43 57 Q53 54 62 59 M41 63 Q51 62 58 66 M30 80 L37 73',1.2)+oeil(67.5,44,3.4)},
  {nom:'Le cerf',sens:'Le gibier des bois',f:(F,B)=>{
    const bois=(s)=>`<g transform="${s}">${barre('M46 52 C40 44 37 36 35 24',2.6,F)}${barre('M39 40 L29 36',2.2,F)}${barre('M36 31 L28 25',2,F)}${barre('M35.5 27 L39 19',2,F)}</g>`;
    return bois('')+bois('translate(100 0) scale(-1 1)')+
      `<g transform="rotate(-28 40 58)">${sil('M40 52 C33 53 29 58 31 60 C35 61 39 59 42 56 Z',F)}</g>`+
      `<g transform="rotate(28 60 58)">${sil('M60 52 C67 53 71 58 69 60 C65 61 61 59 58 56 Z',F)}</g>`+
      sil('M50 92 C45 92 42 84 41 74 C40 64 42 54 50 52 C58 54 60 64 59 74 C58 84 55 92 50 92 Z',F)+
      oeil(45,64,3)+oeil(55,64,3)+`<ellipse cx="50" cy="87" rx="4" ry="2.6" fill="${INK}"/>`+trait('M47 72 Q50 75 53 72',1);}},
  {log:1,nom:'Le tonneau',sens:'Vin, bière, salaisons : tout voyage en fût',f:(F,B)=>
    trait('M20 92 H82',1.6)+sil('M33 79 L29 92 H41 L39 82 Z',F)+sil('M61 82 L59 92 H71 L67 79 Z',F)+
    sil('M30 43 Q50 36 68 43 L68 81 Q50 88 30 81 Q25 62 30 43 Z',F)+
    trait('M32 52 Q50 47 67 52 M31 62 H67 M32 72 Q50 77 67 72',1)+
    trait('M38 41 Q34 62 38 84',3.4)+trait('M58 40 Q62 62 58 84',3.4)+
    `<ellipse cx="68" cy="62" rx="8" ry="19.5" fill="${F}" stroke="${INK}" stroke-width="3"/>`+
    trait('M64 47 Q66 62 64 77 M71 46 Q73 62 71 78',1)+`<ellipse cx="68" cy="62" rx="5.5" ry="15" fill="none" stroke="${INK}" stroke-width="1.2"/>`+
    sil('M72 64 H80 V68 H76 V72 H72 Z',F)+`<path d="M77.5 76 q-2.2 3.4 0 4.6 q2.2 -1.2 0 -4.6 Z" fill="#9fc4dc" stroke="${INK}" stroke-width="1"/>`+
    `<circle cx="49" cy="44" r="2.2" fill="${INK}"/>`},
  {log:1,nom:'La charrette',sens:'Le transport par la route',f:(F,B)=>{
    let r=''; for(let k=0;k<6;k++){const a=k*Math.PI/3; r+=barre(`M${40+3*Math.cos(a)} ${78+3*Math.sin(a)} L${40+10*Math.cos(a)} ${78+10*Math.sin(a)}`,2,F);}
    return sil('M31 40 h14 v18 h-14 Z',F)+trait('M31 45 h14 M31 53 h14',1.6)+sil('M49 40 h14 v18 h-14 Z',F)+trait('M49 45 h14 M49 53 h14',1.6)+
      barre('M70 66 L88 74',2.6,F)+sil('M24 58 H72 V68 H24 Z',F)+trait('M30 58 V68 M42 58 V68 M54 58 V68 M66 58 V68',1)+
      `<circle cx="40" cy="78" r="13" fill="none" stroke="${INK}" stroke-width="7"/><circle cx="40" cy="78" r="13" fill="none" stroke="${F}" stroke-width="3.6"/>`+r+ronds([[40,78,3.2]],F);}},
  {log:1,nom:'La balance',sens:'Peser, compter, contrôler',f:(F,B)=>
    barre('M50 32 V88',3,F)+sil('M40 88 H60 L64 95 H36 Z',F)+barre('M26 40 H74',3,F)+ronds([[50,31,4]],F)+
    trait('M27 41 L21 63 M27 41 L33 63 M73 41 L67 63 M73 41 L79 63',1.2)+
    sil('M18 63 H36 Q34 70 27 70 Q20 70 18 63 Z',F)+sil('M64 63 H82 Q80 70 73 70 Q66 70 64 63 Z',F)+
    sil('M22 62 Q21 54 25 52 L24 49 H30 L29 52 Q33 54 32 62 Z',F)+trait('M24.5 50.5 H29.5',1.2)},
  {log:1,nom:'Le sac de grain',sens:'La réserve pour passer l’hiver',f:(F,B)=>{
    const epi=(a)=>`<g transform="rotate(${a} 50 40)">${barre('M50 40 V26',1.6,F)}${sil('M50 12 C54 16 54 24 50 28 C46 24 46 16 50 12 Z',F)}${trait('M50 15 V26 M47.6 19 L50 21 L52.4 19 M47.6 23 L50 25 L52.4 23',.9)}</g>`;
    return epi(-24)+epi(0)+epi(24)+
      sil('M30 92 C23 80 25 61 36 53 C40 50 42 47 41 43 C38 41 37 37 40 35 C44 37 47 39 50 39 C53 39 56 37 60 35 C63 37 62 41 59 43 C58 47 60 50 64 53 C75 61 77 80 70 92 C60 96 40 96 30 92 Z',F)+
      trait('M40.5 43.5 Q50 47.5 59.5 43.5',3.4)+trait('M57 45 q4 4 2 9',1.6)+
      trait('M36 60 Q40 72 35 86 M64 60 Q60 72 65 86 M45 52 Q47 56 45 60 M55 52 Q53 56 55 60',1)+
      `<circle cx="50" cy="73" r="9" fill="none" stroke="${INK}" stroke-width="1.8"/>`+trait('M50 66 V80 M46.5 70 L50 73 L53.5 70 M46.5 75 L50 78 L53.5 75',1.2)+
      ronds([[74,91,1.8],[78,93,1.6],[76,88,1.4],[23,93,1.6]],F);}},
  {log:1,nom:'Le sablier',sens:'Les délais : chaque saison compte',f:(F,B)=>
    `<path d="M38 34 Q38 52 50 61 Q62 52 62 34 Z M38 88 Q38 70 50 61 Q62 70 62 88 Z" fill="#f4ece0" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`+
    `<path d="M42 46 Q45 53 50 58 Q55 53 58 46 Z M40 88 Q50 72 60 88 Z" fill="${F}"/>`+trait('M50 58 V80',1)+
    barre('M34 34 V88 M66 34 V88',2.6,F)+sil('M28 27 H72 V34 H28 Z',F)+sil('M28 88 H72 V95 H28 Z',F)},
  {log:1,nom:'Le pigeon voyageur',sens:'L’information qui précède la marchandise',f:(F,B)=>
    barre('M51 76 L50 89 M57 74 L58 89',1.8,F)+trait('M46 89 H54 M54 89 H62',1.6)+
    sil('M74 46 L82 48 L74 51 Z',F)+
    sil('M22 80 L35 69 Q32 55 47 50 Q57 47 63 50 Q62 42 68 41 Q76 41 75 49 Q77 62 67 71 Q55 80 41 77 L31 87 Z',F)+
    trait('M42 58 Q53 55 62 61 M40 64 Q50 63 58 68',1.2)+oeil(68,46,3.2)+
    sil('M53 79 h10 v6 h-10 Z',F)+trait('M55 79 v6 M61 79 v6',1)},
  {log:1,nom:'La nef',sens:'Le commerce par la mer',f:(F,B)=>
    barre('M50 72 V24',2.6,F)+sil('M33 30 Q50 34 67 30 Q70 46 67 62 Q50 58 33 62 Q30 46 33 30 Z',F)+trait('M50 33 V59 M36 46 H64',1.4)+
    sil('M50 22 L60 25 L50 28 Z',F)+
    sil('M20 70 H80 Q74 88 50 88 Q26 88 20 70 Z',F)+sil('M20 70 V63 H31 V70 Z',F)+sil('M69 70 V63 H80 V70 Z',F)+trait('M26 78 H74',1.1)+
    trait('M16 95 q5 -4 10 0 q5 -4 10 0 q5 -4 10 0 q5 -4 10 0 q5 -4 10 0 q5 -4 10 0 q5 -4 10 0',1.6)},
  {log:1,nom:'La grue',sens:'Lever et charger les caisses',f:(F,B)=>{
    let r=''; for(let k=0;k<8;k++){const a=k*Math.PI/4; r+=barre(`M${36+3*Math.cos(a)} ${74+3*Math.sin(a)} L${36+13*Math.cos(a)} ${74+13*Math.sin(a)}`,1.8,F);}
    return barre('M56 92 L60 34',3,F)+barre('M40 44 L82 30',3,F)+barre('M60 34 L56 92 M64 92 L60 34',2.4,F)+
      `<circle cx="36" cy="74" r="16" fill="none" stroke="${INK}" stroke-width="7"/><circle cx="36" cy="74" r="16" fill="none" stroke="${F}" stroke-width="3.6"/>`+r+ronds([[36,74,3]],F)+
      trait('M78 32 V60',1.4)+sil('M71 60 h14 v13 h-14 Z',F)+trait('M71 60 l14 13 M85 60 l-14 13',1.2);}},
  {log:1,nom:'Le coffre',sens:'La caisse de la ville',f:(F,B)=>
    ronds([[40,46,4],[49,43,4],[58,46,4],[45,40,3.5],[54,39,3.5]],F)+
    sil('M27 56 Q50 40 73 56 V60 H27 Z',F)+sil('M27 60 H73 V90 H27 Z',F)+
    trait('M35 52 V90 M65 52 V90',3.6)+sil('M45 62 H55 V73 H45 Z',F)+`<circle cx="50" cy="66.5" r="1.8" fill="${INK}"/>`+trait('M50 68 V71',1.4)},
  {log:1,nom:'Le pont',sens:'Le passage obligé des convois',f:(F,B)=>
    '<g transform="translate(50 74) scale(.8) translate(-50 -74)">'+sil('M14 62 H86 V92 H78 Q78 76 66 76 Q55 76 55 92 H45 Q45 76 34 76 Q22 76 22 92 H14 Z',F)+
    trait('M14 68 H86',1.4)+trait('M20 62 V58 M30 62 V58 M40 62 V58 M50 62 V58 M60 62 V58 M70 62 V58 M80 62 V58',2)+trait('M14 58 H86',1.6)+
    trait('M28 70 h6 M44 70 h6 M60 70 h6 M74 70 h6',1)+
    trait('M16 98 q5 -3 10 0 q5 -3 10 0 q5 -3 10 0 q5 -3 10 0 q5 -3 10 0 q5 -3 10 0 q5 -3 10 0',1.6)+'</g>'},
];

const ECU='M12 10 H88 V56 C88 86 70 104 50 113 C30 104 12 86 12 56 Z';
let nUid = 0;   // chaque dessin a ses propres filtres et masques : deux blasons d'une page ne se mélangent pas
export function dessinBlason(bl, nom){
  const i='b'+(nUid++); const fig=FIGURES[bl.fig]; const t=TEINTES.find(x=>x.id===bl.teinte);
  const F = t.id==='or' ? '#91333e' : t.id==='argent' ? '#3f4f9a' : '#e3a93a';
  const h = nom ? 140 : 118;
  return `<svg viewBox="0 0 100 ${h}" class="svgbl" role="img" aria-label="Blason : ${fig.nom}, fond ${t.nom}">
    <defs><filter id="trem${i}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${bl.fig+3}"/><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter>
      <linearGradient id="lum${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
      <clipPath id="cl${i}"><path d="${ECU}"/></clipPath></defs>
    <g filter="url(#trem${i})">
      <path d="${ECU}" fill="${t.c}"/>
      <g clip-path="url(#cl${i})" opacity=".13" stroke="${t.id==='sable'?'#fff':INK}" stroke-width=".55">${Array.from({length:30},(_,k)=>`<line x1="${k*4.2-20}" y1="${(k*37)%9}" x2="${k*4.2+14}" y2="${118-(k*53)%11}"/>`).join('')}</g>
      <path d="${ECU}" fill="url(#lum${i})"/>
      <g transform="translate(50 60) scale(.86) translate(-50 -60)">${fig.f(F,t.c)}</g>
      <path d="${ECU}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
    </g>
    ${nom?`<path d="M24 121 H74 l3 -.6 l-2 1.4" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/><text x="50" y="135" text-anchor="middle" font-family="UnifrakturMaguntia, serif" font-size="${nom.length>10?10.5:12}" fill="${INK}">· ${ech(nom.toLowerCase())} ·</text>`:''}
  </svg>`;
}
export const petitBlason=(v,taille=34)=>v&&v.blason?`<span class="mini" style="width:${taille}px">${dessinBlason(v.blason)}</span>`:'';
