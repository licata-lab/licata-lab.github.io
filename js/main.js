/* ========================================================= */
const NS="http://www.w3.org/2000/svg";
const $=id=>document.getElementById(id);
const svg=$("net"), gBg=$("bg"), gMainE=$("mainedges"), gCl=$("clusters"), home=$("home"), page=$("page"), gHub=$("hub");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const noHover=matchMedia("(hover: none)").matches;
if(noHover) $("hint").textContent="Tap a node to reveal its neighbours, tap again to open it. Drag to move it.";
const el=(t,a={})=>{ const e=document.createElementNS(NS,t); for(const k in a) e.setAttribute(k,a[k]); return e; };
let W=0,H=0,S=1,small=false,lastPointer="mouse";
addEventListener("pointerdown",e=>lastPointer=e.pointerType,true);

/* ---- central node ---- */
const hub={};
hub.halo=el("circle",{class:"halo"}); hub.core=el("circle");
hub.t1=el("text"); hub.t1.textContent="LICATA"; hub.t2=el("text"); hub.t2.textContent="GROUP";
gHub.append(hub.halo,hub.core,hub.t1,hub.t2);

/* ---- build clusters (one per section) ---- */
const clusters=SECTIONS.map((s,si)=>{
  const c={sec:s, open:false, openChild:null, timer:null, all:[]};
  c.g=el("g",{class:"cluster"}); c.gE=el("g"); c.gN=el("g"); c.g.append(c.gE,c.gN); gCl.append(c.g);
  c.g.style.setProperty("--accent",`var(${s.color})`);
  const make=(d,parent,depth)=>{
    const n={label:d.label, href:d.href, parent, depth, c};
    n.el=el("g",{class:`node d${depth}`+(d.href?" link":""),role:d.href?"link":"button",tabindex:depth?-1:0,
      "aria-label": depth===0 ? `${d.label}: hover to explore, click to open` : d.label});
    n.hitc=el("circle",{class:"hitc"}); n.core=el("circle",{class:"core"});
    n.core.style.fill = depth===1 ? "#fff" : `var(${s.color})`;
    if(depth===1) n.core.style.stroke=`var(${s.color})`;
    n.text=el("text"); n.text.textContent=d.label;
    n.el.append(n.hitc,n.core,n.text);
    if(parent){
      n.edge=el("line",{class:"cedge",style:`stroke:var(${s.color})`});
      n.hit=el("line",{class:"hit"});
      c.gE.append(n.edge,n.hit);
      n.hit.addEventListener("pointerenter",()=>enter(c,null));
    }
    c.all.push(n);
    n.kids=(d.kids||[]).map(k=>make(k,n,depth+1));
    c.gN.append(n.el);                                    // parents end up above their kids
    n.el.addEventListener("pointerenter",()=>enter(c,n));
    n.el.addEventListener("focus",()=>enter(c,n));
    n.el.addEventListener("click",ev=>{ ev.stopPropagation(); if(!suppress) activate(n); });
    n.el.addEventListener("pointerdown",ev=>startDrag(ev,n));
    n.el.addEventListener("keydown",ev=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); activate(n,true); }});
    return n;
  };
  c.main=make(s,null,0);
  c.g.addEventListener("pointerleave",()=>leave(c));
  c.g.addEventListener("focusout",ev=>{ if(!c.g.contains(ev.relatedTarget)) leave(c); });
  c.g.addEventListener("pointerenter",()=>clearTimeout(c.timer));
  return c;
});
const byId=Object.fromEntries(clusters.map(c=>[c.sec.id,c]));

