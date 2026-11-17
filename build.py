"""Builds index.html from index.src.html: fills the set list, video cards, gallery, structured data and cache-busting
versions. Durations are read from the actual web video files. Run: python3 build.py"""
import json,hashlib,subprocess,os,html
H=os.path.dirname(os.path.abspath(__file__))
FP=os.path.expanduser('~/anaconda3/envs/video/bin/ffprobe')
def dur(p):
    try: s=float(subprocess.run([FP,'-v','error','-show_entries','format=duration','-of','csv=p=0',os.path.join(H,p)],capture_output=True,text=True).stdout)
    except Exception: return ''
    return f'{int(s//60)}:{int(round(s%60)):02d}'
def ver(p): return hashlib.md5(open(os.path.join(H,p),'rb').read()).hexdigest()[:8]
PLAY='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>'
SET=[('What I Got','Sublime','what_i_got'),("Isn't She Lovely",'Stevie Wonder','isnt_she_lovely'),('Red House','Jimi Hendrix','red_house'),
     ('Stand By Me','Ben E. King','stand_by_me'),('Ela Vai Voltar','Charlie Brown Jr.','ela_vai_voltar')]
rows=[]
for i,(t,a,slug) in enumerate(SET,1):
    if slug:
        v=f'assets/video/film_{slug}.mp4'; rows.append(f'<button class="song" role="listitem" data-src="{v}" data-poster="assets/video/film_{slug}.jpg" data-title="{html.escape(t)}" aria-current="{"true" if i==1 else "false"}"><span class="n">{i:02d}</span><span class="t">{html.escape(t)}<small>{html.escape(a)}</small></span><span class="d">{"▶ "+dur(v)+(" · trecho" if slug=="isnt_she_lovely" else "")}</span></button>')
    else:
        rows.append(f'<div class="song nofilm" role="listitem"><span class="n">{i:02d}</span><span class="t">{html.escape(t)}<small>{html.escape(a)}</small></span><span class="d">·</span></div>')
VIDS=[('promo','Garden Session','Trailer',True),('what_i_got','What I Got','Sublime',False),('isnt_she_lovely',"Isn't She Lovely",'Stevie Wonder',False),('red_house','Red House','Jimi Hendrix',False),
      ('stand_by_me','Stand By Me','Ben E. King',False),('ela_vai_voltar','Ela Vai Voltar','Charlie Brown Jr.',False),
      ('promo_916','Garden Session · 9:16','Reels · Stories',False),('social_what_i_got_916','What I Got · 30 s','Reels · Stories',False)]
cards=[]
for slug,t,a,feat in VIDS:
    tall=slug.endswith('_916'); v=f'assets/video/film_{slug}.mp4'; p=f'assets/video/film_{slug}.jpg'
    if not os.path.exists(os.path.join(H,v)): continue
    cap=f'GigZ · {t} ({a}) · Garden Session 07.2026'
    thumb=f'<span class="thumb{" tall" if tall else ""}"><img src="{p}" alt="" loading="lazy"><span class="play">{PLAY}</span><span class="dur">{dur(v)}</span></span>'
    if feat:
        cards.append(f'<button class="vcard feature rv" data-video="{v}" data-poster="{p}" data-caption="GigZ · Garden Session 07.2026">{thumb}<span class="meta"><span class="k" style="margin-bottom:14px"><span data-pt>Vídeo principal</span><span data-en>Main video</span></span><h3>Garden Session</h3><p><span data-pt>Um minuto da banda ao vivo: What I Got, Red House, Stand By Me e Ela Vai Voltar.</span><span data-en>One minute of the band live: What I Got, Red House, Stand By Me and Ela Vai Voltar.</span></p></span></button>')
    else:
        sub='<span data-pt>Corte vertical para redes sociais</span><span data-en>Vertical cut for social media</span>' if tall else f'{html.escape(a)} · <span data-pt>ao vivo</span><span data-en>live</span>'
        cards.append(f'<button class="vcard rv" data-video="{v}" data-poster="{p}" data-caption="{html.escape(cap)}">{thumb}<h3>{html.escape(t)}</h3><p>{sub}</p></button>')
GAL=[('img_1817','g1','A GigZ com os instrumentos no jardim: violão, bumbo e baixo'),('img_1824','g2','Os três músicos diante de uma cerca de madeira'),
     ('img_1813','g3','A banda no jardim, entre palmeiras'),('img_1822','g4','A banda com um cachorro, numa calçada'),
     ('img_1816','g5','Rafael Z, o baterista e o baixista com os instrumentos'),('img_1826','g6','A banda de braços cruzados diante da cerca'),
     ('img_1814','g7','Retrato da banda com violão e baixo, ao fim da tarde')]
gal=''.join(f'<button class="{g} rv" data-full="assets/img/photos/{n}.jpg"><img src="assets/img/photos/{n}_s.jpg" srcset="assets/img/photos/{n}_s.jpg 900w, assets/img/photos/{n}.jpg 1800w" sizes="(max-width:899px) 50vw, 40vw" loading="lazy" alt="{html.escape(alt)}"></button>' for n,g,alt in GAL)
LD={"@context":"https://schema.org","@type":"MusicGroup","@id":"https://rafaelzeredo.github.io/gigz/#band","name":"GigZ",
    "url":"https://rafaelzeredo.github.io/gigz/","image":"https://rafaelzeredo.github.io/gigz/assets/img/og/og.jpg",
    "logo":"https://rafaelzeredo.github.io/gigz/assets/brand/icon-512.png","foundingDate":"2026",
    "foundingLocation":{"@type":"Place","name":"Brasília, Distrito Federal, Brasil"},
    "genre":["Rock","Reggae","Blues","Soul"],"description":"Power trio de Brasília formado em 2026: voz e violão, baixo e bateria.",
    "member":[{"@type":"OrganizationRole","roleName":"Voz e violão","member":{"@type":"Person","name":"Rafael Z","url":"https://rafaelzeredo.github.io/","@id":"https://rafaelzeredo.github.io/#rafael-z"}},{"@type":"OrganizationRole","roleName":"Bateria","member":{"@type":"Person","name":"Alisson (Alvinho)"}},{"@type":"OrganizationRole","roleName":"Baixo","member":{"@type":"Person","name":"João Paulo"}}],
    "contactPoint":{"@type":"ContactPoint","contactType":"booking","telephone":"+55-61-98416-7777","email":"gig.z.contato@gmail.com","areaServed":"BR","availableLanguage":["pt-BR","en"]}}
src=open(os.path.join(H,'index.src.html')).read()
wm=open(os.path.join(os.path.dirname(H),'work','wm_inner.txt')).read().replace('<path class="z"','<path style="fill:var(--zc,#FF5A1F)" class="z"')
out=(src.replace('@@SETLIST@@','\n        '.join(rows)).replace('@@VIDEOS@@',''.join(cards)).replace('@@GALLERY@@',gal)
     .replace('@@JSONLD@@',json.dumps(LD,ensure_ascii=False,separators=(',',':'))).replace('@@WM@@',wm)
     .replace('@@CSSV@@',ver('assets/css/site.css')).replace('@@JSV@@',ver('assets/js/site.js')))
assert '@@' not in out
open(os.path.join(H,'index.html'),'w').write(out); print('index.html',len(out),'bytes;',len(cards),'videos')
