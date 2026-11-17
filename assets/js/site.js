/* GigZ: site behaviour. Language (PT/EN, remembered), menu, reveal, hero loop, session player + set list,
   video and photo lightboxes, WhatsApp/e-mail messages in the visitor's language, mobile dock. No dependencies. */
(function(){
  var d=document,root=d.documentElement,b=d.body;
  var WA='5561984167777';
  var MSG={pt:'Olá, Rafael! Gostaria de um orçamento para um show da GigZ.',en:'Hi Rafael! I would like a quote for a GigZ show.'};
  var SUBJ={pt:'Orçamento de show: GigZ',en:'Show quote: GigZ'};
  function lang(){return root.dataset.lang==='en'?'en':'pt'}
  function setLang(l){
    root.dataset.lang=l;root.lang=l==='pt'?'pt-BR':'en';try{localStorage.setItem('gigz-lang',l)}catch(e){}
    d.querySelectorAll('[data-wa]').forEach(function(a){a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(MSG[l])});
    var m=d.getElementById('mailBtn');if(m)m.href='mailto:gig.z.contato@gmail.com?subject='+encodeURIComponent(SUBJ[l]);
  }
  setLang(lang());
  d.querySelectorAll('.lang button').forEach(function(x){x.addEventListener('click',function(){setLang(x.dataset.set)})});

  // header + menu
  var top=d.getElementById('top'),mb=d.getElementById('menuBtn'),sh=d.getElementById('sheet');
  function menu(o){b.classList.toggle('menu-open',o);mb.setAttribute('aria-expanded',o);sh.setAttribute('aria-hidden',!o);b.style.overflow=o?'hidden':''}
  mb.addEventListener('click',function(){menu(!b.classList.contains('menu-open'))});
  sh.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu(false)})});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&b.classList.contains('menu-open'))menu(false)});
  function onScroll(){top.classList.toggle('solid',scrollY>30)}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // reveal (with a safety net for anything already on screen)
  var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{threshold:.12});
  d.querySelectorAll('.rv').forEach(function(e){rio.observe(e)});
  function net(){d.querySelectorAll('.rv:not(.in)').forEach(function(e){var r=e.getBoundingClientRect();if(r.top-40<innerHeight&&r.bottom>0)e.classList.add('in')})}
  setTimeout(net,1200);var nt=0;addEventListener('scroll',function(){clearTimeout(nt);nt=setTimeout(net,350)},{passive:true});

  // active nav
  var navs=[].slice.call(d.querySelectorAll('.nav a'));
  var nio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)navs.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
  ['banda','formacao','ao-vivo','videos','fotos','contratar'].forEach(function(id){var s=d.getElementById(id);if(s)nio.observe(s)});

  // hero loop: the wide version on landscape screens, the tall one on phones; silent, plays only on screen.
  // If the browser refuses autoplay (e.g. Safari in Low Power Mode) the poster image simply stays.
  var hv=d.getElementById('heroVideo');
  if(hv){
    var tall=matchMedia('(max-aspect-ratio: 1/1)').matches;
    hv.src=tall?hv.dataset.tall:hv.dataset.wide;hv.muted=true;
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(){if(reduce)return;var p=hv.play();if(p&&p.catch)p.catch(function(){})}
    hv.addEventListener('playing',function(){hv.style.opacity=1});
    new IntersectionObserver(function(es){es[0].isIntersecting?go():hv.pause()}).observe(hv);
    ['pointerdown','keydown','touchend'].forEach(function(ev){addEventListener(ev,function(){if(hv.paused)go()},{passive:true,once:true})});
  }

  // session player + set list
  var film=d.getElementById('film'),player=d.getElementById('player'),pb=d.getElementById('playBtn'),tape=d.getElementById('playerTape');
  var songs=[].slice.call(d.querySelectorAll('.song[data-src]'));
  function load(s,play){
    songs.forEach(function(x){x.setAttribute('aria-current',x===s)});
    film.pause();film.poster=s.dataset.poster;film.src=s.dataset.src;tape.textContent=s.dataset.title;player.classList.remove('playing');
    if(play){var p=film.play();if(p&&p.catch)p.catch(function(){})}
  }
  if(film){
    songs.forEach(function(s){s.addEventListener('click',function(){load(s,true)})});
    pb.addEventListener('click',function(){film.controls=true;var p=film.play();if(p&&p.catch)p.catch(function(){})});
    film.addEventListener('play',function(){player.classList.add('playing');film.controls=true;d.querySelectorAll('video').forEach(function(v){if(v!==film&&v!==hv&&!v.paused)v.pause()})});
    film.addEventListener('ended',function(){var i=songs.findIndex(function(x){return x.getAttribute('aria-current')==='true'});if(i>-1&&i<songs.length-1)load(songs[i+1],true)});
  }

  // video lightbox
  var vlb=d.getElementById('vlb'),vv=vlb&&vlb.querySelector('video');
  d.querySelectorAll('[data-video]').forEach(function(btn){btn.addEventListener('click',function(){
    if(!vlb.showModal){location.href=btn.dataset.video;return}
    film&&film.pause();vv.poster=btn.dataset.poster||'';vv.src=btn.dataset.video;vlb.querySelector('figcaption').textContent=btn.dataset.caption||'';
    vlb.showModal();b.style.overflow='hidden';var p=vv.play();if(p&&p.catch)p.catch(function(){});
  })});
  // photo lightbox
  var lb=d.getElementById('lb'),li=lb&&lb.querySelector('img'),lc=lb&&lb.querySelector('figcaption'),shots=[].slice.call(d.querySelectorAll('[data-full]')),cur=0;
  function show(i){cur=(i+shots.length)%shots.length;var s=shots[cur];li.src=s.dataset.full;li.alt=s.querySelector('img').alt;lc.textContent=s.querySelector('img').alt}
  shots.forEach(function(s,i){s.addEventListener('click',function(){if(!lb.showModal){location.href=s.dataset.full;return}show(i);lb.showModal();b.style.overflow='hidden'})});
  if(lb){lb.querySelector('.lb-prev').addEventListener('click',function(){show(cur-1)});lb.querySelector('.lb-next').addEventListener('click',function(){show(cur+1)});
    lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
    var sx=null;lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});lb.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));sx=null})}
  [lb,vlb].forEach(function(x){if(!x)return;
    x.addEventListener('click',function(e){if(e.target===x||e.target.tagName==='FIGURE'||e.target.closest('.lb-x'))x.close()});
    x.addEventListener('close',function(){b.style.overflow='';if(x===vlb){vv.pause();vv.removeAttribute('src');vv.load()}});
  });

  // mobile dock: after the hero, hidden over the booking section
  var dock=d.getElementById('dock'),book=d.getElementById('contratar');
  function dk(){var past=scrollY>innerHeight*.7,inB=book.getBoundingClientRect().top<innerHeight*.85;dock.classList.toggle('show',past&&!inB&&!b.classList.contains('menu-open'))}
  addEventListener('scroll',dk,{passive:true});dk();
})();