/* ---- hover logic: main → first neighbours → their neighbours ---- */
function enter(c,n){
  clearTimeout(c.timer);
  clusters.forEach(o=>{ if(o!==c && (o.open||o.openChild)){ o.open=false; o.openChild=null; paint(o); } });
  if(n){
    if(n.depth===0){ c.open=true; c.openChild=null; }
    else if(n.depth===1){ c.open=true; c.openChild=n.kids.length?n:null; }
  }
  // bring the explored cluster to the front, but only if it isn't already: moving it in the DOM
  // between mousedown and mouseup (the focus event fires on mousedown) cancels the click
  if(gCl.lastElementChild!==c.g) gCl.append(c.g);
  paint(c); exploring();
}
function leave(c){ if(drag&&drag.moved) return; clearTimeout(c.timer); c.timer=setTimeout(()=>{ c.open=false; c.openChild=null; paint(c); exploring(); }, 320); }
function collapseAll(){ clusters.forEach(c=>{ c.open=false; c.openChild=null; paint(c); }); exploring(); }
function exploring(){
  const any=clusters.find(c=>c.open);
  home.classList.toggle("exploring",!!any);
  clusters.forEach(c=>c.g.classList.toggle("dim",!!any && c!==any));
}
function visible(n){ return n.depth===0 || (n.depth===1 && n.c.open) || (n.depth===2 && n.c.open && n.c.openChild===n.parent); }
function paint(c){
  c.all.forEach(n=>{
    const v=visible(n);
    n.el.classList.toggle("shown",v);
    n.el.setAttribute("tabindex", v ? 0 : -1);
    const p=n.parent||n;
    n.el.style.transform = v ? `translate(${n.x}px,${n.y}px)` : `translate(${p.x}px,${p.y}px) scale(.2)`;
    if(n.edge){ n.edge.classList.toggle("shown",v); n.hit.classList.toggle("shown",v); }
  });
}
function activate(n,keyboard){
  const c=n.c;
  const touch=lastPointer==="touch" && !keyboard;
  if(n.depth===0 && touch && !c.open){ enter(c,n); return; }
  if(n.depth===1 && n.kids.length && (touch||keyboard) && c.openChild!==n){ enter(c,n); return; }
  if(n.href){ if(/^https?:/.test(n.href)) window.open(n.href,"_blank","noopener"); else location.href=n.href; return; }
  go(c.sec.id,n);
}
svg.addEventListener("click",()=>{ if(!suppress) collapseAll(); });

