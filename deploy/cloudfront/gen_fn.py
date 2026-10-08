import csv,json,re,sys
# usage: python3 gen_fn.py [redirects.csv]   (writes nyct-dentistry-implants-redirects.js + gen-report.json to cwd)
CSV=sys.argv[1] if len(sys.argv)>1 else '/workspace/clients/nyct-dentistry-implants/deploy/REDIRECTS-preview-retargeted.csv'
rows=list(csv.DictReader(open(CSV)))
retarget={'/locations/kent.html':'/kent/','/locations/stamford.html':'/stamford/','/locations/mount-kisco.html':'/mount-kisco/'}
def norm(p):
    p=p.lower(); p=p.rstrip('/'); return p or '/'
hostkey={'nyctdentistry.com':'n','kentdentistryct.com':'k','clearsmiledentalstudio.com':'c'}
maps={'n':{},'k':{},'c':{}}
targets=[]; tidx={}
skipped=[]; retargeted=[]
for r in rows:
    t=r['new_target']; base,frag=(t.split('#',1)+[''])[:2]
    if base in retarget:
        nt=retarget[base]+('#'+frag if frag else ''); retargeted.append((r['old_host'],r['old_path'],t,nt)); t=nt
    k=norm(r['old_path'])
    if r['old_host']=='nyctdentistry.com' and norm(t.split('#')[0].replace('/index.html','/'))==k:
        skipped.append((r['old_host'],r['old_path'],t)); continue
    if t not in tidx: tidx[t]=len(targets); targets.append(t)
    maps[hostkey[r['old_host']]][k]=tidx[t]
def jsobj(d): return '{'+','.join(json.dumps(k)+':'+str(v) for k,v in d.items())+'}'
js='''var T=%s;
var M={n:%s,k:%s,c:%s};
var A='https://nyctdentistry.com';
function qs(q){var p=[];for(var k in q){var v=q[k];if(v.multiValue){for(var i=0;i<v.multiValue.length;i++)p.push(k+(v.multiValue[i].value!==''?'='+v.multiValue[i].value:''));}else p.push(k+(v.value!==''?'='+v.value:''));}return p.length?'?'+p.join('&'):'';}
function r301(loc){return{statusCode:301,statusDescription:'Moved Permanently',headers:{location:{value:loc},'cache-control':{value:'max-age=3600'}}};}
function handler(event){
var req=event.request;var h=(req.headers.host&&req.headers.host.value||'').toLowerCase();
var hb=h.indexOf('www.')===0?h.slice(4):h;
var g=hb==='kentdentistryct.com'?'k':(hb==='clearsmiledentalstudio.com'?'c':'n');
var u=req.uri;var k=u.toLowerCase().replace(/\\/+$/,'')||'/';
var i=M[g][k];var q=qs(req.querystring);
if(i!==undefined){var t=T[i];var f='';var x=t.indexOf('#');if(x>=0){f=t.slice(x);t=t.slice(0,x);}return r301(A+t+q+f);}
if(g==='k'){return r301(A+'/kent/'+q);}
if(g==='c'){return r301(A+'/stamford/'+q);}
if(h==='www.nyctdentistry.com'){return r301(A+u+q);}
return req;}
''' % (json.dumps(targets,separators=(',',':')),jsobj(maps['n']),jsobj(maps['k']),jsobj(maps['c']))
open('nyct-dentistry-implants-redirects.js','w').write(js)
json.dump({'skipped':skipped,'retargeted':retargeted,'counts':{g:len(m) for g,m in maps.items()},'targets':len(targets)},open('gen-report.json','w'),indent=1)
print(len(js.encode()),'bytes');print(open('gen-report.json').read())
