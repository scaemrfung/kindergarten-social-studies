/* SCHOOL-YEAR SETTINGS: Kindergarten Social Studies (review each August).
   Biweekly class: one 30-minute lesson every two school weeks.
   School weeks come from the EIPS Division Calendar 2026-27 (same dates as
   the Grade 5 Health site). Weeks with no school are skipped. Each pair of
   school weeks is one lesson "cycle". Lessons 1-18 fill the first 18 cycles;
   any cycles after that are review and reassessment.
   Test any date with ?today=YYYY-MM-DD in the page URL. */
(function (root) {
  "use strict";
  var CAL = {
    label: "2026–2027", timeZone: "America/Edmonton",
    firstDay: "2026-08-31", lastDay: "2027-06-28", lessons: 18,
    closed: [
      ["2026-09-07","2026-09-07","Labour Day"],["2026-09-30","2026-09-30","Truth and Reconciliation Day"],
      ["2026-10-02","2026-10-02","PL day"],["2026-10-12","2026-10-12","Thanksgiving"],
      ["2026-11-09","2026-11-13","November Break"],["2026-12-21","2027-01-01","Christmas Break"],
      ["2027-01-29","2027-01-29","PL day"],["2027-02-04","2027-02-05","Teachers' Convention"],
      ["2027-02-15","2027-02-15","Family Day"],["2027-03-05","2027-03-05","PL day"],
      ["2027-03-19","2027-03-19","School closure"],["2027-03-22","2027-03-26","Spring Break"],
      ["2027-03-29","2027-03-29","Easter Monday"],["2027-05-07","2027-05-07","PL day"],
      ["2027-05-20","2027-05-21","School closure"],["2027-05-24","2027-05-24","Victoria Day"],
      ["2027-06-29","2027-06-29","Operational day (no students)"]
    ]
  };
  var MON=["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"], DAY=864e5;
  function parse(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||""));return m?Date.UTC(+m[1],+m[2]-1,+m[3]):null}
  function iso(t){return new Date(t).toISOString().slice(0,10)}
  function dow(t){return new Date(t).getUTCDay()}
  function short(t){var d=new Date(t);return MON[d.getUTCMonth()]+" "+d.getUTCDate()}
  function range(a,b){if(a===b)return short(a);var da=new Date(a),db=new Date(b);return short(a)+"–"+(da.getUTCMonth()===db.getUTCMonth()?db.getUTCDate():short(b))}
  var CLOSED={};CAL.closed.forEach(function(c){for(var t=parse(c[0]);t<=parse(c[1]);t+=DAY)CLOSED[iso(t)]=c[2]});
  var FIRST=parse(CAL.firstDay),LAST=parse(CAL.lastDay),WEEKS=[];
  for(var mon=FIRST-((dow(FIRST)+6)%7)*DAY;mon<=LAST;mon+=7*DAY){
    var days=[],off=[];
    for(var i=0;i<5;i++){var t=mon+i*DAY,k=iso(t);if(t<FIRST||t>LAST)continue;if(CLOSED[k])off.push(CLOSED[k]);else days.push(k)}
    if(days.length)WEEKS.push({monday:iso(mon),start:days[0],end:days[days.length-1],off:off});
  }
  var CYCLES=[];
  for(var j=0;j<WEEKS.length;j+=2){
    var a=WEEKS[j],b=WEEKS[j+1]||a,n=CYCLES.length+1;
    var notes=[];[a,b].forEach(function(w){w.off.forEach(function(o){if(notes.indexOf(o)<0)notes.push(o)})});
    CYCLES.push({n:n,lesson:n<=CAL.lessons?n:null,start:a.start,end:b.end,range:range(parse(a.start),parse(b.end)),note:notes.length?"Days off: "+notes.join(", "):""});
  }
  function todayISO(){
    try{var o=root&&root.location&&new URLSearchParams(root.location.search).get("today");if(o&&parse(o)!=null)return o}catch(e){}
    try{var p=new Intl.DateTimeFormat("en-CA",{timeZone:CAL.timeZone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
      var g=function(t){return p.find(function(x){return x.type===t}).value};return g("year")+"-"+g("month")+"-"+g("day")}catch(e){return iso(Date.now())}
  }
  function cycleOfLesson(n){for(var i=0;i<CYCLES.length;i++)if(CYCLES[i].lesson===n)return CYCLES[i];return null}
  function status(k){
    k=k||todayISO();
    if(k<CYCLES[0].start)return{kind:"before",lesson:1,cycle:CYCLES[0],message:"School starts "+short(parse(CYCLES[0].start))+". Lesson 1 is ready."};
    if(k>CAL.lastDay)return{kind:"summer",lesson:1,cycle:null,message:"The "+CAL.label+" school year is over. Lesson 1 is here so you can plan for next year."};
    for(var i=0;i<CYCLES.length;i++){var c=CYCLES[i],nx=CYCLES[i+1];
      if(k<=c.end||!nx||k<nx.start){
        if(k<c.start)c=CYCLES[i]; // break before this cycle
        if(c.lesson)return{kind:"lesson",lesson:c.lesson,cycle:c,message:(k<c.start?"Break now. Next lesson after the break. ":"")+(c.note||"")};
        return{kind:"review",lesson:CAL.lessons,cycle:c,message:"Review and reassessment (" +c.range+"): all 18 lessons are done. Revisit any lesson, or reassess with Lesson 18."};
      }}
    return{kind:"review",lesson:CAL.lessons,cycle:null,message:""};
  }
  root.SCHOOL_YEAR={config:CAL,cycles:CYCLES,status:status,cycleOfLesson:cycleOfLesson,todayISO:todayISO};
})(window);