/* ---- layout: central node, two loose columns, fans opening away from the centre ---- */
function rand(seed){ return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function layout(){
  const b=svg.getBoundingClientRect(); W=b.width; H=b.height; if(!W||!H) return;
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
  small=W<720;
  const cx=W/2, cy=H/2;
  // everything scales with the viewport, so the network fills big screens too
  S = small ? 1 : Math.max(.8, Math.min(1.35, Math.min(W/1300, H/760)));
  const colX = small ? W*.29 : Math.min(W*.27, 560);
  const rowY = small ? H*.31 : Math.min(H*.31, 330);
  const R0=(small?30:42)*S, R1=(small?9:12)*S, R2=(small?6:7)*S;
  const HR = small ? Math.min(54, W*.14) : 84*S;
  hub.x=cx; hub.y=cy; hub.r=HR;
  hub.core.setAttribute("r",HR); hub.halo.setAttribute("r",HR+9);
  const fs = small?13:Math.round(19*S);
  [hub.t1,hub.t2].forEach((t,i)=>{ t.setAttribute("font-size",fs); t.setAttribute("y", i ? fs*1.05 : -fs*.2); t.setAttribute("x", fs*.07); });
  // organic, slightly asymmetric placement of the main nodes around the centre.
  // Each value is [x, y] as a fraction of the available half-width / half-height (−1 … 1).
  // A section in content.js can override its own spot with  pos:[x, y]
  const DEFAULT_POS={ research:[-.20,-.86], resources:[.55,-.96], news:[.96,-.05],
                      contact:[.30,.86], publications:[-.90,.96], people:[-.80,-.10] };
  // on phones the screen is narrow: spread the nodes more sideways so labels don't touch
  const SMALL_POS={ research:[-.55,-.88], resources:[.60,-.98], news:[.88,-.02],
                    contact:[.50,.90], publications:[-.62,.98], people:[-.85,-.12] };
  const ring=i=>{ const a=i/clusters.length*2*Math.PI-Math.PI/2; return [Math.cos(a)*.9, Math.sin(a)*.9]; };
  const ex = small ? W/2-R0-14 : Math.min(W/2-R0-150, 600);
  const ey = small ? H/2-R0-104 : Math.min(H/2-R0-50, 360);   // phones: leave room for the hint at the bottom
  clusters.forEach((c,i)=>{
    const m=c.main, [fx,fy]=c.sec.pos||(small?SMALL_POS:DEFAULT_POS)[c.sec.id]||ring(i);
    m.x = cx + fx*ex;
    m.y = cy + fy*ey;
    // fan direction: away from the central node, flattened on desktop so it doesn't run into the next row
    const base = Math.atan2((m.y-cy)*(small?1:.25), (m.x-cx));
    const place=(n,ang,dist,R)=>{
      n.x=Math.max(R+6,Math.min(W-R-6,n.parent.x+Math.cos(ang)*dist));
      n.y=Math.max(R+6,Math.min(H-R-6,n.parent.y+Math.sin(ang)*dist));
      n.ang=ang;
    };
    m.r=R0; m.ang=base;
    // first neighbours all around the main node, evenly spaced, with the gap facing the centre
    // so no arc points back at the hub; arc lengths vary a little for an organic look
    const room=Math.min(m.x, W-m.x, m.y, H-m.y) - R0;
    const D1 = small ? 62 : Math.max(104*S, Math.min(132*S, room*.9));
    const D2 = small ? 64 : Math.max(104*S, Math.min(140*S, room*.9));
    c.D1=D1; c.D2=D2;
    const JIT=[1, 1.2, .88, 1.12, .94, 1.07];             // deterministic "a bit different" lengths
    const hubAng=Math.atan2(cy-m.y, cx-m.x), n1=m.kids.length, step=2*Math.PI/Math.max(1,n1);
    // rotate the whole star so that no arc points at the hub nor straight down onto the node's own label
    const adiff=(x,y)=>{ const d=Math.abs(((x-y)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI); return d; };
    let rot=0, best=-1;
    for(let s=0;s<36;s++){ const o=s/36*step;
      const sc=Math.min(...m.kids.map((_,j)=>{ const a=hubAng+o+j*step; return Math.min(adiff(a,hubAng), adiff(a,Math.PI/2)*1.15); }));
      if(sc>best){ best=sc; rot=o; } }
    m.kids.forEach((k,j)=>{
      const a=hubAng+rot+j*step;
      // an arc that points down crosses the node's own label: make it longer so it clears it
      k.rest=D1*JIT[j%JIT.length]*(adiff(a,Math.PI/2)<.6 ? 1.3 : 1); place(k,a,k.rest,R1); k.r=R1;
      // second neighbours fan outwards, continuing the direction of their parent
      k.kids.forEach((g,q)=>{ g.rest=D2*JIT[(j+q+2)%JIT.length];
        place(g,a+(q-(k.kids.length-1)/2)*.55,g.rest,R2); g.r=R2; });
    });
    c.all.forEach(n=>{ n.core.setAttribute("r",n.r); n.hitc.setAttribute("r",n.r+14); });
  });
  clusters.forEach(c=>relax(c));                          // untangle every fan before showing it
  clusters.forEach(geom);
  gMainE.textContent="";
  clusters.forEach(c=>{ c.spoke=el("line",{class:"spoke"}); gMainE.append(c.spoke); });
  spokes();
  background();
}
function spokes(){
  gHub.setAttribute("transform",`translate(${hub.x},${hub.y})`);
  clusters.forEach(c=>{ const L=c.spoke; L.setAttribute("x1",hub.x); L.setAttribute("y1",hub.y); L.setAttribute("x2",c.main.x); L.setAttribute("y2",c.main.y);
    (c.ties||[]).forEach(T=>{ T.setAttribute("x1",c.main.x); T.setAttribute("y1",c.main.y); }); });
}
/* labels, arcs and positions of one cluster */
function geom(c){
    c.all.forEach(n=>{
      if(n.parent) n.ang=Math.atan2(n.y-n.parent.y, n.x-n.parent.x);
      if(n.depth===0){ n.text.setAttribute("x",0); n.text.setAttribute("y",n.r+24); n.text.setAttribute("font-size",Math.round(16*Math.min(1.2,S))); }
      else {
        const cs=Math.cos(n.ang), sn=Math.sin(n.ang);
        if(Math.abs(cs)>.35){ n.text.setAttribute("text-anchor",cs>0?"start":"end"); n.text.setAttribute("x",(cs>0?1:-1)*(n.r+8)); n.text.setAttribute("y",5); }
        else { n.text.setAttribute("text-anchor","middle"); n.text.setAttribute("x",0); n.text.setAttribute("y",sn>0?n.r+18:-n.r-10); }
      }
      if(n.edge){ for(const L of [n.edge,n.hit]){ L.setAttribute("x1",n.parent.x); L.setAttribute("y1",n.parent.y); L.setAttribute("x2",n.x); L.setAttribute("y2",n.y); } }
    });
    paint(c);
}


/* ---- collision solver: keeps neighbours (and their labels) apart and on screen ----
   Every kid and grandkid of a cluster is solved together, as if all were open at once,
   so whatever subset is shown on hover never overlaps. */
function labelW(n){ try{ return n.text.getComputedTextLength(); }catch(e){ return n.label.length*7.5; } }
function relax(c){
  // stage 1: first neighbours only. stage 2: each kid's own neighbours, with all first neighbours fixed.
  // Grandkids of different kids are never on screen together, so they don't need to avoid each other.
  solve(c, c.main.kids, []);
  c.main.kids.forEach(k=>{ if(k.kids.length) solve(c, k.kids, c.main.kids); });
}
function solve(c, mov, pinned){
  if(!mov.length) return;
  const fixed=[...clusters.map(o=>o.main), hub, ...pinned];
  const PAD=small?14:20;
  const rest=n=> n.rest || (n.depth===1 ? c.D1 : c.D2);
  const box=n=>{ const ang=Math.atan2(n.y-n.parent.y, n.x-n.parent.x), cs=Math.cos(ang), sn=Math.sin(ang), lw=labelW(n), h=Math.max(n.r,10)+4;
    if(Math.abs(cs)>.35) return cs>0 ? [n.x-n.r-4, n.x+n.r+12+lw, n.y-h, n.y+h] : [n.x-n.r-12-lw, n.x+n.r+4, n.y-h, n.y+h];
    const hw=Math.max(lw/2,n.r)+4;
    return sn>0 ? [n.x-hw, n.x+hw, n.y-n.r-4, n.y+n.r+24] : [n.x-hw, n.x+hw, n.y-n.r-26, n.y+n.r+4]; };
  const fixedBoxes=[...clusters.map(o=>{ const m=o.main, hw=Math.max(m.r,labelW(m)/2)+6; return [m.x-hw, m.x+hw, m.y-m.r-6, m.y+m.r+34]; }),
                    ...pinned.map(box)];
  const overlap=(A,B)=>[Math.min(A[1],B[1])-Math.max(A[0],B[0]), Math.min(A[3],B[3])-Math.max(A[2],B[2])];
  for(let it=0; it<160; it++){
    // 1) springs towards the rest length from the parent
    mov.forEach(n=>{ const p=n.parent, dx=n.x-p.x, dy=n.y-p.y, d=Math.hypot(dx,dy)||1, k=(rest(n)-d)/d*.25; n.x+=dx*k; n.y+=dy*k; });
    // 2) circles apart
    for(let i=0;i<mov.length;i++){ const a=mov[i];
      for(let j=i+1;j<mov.length;j++){ const b=mov[j];
        const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||.01, min=a.r+b.r+PAD+14;
        if(d<min){ const s=(min-d)/d*.5; a.x-=dx*s; a.y-=dy*s; b.x+=dx*s; b.y+=dy*s; } }
      fixed.forEach(f=>{ if(f===a.parent) return;
        const dx=a.x-f.x, dy=a.y-f.y, d=Math.hypot(dx,dy)||.01, min=f.r+a.r+PAD+22;
        if(d<min){ const s=(min-d)/d; a.x+=dx*s; a.y+=dy*s; } });
    }
    // 3) labels apart (from each other, from main nodes, from pinned kids' labels)
    for(let i=0;i<mov.length;i++){ const a=mov[i], A=box(a);
      for(let j=i+1;j<mov.length;j++){ const b=mov[j], [ox,oy]=overlap(A,box(b));
        if(ox>0&&oy>0){ if(oy<ox){ const s=(oy/2+1)*Math.sign(b.y-a.y||1); a.y-=s; b.y+=s; } else { const s=(ox/2+1)*Math.sign(b.x-a.x||1); a.x-=s; b.x+=s; } } }
      fixedBoxes.forEach(F=>{ const [ox,oy]=overlap(A,F);
        if(ox>0&&oy>0){ if(oy<ox) a.y+=(oy+1)*Math.sign(a.y-(F[2]+F[3])/2||1); else a.x+=(ox+1)*Math.sign(a.x-(F[0]+F[1])/2||1); } });
    }
    // 4) on screen, label included
    mov.forEach(n=>{
      const ang=Math.atan2(n.y-n.parent.y, n.x-n.parent.x), cs=Math.cos(ang), lw=labelW(n);
      let x0=n.r+6, x1=W-n.r-6;
      if(Math.abs(cs)>.35){ if(cs>0) x1=W-n.r-14-lw; else x0=n.r+14+lw; } else { x0=Math.max(x0,lw/2+6); x1=Math.min(x1,W-lw/2-6); }
      n.x=Math.max(x0,Math.min(x1,n.x)); n.y=Math.max(n.r+20,Math.min(H-n.r-34,n.y));
    });
  }
}

/* ---- static "interactome" texture that fills the empty space ---- */
function background(){
  gBg.textContent="";
  const r=rand(11);
  const N=Math.round(Math.max(40,Math.min(160,W*H/7500))), pts=[];
  for(let t=0;pts.length<N && t<N*30;t++){
    const p={x:r()*W,y:r()*H};
    if(Math.hypot(p.x-hub.x,p.y-hub.y)<hub.r+40) continue;
    if(clusters.some(c=>Math.hypot(p.x-c.main.x,p.y-c.main.y)<c.main.r+34)) continue;
    if(pts.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<28)) continue;
    pts.push(p);
  }
  const seen=new Set();
  pts.forEach((p,i)=>{
    pts.map((q,j)=>[j,Math.hypot(p.x-q.x,p.y-q.y)]).filter(([j,d])=>j!==i&&d<120).sort((a,b)=>a[1]-b[1]).slice(0,2)
      .forEach(([j])=>{ const k=i<j?i+"-"+j:j+"-"+i; if(seen.has(k)) return; seen.add(k);
        gBg.append(el("line",{x1:p.x,y1:p.y,x2:pts[j].x,y2:pts[j].y})); });
  });
  clusters.forEach(c=>{ c.ties=[]; pts.map(q=>[q,Math.hypot(q.x-c.main.x,q.y-c.main.y)]).sort((a,b)=>a[1]-b[1]).slice(0,3)
    .forEach(([q])=>{ const L=el("line",{class:"tie",x1:c.main.x,y1:c.main.y,x2:q.x,y2:q.y}); c.ties.push(L); gBg.append(L); }); });
  pts.forEach(p=>gBg.append(el("circle",{cx:p.x,cy:p.y,r:(1.6+r()*2.4).toFixed(1)})));
}


/* ---- drag & drop: grab any node (or the centre) and move it; kids follow their parent ---- */
let drag=null, suppress=false;
function startDrag(ev,t){ if(ev.button!==0) return; drag={t,x0:ev.clientX,y0:ev.clientY,lx:ev.clientX,ly:ev.clientY,moved:false,id:ev.pointerId}; }
function shift(n,dx,dy){ n.x+=dx; n.y+=dy; (n.kids||[]).forEach(k=>shift(k,dx,dy)); }
addEventListener("pointermove",ev=>{
  if(!drag||ev.pointerId!==drag.id) return;
  if(!drag.moved){ if(Math.hypot(ev.clientX-drag.x0,ev.clientY-drag.y0)<6) return; drag.moved=true; svg.classList.add("dragging"); }
  const t=drag.t, r=t.r||20;
  const dx=Math.max(r-t.x, Math.min(W-r-t.x, ev.clientX-drag.lx)), dy=Math.max(r-t.y, Math.min(H-r-t.y, ev.clientY-drag.ly));
  drag.lx=ev.clientX; drag.ly=ev.clientY;
  if(t===hub){ hub.x+=dx; hub.y+=dy; spokes(); return; }
  shift(t,dx,dy); geom(t.c); if(t.depth===0) spokes();
});
function endDrag(ev){
  if(!drag||ev.pointerId!==drag.id) return;
  const d=drag; drag=null;
  if(!d.moved) return;
  svg.classList.remove("dragging");
  suppress=true; setTimeout(()=>suppress=false,0);       // the click that follows a drag must not open the page
  if(d.t!==hub){ const c=d.t.c; if(d.t.depth===0) relax(c); geom(c); if(!c.g.matches(":hover")) leave(c); }
}
addEventListener("pointerup",endDrag); addEventListener("pointercancel",endDrag);
gHub.addEventListener("pointerdown",ev=>startDrag(ev,hub));
/* ---- dropdown menu ---- */
const btn=$("menubtn"), list=$("menulist");
list.innerHTML=`<li><a href="#" data-sec="">Home</a></li><li class="sep" role="separator"></li>`+
  SECTIONS.map(s=>`<li><a href="#${s.id}" data-sec="${s.id}">${s.label}</a></li>`).join("");
function setMenu(open){ list.classList.toggle("open",open); btn.setAttribute("aria-expanded",open); if(open) list.querySelector("a").focus(); }
btn.onclick=()=>setMenu(!list.classList.contains("open"));
list.addEventListener("click",ev=>{ const a=ev.target.closest("a"); if(!a) return; ev.preventDefault(); setMenu(false); go(a.dataset.sec||null); });
document.addEventListener("click",ev=>{ if(!ev.target.closest(".menu")) setMenu(false); });
list.addEventListener("keydown",ev=>{
  const items=[...list.querySelectorAll("a")], i=items.indexOf(document.activeElement);
  if(ev.key==="ArrowDown"){ ev.preventDefault(); items[(i+1)%items.length].focus(); }
  if(ev.key==="ArrowUp"){ ev.preventDefault(); items[(i-1+items.length)%items.length].focus(); }
});
function markMenu(id){ list.querySelectorAll("a").forEach(a=>{ if((a.dataset.sec||null)===id) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); }); }


