// Socle commun aux environnements d'entreprise (type « entreprise »).
//
// Repris tel quel de LogiSim : couleurs, zones d'entrepôt, modes de livraison, générateur
// pseudo-aléatoire déterministe et construction du catalogue. Le déterminisme est essentiel —
// deux élèves de la même classe doivent voir exactement le même catalogue et les mêmes stocks
// de départ, sans quoi la correction commune n'a plus de sens.

export const COLORS={NR:['Noir','#1f2124'],BL:['Blanc','#f4f4f1'],GR:['Gris','#8b9098'],MA:['Bleu marine','#22406e'],RG:['Rouge','#c23a2f'],BE:['Beige','#d9c4a1'],VE:['Vert','#33704f'],RS:['Rose','#e8a9ba'],MR:['Marron','#6d4b30']};

export const ZONES={Running:'A',Lifestyle:'B',Skate:'C',Confort:'D',Bottes:'E',Ordinateurs:'F',Ecrans:'G',Peripheriques:'H',Reseau:'I',Impression:'J'};

export const SHIP={COL:['Colissimo Domicile',4.9],CHR:['Chronopost Express',9.9],REL:['Point Relais',3.9]};

export function pad(n, l) { return String(n).padStart(l, '0'); }

export function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// Déplie les modèles bruts en variantes (modèle × couleur × taille), avec emplacement
// d'entrepôt et stock de départ. `seed` fixe le tirage : ne jamais le changer sur un
// univers déjà utilisé en classe, tous les stocks bougeraient.
export function buildCatalog(rawModels,seed){
  var MODELS=[],MM={},VARIANTS=[],VM={},r=rng(seed),aisle={};
  rawModels.forEach(function(a){
    var z=ZONES[a[3]];aisle[z]=(aisle[z]||0)+1;
    var m={ref:a[0],brand:a[1],name:a[2],cat:a[3],price:a[4],cost:a[5],colors:a[6],s0:a[7][0],s1:a[7][1],sup:a[8],desc:a[9],min:4+Math.floor(r()*4),zone:z,aisle:aisle[z]};
    m.max=m.min+8; /* stock maximum (cible de réapprovisionnement) par référence : ne consomme pas de tirage aléatoire pour ne pas décaler les stocks déjà fixés */
    m.sizes=[];for(var s=m.s0;s<=m.s1;s++)m.sizes.push(s);
    m.loc={};m.colors.forEach(function(c,ci){m.loc[c]=z+'-'+pad(m.aisle,2)+'-'+(ci+1)});
    MODELS.push(m);MM[m.ref]=m;
    var mid=(m.s0+m.s1)/2;
    m.colors.forEach(function(c){
      m.sizes.forEach(function(s){
        var central=1-Math.min(1,Math.abs(s-mid)/6);
        var q=r()<0.1?0:Math.round((r()*18+2)*(0.5+central*0.8));
        var v={sku:m.ref+'-'+c+'-'+s,model:m,color:c,size:s,qty0:q,loc:m.loc[c]};
        VARIANTS.push(v);VM[v.sku]=v;
      });
    });
  });
  return {MODELS:MODELS,MM:MM,VARIANTS:VARIANTS,VM:VM};
}
