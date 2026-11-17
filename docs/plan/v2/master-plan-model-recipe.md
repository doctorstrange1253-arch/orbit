# Phase E Guarded Planning Models and Reproducibility

Date: 2026-11-08. Task: FP2-E. Status: PROPOSED planning arithmetic, not production accounting, policy approval or PLAN LOCKED.
[Skill: sn-da-excel-workflow]

## 1. Purpose, audience and authority

For engineers validating the F5/F7 planning assumptions before implementation. This coordinator-authored recipe uses only isolated Python standard libraries. It creates the canonical [typed input CSV](models/master-plan-inputs.csv) and [planning workbook](models/master-plan-models.xlsx), immediately verifies/registers/logs each, and preserves all earlier C2/D models. No application import, helper file, dependency installation, credential, provider, database, server, chart or Office process is used. The paths were recorded in PATHS before creation; the alternate model path in the original F5 agent draft is not authorized.

The input CSV is a typed regeneration source/snapshot, not an automatic export of subsequent workbook edits. `ValueJSON` preserves numeric versus string/boolean/null distinctions; duplicate JSON keys, nonfinite JSON and duplicate source fields are rejected. Labels are data, never executable formulas. The recipe refuses an existing workbook; preserve user edits and record a separately approved revision path before regeneration. An existing canonical CSV may be read as data, never overwritten by this recipe. It must have the complete exact schema and valid inputs.

Every share, cap, price point, archetype, multiplier and allocation option is a planning assumption except the user's fixed separate 15% session and 20% subscription shares. Synthetic recognized bases are hypothetical inputs, not signed current recognized-basis rules or approved prices. Tax/provider/allocation applicability, invoice/KYC/refund/reserve and actual costs remain unresolved. No number here authorizes a grant, charge, settlement or launch.

## 2. Model contract and input controls

Schema: `fp2.e.economy-model.v1`. Thirteen F5 sheets plus internal EligibleCourses and FormulaManifest. WalletBaseline has exactly108 months; WalletStress432 months over BASELINE/MORE_EARNING/LESS_SPENDING/COMBINED; YearEnd36 identity/archetype/scenario rows. A repeated baseline grid is deliberate, not108 additional independent people. Source limits are1,000,000,000 units per input,100,000 multiplier basis points, denominator10,000, intermediate ceiling100,000,000,000,000. Weeks0..52; months1..12. Zero awards/caps/scales are explicit valid disabled synthetic cases; missing values are not zero.

Wallet inputs are the nine D tuples, ordered weekly request/monthly optional sink/weekly cap/balance cap: Student40/80/100/2000,80/250/100/2000,120/380/100/2000; Mentor25/40/150/3000,75/160/150/3000,180/550/150/3000; Peer15/40/75/1500,45/160/75/1500,90/260/75/1500. Initial opening0 and4 active weeks/month. ModelConfig.ActiveWeeksPerMonth is a seed default; WalletInputs.H is the live per-archetype control. Twelve four-week months mean48 synthetic active weeks, not a calendar forecast.

For O/R/C/B/W/S and f/s/D: requested=min(C,floor(R*f/D))*W; issued=max(0,min(B-O,requested)); spent=min(O+issued,floor(S*s/D)); closing=O+issued-spent; unissued=requested-issued. Issuance precedes optional spending, which does not reopen that month's issuance. Opening above cap is invalid, not confiscated. A prior invalid month propagates a blocked output. Each chain is generated from its complete scenario/identity/archetype/month key, not an unrelated preceding row.

Money arithmetic is integer paise: session platform=floor((15*B+50)/100), mentor=B-platform; subscription platform=floor((20*B+50)/100), pool=B-platform. Every dependent money output blocks if either fixed share changes. Synthetic gateway=floor((B*200+5000)/10000)+500 paise, infrastructure800, support2000, risk1000; these are assumptions, not quotes. Conditional contribution is allowed to be negative. Actual-mode unapproved provider/tax/policy blocks; all-in net is never numeric because a complete approved actual tax/cost model is absent. Subscription equal-course arithmetic is only a proposed comparison. Zero or duplicate beneficiaries block, never redirect the pool to the platform.

Only numeric cells of the proper range/integrality are accepted; numeric text, boolean, null, fractional units, nonfinite, unsupported enums and unsafe intermediates reject. Mathematically integral finite numeric values such as4.0 are valid; strings such as"4" are not coerced. CSV dates are strings and rejected in units fields. Date-formatted worksheet units and unexpected formula inputs must be rejected by the trusted import validator. An unformatted numeric date serial cannot be distinguished from an ordinary number by value alone; no universal date-intent detection is claimed.

Formula/input styles and sheet protection prevent accidental edits, not adversarial changes. Output sorting/row insertion/deletion is intentionally disabled until actual engine key-chain tests succeed; filters remain available. FormulaManifest records exact cell/formula digests. Independent validation must compare against the recipe-derived expected formulas/keys, not trust an editable manifest. Pasted inputs, formula replacement, deleted rows and moved keys invalidate export. A workbook never becomes server authority.

## 3. Trusted generator

Compile this single Python fence before execution. Execution is allowed only for these planning outputs and immediate registry/log updates under `python -I`. No code comments or downloaded execution. The initial recipe invocation is not an Office recalculation test.