/* ---- page decoration: the same kind of network as the home background, kept clear of the text ---- */
function scatter(svgEl, box, seed, maxN){
  svgEl.textContent="";
  const b=svgEl.getBoundingClientRect(), W=b.width, H=b.height; if(!W||!H) return;
  svgEl.setAttribute("viewBox",`0 0 ${W} ${H}`);
  const ex={x0:box.left-b.left-36, x1:box.right-b.left+36, y0:box.top-b.top-24, y1:box.bottom-b.top+24};
  const r=rand(seed), N=Math.round(Math.max(18,Math.min(maxN,W*H/7000))), pts=[];
  for(let t=0;pts.length<N && t<N*40;t++){
    const p={x:r()*W,y:r()*H};
    if(p.x>ex.x0&&p.x<ex.x1&&p.y>ex.y0&&p.y<ex.y1) continue;      // keep the text area clean
    if(pts.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<28)) continue;
    pts.push(p);
  }
  const seen=new Set();
  pts.forEach((p,i)=>{
    pts.map((q,j)=>[j,Math.hypot(p.x-q.x,p.y-q.y)]).filter(([j,d])=>j!==i&&d<120).sort((a,c)=>a[1]-c[1]).slice(0,2)
      .forEach(([j])=>{ const q=pts[j];
        const mx=(p.x+q.x)/2, my=(p.y+q.y)/2;                    // no edge may cut across the text
        if(mx>ex.x0&&mx<ex.x1&&my>ex.y0&&my<ex.y1) return;
        const k=i<j?i+"-"+j:j+"-"+i; if(seen.has(k)) return; seen.add(k);
        svgEl.append(el("line",{x1:p.x,y1:p.y,x2:q.x,y2:q.y})); });
  });
  pts.forEach(p=>svgEl.append(el("circle",{cx:p.x,cy:p.y,r:(1.6+r()*2.6).toFixed(1)})));
}
function decorate(id){
  const seed=[...id].reduce((a,ch)=>a*31+ch.charCodeAt(0),7);   // every page gets its own, stable pattern
  // hero: union of back button, title and lead
  const parts=[$("back"),$("ptitle"),$("plead")].map(e=>e.getBoundingClientRect()).filter(r=>r.width);
  const hb={left:Math.min(...parts.map(r=>r.left)),right:Math.max(...parts.map(r=>r.right)),
            top:Math.min(...parts.map(r=>r.top)),bottom:Math.max(...parts.map(r=>r.bottom))};
  scatter($("decoHero"), hb, seed, 120);
  scatter($("decoSheet"), $("content").getBoundingClientRect(), seed+1, 260);
}
/* ---- pages: the clicked node swells, then its colour floods the screen ---- */
let current=null, ptimer=null, origin=null;
function setOrigin(n){
  const b=n?n.core.getBoundingClientRect():null;
  const o=b?{x:b.left+b.width/2,y:b.top+b.height/2,r:b.width/2}:{x:innerWidth/2,y:innerHeight/2,r:0};
  page.style.setProperty("--cx",o.x+"px"); page.style.setProperty("--cy",o.y+"px"); page.style.setProperty("--r0",o.r+"px");
}
function fill(s){
  $("ptitle").textContent=s.label; $("plead").textContent=s.lead||""; $("content").innerHTML=s.html;
  page.style.setProperty("--accent",`var(${s.color})`); document.title=s.label+" — Licata Group"; markMenu(s.id);
  requestAnimationFrame(()=>decorate(s.id));
}
function openPage(s,n,animate){
  clearTimeout(ptimer); fill(s);
  if(current){ page.scrollTop=0; current=s.id; return; }
  current=s.id; page.setAttribute("aria-hidden","false"); home.setAttribute("aria-hidden","true");
  n=n||byId[s.id].main;
  if(!animate||reduce){
    setOrigin(n); page.classList.add("instant","open"); page.scrollTop=0;
    requestAnimationFrame(()=>page.classList.remove("instant")); $("back").focus({preventScroll:true}); return;
  }
  svg.classList.add("picking"); n.c.g.classList.add("chosen"); n.el.classList.add("picked");
  ptimer=setTimeout(()=>{
    setOrigin(n);
    page.classList.add("instant"); page.classList.remove("open"); page.scrollTop=0;
    void page.offsetWidth; page.classList.remove("instant"); page.classList.add("open");
    $("back").focus({preventScroll:true});
  },300);
}
function closePage(){
  clearTimeout(ptimer); current=null; markMenu(null);
  document.title="Licata Group — Network Biology, University of Rome Tor Vergata";
  page.setAttribute("aria-hidden","true"); home.removeAttribute("aria-hidden");
  page.classList.remove("open");                          // the circle shrinks back into the node it came from
  ptimer=setTimeout(()=>{
    svg.classList.remove("picking");
    document.querySelectorAll(".picked,.chosen").forEach(e=>e.classList.remove("picked","chosen"));
    collapseAll();
  }, reduce?0:620);
}

/* ---- hash routing (works on any static host: site/#research) ---- */
let pending=null;
function go(id,n){
  pending=n||null;
  if(id){ if(location.hash==="#"+id) route(true); else location.hash=id; }
  else { if(location.hash) history.pushState(null,"",location.pathname+location.search); route(true); }
}
function route(animate){
  const s=SECTIONS.find(x=>x.id===location.hash.slice(1));
  if(s){ if(s.id!==current) openPage(s,pending,animate); }   // hashchange + popstate both fire: stay idempotent
  else if(current) closePage();
  pending=null;
}
$("back").onclick=()=>go(null);
$("homelink").onclick=ev=>{ ev.preventDefault(); go(null); };
addEventListener("keydown",ev=>{ if(ev.key!=="Escape") return;
  if(list.classList.contains("open")){ setMenu(false); btn.focus(); }
  else if(current) go(null); else collapseAll(); });
addEventListener("hashchange",()=>route(true));
addEventListener("popstate",()=>route(true));
let rz; addEventListener("resize",()=>{ clearTimeout(rz); rz=setTimeout(()=>{ layout(); if(current) decorate(current); },80); });
(document.fonts?document.fonts.ready:Promise.resolve()).then(layout);
layout(); route(false);
