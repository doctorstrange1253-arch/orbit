# D synthetic model recipe and reproducibility

Date: 2026-11-07. Task: FP2-D. Trusted coordinator-authored planning/model document only.
[Skill: sn-da-excel-workflow]

This recipe imports only Python standard libraries under `python -I`, reads no application/environment content and writes only the D workbook/result CSV plus immediate registry/log records. It is not a downloaded script, application implementation or live financial test. Compile before execution. All modeled rates, caps, task bands, probabilities and price points are explicit synthetic assumptions; published Stream storage/delivery numbers retain their source-unit boundary. Taxes, full provider costs, currency confirmation and Office-engine recalculation remain UNKNOWN/UNVERIFIED.

The workbook contains editable scenario inputs and live formulas; formulas are unprotected and must not be overwritten. Mandatory session/subscription share guards reject changing 15%/20%. CSV is a recorded run snapshot, not synchronized from later workbook edits. Re-running this trusted model regenerates synthetic outputs, so do not overwrite user edits without choosing a preserved input source. No charts/macros/external workbook links are created.

```python
import pathlib,csv,json,math,zipfile,re,copy,xml.etree.ElementTree as ET
root=pathlib.Path('D:/orbit-main/orbit-main');base=root/'docs/plan/v2';model=base/'models'
outputs={model/'thinking-simulations.xlsx',model/'thinking-simulation-results.csv'}
def register_output(p,purpose,scope):
    assert p in outputs and p.is_file() and p.stat().st_size>0
    if p.suffix=='.xlsx':
        with zipfile.ZipFile(p) as z:
            assert z.testzip() is None
            for n in z.namelist():ET.fromstring(z.read(n))
        first='ZIP/XML verified'
    else:
        text=p.read_text(encoding='utf-8');first=text.splitlines()[0]
        assert not any(0x1F000<=ord(c)<=0x1FAFF or 0x2600<=ord(c)<=0x27BF or ord(c) in (0xFE0F,0x200D) for c in text)
    rel=p.relative_to(root).as_posix();rp=root/'.agent/FILE_REGISTRY.md';t=rp.read_text(encoding='utf-8')
    row=f'| {rel} | {purpose} | FP2-D | verified {p.stat().st_size:,} bytes; {scope}; synthetic, Office engine UNVERIFIED | 2026-11-07 |'
    pat=r'^\| '+re.escape(rel)+r' \|.*$'
    t=re.sub(pat,lambda m:row,t,flags=re.M) if re.search(pat,t,re.M) else t.rstrip()+'\n'+row+'\n'
    rp.write_text(t,encoding='utf-8')
    with (root/'.agent/SESSION_LOG.md').open('a',encoding='utf-8') as f:f.write(f'- 2026-11-07 D generated/verified/registered {rel}; {p.stat().st_size:,} bytes; first record {first}; {scope}. Synthetic planning only, no application/financial operation.\n')
    print(json.dumps({'registered':rel,'bytes':p.stat().st_size,'first':first}))
inputs=[('Prior1',1),('Prior2',1),('Prior3',2),('Prior4',9),('Prior5',7),('RatingHalfLifeDays',180),('RatingRisk',1.2815515655),('WeightQ',35),('WeightE',30),('WeightR',15),('WeightP',10),('WeightT',5),('WeightF',5),('MentorWeekCap',400),('StudentFamilyCap',24),('StudentWeekCap',300),('StudentCourseCap',80),('WeeksPerMonth',4),('SessionShare',.15),('SubscriptionShare',.20),('SyntheticGatewayRate',.02),('SyntheticGatewayFixedINR',5),('SyntheticSessionInfraINR',8),('SyntheticSupportINR',20),('SyntheticRiskINR',10),('PublishedCapacityUnits',5),('PublishedCapacityMinutes',1000),('PublishedDeliveryUnits',1),('PublishedDeliveryMinutes',1000),('RetentionMonths',12),('RecordingMbps',4),('LocalFreeDecimalMB',256),('StopReserveSeconds',30),('ExtraMediaCosts','UNKNOWN'),('Taxes','UNKNOWN'),('StudentFaucetWeekCap',100),('MentorFaucetWeekCap',150),('PeerFaucetWeekCap',75),('StudentBalanceCap',2000),('MentorBalanceCap',3000),('PeerBalanceCap',1500),('FaucetScale',1),('SinkScale',1)]
ival=dict(inputs);iref={k:f'Inputs!$B${n}' for n,(k,v) in enumerate(inputs,2)}
F=lambda text,value:('FORMULA',text,value)
result=[];tests=[]
def record(domain,case,metric,value,unit='synthetic units',assumption='Illustrative input, not measured outcome'):
    result.append([domain,case,metric,value,unit,assumption])
def check(name,condition):
    assert condition,name
    tests.append([name,'PASS','Executed abstract/numeric model only, not application test'])
pri=[ival['Prior'+str(k)] for k in range(1,6)]
def rating(hist,age=0,scale=1,risk=None):
    w=2**(-age/ival['RatingHalfLifeDays']);a=[scale*p+w*n for p,n in zip(pri,hist)];A=sum(a);mu=sum((k+1)*v for k,v in enumerate(a))/A
    var=max(0,(sum((k+1)**2*v for k,v in enumerate(a))/A-mu**2)/(A+1));L=max(1,min(5,mu-(ival['RatingRisk'] if risk is None else risk)*math.sqrt(var))) if sum(hist) else 'UNRATED'
    return w,A,mu,var,L
rating_cases=[('Single perfect',[0,0,0,0,1],0),('Established 4.7',[1,2,7,66,224],0),('Five perfect',[0,0,0,0,5],0),('Mixed',[5,5,10,30,50],0),('Low stable',[50,25,15,5,5],0),('Established aged',[1,2,7,66,224],360),('Unrated',[0,0,0,0,0],0)]
ratings=[['Case','n1','n2','n3','n4','n5','AgeDays','Weight','EvidenceMass','PosteriorMass','Mean','Variance','LowerProxy','RawMean']]
pref=[iref['Prior'+str(k)] for k in range(1,6)];pm='+'.join(pref);pm1='+'.join(f'{k}*{pref[k-1]}' for k in range(1,6));pm2='+'.join(f'{k*k}*{pref[k-1]}' for k in range(1,6))
for rn,(name,h,age) in enumerate(rating_cases,2):
    w,A,mu,var,L=rating(h,age);raw=sum((k+1)*n for k,n in enumerate(h))/sum(h) if sum(h) else 'UNRATED'
    ratings.append([name]+h+[age,F(f'IFERROR(POWER(2,-G{rn}/{iref["RatingHalfLifeDays"]}),"INVALID_INPUT")',w),F(f'SUM(B{rn}:F{rn})*H{rn}',sum(h)*w),F(f'{pm}+I{rn}',A),F(f'IFERROR((SUMPRODUCT(B{rn}:F{rn},{{1,2,3,4,5}})*H{rn}+{pm1})/J{rn},"INVALID_INPUT")',mu),F(f'IFERROR(MAX(0,(SUMPRODUCT(B{rn}:F{rn},{{1,4,9,16,25}})*H{rn}+{pm2})/J{rn}-K{rn}^2)/(J{rn}+1),"INVALID_INPUT")',var),F(f'IF(SUM(B{rn}:F{rn})=0,"UNRATED",IFERROR(MAX(1,MIN(5,K{rn}-{iref["RatingRisk"]}*SQRT(L{rn}))),"INVALID_INPUT"))',L),F(f'IFERROR(SUMPRODUCT(B{rn}:F{rn},{{1,2,3,4,5}})/SUM(B{rn}:F{rn}),"UNRATED")',raw)])
    record('F2',name,'lower proxy',L,'stars');record('F2',name,'posterior mean',mu,'stars')
check('300 raw mean exactly 4.7',sum((k+1)*v for k,v in enumerate(rating_cases[1][1]))==1410)
check('Established beats single perfect',rating(rating_cases[1][1])[4]>rating(rating_cases[0][1])[4])
check('No public prior-only rating',rating([0]*5)[4]=='UNRATED')
rsens=[['Case','PriorScale','ExtraAgeDays','RiskScale','PosteriorMass','Mean','Variance','LowerProxy']]
for n,(name,h,age) in enumerate(rating_cases,2):
    for label,sc,extra,rsc in [('Baseline',1,0,1),('Half prior',.5,0,1),('Double risk',1,0,2),('Older evidence',1,180,1)]:
        rn=len(rsens)+1;w,A,mu,var,L=rating(h,age+extra,sc,ival['RatingRisk']*rsc);wh=f'POWER(2,-(Ratings!G{n}+C{rn})/{iref["RatingHalfLifeDays"]})'
        rsens.append([name+' / '+label,sc,extra,rsc,F(f'({pm})*B{rn}+SUM(Ratings!B{n}:F{n})*{wh}',A),F(f'IFERROR(((SUMPRODUCT(Ratings!B{n}:F{n},{{1,2,3,4,5}})*{wh})+({pm1})*B{rn})/E{rn},"INVALID_INPUT")',mu),F(f'IFERROR(MAX(0,((SUMPRODUCT(Ratings!B{n}:F{n},{{1,4,9,16,25}})*{wh})+({pm2})*B{rn})/E{rn}-F{rn}^2)/(E{rn}+1),"INVALID_INPUT")',var),F(f'IF(SUM(Ratings!B{n}:F{n})=0,"UNRATED",IFERROR(MAX(1,MIN(5,F{rn}-{iref["RatingRisk"]}*D{rn}*SQRT(G{rn}))),"INVALID_INPUT"))',L)])
        record('F2 sensitivity',name+' / '+label,'lower proxy',L,'stars')
weights=[35,30,15,10,5,5];wk=['WeightQ','WeightE','WeightR','WeightP','WeightT','WeightF']
mentor_examples=[('Established',[.91,.9,.9,.8,.9,.2]),('Specialist',[.85,1,.75,.9,.7,.5]),('New qualified',[.5,.9,2/3,.5,1,1])]
mentors=[['Case','Q','E','R','P','T','F','Score']]
def mscore(v):return 100*sum(a*b for a,b in zip(v,weights))/sum(weights)
def score_formula(rn):
    body='+'.join(f'{chr(66+k)}{rn}*{iref[wk[k]]}' for k in range(6));den='+'.join(iref[k] for k in wk)
    return f'IFERROR(IF(AND(COUNT(B{rn}:G{rn})=6,MIN(B{rn}:G{rn})>=0,MAX(B{rn}:G{rn})<=1,({den})>0),100*({body})/({den}),"INVALID_INPUT"),"INVALID_INPUT")'
for rn,(name,v) in enumerate(mentor_examples,2):mentors.append([name]+v+[F(score_formula(rn),mscore(v))]);record('F1',name,'allocation score',mscore(v),'0-100')
check('Mentor component weights sum 100',sum(weights)==100)
alloc=[['Population','MentorID','Q','E','R','P','T','F','Score','Primary','FirstFallback']];asummary=[['QualifiedPopulation','PrimarySize','FirstFallbackSize','TotalPossibleRecipients','InitialInvitations']]
for N in [3,15,80]:
    pop=[]
    for i in range(N):
        v=[.5,.9,2/3,.5,1,1] if i==0 else [.80+.01*(i%10),.80+.02*(i%8),.75+.01*(i%9),.65+.02*(i%10),.7+.02*(i%8),1/(2+i%7)]
        pop.append((f'M-{i:03}',v,mscore(v)))
    sortedpop=sorted(pop,key=lambda p:(-p[2],-p[1][1],p[0]));ps=min(N,max(1,math.ceil(N/30)),3);primary=[p[0] for p in sortedpop[:ps]]
    if ps>=2 and sortedpop[0][2]-pop[0][2]<=20:primary[-1]=pop[0][0]
    fallback=[p[0] for p in sortedpop if p[0] not in primary][:min(5,N-ps)]
    check(f'Allocation {N}: distinct primary/fallback',len(set(primary+fallback))==len(primary)+len(fallback))
    check(f'Allocation {N}: bounded primary',len(primary)==ps)
    check(f'Allocation {N}: qualified fit only',all(v[1]>=.6 for _,v,_ in pop))
    lo=len(alloc)+1;hi=lo+N-1
    for mid,v,s in pop:
        rn=len(alloc)+1;body='+'.join(f'{chr(67+k)}{rn}*{iref[wk[k]]}' for k in range(6));den='+'.join(iref[k] for k in wk)
        alloc.append([N,mid]+v+[F(f'IFERROR(100*({body})/({den}),"INVALID_INPUT")',s),int(mid in primary),int(mid in fallback)])
    rn=len(asummary)+1;asummary.append([N,F(f'MIN(A{rn},MAX(1,ROUNDUP(A{rn}/30,0)),3)',ps),F(f'MIN(5,A{rn}-B{rn})',len(fallback)),N,F(f'B{rn}+C{rn}',ps+len(fallback))])
    record('F1 population',str(N),'primary size',ps,'mentors');record('F1 population',str(N),'first fallback',len(fallback),'mentors')
class Flare:
    def __init__(self,offers,expiry):self.offers=set(offers);self.expiry=expiry;self.owner=None;self.receipts={}
    def accept(self,actor,now,key):
        if key in self.receipts:return self.receipts[key]
        if actor not in self.offers:out='NOT_OFFERED'
        elif self.owner is not None:out='ALREADY_CLAIMED'
        elif now>=self.expiry:out='EXPIRED'
        else:self.owner=actor;out='CLAIMED'
        self.receipts[key]=out;return out
for order in [('a','b'),('b','a')]:
    fl=Flare(['a','b'],20);out=[fl.accept(x,1,x) for x in order];check('Serialized concurrent order '+''.join(order),out.count('CLAIMED')==1)
fl=Flare(['a'],20);check('Claim original success',fl.accept('a',1,'same')=='CLAIMED');check('Claim retry after deadline returns receipt',fl.accept('a',25,'same')=='CLAIMED')
check('Expired new accept rejected',Flare(['a'],20).accept('a',20,'new')=='EXPIRED');check('Nonoffered actor rejected',Flare(['a'],20).accept('b',1,'new')=='NOT_OFFERED')
league=[['Case','Publications','Outcomes','Milestones','Resolutions','Patterns','CappedWeekPoints','Prev1','Prev2','Prev3','Standing','InternalTier']]
for rn,(name,counts,previous) in enumerate([('New contributor',[1,0,0,1,0],[0,0,0]),('Steady',[3,2,3,4,2],[260,240,220]),('Category overload',[20,20,20,20,20],[400,400,400]),('Rest week',[0,0,0,0,0],[400,400,400]),('Four inactive weeks',[0,0,0,0,0],[0,0,0])],2):
    point=min(ival['MentorWeekCap'],sum(min(n*r,c) for n,r,c in zip(counts,[30,40,20,10,10],[120,160,80,60,40])));standing=(point+.7*previous[0]+.49*previous[1]+.343*previous[2])/2.533;tier=min(4,int(standing//100))
    league.append([name]+counts+[F(f'MIN({iref["MentorWeekCap"]},MIN(B{rn}*30,120)+MIN(C{rn}*40,160)+MIN(D{rn}*20,80)+MIN(E{rn}*10,60)+MIN(F{rn}*10,40))',point)]+previous+[F(f'(G{rn}+.7*H{rn}+.49*I{rn}+.343*J{rn})/2.533',standing),F(f'MIN(4,INT(K{rn}/100))',tier)])
    record('F3',name,'week points',point,'points');record('F3',name,'standing',standing,'points')
check('Mentor overload reaches corrected global 400 cap',league[3][7-1][2]==400)
student=[['Case','Accuracy','ChanceBaseline','Difficulty','PreviousBest','NormalizedQuality','TaskValue','IncrementalCredit']]
student_cases=[('At chance',.25,.25,1,0),('Standard partial',.8,.25,1,0),('Hard partial',.8,.25,1.2,0),('Improved retake',.8,.25,1.2,15),('Repeated retake',.8,.25,1.2,18),('Easy perfect',1,.25,.8,0),('Standard perfect',1,.25,1,0),('Hard perfect',1,.25,1.2,0)]
for rn,(name,p,g,d,old) in enumerate(student_cases,2):
    C=max(0,min(1,(p-g)/(1-g)));V=min(24,math.floor(20*d*C+.5));delta=max(0,V-old)
    student.append([name,p,g,d,old,F(f'IFERROR(IF(AND(B{rn}>=0,B{rn}<=1,C{rn}>=0,C{rn}<1),MAX(0,MIN(1,(B{rn}-C{rn})/(1-C{rn}))),"INVALID_INPUT"),"INVALID_INPUT")',C),F(f'IFERROR(MIN({iref["StudentFamilyCap"]},ROUND(20*D{rn}*F{rn},0)),"INVALID_INPUT")',V),F(f'IFERROR(MAX(0,G{rn}-E{rn}),"INVALID_INPUT")',delta)])
    record('F4',name,'incremental credit',delta,'points')
check('Chance earns zero',student[1][7][2]==0);check('Unchanged retake earns zero',student[5][7][2]==0);check('Improvement only delta',student[4][7][2]==3)
student_week=[['Case','RawFamilyPoints','CoursesContributing','EligibleCompletion','EligibleTransfer','EligibleReview','FamilyAfterCourseCaps','WeekPoints']]
for rn,(name,families,courses,completion,transfer,review) in enumerate([('One easy course grind',320,1,80,80,80),('Diverse hard practice',288,4,60,90,50),('Private light practice',35,1,20,0,10)],2):
    family=min(200,families,courses*80);points=min(300,family+min(40,completion)+min(60,transfer)+min(40,review))
    student_week.append([name,families,courses,completion,transfer,review,F(f'MIN(200,B{rn},C{rn}*{iref["StudentCourseCap"]})',family),F(f'MIN({iref["StudentWeekCap"]},G{rn}+MIN(40,D{rn})+MIN(60,E{rn})+MIN(40,F{rn}))',points)])
    check('Student course/week caps '+name,family<=200 and family<=courses*80 and points<=300);record('F4 weekly',name,'weekly points',points,'points')
cohort=[['Case','QualifiedCohortSize','Score','TopCut','BottomCut','FirstCycleProtected','DistinctFamilies','Movement']]
for rn,(name,N,s,top,bottom,protected,qualified) in enumerate([('Small cohort',8,90,80,20,0,3),('First cycle',15,10,80,20,1,3),('Shared tie',15,50,50,50,0,3),('Qualified high',15,90,80,20,0,3),('Qualified low',15,10,80,20,0,3),('Insufficient families',15,90,80,20,0,2)],2):
    move='UNRANKED' if N<10 or qualified<3 else 'PROTECTED' if protected else 'NO_MOVE' if top<=bottom else 'UP' if s>=top else 'DOWN' if s<=bottom else 'KEEP'
    cohort.append([name,N,s,top,bottom,protected,qualified,F(f'IF(OR(B{rn}<10,G{rn}<3),"UNRANKED",IF(F{rn}=1,"PROTECTED",IF(D{rn}<=E{rn},"NO_MOVE",IF(C{rn}>=D{rn},"UP",IF(C{rn}<=E{rn},"DOWN","KEEP")))))',move)])
    record('F4 cohort',name,'proposed movement',move,'state')
check('Small cohort no ranked movement',cohort[1][7][2]=='UNRANKED');check('First cycle protection',cohort[2][7][2]=='PROTECTED');check('Shared-cut tie no artificial movement',cohort[3][7][2]=='NO_MOVE')
wallet_inputs=[('Student','Casual',40,80,100,2000),('Student','Steady',80,250,100,2000),('Student','Intensive',120,380,100,2000),('Mentor','Casual',25,40,150,3000),('Mentor','Steady',75,160,150,3000),('Mentor','Intensive',180,550,150,3000),('Peer','Casual',15,40,75,1500),('Peer','Steady',45,160,75,1500),('Peer','Intensive',90,260,75,1500)]
wallets=[['Identity','Archetype','Month','WeeklyRequested','MonthlyRequestedSink','Opening','WeeklyCap','BalanceCap','ActiveWeeks','Issued','Spent','Closing','UnissuedAtCap']]
for identity,arch,rate,sink,cap,balcap in wallet_inputs:
    opening=0
    for month in range(1,13):
        rn=len(wallets)+1;requested=min(cap,math.floor(rate*ival['FaucetScale']))*4;issued=min(max(0,balcap-opening),requested);spent=min(opening+issued,math.floor(sink*ival['SinkScale']));close=opening+issued-spent
        op=F(f'L{rn-1}',opening) if month>1 else 0
        wallets.append([identity,arch,month,rate,sink,op,F(iref[identity+'FaucetWeekCap'],cap),F(iref[identity+'BalanceCap'],balcap),F(iref['WeeksPerMonth'],4),F(f'IFERROR(MAX(0,MIN(H{rn}-F{rn},MIN(G{rn},INT(D{rn}*{iref["FaucetScale"]}))*I{rn})),"INVALID_INPUT")',issued),F(f'IFERROR(MAX(0,MIN(F{rn}+J{rn},INT(E{rn}*{iref["SinkScale"]}))),"INVALID_INPUT")',spent),F(f'IFERROR(F{rn}+J{rn}-K{rn},"INVALID_INPUT")',close),F(f'MAX(0,MIN(G{rn},INT(D{rn}*{iref["FaucetScale"]}))*I{rn}-J{rn})',requested-issued)])
        check(f'Wallet nonnegative/cap {identity}-{arch}-{month}',0<=close<=balcap)
        record('F5 monthly',identity+'/'+arch+'/'+str(month),'closing balance',close,identity+' virtual units');opening=close
wsens=[['Identity','Archetype','Scenario','FaucetScale','SinkScale','Month','WeeklyRequested','MonthlySinkRequested','WeeklyCap','BalanceCap','Opening','Issued','Spent','Closing']]
wsummary=[]
for identity,arch,rate,sink,cap,balcap in wallet_inputs:
    for label,fs,ss in [('Baseline',1,1),('More earning',1.2,1),('Less optional spending',1,.8),('Combined stress',1.2,.8)]:
        opening=0
        for month in range(1,13):
            rn=len(wsens)+1;issued=min(balcap-opening,min(cap,math.floor(rate*fs))*4);spent=min(opening+issued,math.floor(sink*ss));close=opening+issued-spent;op=F(f'N{rn-1}',opening) if month>1 else 0
            wsens.append([identity,arch,label,fs,ss,month,rate,sink,F(iref[identity+'FaucetWeekCap'],cap),F(iref[identity+'BalanceCap'],balcap),op,F(f'MAX(0,MIN(J{rn}-K{rn},MIN(I{rn},INT(G{rn}*D{rn}))*{iref["WeeksPerMonth"]}))',issued),F(f'MAX(0,MIN(K{rn}+L{rn},INT(H{rn}*E{rn})))',spent),F(f'K{rn}+L{rn}-M{rn}',close)])
            check(f'Wallet stress cap {identity}-{arch}-{label}-{month}',0<=close<=balcap);opening=close
        wsummary.append([identity,arch,label,close]);record('F5 sensitivity',identity+'/'+arch+'/'+label,'year-end balance',close,identity+' virtual units')
class Ledger:
    def __init__(self):self.bal={};self.ops=set();self.sources=set()
    def post(self,op,source,asset,debit,credit,amount,fail=False):
        if op in self.ops or (asset,source) in self.sources:return 'DUPLICATE'
        if type(amount) is not int or amount<=0 or debit==credit:return 'INVALID'
        key=(asset,debit)
        if debit!='ISSUANCE' and self.bal.get(key,0)<amount:return 'INSUFFICIENT'
        staged=self.bal.copy();staged[key]=staged.get(key,0)-amount;ck=(asset,credit);staged[ck]=staged.get(ck,0)+amount
        assert sum(v for (a,k),v in staged.items() if a==asset)==sum(v for (a,k),v in self.bal.items() if a==asset)
        if fail:return 'FAILED_BEFORE_COMMIT'
        self.bal=staged;self.ops.add(op);self.sources.add((asset,source));return 'POSTED'
ledger=Ledger();check('Authorized synthetic issuance',ledger.post('a','source1','Student','ISSUANCE','u',100)=='POSTED');snapshot=copy.deepcopy(ledger.bal)
check('Semantic retry different operation',ledger.post('b','source1','Student','ISSUANCE','u',100)=='DUPLICATE' and ledger.bal==snapshot)
check('Invalid noninteger amount',ledger.post('c','source2','Student','u','v',1.5)=='INVALID')
check('Synthetic crash commits neither leg',ledger.post('c','source2','Student','u','v',50,True)=='FAILED_BEFORE_COMMIT' and ledger.bal==snapshot)
check('Two-leg transfer posts',ledger.post('c','source2','Student','u','v',50)=='POSTED')
check('Same transfer cannot repeat',ledger.post('d','source2','Student','u','v',50)=='DUPLICATE')
check('Different assets not mixed',ledger.post('e','source3','Mentor','u','v',50)=='INSUFFICIENT')
check('Spent reward cannot silently reverse',ledger.post('f','reverse1','Student','u','ISSUANCE',100)=='INSUFFICIENT')
check('Unspent part reversal additive',ledger.post('g','reverse2','Student','v','ISSUANCE',50)=='POSTED')
check('Virtual ledger conservation',sum(ledger.bal.values())==0)
sessions=[['Case','GrossMinorINR','PlatformMinor','MentorObligationMinor','GatewayMinorAssumed','InfraMinorAssumed','SupportMinorAssumed','RiskMinorAssumed','PlatformContributionMinor','ContributionRate','TaxStatus']]
for rn,gross in enumerate([50000,150000,300000,101],2):
    share=math.floor(gross*.15+.5);mentor=gross-share;gateway=math.floor(gross*.02+.5)+500;infra=800;support=2000;risk=1000;contrib=share-gateway-infra-support-risk
    sessions.append(['Synthetic '+str(gross/100),gross,F(f'IF({iref["SessionShare"]}=.15,ROUND(B{rn}*{iref["SessionShare"]},0),"FIXED_SHARE_VIOLATION")',share),F(f'IFERROR(B{rn}-C{rn},"INVALID_INPUT")',mentor),F(f'ROUND(B{rn}*{iref["SyntheticGatewayRate"]},0)+ROUND(100*{iref["SyntheticGatewayFixedINR"]},0)',gateway),F(f'ROUND(100*{iref["SyntheticSessionInfraINR"]},0)',infra),F(f'ROUND(100*{iref["SyntheticSupportINR"]},0)',support),F(f'ROUND(100*{iref["SyntheticRiskINR"]},0)',risk),F(f'IFERROR(C{rn}-E{rn}-F{rn}-G{rn}-H{rn},"INVALID_INPUT")',contrib),F(f'IFERROR(I{rn}/B{rn},"INVALID_INPUT")',contrib/gross),'UNKNOWN; not an all-in tax/net model'])
    check('Session share conservation '+str(gross),share+mentor==gross);record('F7',str(gross/100),'platform contribution before unknown tax',contrib/100,'synthetic INR');record('F7',str(gross/100),'mentor obligation',mentor/100,'synthetic INR')
check('Low minor-unit boundary can have negative contribution',sessions[-1][8][2]<0)
for gross in [1,101,50000,150000,300000]:
    platform=math.floor(gross*.15+.5);mentor=gross-platform;check('Full pre-payout refund reverses conserved '+str(gross),gross-platform-mentor==0)
subscription=[['Case','RecognizedBasisMinorINR','EnrolledCourseSeats','PlatformMinor','MentorPoolMinor','PerCourseMinor','RemainderMinor','AllocationState']]
for rn,(gross,seats) in enumerate([(100000,2),(100000,5),(100000,10),(101,3)],2):
    platform=math.floor(gross*.2+.5);pool=gross-platform;each=pool//seats;remainder=pool%seats
    subscription.append(['Synthetic enrolled-course split',gross,seats,F(f'IF({iref["SubscriptionShare"]}=.20,ROUND(B{rn}*{iref["SubscriptionShare"]},0),"FIXED_SHARE_VIOLATION")',platform),F(f'IFERROR(B{rn}-D{rn},"INVALID_INPUT")',pool),F(f'IFERROR(INT(E{rn}/C{rn}),"INVALID_INPUT")',each),F(f'IFERROR(MOD(E{rn},C{rn}),"INVALID_INPUT")',remainder),'Equal enrolled-course comparison only; final method/base UNKNOWN'])
    check('Subscription split conserves '+str(seats)+'/'+str(gross),platform+each*seats+remainder==gross);record('Subscription',str(gross)+'/'+str(seats),'mentor pool',pool,'synthetic INR minor units')
media=[['Case','MonthlyNewMinutes','RetentionMonths','RetainedMinutes','CapacityBlocks','StorageMonthlyUnits','ViewerHours','DeliveredMinutes','DeliveryUnits','PublishedMeterSubtotal','PerNewHourSubtotal','AllInCost']]
for rn,(minutes,viewhours) in enumerate([(60,10),(600,100),(6000,1000)],2):
    retained=minutes*12;blocks=math.ceil(retained/1000);storage=blocks*5;delivered=viewhours*60;delivery=delivered/1000;subtotal=storage+delivery
    media.append(['Synthetic workload; published-dollar meter units',minutes,F(iref['RetentionMonths'],12),F(f'B{rn}*C{rn}',retained),F(f'IFERROR(ROUNDUP(D{rn}/{iref["PublishedCapacityMinutes"]},0),"INVALID_INPUT")',blocks),F(f'E{rn}*{iref["PublishedCapacityUnits"]}',storage),viewhours,F(f'G{rn}*60',delivered),F(f'H{rn}/{iref["PublishedDeliveryMinutes"]}*{iref["PublishedDeliveryUnits"]}',delivery),F(f'F{rn}+I{rn}',subtotal),F(f'IFERROR(J{rn}/(B{rn}/60),"INVALID_INPUT")',subtotal/(minutes/60)),F(f'IF(ISNUMBER({iref["ExtraMediaCosts"]}),J{rn}+{iref["ExtraMediaCosts"]},"UNKNOWN")','UNKNOWN')])
    record('F6',str(minutes),'published-meter subtotal per new hour',subtotal/(minutes/60),'published-dollar units; ISO/extra costs unconfirmed')
check('Capacity prepaid quantum, not fractional storage',media[1][4][2]==1 and media[2][4][2]==8)
clock=[['Case','SourceStartSec','SourceEndSec','OutputStartSec','OutputEndSec','LengthSec']]
segments=[(0,40),(60,100)];offset=0
for rn,(start,end) in enumerate(segments,2):
    length=end-start;clock.append(['Kept edit segment',start,end,offset,F(f'D{rn}+C{rn}-B{rn}',offset+length),F(f'C{rn}-B{rn}',length)]);offset+=length
mapping=lambda source:next((out+(source-start) for start,end,out in [(0,40,0),(60,100,40)] if start<=source<end),None)
check('Trim maps source checkpoint 70 to output 50',mapping(70)==50);check('Removed checkpoint 50 unavailable',mapping(50) is None);check('Output duration equals kept intervals',offset==80)
record('F6 clock','source 70','mapped output timestamp',mapping(70),'seconds');record('F6 clock','source 50','removed anchor','UNAVAILABLE','state')
recovery=[['Case','FreeDecimalMB','BitrateMbps','ReserveSec','EstimatedBufferedSec','UsableSec','Guarantee']]
estimate=256*8/4;usable=max(0,estimate-30);recovery.append(['Synthetic raw-byte budget',F(iref['LocalFreeDecimalMB'],256),F(iref['RecordingMbps'],4),F(iref['StopReserveSeconds'],30),F('IFERROR(B2*8/C2,"INVALID_INPUT")',estimate),F('IFERROR(MAX(0,E2-D2),"INVALID_INPUT")',usable),'Not measured durable storage/quota guarantee'])
record('F6 recovery','256 decimal MB / 4 Mbps','usable raw-buffer estimate',usable,'seconds');check('Buffer estimate arithmetic',usable==482)
check('12 months times 9 identity/archetypes',len(wallets)-1==108);check('4 sensitivity scenarios times 108 months',len(wsens)-1==432);check('3/15/80 allocation rows',len(alloc)-1==98)
readme=[['D synthetic simulations','PROPOSED assumptions, not approved policy or app readiness'],['Input edits','Inputs and scenario cells; formulas unprotected, no CSV auto-sync'],['Money','15% session / 20% subscription fixed-share guards; no tax/applicability approval'],['Evidence','Rating prior/half-life/risk, difficulty/caps/archetypes/rates are synthetic proposals'],['Published meter','Stream 5/1000 capacity and 1/1000 delivery as published dollar units; ISO/extra costs UNKNOWN'],['Allocation flags','Scenario primary/fallback membership is a run snapshot; score formulas live, changes require rerun/review'],['Scope','Abstract serialized claims/atomic ledger assertions do not prove database concurrency/recovery'],['Office engine','UNVERIFIED; ZIP/XML/cache/numeric checks only'],['No execution authority','No application code/import, provider/DB transaction, install, server or commit']]
inputrows=[['Parameter','Value','Status / meaning']]+[[k,v,'Fixed user share' if k in ['SessionShare','SubscriptionShare'] else 'Published source units, not all-in quote' if k.startswith('Published') else 'Synthetic editable assumption / unknown'] for k,v in inputs]
sheets={'Readme':readme,'Inputs':inputrows,'Ratings':ratings,'RatingSensitivity':rsens,'MentorExamples':mentors,'Allocation':alloc,'AllocationSummary':asummary,'MentorLeague':league,'StudentTasks':student,'StudentWeekCaps':student_week,'CohortCases':cohort,'Wallets12Month':wallets,'WalletSensitivity':wsens,'Sessions':sessions,'Subscription':subscription,'MediaMeters':media,'EditClock':clock,'BufferBudget':recovery,'Checks':[['Check','Outcome','Scope']]+tests}
cp=model/'thinking-simulation-results.csv'
with cp.open('w',encoding='utf-8',newline='') as f:
    wr=csv.writer(f);wr.writerow(['Domain','Case','Metric','Value','Unit','Assumption']);wr.writerows(result)
register_output(cp,'Recorded D synthetic model results','ratings/allocation/progression/108 wallet months/sensitivities/economics/media clocks')
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main';REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('',NS)
def col(n):
    s=''
    while n:n,x=divmod(n-1,26);s=chr(65+x)+s
    return s
def sheet(rows):
    e=ET.Element('worksheet',xmlns=NS);ET.SubElement(e,'dimension',ref=f'A1:{col(max(map(len,rows)))}{len(rows)}');views=ET.SubElement(e,'sheetViews');v=ET.SubElement(views,'sheetView',workbookViewId='0');ET.SubElement(v,'pane',ySplit='1',topLeftCell='A2',activePane='bottomLeft',state='frozen')
    cols=ET.SubElement(e,'cols');ET.SubElement(cols,'col',min='1',max=str(max(map(len,rows))),width='24',customWidth='1');sd=ET.SubElement(e,'sheetData')
    for rn,row in enumerate(rows,1):
        er=ET.SubElement(sd,'row',r=str(rn))
        for cn,val in enumerate(row,1):
            c=ET.SubElement(er,'c',r=col(cn)+str(rn),s='1' if rn==1 else '0')
            if isinstance(val,tuple) and val[0]=='FORMULA':
                ET.SubElement(c,'f').text=val[1];cached=val[2]
                if isinstance(cached,str):c.set('t','str')
                ET.SubElement(c,'v').text=str(cached)
            elif isinstance(val,(int,float)):ET.SubElement(c,'v').text=str(val)
            else:c.set('t','inlineStr');ET.SubElement(ET.SubElement(c,'is'),'t').text=str(val)
    return ET.tostring(e,encoding='utf-8',xml_declaration=True)
style=f'''<styleSheet xmlns="{NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" fillId="0" borderId="0" xfId="0"><alignment wrapText="1" vertical="top"/></xf><xf fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment wrapText="1"/></xf></cellXfs></styleSheet>'''
wb=ET.Element('workbook',xmlns=NS);sv=ET.SubElement(wb,'sheets');rels=ET.Element('Relationships',xmlns='http://schemas.openxmlformats.org/package/2006/relationships');ct=ET.Element('Types',xmlns='http://schemas.openxmlformats.org/package/2006/content-types')
ET.SubElement(ct,'Default',Extension='rels',ContentType='application/vnd.openxmlformats-package.relationships+xml');ET.SubElement(ct,'Default',Extension='xml',ContentType='application/xml');ET.SubElement(ct,'Override',PartName='/xl/workbook.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml');ET.SubElement(ct,'Override',PartName='/xl/styles.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml')
for i,name in enumerate(sheets,1):
    se=ET.SubElement(sv,'sheet',name=name,sheetId=str(i));se.set('{'+REL+'}id','rId'+str(i));ET.SubElement(rels,'Relationship',Id='rId'+str(i),Type=REL+'/worksheet',Target=f'worksheets/sheet{i}.xml');ET.SubElement(ct,'Override',PartName=f'/xl/worksheets/sheet{i}.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml')
ET.SubElement(rels,'Relationship',Id='styles',Type=REL+'/styles',Target='styles.xml');ET.SubElement(wb,'calcPr',calcId='191029',calcMode='auto',fullCalcOnLoad='1',forceFullCalc='1');rr=ET.Element('Relationships',xmlns='http://schemas.openxmlformats.org/package/2006/relationships');ET.SubElement(rr,'Relationship',Id='workbook',Type=REL+'/officeDocument',Target='xl/workbook.xml')
xp=model/'thinking-simulations.xlsx'
with zipfile.ZipFile(xp,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml',ET.tostring(ct));z.writestr('_rels/.rels',ET.tostring(rr));z.writestr('xl/workbook.xml',ET.tostring(wb));z.writestr('xl/_rels/workbook.xml.rels',ET.tostring(rels));z.writestr('xl/styles.xml',style)
    for i,(name,rows) in enumerate(sheets.items(),1):z.writestr(f'xl/worksheets/sheet{i}.xml',sheet(rows))
register_output(xp,'Editable D synthetic simulations workbook',f'{len(sheets)} sheets; rating/progression/claim/ledger/numeric checks; no Office recalculation')
print(json.dumps({'sheets':{k:len(v) for k,v in sheets.items()},'csvRows':len(result),'assertions':len(tests),'singlePerfectLower':rating(rating_cases[0][1])[4],'established47Lower':rating(rating_cases[1][1])[4],'mentorExamples':[(n,mscore(v)) for n,v in mentor_examples],'allocationSummary':[(r[0],r[1][2],r[2][2]) for r in asummary[1:]],'walletYearEnd':[(r[0],r[1],r[11][2]) for r in wallets[1:] if r[2]==12],'sensitivityYearEnd':wsummary,'sessionContributionsINR':[(r[1]/100,r[8][2]/100) for r in sessions[1:]],'mediaPerNewHourPublishedUnits':[r[10][2] for r in media[1:]],'zipXml':'PASS','officeEngine':'UNVERIFIED','runtimeFinancialClaims':'NONE'},indent=2))
```