```python
import pathlib,csv,json,math,zipfile,re,io,hashlib,sys,datetime,xml.etree.ElementTree as ET
root=pathlib.Path('D:/orbit-main/orbit-main');base=root/'docs/plan/v2';mp=base/'models'
cp=mp/'master-plan-inputs.csv';xp=mp/'master-plan-models.xlsx';DATE='2026-11-08'
assert mp.is_dir() and not xp.exists(),'Existing workbook is preserved; choose an approved revision path'
assert cp.resolve().is_relative_to(root.resolve()) and xp.resolve().is_relative_to(root.resolve())
LIMIT=1000000000;INTER=100000000000000;stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
F=lambda text,value:('FORMULA',text,value)
def cv(x):return x[2] if isinstance(x,tuple) and x[0]=='FORMULA' else x
def integer(x,lo=0,hi=LIMIT):return type(x) in (int,float) and lo<=x<=hi and math.isfinite(x) and x==int(x)
def unique_object(pairs):
    out={}
    for k,v in pairs:
        if k in out:raise ValueError('DUPLICATE_JSON_KEY')
        out[k]=v
    return out
def reject_constant(x):raise ValueError('NONFINITE_JSON')
def strict_json(s):return json.loads(s,object_pairs_hook=unique_object,parse_constant=reject_constant)
config=dict(SessionSharePct=15,SubscriptionSharePct=20,MoneyMinorPerINR=100,ScaleDenominator=10000,ModelMonths=12,ActiveWeeksPerMonth=4,ModelNumericLimit=LIMIT,TaxPolicyState='UNKNOWN',ProviderPolicyState='UNKNOWN',AllocationPolicyState='PROPOSED',OfficeRecalculationState='UNVERIFIED')
wallet_keys=['identity','archetype','weeklyRequested','monthlySinkRequested','weeklyCap','balanceCap','openingUnits','activeWeeksPerMonth']
wallets=[dict(zip(wallet_keys,t+(0,4))) for t in [('Student','Casual',40,80,100,2000),('Student','Steady',80,250,100,2000),('Student','Intensive',120,380,100,2000),('Mentor','Casual',25,40,150,3000),('Mentor','Steady',75,160,150,3000),('Mentor','Intensive',180,550,150,3000),('Peer','Casual',15,40,75,1500),('Peer','Steady',45,160,75,1500),('Peer','Intensive',90,260,75,1500)]]
scenarios=[dict(scenarioId=s,faucetScaleBp=f,sinkScaleBp=t,scaleDenominator=10000) for s,f,t in [('BASELINE',10000,10000),('MORE_EARNING',12000,10000),('LESS_SPENDING',10000,8000),('COMBINED',12000,8000)]]
sessions=[dict(scenarioId=s,recognizedBasisMinor=b,gatewayRateBp=200,gatewayFixedMinor=500,infrastructureMinor=800,supportMinor=2000,riskMinor=1000,costMode=m,taxState='UNKNOWN',providerState='UNKNOWN') for s,b,m in [('S500',50000,'SYNTHETIC'),('S1500',150000,'SYNTHETIC'),('S3000',300000,'SYNTHETIC'),('S1_01',101,'SYNTHETIC'),('ACTUAL_BLOCKED',50000,'ACTUAL')]]
subscriptions=[dict(scenarioId=s,recognizedBasisMinor=b,eligibleCourseIds=ids,allocationMode='EQUAL_COURSE_CANDIDATE',policyState='PROPOSED') for s,b,ids in [('SUB2',100000,['C-01','C-02']),('SUB5',100000,[f'C-{n:02}' for n in range(1,6)]),('SUB10',100000,[f'C-{n:02}' for n in range(1,11)]),('SUB_BOUNDARY',101,['C-01','C-02','C-03']),('NO_COURSES',100000,[]),('DUP_COURSES',100000,['C-01','C-01'])]]
header=['Sheet','RowKey','Field','ValueJSON','Unit','State','Source'];source=[]
for name,rows in [('ModelConfig',[config]),('WalletInputs',wallets),('Scenarios',scenarios),('SessionInputs',sessions),('SubscriptionInputs',subscriptions)]:
    for d in rows:
        key='CONFIG' if name=='ModelConfig' else d.get('scenarioId') or d['identity']+'|'+d['archetype']
        for k,v in d.items():source.append([name,key,k,json.dumps(v,ensure_ascii=True,allow_nan=False,separators=(',',':')),'typed JSON; integer amounts/bp where specified','FIXED' if k in ('SessionSharePct','SubscriptionSharePct','MoneyMinorPerINR','ScaleDenominator','ModelMonths','ModelNumericLimit') else 'PROPOSED_OR_SYNTHETIC','F5/F7 E planning; D seed assumptions, not actual accounts'])
def parse_source(text):
    rd=csv.DictReader(io.StringIO(text));assert rd.fieldnames==header,'INPUT_SCHEMA'
    seen=set();groups={}
    for d in rd:
        assert None not in d and set(d)==set(header),'INPUT_COLUMNS'
        key=(d['Sheet'],d['RowKey'],d['Field']);assert key not in seen,'DUPLICATE_SOURCE_FIELD';seen.add(key)
        assert d['Sheet'] in ('ModelConfig','WalletInputs','Scenarios','SessionInputs','SubscriptionInputs'),'UNKNOWN_INPUT_SHEET'
        groups.setdefault((d['Sheet'],d['RowKey']),{})[d['Field']]=strict_json(d['ValueJSON'])
    return groups
buf=io.StringIO(newline='');wr=csv.writer(buf);wr.writerow(header);wr.writerows(source);source_text=buf.getvalue();seed_groups=parse_source(source_text)
if cp.exists():source_text=cp.read_text(encoding='utf-8-sig')
groups=parse_source(source_text)
expected={('ModelConfig','CONFIG'):set(config)}
for name,rows in [('WalletInputs',wallets),('Scenarios',scenarios),('SessionInputs',sessions),('SubscriptionInputs',subscriptions)]:
    for d in rows:expected[(name,d.get('scenarioId') or d['identity']+'|'+d['archetype'])]=set(d)
assert set(groups)==set(expected) and all(set(groups[k])==expected[k] for k in expected),'COMPLETE_EXACT_SOURCE_SCHEMA'
assert all((name=='ModelConfig' and key=='CONFIG') or (name=='WalletInputs' and type(d['identity']) is str and type(d['archetype']) is str and d['identity']+'|'+d['archetype']==key) or (name in ('Scenarios','SessionInputs','SubscriptionInputs') and d['scenarioId']==key) for (name,key),d in groups.items()),'SOURCE_KEY_MISMATCH'
config=groups[('ModelConfig','CONFIG')]
wallets=[groups[('WalletInputs',w['identity']+'|'+w['archetype'])] for w in wallets]
scenarios=[groups[('Scenarios',s['scenarioId'])] for s in scenarios]
sessions=[groups[('SessionInputs',s['scenarioId'])] for s in sessions]
subscriptions=[groups[('SubscriptionInputs',s['scenarioId'])] for s in subscriptions]
input_hash=hashlib.sha256(source_text.encode('utf-8')).hexdigest();same_seed=groups==seed_groups
def config_status(c,money=False):
    if not all(integer(c[k],0,100) and c[k]==n for k,n in [('SessionSharePct',15),('SubscriptionSharePct',20)]):return 'FIXED_SHARE_VIOLATION' if money else 'INVALID_CONFIG'
    if not all(integer(c[k],0,INTER) and c[k]==n for k,n in [('MoneyMinorPerINR',100),('ScaleDenominator',10000),('ModelMonths',12),('ModelNumericLimit',LIMIT)]):return 'INVALID_CONFIG'
    if not integer(c['ActiveWeeksPerMonth'],0,52):return 'INVALID_CONFIG'
    if any(c[k] not in ('UNKNOWN','PROPOSED','APPROVED') for k in ('TaxPolicyState','ProviderPolicyState','AllocationPolicyState')) or c['OfficeRecalculationState']!='UNVERIFIED':return 'INVALID_CONFIG'
    return 'VALID'
def scenario_status(s):
    if s['scenarioId'] not in ('BASELINE','MORE_EARNING','LESS_SPENDING','COMBINED'):return 'INVALID_INPUT:SCENARIO'
    if not integer(s['scaleDenominator'],1,10000) or s['scaleDenominator']!=10000:return 'INVALID_INPUT:DENOMINATOR'
    return 'VALID' if all(integer(s[k],0,100000) for k in ('faucetScaleBp','sinkScaleBp')) else 'INVALID_INPUT'
def wallet_status(w,s,opening,c=config):
    if config_status(c)!='VALID':return config_status(c)
    if scenario_status(s)!='VALID':return scenario_status(s)
    if type(opening) is str and opening.startswith(('INVALID_','BLOCKED_','FIXED_')):return 'INVALID_INPUT:UPSTREAM'
    if w['identity'] not in ('Student','Mentor','Peer') or w['archetype'] not in ('Casual','Steady','Intensive'):return 'INVALID_INPUT:IDENTITY'
    if not all(integer(w[k]) for k in ('weeklyRequested','monthlySinkRequested','weeklyCap','balanceCap','openingUnits')) or not integer(w['activeWeeksPerMonth'],0,52) or not integer(opening):return 'INVALID_INPUT'
    if opening>w['balanceCap']:return 'INVALID_INPUT:OPENING_ABOVE_CAP'
    if w['weeklyRequested']*s['faucetScaleBp']>INTER or w['monthlySinkRequested']*s['sinkScaleBp']>INTER:return 'INVALID_INPUT:OVERFLOW'
    return 'VALID'
def wallet_step(w,s,opening,c=config):
    status=wallet_status(w,s,opening,c)
    if status!='VALID':return (status,)*5+(status,)
    O,R,S,C,B,W,f,t,D=map(int,[opening,w['weeklyRequested'],w['monthlySinkRequested'],w['weeklyCap'],w['balanceCap'],w['activeWeeksPerMonth'],s['faucetScaleBp'],s['sinkScaleBp'],s['scaleDenominator']])
    requested=min(C,R*f//D)*W;issued=max(0,min(B-O,requested));spent=min(O+issued,S*t//D);close=O+issued-spent
    assert 0<=close<=B and 0<=issued<=requested and 0<=spent<=O+issued and requested-issued>=0
    return requested,issued,spent,close,requested-issued,'VALID'
def session_status(s,c=config):
    status=config_status(c,True)
    if status!='VALID':return status
    if not integer(s['recognizedBasisMinor'],1,LIMIT):return 'INVALID_INPUT:DENOMINATOR' if integer(s['recognizedBasisMinor']) and s['recognizedBasisMinor']==0 else 'INVALID_INPUT'
    if not integer(s['gatewayRateBp'],0,100000) or not all(integer(s[k]) for k in ('gatewayFixedMinor','infrastructureMinor','supportMinor','riskMinor')):return 'INVALID_INPUT'
    if s['recognizedBasisMinor']*s['gatewayRateBp']+5000>INTER:return 'INVALID_INPUT:OVERFLOW'
    if s['costMode'] not in ('SYNTHETIC','ACTUAL') or any(s[k] not in ('UNKNOWN','PROPOSED','APPROVED') for k in ('taxState','providerState')):return 'INVALID_INPUT'
    if s['costMode']=='ACTUAL':return 'BLOCKED_POLICY:PROVIDER' if s['providerState']!='APPROVED' else 'BLOCKED_POLICY:TAX' if s['taxState']!='APPROVED' else 'BLOCKED_POLICY:SIGNED_POLICY_NOT_LOADED'
    return 'VALID'
def subscription_status(s,c=config):
    status=config_status(c,True)
    if status!='VALID':return status
    ids=s['eligibleCourseIds']
    if not integer(s['recognizedBasisMinor']) or type(ids) is not list or any(type(x) is not str or x not in {f'C-{n:02}' for n in range(1,11)} for x in ids):return 'INVALID_INPUT:COURSES'
    if len(ids)!=len(set(ids)):return 'INVALID_INPUT:DUPLICATE_COURSES'
    if not ids:return 'BLOCKED_POLICY:NO_BENEFICIARIES'
    if s['allocationMode']!='EQUAL_COURSE_CANDIDATE' or s['policyState'] not in ('PROPOSED','APPROVED'):return 'BLOCKED_POLICY:ALLOCATION'
    return 'VALID'
assert config_status(config)=='VALID' and len(wallets)==9 and len({(w['identity'],w['archetype']) for w in wallets})==9
assert all(scenario_status(s)=='VALID' for s in scenarios)
assert all(wallet_status(w,s,w['openingUnits'])=='VALID' for w in wallets for s in scenarios)
assert all(session_status(s) in ('VALID','BLOCKED_POLICY:PROVIDER','BLOCKED_POLICY:TAX','BLOCKED_POLICY:SIGNED_POLICY_NOT_LOADED') for s in sessions)
assert all(subscription_status(s) in ('VALID','BLOCKED_POLICY:NO_BENEFICIARIES','INVALID_INPUT:DUPLICATE_COURSES') for s in subscriptions)
checks=[];vectors=[]
def check(name,condition):
    assert condition,name
    checks.append([name,'expected condition true','true','PASS','CPython planning model',sys.version.split()[0],stamp])
def vector(target,value,expected,observed):
    check('guard '+target+' '+repr(value),observed==expected)
    vectors.append([f'GM-{len(vectors)+1:03}',target,type(value).__name__,repr(value),expected,observed,'EXECUTED_PYTHON_TYPED_MODEL; Office edit NOT_RUN'])
w0=seed_groups[('WalletInputs','Student|Casual')];s0=seed_groups[('Scenarios','BASELINE')]
for field in ('weeklyRequested','monthlySinkRequested','weeklyCap','balanceCap','openingUnits'):
    for bad in (-1,1.5,True,'10',None,float('nan'),float('inf')):
        w=dict(w0);w[field]=bad;vector('Wallet.'+field,bad,'INVALID_INPUT',wallet_status(w,s0,w['openingUnits']))
for bad in (-1,53,1.5,True,'4'):
    w=dict(w0);w['activeWeeksPerMonth']=bad;vector('Wallet.weeks',bad,'INVALID_INPUT',wallet_status(w,s0,0))
for bad in (0,-1,True,'10000',10001):
    s=dict(s0);s['scaleDenominator']=bad;vector('Scenario.denominator',bad,'INVALID_INPUT:DENOMINATOR',scenario_status(s))
vector('Wallet.openingAboveCap',2001,'INVALID_INPUT:OPENING_ABOVE_CAP',wallet_status(w0,s0,2001))
vector('Wallet.upstream','INVALID_INPUT','INVALID_INPUT:UPSTREAM',wallet_status(w0,s0,'INVALID_INPUT'))
for field,bad in [('SessionSharePct',14),('SubscriptionSharePct',19),('SessionSharePct','15'),('SubscriptionSharePct',True)]:
    c=dict(config);c[field]=bad;vector('Config.'+field,bad,'FIXED_SHARE_VIOLATION',session_status(sessions[0],c))
s=dict(seed_groups[('SessionInputs','S500')]);s['recognizedBasisMinor']=0;vector('Session.zeroQuote',0,'INVALID_INPUT:DENOMINATOR',session_status(s))
s=dict(seed_groups[('SessionInputs','S500')]);s['recognizedBasisMinor']=LIMIT;s['gatewayRateBp']=100000;vector('Session.intermediate',INTER+5000,'INVALID_INPUT:OVERFLOW',session_status(s))
vector('Session.actualProvider','UNKNOWN','BLOCKED_POLICY:PROVIDER',session_status(seed_groups[('SessionInputs','ACTUAL_BLOCKED')]))
vector('Subscription.zeroCourses',[],'BLOCKED_POLICY:NO_BENEFICIARIES',subscription_status(seed_groups[('SubscriptionInputs','NO_COURSES')]))
vector('Subscription.duplicateCourses',['C-01','C-01'],'INVALID_INPUT:DUPLICATE_COURSES',subscription_status(seed_groups[('SubscriptionInputs','DUP_COURSES')]))
for raw in ('NaN','Infinity','{"x":1,"x":2}','"2026-11-08"'):
    try:
        parsed=strict_json(raw);observed='INVALID_INPUT:JSON' if not integer(parsed) else 'VALID'
    except (ValueError,TypeError):observed='INVALID_INPUT:JSON'
    vector('JSON.units',raw,'INVALID_INPUT:JSON',observed)
check('valid zero scale and zero cap',wallet_step(dict(w0,weeklyCap=0),dict(s0,faucetScaleBp=0),0)[1]==0)
check('integral numeric not numeric text',integer(4.0) and not integer('4'))
config_rows=[['parameter','value','unit','state','decisionId']]+[[k,v,'paise/bp/units or typed state','FIXED' if k in ('SessionSharePct','SubscriptionSharePct','MoneyMinorPerINR','ScaleDenominator','ModelMonths','ModelNumericLimit') else 'PROPOSED/UNKNOWN','DEC-E-C04/C05/C06/C08/C11'] for k,v in config.items()]
cr={k:'ModelConfig!$B$'+str(i) for i,k in enumerate(config,2)}
def ig(ref,lo=0,hi=LIMIT):return f'AND(ISNUMBER({ref}),{ref}=INT({ref}),{ref}>={lo},{ref}<={hi})'
fixed='AND('+','.join(f'AND(ISNUMBER({cr[k]}),{cr[k]}={n})' for k,n in [('SessionSharePct',15),('SubscriptionSharePct',20)])+')'
config_guard='IFERROR(IF(AND('+fixed+','+','.join(f'AND(ISNUMBER({cr[k]}),{cr[k]}={n})' for k,n in [('MoneyMinorPerINR',100),('ScaleDenominator',10000),('ModelMonths',12),('ModelNumericLimit',LIMIT)])+','+ig(cr['ActiveWeeksPerMonth'],0,52)+','+','.join('OR('+','.join(f'{cr[k]}="{state}"' for state in ['UNKNOWN','PROPOSED','APPROVED'])+')' for k in ['TaxPolicyState','ProviderPolicyState','AllocationPolicyState'])+','+cr['OfficeRecalculationState']+'="UNVERIFIED"),"VALID","INVALID_CONFIG"),"INVALID_CONFIG")'
config_rows += [['ConfigGuard',F(config_guard,'VALID'),'state','FORMULA','recipe'],['FixedShareGuard',F(f'IFERROR(IF({fixed},"VALID","FIXED_SHARE_VIOLATION"),"FIXED_SHARE_VIOLATION")','VALID'),'state','FORMULA','user fixed shares']]
CG='ModelConfig!$B$13';FG='ModelConfig!$B$14'
wi=[wallet_keys+['inputStatus','pairKey']]
for rn,w in enumerate(wallets,2):
    pred='AND('+','.join(ig(f'{c}{rn}') for c in 'CDEFG')+','+ig(f'H{rn}',0,52)+f',G{rn}<=F{rn},OR(A{rn}="Student",A{rn}="Mentor",A{rn}="Peer"),OR(B{rn}="Casual",B{rn}="Steady",B{rn}="Intensive"),COUNTIFS($A$2:$A$10,A{rn},$B$2:$B$10,B{rn})=1)'
    wi.append([w[k] for k in wallet_keys]+[F(f'IFERROR(IF(AND({CG}="VALID",{pred}),"VALID","INVALID_INPUT"),"INVALID_INPUT")','VALID'),F(f'A{rn}&"|"&B{rn}',w['identity']+'|'+w['archetype'])])
sc=[list(scenarios[0])+['inputStatus']]
for rn,s in enumerate(scenarios,2):sc.append(list(s.values())+[F(f'IFERROR(IF(AND({ig("B"+str(rn),0,100000)},{ig("C"+str(rn),0,100000)},ISNUMBER(D{rn}),D{rn}=10000),"VALID","INVALID_INPUT:DENOMINATOR"),"INVALID_INPUT")','VALID')])
def lookup(sheet,column,key,keycol,last):return f'INDEX({sheet}!${column}$2:${column}${last},MATCH({key},{sheet}!${keycol}$2:${keycol}${last},0))'
def guarded(status,body):return f'IFERROR(IF({status}="VALID",{body},{status}),"INVALID_INPUT")'
def grid(stress):
    names=['identity','archetype','month','opening','weeklyRequested','weeklyCap','balanceCap','activeWeeks','faucetScaleBp','sinkScaleBp','scaleDenominator','monthlySinkRequested','requested','issued','spent','closing','unissuedAtCap','inputStatus','invariantStatus']
    rows=[(['scenarioId'] if stress else [])+names+['rowKey']];keymap={};year={};sources=scenarios if stress else [scenarios[0]]
    for s in sources:
        for w in wallets:
            opening=w['openingUnits'];totalissued=totalspent=totalunissued=0
            for month in range(1,13):
                rn=len(rows)+1;off=1 if stress else 0;letters=[chr(65+i+off) for i in range(19)];A,B,C,D,E,Gc,Bc,Wc,Fc,Sc,Dc,Mc,Rq,Iss,Sp,Cl,U,St,Inv=letters
                pair=f'{A}{rn}&"|"&{B}{rn}';sk=f'A{rn}' if stress else '"BASELINE"';key=(s['scenarioId'],w['identity'],w['archetype'],month)
                pkey=(s['scenarioId'],w['identity'],w['archetype'],month-1)
                op=lookup('WalletInputs','G',pair,'J',10) if month==1 else f'${Cl}${keymap[pkey]}'
                defs=[op,lookup('WalletInputs','C',pair,'J',10),lookup('WalletInputs','E',pair,'J',10),lookup('WalletInputs','F',pair,'J',10),lookup('WalletInputs','H',pair,'J',10),lookup('Scenarios','B',sk,'A',5),lookup('Scenarios','C',sk,'A',5),lookup('Scenarios','D',sk,'A',5),lookup('WalletInputs','D',pair,'J',10)]
                raw=[opening,w['weeklyRequested'],w['weeklyCap'],w['balanceCap'],w['activeWeeksPerMonth'],s['faucetScaleBp'],s['sinkScaleBp'],s['scaleDenominator'],w['monthlySinkRequested']]
                out=wallet_step(w,s,opening);requested,issued,spent,close,unissued,status=out
                pred='AND('+','.join(ig(f'{c}{rn}') for c in [D,E,Gc,Bc,Mc])+','+ig(f'{Wc}{rn}',0,52)+','+ig(f'{Fc}{rn}',0,100000)+','+ig(f'{Sc}{rn}',0,100000)+f',{Dc}{rn}=10000,{E}{rn}*{Fc}{rn}<={INTER},{Mc}{rn}*{Sc}{rn}<={INTER},'+lookup('WalletInputs','I',pair,'J',10)+'="VALID",'+lookup('Scenarios','E',sk,'A',5)+'="VALID")'
                stat=f'IFERROR(IF({CG}<>"VALID","INVALID_CONFIG",IF(NOT(ISNUMBER({D}{rn})),"INVALID_INPUT:UPSTREAM",IF({Dc}{rn}<>10000,"INVALID_INPUT:DENOMINATOR",IF({D}{rn}>{Bc}{rn},"INVALID_INPUT:OPENING_ABOVE_CAP",IF({pred},"VALID","INVALID_INPUT"))))),"INVALID_INPUT")'
                bodies=[f'MIN({Gc}{rn},INT({E}{rn}*{Fc}{rn}/{Dc}{rn}))*{Wc}{rn}',f'MAX(0,MIN({Bc}{rn}-{D}{rn},{Rq}{rn}))',f'MIN({D}{rn}+{Iss}{rn},INT({Mc}{rn}*{Sc}{rn}/{Dc}{rn}))',f'{D}{rn}+{Iss}{rn}-{Sp}{rn}',f'{Rq}{rn}-{Iss}{rn}']
                inv=f'IFERROR(IF({St}{rn}<>"VALID",{St}{rn},IF(AND({Cl}{rn}={D}{rn}+{Iss}{rn}-{Sp}{rn},{Cl}{rn}>=0,{Cl}{rn}<={Bc}{rn},{Iss}{rn}>=0,{Iss}{rn}<={Rq}{rn},{Sp}{rn}>=0,{Sp}{rn}<={D}{rn}+{Iss}{rn},{U}{rn}>=0),"VALID","INVARIANT_FAILED")),"INVALID_INPUT")'
                row=([s['scenarioId']] if stress else [])+[w['identity'],w['archetype'],month]+[F(t,v) for t,v in zip(defs,raw)]+[F(guarded(f'{St}{rn}',b),v) for b,v in zip(bodies,out[:5])]+[F(stat,status),F(inv,'VALID' if status=='VALID' else status),'|'.join(map(str,key))]
                rows.append(row);keymap[key]=rn;check(('stress ' if stress else 'baseline ')+'wallet '+str(key),status=='VALID' and close==opening+issued-spent and 0<=close<=w['balanceCap'])
                opening=close;totalissued+=issued;totalspent+=spent;totalunissued+=unissued
            year[(s['scenarioId'],w['identity'],w['archetype'])]=(opening,totalissued,totalspent,totalunissued)
    return rows,year
wb,baseline_year=grid(False);ws,stress_year=grid(True)
check('108 baseline rows',len(wb)==109);check('432 stress rows',len(ws)==433)
ye=[['scenarioId','identity','archetype','month12Closing','totalIssued','totalSpent','totalUnissued','rowStatus']]
for rn,(key,values) in enumerate(stress_year.items(),2):
    scid,identity,arch=key;criteria=f'WalletStress!$A$2:$A$433,A{rn},WalletStress!$B$2:$B$433,B{rn},WalletStress!$C$2:$C$433,C{rn}'
    status=f'IFERROR(IF(AND(COUNTIFS({criteria})=12,COUNTIFS({criteria},WalletStress!$S$2:$S$433,"VALID")=12,COUNTIFS({criteria},WalletStress!$T$2:$T$433,"VALID")=12),"VALID","INVALID_INPUT:UPSTREAM"),"INVALID_INPUT")'
    bodies=[lookup('WalletStress','Q',f'A{rn}&"|"&B{rn}&"|"&C{rn}&"|12"','U',433)]+[f'SUMIFS(WalletStress!${c}$2:${c}$433,{criteria})' for c in ['O','P','R']]
    ye.append(list(key)+[F(guarded(f'H{rn}',b),v) for b,v in zip(bodies,values)]+[F(status,'VALID')])
si=[list(sessions[0])];so=[['scenarioId','basisMinor','sessionSharePct','platformMinor','mentorObligationMinor','assumedCostsMinor','conditionalContributionMinor','contributionRatio','allInNetStatus','inputStatus']]
for rn,s in enumerate(sessions,2):
    si.append(list(s.values()));status=session_status(s);b=int(s['recognizedBasisMinor']);p=(15*b+50)//100;cost=(b*int(s['gatewayRateBp'])+5000)//10000+sum(int(s[k]) for k in ['gatewayFixedMinor','infrastructureMinor','supportMinor','riskMinor']);contrib=p-cost
    nr=[f'SessionInputs!{c}{rn}' for c in 'BCDEFG'];pred='AND('+','.join(ig(x,1 if i==0 else 0,100000 if i==1 else LIMIT) for i,x in enumerate(nr))+f',SessionInputs!B{rn}*SessionInputs!C{rn}+5000<={INTER},OR(SessionInputs!H{rn}="SYNTHETIC",SessionInputs!H{rn}="ACTUAL"))'
    st=f'IFERROR(IF({FG}<>"VALID","FIXED_SHARE_VIOLATION",IF({CG}<>"VALID","INVALID_CONFIG",IF(NOT({pred}),"INVALID_INPUT",IF(SessionInputs!H{rn}="ACTUAL",IF(SessionInputs!J{rn}<>"APPROVED","BLOCKED_POLICY:PROVIDER",IF(SessionInputs!I{rn}<>"APPROVED","BLOCKED_POLICY:TAX","BLOCKED_POLICY:SIGNED_POLICY_NOT_LOADED")),"VALID")))),"INVALID_INPUT")'
    bodies=[f'SessionInputs!B{rn}',cr['SessionSharePct'],f'INT(({cr["SessionSharePct"]}*B{rn}+50)/100)',f'B{rn}-D{rn}',f'INT((SessionInputs!B{rn}*SessionInputs!C{rn}+5000)/10000)+SUM(SessionInputs!D{rn}:G{rn})',f'D{rn}-F{rn}',f'G{rn}/B{rn}']
    vals=[b,15,p,b-p,cost,contrib,contrib/b];net='BLOCKED_POLICY:TAX' if s['taxState']!='APPROVED' else 'BLOCKED_POLICY:PROVIDER' if s['providerState']!='APPROVED' else 'BLOCKED_POLICY:UNMODELED_ACTUAL_TAX_AND_COSTS'
    so.append([s['scenarioId']]+[F(guarded(f'J{rn}',body),v if status=='VALID' else status) for body,v in zip(bodies,vals)]+[F(f'IF(J{rn}<>"VALID",J{rn},IF(SessionInputs!I{rn}<>"APPROVED","BLOCKED_POLICY:TAX",IF(SessionInputs!J{rn}<>"APPROVED","BLOCKED_POLICY:PROVIDER","BLOCKED_POLICY:UNMODELED_ACTUAL_TAX_AND_COSTS")))',net if status=='VALID' else status),F(st,status)])
    check('session conservation '+s['scenarioId'],p+(b-p)==b)
if same_seed:check('identical-input synthetic session contributions',[(cv(r[6])) for r in so[1:5]]==[2200,15200,34700,-4287])
elig=[['scenarioId','courseId','eligibilityState','inputStatus']];eligibleLast=1+sum(len(s['eligibleCourseIds']) for s in subscriptions)
for s in subscriptions:
    for cid in s['eligibleCourseIds']:
        rn=len(elig)+1;status='INVALID_INPUT:DUPLICATE_COURSES' if len(s['eligibleCourseIds'])!=len(set(s['eligibleCourseIds'])) else 'VALID'
        allowed='OR('+','.join(f'B{rn}="C-{n:02}"' for n in range(1,11))+')'
        formula=f'IFERROR(IF(OR(NOT(ISTEXT(B{rn})),LEN(B{rn})=0,NOT({allowed}),C{rn}<>"SYNTHETIC_ELIGIBLE"),"INVALID_INPUT:COURSES",IF(COUNTIFS($A$2:$A${eligibleLast},A{rn},$B$2:$B${eligibleLast},B{rn})<>1,"INVALID_INPUT:DUPLICATE_COURSES","VALID")),"INVALID_INPUT")'
        elig.append([s['scenarioId'],cid,'SYNTHETIC_ELIGIBLE',F(formula,status)])
subi=[list(subscriptions[0])];subo=[['scenarioId','basisMinor','subscriptionSharePct','platformMinor','mentorPoolMinor','courseCount','eachFloorMinor','remainderMinor','allocationStatus','inputStatus']]
for rn,s in enumerate(subscriptions,2):
    subi.append([s[k] if k!='eligibleCourseIds' else json.dumps(s[k],separators=(',',':')) for k in s]);status=subscription_status(s);b=int(s['recognizedBasisMinor']);p=(20*b+50)//100;pool=b-p;n=len(s['eligibleCourseIds']);each=pool//n if n else 0;rem=pool%n if n else 0
    cnt=f'COUNTIF(EligibleCourses!$A$2:$A${eligibleLast},A{rn})';dups=f'COUNTIFS(EligibleCourses!$A$2:$A${eligibleLast},A{rn},EligibleCourses!$D$2:$D${eligibleLast},"INVALID_INPUT:DUPLICATE_COURSES")'
    bad=f'COUNTIFS(EligibleCourses!$A$2:$A${eligibleLast},A{rn},EligibleCourses!$D$2:$D${eligibleLast},"<>VALID")'
    st=f'IFERROR(IF({FG}<>"VALID","FIXED_SHARE_VIOLATION",IF({CG}<>"VALID","INVALID_CONFIG",IF(NOT({ig("SubscriptionInputs!B"+str(rn))}),"INVALID_INPUT",IF({dups}>0,"INVALID_INPUT:DUPLICATE_COURSES",IF({bad}>0,"INVALID_INPUT:COURSES",IF({cnt}=0,"BLOCKED_POLICY:NO_BENEFICIARIES",IF(AND(SubscriptionInputs!D{rn}="EQUAL_COURSE_CANDIDATE",OR(SubscriptionInputs!E{rn}="PROPOSED",SubscriptionInputs!E{rn}="APPROVED")),"VALID","BLOCKED_POLICY:ALLOCATION"))))))),"INVALID_INPUT")'
    bodies=[f'SubscriptionInputs!B{rn}',cr['SubscriptionSharePct'],f'INT(({cr["SubscriptionSharePct"]}*B{rn}+50)/100)',f'B{rn}-D{rn}',cnt,f'INT(E{rn}/F{rn})',f'MOD(E{rn},F{rn})']
    subo.append([s['scenarioId']]+[F(guarded(f'J{rn}',body),v if status=='VALID' else status) for body,v in zip(bodies,[b,20,p,pool,n,each,rem])]+[F(f'IF(J{rn}="VALID","PROPOSED_EQUAL_COMPARISON_ONLY",J{rn})','PROPOSED_EQUAL_COMPARISON_ONLY' if status=='VALID' else status),F(st,status)])
    check('subscription nominal conservation '+s['scenarioId'],p+pool==b and (n==0 or each*n+rem==pool))
if same_seed:
    check('identical-input D baseline reference values',[v[0] for v in baseline_year.values()]==[960,840,240,720,1680,600,240,240,480])
    check('identical-input D combined reference values',[v[0] for k,v in stress_year.items() if k[0]=='COMBINED']==[1536,1800,1152,1056,2784,1920,480,1056,1104])
else:check('edited typed snapshot is explicitly not the D seed',groups!=seed_groups)
readme=[['key','value','evidenceStatus'],['schema','fp2.e.economy-model.v1','PROPOSED'],['generatedUTC',stamp,'ACTUAL_TIMESTAMP'],['inputSnapshotSHA256',input_hash,'DATA_INTEGRITY_ONLY'],['archetypes','nine synthetic identity/archetypes,108 baseline/432 stress months','NOT_PEOPLE_OR_FORECAST'],['editable','Numeric WalletInputs; Scenarios multipliers; numeric/config scenario assumptions; fixed key fields protected','PROPOSED'],['CSV','typed regeneration input snapshot; workbook edits do not auto-sync','NOT_SYNCHRONIZED'],['money','session15%,subscription20%, remaining80% separate; no actual approved base/tax/cost/allocation','UNKNOWN_POLICY'],['allInNet','always blocked; toggling approval text cannot load signed policy or omitted costs','NOT_COMPUTED'],['sort','Output sorting disabled; key/formula/source validation required before export','ENGINE_SORT_NOT_RUN'],['protection','accidental-edit barrier only; compare trusted expected formulas not an editable manifest','NOT_SECURITY'],['OfficeRecalculation','UNVERIFIED; cached values/XML/Python checks do not prove engine recalculation','NOT_RUN'],['dataLimit','date-formatted cells rejected by future importer; plain numeric date intent unknowable','LIMITATION'],['noExecutionAuthority','No application/provider/DB/import/migration/package/server/commit','PLAN_ONLY']]
check('input roundtrip exact keys',set(parse_source(source_text))==set(expected))
check('formula tamper digest distinction',hashlib.sha256(b'A1+1').hexdigest()!=hashlib.sha256(b'A1+2').hexdigest())
checks.append(['Office valid-edit/negative-input recalculation','actual selected engine evidence','NOT_RUN','NOT_RUN','UNVERIFIED','UNVERIFIED','UNVERIFIED'])
sheets={'Readme':readme,'ModelConfig':config_rows,'WalletInputs':wi,'Scenarios':sc,'WalletBaseline':wb,'WalletStress':ws,'YearEnd':ye,'SessionInputs':si,'SessionOutputs':so,'SubscriptionInputs':subi,'SubscriptionOutputs':subo,'EligibleCourses':elig,'GuardVectors':[['vectorId','targetField','injectedValueType','injectedValueText','expectedStatus','observedStatus','verificationKind']]+vectors,'Checks':[['assertionId','expected','observed','outcome','engineName','engineVersion','verifiedAt']]+checks}
def col(n):
    s=''
    while n:n,k=divmod(n-1,26);s=chr(65+k)+s
    return s
manifest=[]
for name,rows in sheets.items():
    for rn,row in enumerate(rows,1):
        for cn,v in enumerate(row,1):
            if isinstance(v,tuple) and v[0]=='FORMULA':manifest.append([name,col(cn)+str(rn),hashlib.sha256(v[1].encode()).hexdigest()])
sheets['FormulaManifest']=[['sheet','cell','sha256OfExactFormulaText']]+manifest
assert len(manifest)>0 and len(sheets)==15
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
editable={'ModelConfig':{'B'},'WalletInputs':set('CDEFGH'),'Scenarios':set('BC'),'SessionInputs':set('BCDEFGH'),'SubscriptionInputs':set('BD'),'EligibleCourses':{'B'}}
def sheet_xml(name,rows):
    width=max(map(len,rows));e=ET.Element('worksheet',xmlns=NS);ET.SubElement(e,'dimension',ref=f'A1:{col(width)}{len(rows)}');views=ET.SubElement(e,'sheetViews');v=ET.SubElement(views,'sheetView',workbookViewId='0');ET.SubElement(v,'pane',ySplit='1',topLeftCell='A2',activePane='bottomLeft',state='frozen');cs=ET.SubElement(e,'cols');ET.SubElement(cs,'col',min='1',max=str(width),width='22',customWidth='1');data=ET.SubElement(e,'sheetData')
    validations=[]
    for rn,row in enumerate(rows,1):
        er=ET.SubElement(data,'row',r=str(rn))
        for cn,value in enumerate(row,1):
            address=col(cn)+str(rn);formula=isinstance(value,tuple) and value[0]=='FORMULA';unlocked=rn>1 and col(cn) in editable.get(name,set()) and not formula
            ce=ET.SubElement(er,'c',r=address,s='1' if rn==1 else '2' if unlocked else '0')
            if formula:
                ET.SubElement(ce,'f').text=value[1];cache=value[2]
                if type(cache) is str:ce.set('t','str')
                else:assert type(cache) in (int,float) and math.isfinite(cache),'NONFINITE_CACHE'
                ET.SubElement(ce,'v').text=str(cache)
            elif type(value) in (int,float):
                assert math.isfinite(value);ET.SubElement(ce,'v').text=str(value)
                if unlocked:validations.append((address,ig(address,0,100000 if name=='Scenarios' or (name=='SessionInputs' and col(cn)=='C') else 52 if name=='WalletInputs' and col(cn)=='H' else LIMIT)))
            else:ce.set('t','inlineStr');ET.SubElement(ET.SubElement(ce,'is'),'t').text=str(value)
    ET.SubElement(e,'sheetProtection',sheet='1',objects='1',scenarios='1',sort='1',autoFilter='0',insertRows='1',deleteRows='1')
    ET.SubElement(e,'autoFilter',ref=f'A1:{col(width)}{len(rows)}')
    if validations:
        dvs=ET.SubElement(e,'dataValidations',count=str(len(validations)))
        for address,pred in validations:
            dv=ET.SubElement(dvs,'dataValidation',type='custom',allowBlank='0',showErrorMessage='1',errorStyle='stop',sqref=address,errorTitle='Invalid planning input',error='Use a finite nonnegative integer in the stated range; no text or boolean.')
            ET.SubElement(dv,'formula1').text=pred
    return ET.tostring(e,encoding='utf-8',xml_declaration=True)
style=f'<styleSheet xmlns="{NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf fontId="0" fillId="0" borderId="0" xfId="0" applyProtection="1"><alignment wrapText="1" vertical="top"/><protection locked="1"/></xf><xf fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyProtection="1"><alignment wrapText="1"/><protection locked="1"/></xf><xf fontId="0" fillId="0" borderId="0" xfId="0" applyProtection="1"><alignment wrapText="1" vertical="top"/><protection locked="0"/></xf></cellXfs></styleSheet>'
workbook=ET.Element('workbook',xmlns=NS);sv=ET.SubElement(workbook,'sheets');rels=ET.Element('Relationships',xmlns='http://schemas.openxmlformats.org/package/2006/relationships');ct=ET.Element('Types',xmlns='http://schemas.openxmlformats.org/package/2006/content-types')
ET.SubElement(ct,'Default',Extension='rels',ContentType='application/vnd.openxmlformats-package.relationships+xml');ET.SubElement(ct,'Default',Extension='xml',ContentType='application/xml');ET.SubElement(ct,'Override',PartName='/xl/workbook.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml');ET.SubElement(ct,'Override',PartName='/xl/styles.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml')
for i,name in enumerate(sheets,1):
    se=ET.SubElement(sv,'sheet',name=name,sheetId=str(i));se.set('{'+REL+'}id','rId'+str(i));ET.SubElement(rels,'Relationship',Id='rId'+str(i),Type=REL+'/worksheet',Target=f'worksheets/sheet{i}.xml');ET.SubElement(ct,'Override',PartName=f'/xl/worksheets/sheet{i}.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml')
ET.SubElement(rels,'Relationship',Id='styles',Type=REL+'/styles',Target='styles.xml');ET.SubElement(workbook,'calcPr',calcId='191029',calcMode='auto',fullCalcOnLoad='1',forceFullCalc='1');rr=ET.Element('Relationships',xmlns='http://schemas.openxmlformats.org/package/2006/relationships');ET.SubElement(rr,'Relationship',Id='workbook',Type=REL+'/officeDocument',Target='xl/workbook.xml')
parts={'[Content_Types].xml':ET.tostring(ct),'_rels/.rels':ET.tostring(rr),'xl/workbook.xml':ET.tostring(workbook),'xl/_rels/workbook.xml.rels':ET.tostring(rels),'xl/styles.xml':style.encode()}
for i,(name,rows) in enumerate(sheets.items(),1):parts[f'xl/worksheets/sheet{i}.xml']=sheet_xml(name,rows)
for data in parts.values():ET.fromstring(data)
def register_output(p,purpose,scope):
    assert p in (cp,xp) and p.is_file() and p.stat().st_size>0
    if p==xp:
        with zipfile.ZipFile(p) as z:
            assert z.testzip() is None
            for n in z.namelist():ET.fromstring(z.read(n))
        first='PK ZIP; all XML and CRC verified'
    else:
        text=p.read_text(encoding='utf-8-sig');parse_source(text);first=text.splitlines()[0]
        assert not any(0x1F000<=ord(c)<=0x1FAFF or 0x2600<=ord(c)<=0x27BF or ord(c) in (0xFE0F,0x200D) for c in text)
    rel=p.relative_to(root).as_posix();registry=root/'.agent/FILE_REGISTRY.md';old=registry.read_text(encoding='utf-8');row=f'| {rel} | {purpose} | FP2-E | verified {p.stat().st_size:,} bytes; {scope}; Office engine UNVERIFIED | {DATE} |'
    pattern=r'^\| '+re.escape(rel)+r' \|.*$';updated=re.sub(pattern,lambda m:row,old,flags=re.M) if re.search(pattern,old,re.M) else old.rstrip()+'\n'+row+'\n';registry.write_text(updated,encoding='utf-8')
    with (root/'.agent/SESSION_LOG.md').open('a',encoding='utf-8') as f:f.write(f'- {DATE} E generated/verified/registered {rel}; {p.stat().st_size:,} bytes; first {first}; {scope}. Planning only, Office/app/provider/legal verification not claimed.\n')
    print(json.dumps({'registered':rel,'bytes':p.stat().st_size,'first':first}))
if not cp.exists():
    with cp.open('x',encoding='utf-8',newline='') as f:f.write(source_text)
    register_output(cp,'Typed guarded E planning-model inputs','exact schema/JSON types; preserves nine-archetype synthetic assumptions')
with zipfile.ZipFile(xp,'x',zipfile.ZIP_DEFLATED) as z:
    for name,data in parts.items():z.writestr(name,data)
register_output(xp,'Guarded editable E planning workbook','15 sheets;108 baseline/432 stress months; typed guard/manifest snapshots, not Office recalculation')
print(json.dumps({'schema':'fp2.e.economy-model.v1','sheets':{k:len(v)-1 for k,v in sheets.items()},'totalDataRows':sum(len(v)-1 for v in sheets.values()),'inputFields':len(list(csv.DictReader(io.StringIO(source_text)))),'formulaCount':len(manifest),'pythonCheckCount':len(checks)-1,'guardVectors':len(vectors),'inputSHA256':input_hash,'baselineYearEnd':[[*k,v[0]] for k,v in baseline_year.items()],'combinedYearEnd':[[*k,v[0]] for k,v in stress_year.items() if k[0]=='COMBINED'],'sessionConditionalContributionMinor':[cv(r[6]) for r in so[1:]],'OfficeRecalculation':'UNVERIFIED','applicationProviderClaims':'NONE'},indent=2))
```

