"""End-to-end API checks. Run only against the local demo server."""
import json, urllib.request, urllib.error, http.cookiejar, uuid, sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:5173'
if not (BASE.startswith('http://localhost:') or BASE.startswith('http://127.0.0.1:')): raise SystemExit('Tests only support localhost to avoid creating production test accounts.')
def client(): return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
checks=[]
def req(c,path,body=None,expected=200,raw=None,origin=None):
 headers={'Content-Type':'application/json'}
 if origin: headers['Origin']=origin
 data=raw if raw is not None else json.dumps(body).encode() if body is not None else None
 request=urllib.request.Request(BASE+path,data=data,headers=headers)
 try:
  response=c.open(request,timeout=90); status=response.status; content=response.read(); h=response.headers
 except urllib.error.HTTPError as error: status=error.code; content=error.read(); h=error.headers
 assert status==expected,(path,status,expected,content[:250])
 return (json.loads(content) if h.get("Content-Type", "").startswith("application/json") else {"text":content.decode()}),h
def ok(label): checks.append(label); print('PASS',label,flush=True)
c=client()
a,_=req(c,'/api/analytics');e,_=req(c,'/api/evidence')
assert e['count']==27 and e['baseline']==40 and e['change']==-32.5 and e['collections']==2700 and e['baselineCollections']==4000
assert [p['count'] for p in e['prior']]==[38,42,39,41]
assert a['settled']+a['pending']==a['total'] and len(a['transactions'])==a['count']
assert sum(h['count'] for h in a['hours'])==a['count']
assert a['returning']+a['inactive']+a['newCustomers']==len(a['customers'])
ok('Exact evidence, hourly totals, customer groups and settlement reconciliation')
for q,intent in [('Why was my afternoon slow?','sales'),('Who has not returned?','customers'),('What has settled?','cash'),('What should I try?','action'),('Tell me the weather','unknown')]:
 answer,_=req(c,'/api/ask',{'question':q,'language':'en'});assert answer['intent']==intent and ('Scripted' in answer['mode'] or 'AI' in answer['mode'])
answer,_=req(c,'/api/ask',{'question':'दोपहर में भुगतान कम क्यों थे?','language':'hi'});assert '27' in answer['text'] and 'भुगतान' in answer['text']
ok('English/Hindi intents, calculated replies, and unsupported questions')
req(c,'/api/ask',{'question':''},400);req(c,'/api/ask',raw=b'null',expected=400);req(c,'/api/ask',raw=b'{broken',expected=400);req(c,'/api/auth',raw=b'[]',expected=400)
req(c,'/api/auth',{'mode':'unknown'},400);req(c,'/api/auth',{'mode':'demo'},403,origin='https://untrusted.example')
req(c,'/api/actions',expected=401)
ok('Malformed input, unknown actions, origin protection and unauthenticated access')
email='test-'+uuid.uuid4().hex[:12]+'@example.test';password='Demo-Test-'+uuid.uuid4().hex
u,h= req(c,'/api/auth',{'mode':'register','email':email,'password':password,'name':'API test shop'})
assert u['user']['name']=='API test shop' and 'HttpOnly' in h.get('Set-Cookie','') and 'SameSite=Lax' in h.get('Set-Cookie','')
u,_=req(c,'/api/auth');assert u['user']['email']==email
req(c,'/api/auth',{'mode':'register','email':email,'password':password,'name':'Duplicate'},409)
ok('Registration, duplicate prevention, HttpOnly session cookie and session read-back')
act={'id':str(uuid.uuid4()),'title':'Afternoon test','offer':'Synthetic combo offer for 2 to 5 PM','budget':300,'status':'draft','counts':[None,None,None]}
req(c,'/api/actions',act);result,_=req(c,'/api/actions');assert result['actions'][0]['id']==act['id']
req(c,'/api/actions',{**act,'status':'reviewed','counts':[36,40,44]},400)
req(c,'/api/actions',{**act,'budget':-1},400);req(c,'/api/actions',{**act,'counts':[1.5,None,None]},400)
act['status']='approved';req(c,'/api/actions',act)
act.update(status='reviewed',counts=[36,40,44]);req(c,'/api/actions',act)
result,_=req(c,'/api/actions');assert result['actions'][0]['counts']==[36,40,44] and result['actions'][0]['status']=='reviewed'
ok('Draft persistence, approval, invalid values, and saved three-day outcome')
other=client();req(other,'/api/auth',{'mode':'demo'});req(other,'/api/actions',act,403);r,_=req(other,'/api/actions');assert not r['actions']
ok('Account isolation: another user cannot read or overwrite the experiment')
old=client();req(old,'/api/auth',{'mode':'login','email':email,'password':password})
req(c,'/api/auth',{'mode':'password','current':'wrong-password','password':password+'-new'},400)
new=password+'-new';req(c,'/api/auth',{'mode':'password','current':password,'password':new})
r,_=req(old,'/api/auth');assert r['user'] is None
req(c,'/api/auth',{'mode':'logout'});r,_=req(c,'/api/auth');assert r['user'] is None
req(c,'/api/auth',{'mode':'login','email':email,'password':password},401)
req(c,'/api/auth',{'mode':'login','email':email,'password':new});r,_=req(c,'/api/actions');assert r['actions'][0]['id']==act['id']
ok('Password verification, session invalidation, logout, re-login and persistent ownership')
blocked=False
for i in range(12):
 try:req(client(),'/api/auth',{'mode':'login','email':'throttle-'+email,'password':password},401)
 except AssertionError as error:
  assert error.args[0][1]==429;blocked=True;break
assert blocked
ok('Repeated failed sign-ins are rate-limited')
req(c,'/api/auth',{'mode':'logout'});req(other,'/api/auth',{'mode':'logout'})
print(json.dumps({'passed':len(checks),'checks':checks},indent=2))