Input discipline: numeric dimensions/amounts must be finite and in their stated ranges; only nonnegative integer counts/minor units and positive valid denominators are meaningful. Formula IFERROR guards expose arithmetic failures but do not certify full spreadsheet data validation; invalid negative/wrong-type scenario edits must be rejected/reviewed rather than accepted as policy. Allocation recipient flags and abstract test outcomes are run snapshots, not live recomputed policy from score edits. Inspect the independent verification before any completion claim.

## Executed verification record

The corrected generator produced nineteen sheets, 240 CSV rows, 3,817 formulas and 601 abstract/numeric assertions (including 540 repeated wallet month cap/nonnegative steps). Initial mentor-cap assertion exposed draft arithmetic 460 versus claimed 560; proposed global cap corrected to 400 and prior-week bounds kept consistent. No outputs were written by that failed first run. The later corrected generation passed ZIP/XML and registered each output immediately.

Independent checks were split into bounded read-only commands after a long verifier shell failed before Python execution (E56). Separate Fraction/Decimal recomputation matched 275 rating/allocation/mentor caches, 3,486 student/wallet caches and 78 money/media/clock caches: 3,839 numeric comparisons total. Recorded 601 Checks rows, shared-share guards, formula parentheses/string structure, nineteen sheets and 240 CSV rows were checked. This does not claim full spreadsheet parser/negative-input validation, Office-engine recalculation/rendered review, real-world independence, legal/effect validation or application/provider/DB behavior. Scripts imported only standard libraries under -I; no app or credential access.