## 4. Verification and remaining work

The generator validates inputs and executes Python planning assertions before output writes. Those assertions and cached values are not independent engine results. After generation, independently reconstruct the typed CSV, recompute every baseline/stress month and separate integer money split with different arithmetic, validate formula references/digests/keys/expected counts/guards, check ZIP/XML/CRC and verify prior C2/D hashes unchanged. Do not describe a positive result until actual command output exists.

Actual Office editing/recalculation/rendering remains UNVERIFIED: choose a permitted already-installed engine, preserve the source workbook, demonstrate valid input dependency updates, then inject wrong types/negative/zero-denominator/share/unknown-policy/duplicate courses/formula tamper/upstream failures. No engine is installed or run by this task. The Checks engine row remains NOT_RUN. Data validation is bypassable; exact trusted schema/formula validation and a real engine test are separate requirements.

Record actual outcomes below after execution. The planning workbook's raw numeric outputs are not forecasts of inflation, marketplace liquidity, learning outcomes, staffing sustainability or mentor income. No final faucet/sink price, visible currency/badge/lore name, additional money flow, tax policy, course allocation or release membership is accepted by creating these artifacts.

## 5. Executed planning verification - 2026-11-08

- Canonical CSV31,923 bytes/179 typed fields; XLSX692,514 bytes/15 sheets. Actual ZIP CRC/XML and first-record checks passed and both artifacts were immediately registered/logged. Earlier C2/D outputs were not written by the generator's exclusive canonical output list.
- Independent streaming counted10,305 data rows, including8,965 FormulaManifest rows. ZIP/XML streaming avoided unavailable pandas/Parquet and created no cache/helper. Required108 baseline/432 stress months and36 year-end rows matched.
- Generator620 Python planning checks include540 repeated monthly steps and60 typed vectors; they are not620 independent product/security tests. Separate Fraction recomputation matched7,704 wallet/year-end numeric caches; Decimal recomputation matched52 money integer caches and4 ratios, total7,760. Three actual-mode/zero-course/duplicate-course rows remained explicitly blocked.
- Independent classification matched all60 recorded vector statuses. All8,965 formula digests/locked formula cells and86,304 bounded references passed structural checks; fixed15/20 guard links matched. This is not a full Office formula parser or editing/recalculation test.
- Post-generation recipe hardening separates canonical negative-test fixtures from edited input data, checks D golden values only for identical seed inputs, and derives eligible-course range bounds from the input list. Memory-only execution of the pre-output prefix matched all8,965 current workbook formula digests. A hypothetical weekly request41 and three-course SUB2 input produced year-end1008 and range-last-row24; canonical CSV/XLSX hashes remained unchanged. No registration/output-write portion executed for this diagnostic.
- Office engine/recalculation/render/import/sort remains UNVERIFIED and Checks keeps its engine row NOT_RUN. Unknown actual tax/provider/basis/allocation/safety/rights and any missing E/F instructions remain unresolved. These checks do not unlock an application, payout, public ranking, extra feature or policy.
