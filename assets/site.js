(function(){
  "use strict";
  var KEY="kss-stamps-v1", BASE="/kindergarten-social-studies";
  function stamps(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  window.KSS={stamps:stamps};
  document.addEventListener("click",function(e){
    var m=e.target.closest(".menu-btn");if(m){document.body.classList.toggle("menu-open");m.setAttribute("aria-expanded",document.body.classList.contains("menu-open"))}
  });
  var SY=window.SCHOOL_YEAR;
  // dates on lesson lists and lesson pages
  document.querySelectorAll("[data-dates]").forEach(function(el){
    var c=SY&&SY.cycleOfLesson(+el.getAttribute("data-dates"));if(c)el.textContent=c.range;
  });
  document.querySelectorAll("[data-dates-full]").forEach(function(el){
    var n=+el.getAttribute("data-dates-full"),c=SY&&SY.cycleOfLesson(n),st=SY&&SY.status();if(!c)return;
    var h="<b>"+c.range+"</b> · two-week span";
    if(st&&st.kind==="lesson"&&st.lesson===n)h+=' <span class="pill coral">This lesson</span>';
    if(c.note)h+=' <span class="pill gold">'+c.note+"</span>";
    el.innerHTML=h;
  });
  // stamps
  var s=stamps();
  document.querySelectorAll("[data-stamp-mark]").forEach(function(el){if(s[el.getAttribute("data-stamp-mark")])el.textContent="✓"});
  var st=SY&&SY.status();
  if(st)document.querySelectorAll('[data-lesson-row="'+st.lesson+'"]').forEach(function(el){if(st.kind==="lesson")el.classList.add("is-now")});
  document.querySelectorAll("[data-stamp]").forEach(function(b){
    var n=b.getAttribute("data-stamp");
    function paint(){var on=!!stamps()[n];b.classList.toggle("done",on);b.classList.toggle("primary",!on);b.textContent=on?"✓ Stamped complete":"Stamp complete";b.setAttribute("aria-pressed",on)}
    paint();b.addEventListener("click",function(){var x=stamps();if(x[n])delete x[n];else x[n]=new Date().toISOString().slice(0,10);save(x);paint()});
  });
  var pc=document.getElementById("progress-count");
  if(pc){var c=Object.keys(s).length;pc.textContent=c+" of 18 lessons stamped";var bar=document.getElementById("progress-bar");if(bar)bar.style.width=(c/18*100)+"%"}
  var pl=document.getElementById("progress-list");
  if(pl){pl.querySelectorAll("[data-stamp-date]").forEach(function(el){var d=s[el.getAttribute("data-stamp-date")];el.textContent=d?"Stamped "+d:"Not yet"})}
  var rs=document.getElementById("reset-stamps");if(rs)rs.addEventListener("click",function(){if(confirm("Clear all stamps on this device?")){save({});location.reload()}});
  // this-lesson card
  var now=document.getElementById("now-card");
  if(now&&st&&window.KSS_LESSONS){
    var L=window.KSS_LESSONS[st.lesson-1];
    now.querySelector("[data-now-label]").textContent=st.kind==="lesson"?"This lesson · Lesson "+L.n+" of 18":(st.kind==="review"?"Review and reassessment":"Start here · Lesson 1");
    now.querySelector("[data-now-title]").textContent=L.title;
    now.querySelector("[data-now-unit]").textContent=L.unit;
    now.querySelector("[data-now-focus]").textContent=L.focus;
    now.querySelector("[data-now-dates]").textContent=(st.cycle?st.cycle.range:"")+(st.message?" · "+st.message:"");
    now.querySelectorAll("[data-now-link]").forEach(function(a){a.href=BASE+"/week/"+L.n+"/"+(a.getAttribute("data-now-link")||"")});
  }
  // block timer
  var blk=document.querySelector(".block");
  if(blk){
    var segs=[].slice.call(blk.querySelectorAll(".seg")),clock=blk.querySelector(".clock"),go=blk.querySelector("[data-go]"),idx=0,left=+segs[0].getAttribute("data-min")*60,tm=null;
    function fmt(x){var m=Math.floor(x/60),z=x%60;return(m<10?"0":"")+m+" : "+(z<10?"0":"")+z}
    function paint(){segs.forEach(function(g,i){g.classList.toggle("on",i===idx);g.classList.toggle("past",i<idx)});clock.textContent=fmt(left);blk.querySelector("[data-seg-name]").textContent=segs[idx].getAttribute("data-name")}
    function pick(i){idx=i;left=+segs[i].getAttribute("data-min")*60;paint()}
    segs.forEach(function(g,i){g.addEventListener("click",function(){pick(i);var t=document.getElementById(g.getAttribute("data-target"));if(t)t.scrollIntoView({behavior:"smooth",block:"start"})})});
    go.addEventListener("click",function(){
      if(tm){clearInterval(tm);tm=null;go.textContent="Start";return}
      go.textContent="Pause";tm=setInterval(function(){left--;if(left<=0){if(idx<segs.length-1){pick(idx+1)}else{clearInterval(tm);tm=null;go.textContent="Start";left=0}}paint()},1000);
    });
    blk.querySelector("[data-reset]").addEventListener("click",function(){if(tm){clearInterval(tm);tm=null;go.textContent="Start"}pick(0)});
    paint();
  }
  // big book viewers
  document.querySelectorAll(".bb").forEach(function(v){
    var pages=JSON.parse(v.getAttribute("data-pages")),i=0,img=v.querySelector("img"),cnt=v.querySelector(".count");
    function show(){img.src=pages[i];img.alt=v.getAttribute("data-title")+", page "+(i+1)+" of "+pages.length;cnt.textContent="Page "+(i+1)+" of "+pages.length;
      if(pages[i+1]){var p=new Image();p.src=pages[i+1]}}
    v.querySelector("[data-prev]").addEventListener("click",function(){if(i>0){i--;show()}});
    v.querySelector("[data-next]").addEventListener("click",function(){if(i<pages.length-1){i++;show()}});
    v.querySelector("[data-full]").addEventListener("click",function(){if(document.fullscreenElement)document.exitFullscreen();else if(v.requestFullscreen)v.requestFullscreen()});
    v.addEventListener("keydown",function(e){if(e.key==="ArrowRight"&&i<pages.length-1){i++;show()}if(e.key==="ArrowLeft"&&i>0){i--;show()}});
    show();
  });
})();
