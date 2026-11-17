# Feature Lab model reproducibility

Date: 2026-11-07. Task: FP2-C2. Planning/model documentation only.
[Skill: sn-da-excel-workflow]

This trusted coordinator-authored recipe creates only C2 planning artifacts. It uses Python standard libraries, not application imports, downloaded scripts or packages. Initial data preparation reads three returned reports plus explicitly authored coordinator proposals; later model generation reads the preserved CSV. Names/scores/portfolio are proposals, not verified impacts or approved implementation.

The workbook has editable scores/weights, an uncompensated ethics filter, four priority scenarios and eighteen one-weight perturbations. Score, rank, sensitivity overlap and shortlist robustness cells contain live formulas; Python supplies initial expected caches. Actual Excel/LibreOffice engine recalculation is NOT verified. No macros, external workbook links or formulas interpreted from candidate text are written. Formulas are unprotected: edit dimension/weight inputs, not formula cells. The Shortlist sheet is the fixed curated proposal; changing its membership requires deliberate review/regeneration, not an automatic scope choice.

Every generated output is verified and registered/logged immediately before the next is written. On regeneration, the CSV supplies data; only the workbook and its registry/log evidence are updated. No charts or rendered workbook review are claimed.

Initial preparation expects the preserved workflow journal and the initial seed ledger. Once CSV exists it is the regeneration input. The source-key prefix prevents identical PACK IDs from colliding across returned packages. This is not evidence that the failed M or stopped critic returned.

```python
import csv,json,re,pathlib,zipfile,xml.etree.ElementTree as ET
root=pathlib.Path('D:/orbit-main/orbit-main')
base=root/'docs/plan/v2'
model=base/'models'
keys=['learner','retention','mentor','margin','differentiation','feasibility','safety','theme','reuse']
weights=[[25,15,15,10,12,10,7,3,3],[35,18,12,5,5,10,10,2,3],[20,10,10,20,5,20,10,2,3],[20,12,10,8,25,10,8,5,2]]
scenario_names=['Baseline','Learning first','Small team margin','Distinctive safe']
assert all(sum(w)==100 for w in weights)
selected={1,2,3,7,12,16,23,24,42,49,53,54,56,57,59,60,66,69,73,79,80,83,87,90,93}
fullcards={1,2,3,12,23,42,49,59,66,73,79,80,87,90}
wow={12,42,56,73,90}
w1={2,3,7,23,24,54,57,66,69,79,80}
w2={1,12,16,42,49,59,60,73,83,87}
merged={8:54,15:69,18:59,20:66,21:59,22:54,29:12,30:12,32:12,36:56,38:3,41:56,43:69,44:87,45:73,46:42,47:54,48:64,51:89,71:79,72:60,84:90,91:66,95:79}
foundation={19,37,55,68,70,74,96}
headers=['ID','Origin','SourceKey','Title','Identity','Ethics','RawEthics','Disposition']+keys+['EthicsScore','Effort','Lenses','EvidenceRefs','EvidenceClass','SeedRefs','Mechanic','Minimum','Signature','Guardrail','Reuse','ScoreReason','CoreOverlap','MergeTarget','Shortlist','Wave','Wow','FullCard','Score100','Eligible','Rank']
cp=model/'feature-lab-candidates.csv'
def register_output(p,purpose,check):
    allowed={cp,model/'feature-lab-scorecard.xlsx',base/'feature-ideas.md'}
    assert p in allowed and p.is_file() and p.stat().st_size>0
    raw=p.read_bytes()
    if p.suffix=='.xlsx':
        assert raw[:2]==b'PK'
        with zipfile.ZipFile(p) as z:
            assert z.testzip() is None
            for entry in z.namelist():ET.fromstring(z.read(entry))
        first='ZIP/XML verified'
    else:
        text=raw.decode('utf-8');first=text.splitlines()[0]
        assert not any(0x1F000<=ord(c)<=0x1FAFF or 0x2600<=ord(c)<=0x27BF or ord(c) in (0xFE0F,0x200D) for c in text)
        if p.suffix=='.md':assert len(text.splitlines())<600
    rel=p.relative_to(root).as_posix()
    registry=root/'.agent/FILE_REGISTRY.md';t=registry.read_text(encoding='utf-8')
    row=f'| {rel} | {purpose} | FP2-C2 | verified {len(raw):,} bytes; {check}; office engine UNVERIFIED | 2026-11-07 |'
    pattern=r'^\| '+re.escape(rel)+r' \|.*$'
    if re.search(pattern,t,re.M):t=re.sub(pattern,lambda m:row,t,flags=re.M)
    else:t=t.rstrip()+'\n'+row+'\n'
    registry.write_text(t,encoding='utf-8')
    with (root/'.agent/SESSION_LOG.md').open('a',encoding='utf-8') as f:f.write(f'- 2026-11-07 C2 output: {rel}; {len(raw):,} bytes; first record {first}; {check}. Verified and registered immediately; proposals only.\n')
    print(json.dumps({'registered':rel,'bytes':len(raw),'first':first}))
if not cp.exists():
    jp=pathlib.Path('C:/Users/Dell/.claude/projects/d--orbit-main/394f740f-07c7-4a14-b38c-634684a4dc94/subagents/workflows/wf_94258761-4bb/journal.jsonl')
    reports={}
    for line in jp.read_text(encoding='utf-8').splitlines():
        q=json.loads(line)
        if q.get('type')=='result' and q.get('result'):
            z=json.loads(q['result']) if isinstance(q['result'],str) else q['result']
            if isinstance(z,dict) and isinstance(z.get('ideas'),list):reports[z['packageId']]=z
    assert set(reports)=={'L','W','P'}
    ideas=[]
    for pack in ['L','W','P']:
        assert len(reports[pack]['ideas'])==24
        for v in reports[pack]['ideas']:
            ideas.append(dict(v,origin='Returned '+pack,sourceKey=pack+':'+str(v['localId'])))
    authored=[
    ('Outline Evidence Ballot','Multi','Test an outline before production.','Learners attempt one draft task; mentor changes scope from evidence, not popularity.','A03 A04 D06','P-023 P-033','PASS','M',[4,4,5,3,5,3,4,4,5]),
    ('Opportunity Scope Receipt','Mentor','Inspect actual demand commitment.','Separate interest, ownership and enrollment through a freshness receipt.','A01 A06 A07','P-032 P-033','PASS','M',[3,3,4,3,3,4,4,4,5]),
    ('Coauthor Rights Draft','Mentor','Inspect rights before co-creation.','Preview contribution/version rights without changing revenue shares.','A05 B12','P-023','REVIEW','L',[3,3,4,3,4,2,2,3,4]),
    ('Cash Pledge Proposal','Student','Evaluate production pledges.','Defer all cash flows until funding, refunds, fairness and law are approved.','A02','P-003','REVIEW','XL',[2,2,3,3,2,1,1,2,2]),
    ('Earned Peer Help Bounties','Peer','Evaluate bounded noncash support.','Help rewards never buy ratings, ranks or unfair learning outcomes.','A10 D01 D05','P-001','REVIEW','L',[3,3,3,2,3,2,2,3,3]),
    ('Outcome Guarantee Proposal','Mentor','Evaluate quality remedies honestly.','Defer guarantees until attribution, funding, refunds and abuse rules are approved.','A11','P-004','REVIEW','XL',[4,3,4,2,3,1,1,3,3]),
    ('Mentor Next Fix','Mentor','Choose one useful course repair.','Aggregate evidence creates a repair experiment, not a public quality score.','B01 B02','P-026 P-029','PASS','M',[5,4,5,4,4,3,4,4,5]),
    ('Earnings Explain','Mentor','Understand an earnings number.','Separate ledger facts from assumptions; sessions 15% and subscriptions 20% never mix.','B03 B04','P-025 P-028','PASS','S',[3,4,5,4,3,4,5,3,5]),
    ('Evidence Storefront','Mentor','Show delivered work with scope.','Pair course versions with permissioned evidence, not unsupported status.','B05','P-027 P-030','PASS','M',[3,3,4,3,4,3,4,4,4]),
    ('Capability Passport Proposal','Mentor','Separate identity and capability.','Evidence and assurance have distinct scope and revocation status.','B06','P-027','REVIEW','L',[3,3,4,3,3,2,2,3,3]),
    ('Mentor Apprentice Clinic','Multi','Improve one teaching draft.','An adult apprentice revises after bounded feedback; no automatic rank or role.','B07 D03','P-023 P-026','PASS','M',[4,4,5,3,4,3,4,4,5]),
    ('Launch Change Log','Mentor','Announce actual changes.','Opt-in version digests distinguish published changes from promises.','B08 B09','P-032','PASS','S',[3,4,4,3,3,4,4,3,5]),
    ('Async Office Hours Queue','Multi','Resolve recurring doubts asynchronously.','Attempted-step questions become reusable mentor answers before live extensions.','B10 D04','P-001 P-026','PASS','M',[4,4,5,3,4,3,4,3,5]),
    ('Live Guest Round Proposal','Mentor','Evaluate guest teaching.','Defer live branches until room, moderation, rights and consent contracts work.','B11 B12','P-029','REVIEW','L',[3,3,4,3,4,1,2,3,3]),
    ('Teaching Pattern Library','Multi','Reuse explanations with their limits.','Templates preserve assumptions, counterexamples, provenance and reviewed revisions.','B13 D02','P-010 P-026','PASS','M',[4,4,5,3,5,3,4,4,5]),
    ('Transcript Claim Draft Proposal','Mentor','Evaluate grounded drafts.','Require real authorized anchors, abstention and confirmed human review before automation.','B14','P-004','REVIEW','XL',[4,3,4,2,4,1,2,4,3]),
    ('Attribution Claim Review','Multi','Discuss sources before accusations.','Authors explain claim/source changes before permissioned human review and appeal.','B15 F03','P-004','PASS','M',[4,3,4,3,4,3,4,3,4]),
    ('Learner Safe Course Refit','Multi','Update without erasing context.','Preview affected work and versioned paths; preserve earlier attempts, never force regrading.','B16 A08 A09','P-004 P-016','PASS','L',[5,4,5,4,5,2,4,5,4]),
    ('Mentor Support Capsule','Mentor','Explain an issue once.','Approved context follows accountable owners without copying all private work.','B17','P-001 P-023','PASS','M',[4,4,4,3,3,4,4,3,5]),
    ('Teaching Commons Proposal','Mentor','Evaluate a maintained community.','Threads conclude in reviewed artifacts, not unmoderated endless feeds.','B18','P-029','REVIEW','L',[3,3,4,2,3,2,3,4,4]),
    ('Demand Portfolio Coverage','Mentor','Avoid catalog-volume certainty.','Own results and demand gaps form an uncertainty-marked map, never an earnings promise.','A01 B01','P-028 P-030','PASS','M',[4,4,5,4,4,3,4,5,5]),
    ('Review Rotation','Peer','Share bounded review work.','Volunteers rotate through drafts with provenance, decline rights and no rank rewards.','D02 B07','P-026 P-027','PASS','M',[4,3,4,2,4,3,4,4,5]),
    ('Repair Impact Receipt','Mentor','Close the improvement loop.','Published fixes retain version evidence and optional follow-up, not demanded praise.','B02 B09','P-026 P-029','PASS','M',[4,4,5,3,4,3,4,4,5]),
    ('Publish Permission Preflight','Mentor','Inspect required media permissions.','Ownership checks are mandatory studio foundations, not paid status.','B15','P-023','PASS','S',[3,3,4,3,2,4,5,3,5])]
    for n,(title,actor,pitch,mechanic,seeds,refs,ethics,effort,score) in enumerate(authored,1):
        ideas.append(dict(localId=f'M-{n:02}',workingTitle=title,identity=actor,pitch=pitch,distinctiveMechanic=mechanic,lenses=[1,2,6,7],evidenceRefs=refs.split(),evidenceClass='REPORTED_PAIN',seedRefs=seeds.split(),minimumSlice='Owner-scoped manual/readonly minimum; no new cash, live or minor-policy branch.',signatureMoment='A source-linked state change is visible with skip and static equivalent.',reuse='Extend canonical contracts after authority/privacy prerequisites.',guardrail='No bought standing, pressure, guarantees or changed money shares; decisions remain proposals.',ethics=ethics,effort=effort,provisionalScores=dict(zip(keys,score)),scoreReason='Editorial job/supply/reuse hypothesis; unknown operations and validation costs are penalized.',coreOverlap='Additional workflow value; mandatory repairs excluded.',origin='Coordinator M',sourceKey=f'M:M-{n:02}'))
    assert len(ideas)==96
    data=[]
    for n,v in enumerate(ideas,1):
        ethics=v['ethics'];sc=dict(v['provisionalScores']);title=v['workingTitle'];guard=v['guardrail']
        if n==49:
            title='Cohort Question Quilt';ethics='PASS';sc['safety']=4
            guard='Proposed minimum: consented adult cohort; mentor-written aggregate only, no drilldown/free-text export; suppress below ten contributors. Not anonymity/compliance certification; minors/live deferred.'
        if n==31:title='Course Closure Quilt'
        assert all(type(sc[k]) is int and 1<=sc[k]<=5 for k in keys)
        disp='MERGED' if n in merged else 'FOUNDATION' if n in foundation else 'CANONICAL'
        d=dict(ID=f'X-{n:03}',Origin=v['origin'],SourceKey=v['sourceKey'],Title=title,Identity=v['identity'],Ethics=ethics,RawEthics=v['ethics'],Disposition=disp,EthicsScore=5 if ethics=='PASS' and sc['safety']==5 else 4 if ethics=='PASS' else 3 if ethics=='REVIEW' else 1,Effort=v['effort'],Lenses=';'.join(map(str,v['lenses'])),EvidenceRefs=';'.join(v['evidenceRefs']),EvidenceClass=v['evidenceClass'],SeedRefs=';'.join(v['seedRefs']),Mechanic=v['distinctiveMechanic'],Minimum=v['minimumSlice'],Signature=v['signatureMoment'],Guardrail=guard,Reuse=v['reuse'],ScoreReason=v.get('scoreReason',''),CoreOverlap=v.get('coreOverlap',''),MergeTarget=f'X-{merged[n]:03}' if n in merged else '',Shortlist=int(n in selected),Wave=1 if n in w1 else 2 if n in w2 else 3 if n in selected else 0,Wow=int(n in wow),FullCard=int(n in fullcards))
        d.update(sc);data.append(d)
    def score(d,w):return 25*(sum(float(d[k])*x for k,x in zip(keys,w))/sum(w)-1)
    eligible=lambda d:d['Disposition']=='CANONICAL' and d['Ethics']=='PASS'
    ranked=sorted(filter(eligible,data),key=lambda d:(-score(d,weights[0]),-d['learner'],-d['feasibility'],d['ID']))
    rank={d['ID']:i for i,d in enumerate(ranked,1)}
    old=(base/'feature-ideas.md').read_text(encoding='utf-8')
    seeds={m[1]:m[2].strip() for m in re.finditer(r'^\| ([A-H]\d{2}) \| ([^|]+) \| [LMPW] \| PENDING \|',old,re.M)}
    assert len(seeds)==86
    with cp.open('w',encoding='utf-8',newline='') as f:
        wr=csv.DictWriter(f,fieldnames=headers);wr.writeheader()
        for d in data:
            d.update(Score100=round(score(d,weights[0]),6),Eligible=int(eligible(d)),Rank=rank.get(d['ID'],''));wr.writerow(d)
    register_output(cp,'Raw scored candidates, provenance and proposed portfolio','96 rows; nine integer score columns; separate ethics')
    manual={'A01':[74,93],'A02':[76],'A03':[73],'A04':[73],'A05':[75],'A06':[74],'A07':[74],'A08':[90],'A09':[90],'A10':[77],'A11':[78],'B01':[79,93],'B02':[79],'B03':[80],'B04':[80],'B05':[81],'B06':[82],'B07':[83],'B08':[90],'B09':[79,90],'B10':[85],'B11':[86],'B12':[75,86],'B13':[87],'B14':[88],'B15':[89],'B16':[90],'B17':[66],'B18':[92],'D01':[77],'D02':[87,94],'D03':[83],'D04':[85],'D05':[77],'D06':[73]}
    reasons={e['seedId']:e.get('reason','') for r in reports.values() for e in r.get('seedEvaluations',[])}
    esc=lambda s:str(s).replace('|','\\|').replace('\n',' ')
    out=['# Feature ideas and seed-evaluation ledger','','Date: 2026-11-07. Task: FP2-C2. Coordinator synthesis complete; every name/selection is PROPOSED.','[Skill: brainstorming] [Skill: sn-da-excel-workflow]','','96 raw proposals comprise 72 returned L/W/P ideas plus 24 coordinator-authored M ideas. Mentor pass failed and critic was stopped; no independent completion is invented. Package-prefixed SourceKey resolves colliding PACK IDs.','','Semantic merges and mandatory foundations do not receive extra slots. '+str(sum(d['Disposition']=='CANONICAL' for d in data))+' canonical concepts remain, including review/deferred ideas. Proposed portfolio: 25; full cards: 14; wow: five. Scores are hypotheses, not measured effects or legal/trademark clearance.','','Data: [CSV](models/feature-lab-candidates.csv), [editable workbook](models/feature-lab-scorecard.xlsx), [rubric](feature-lab.md).','','## Raw idea record','','| ID / origin | Working title and mechanic | Evidence / lenses | Score / ethics / effort | Disposition |','|---|---|---|---|---|']
    for d in data:
        decision='MERGE '+d['MergeTarget'] if d['Disposition']=='MERGED' else 'CORE FOUNDATION' if d['Disposition']=='FOUNDATION' else 'PROPOSE W'+str(d['Wave']) if d['Shortlist'] else 'DEFER/REVIEW' if d['Ethics']!='PASS' else 'EVALUATE'
        out.append('| '+d['ID']+' / '+d['Origin']+' | '+esc(d['Title']+': '+d['Mechanic'])+' | '+esc(d['EvidenceRefs'] or 'JOB/SEED HYPOTHESIS')+'; '+d['Lenses']+' | '+str(d['Score100'])+' / '+d['Ethics']+' / '+d['Effort']+' | '+decision+' |')
    out+=['','## Every seed evaluated','','| Seed | Starting point | Disposition | Candidate refs | Reason / boundary |','|---|---|---|---|---|']
    for sid,label in seeds.items():
        ns=manual.get(sid)
        if ns is None:ns=sorted({merged.get(i,i) for i,v in enumerate(ideas,1) if sid in v['seedRefs'] and v['origin'].startswith('Returned')})
        assert ns,sid
        targets=[data[i-1] for i in ns]
        status='PROPOSE/MERGE' if any(d['Shortlist'] for d in targets) else 'FOUNDATION' if all(d['Disposition']=='FOUNDATION' for d in targets) else 'DEFER/REVIEW' if all(d['Ethics']!='PASS' for d in targets) else 'EVALUATE'
        reason=reasons.get(sid) or ('Sensitive new money/live/assurance branch requires explicit decisions; no implementation.' if status=='DEFER/REVIEW' else 'Coordinator: reuse canonical job/flow, reject duplicate foundation credit; selection remains provisional.')
        out.append('| '+sid+' | '+esc(label)+' | '+status+' | '+', '.join(f'X-{i:03}' for i in ns)+' | '+esc(reason)+' |')
    out+=['','## SCAMPER - fourteen existing areas','','Original P local references are scoped to package P (X-049 through X-072). Cells are ideation, not approved rewrites.','','| Area | Substitute | Combine | Adapt | Modify | Another use | Eliminate | Reverse |','|---|---|---|---|---|---|---|---|']
    assert len(reports['P']['scamper'])==14
    for q in reports['P']['scamper']:out.append('| '+' | '.join(esc(q.get(k,'')) for k in ['area','substitute','combine','adapt','modify','putToAnotherUse','eliminate','reverse'])+' |')
    out+=['','## Coordinator critique','','Merge return/commitment, resource rescue, support and exhibit variants instead of filling slots with duplicates. Mandatory F1/F6/F8 repairs are foundations, not novel releases. X-049 is re-evaluated PASS only for a proposed consenting-adult, suppressed mentor-summary minimum; original REVIEW remains in CSV. This is not final child policy or anonymity certification.','','Cash pledges, guarantees, revenue co-creation, currency bounties, live/guardian and experiment branches remain deferred/reviewed. No bought ranks/ratings, loot boxes, coercive timers, public minors by default or emotional dependence. All ten lenses are traceable in raw rows: L jobs/pain/behavior/science; W game/transfer/shareability; P SCAMPER; coordinator M marketplace/creator.','','[Source corpus](research-pain-points.md) is concentrated qualitative evidence, not prevalence or causal proof. [Audit](01-existing-system-audit.md) supplies prerequisites, not runtime readiness. Missing independent passes remain explicit; source/model checks do not prove learning effects. No Phase D or code implementation approved.']
    (base/'feature-ideas.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
    register_output(base/'feature-ideas.md','Complete raw ideas, 86 seed decisions and SCAMPER','96 raw rows; 86 seed decisions; fourteen SCAMPER areas')
with cp.open(encoding='utf-8',newline='') as f:data=list(csv.DictReader(f))
assert len(data)==96
for d in data:
    for k in keys+['EthicsScore','Shortlist','Wave','Wow','FullCard','Eligible']:d[k]=int(d[k])
    d['Score100']=float(d['Score100'])
assert sum(d['Shortlist'] for d in data)==25 and sum(d['FullCard'] for d in data)==14
score=lambda d,w:25*(sum(d[k]*x for k,x in zip(keys,w))/sum(w)-1)
eligible=lambda d:d['Disposition']=='CANONICAL' and d['Ethics']=='PASS'
assert not eligible(dict(data[0],Ethics='REJECT'))
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('',NS)
def col(n):
    s=''
    while n:n,x=divmod(n-1,26);s=chr(65+x)+s
    return s
def form(text,value):return ('FORMULA',text,value)
def sheet(rows,freeze=True):
    e=ET.Element('worksheet',xmlns=NS);ET.SubElement(e,'dimension',ref=f'A1:{col(max(map(len,rows)))}{len(rows)}')
    views=ET.SubElement(e,'sheetViews');v=ET.SubElement(views,'sheetView',workbookViewId='0')
    if freeze:ET.SubElement(v,'pane',ySplit='1',topLeftCell='A2',activePane='bottomLeft',state='frozen')
    cols=ET.SubElement(e,'cols');ET.SubElement(cols,'col',min='1',max=str(max(map(len,rows))),width='22',customWidth='1')
    sd=ET.SubElement(e,'sheetData')
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
ix={h:col(i+1) for i,h in enumerate(headers)}
start=ix['learner'];end=ix['reuse'];scol=ix['Score100'];ecol=ix['Eligible'];rankcol=ix['Rank']
score=lambda d,w:round(25*(sum(d[k]*x for k,x in zip(keys,w))/sum(w)-1),10)
ranks={d['ID']:i for i,d in enumerate(sorted(filter(eligible,data),key=lambda d:(-score(d,weights[0]),-d['learner'],-d['feasibility'],d['ID'])),1)}
def valid_scores(dr):return f'AND(COUNT({dr})=9,MIN({dr})>=1,MAX({dr})<=5,SUMPRODUCT(--(MOD({dr},1)=0))=9)'
def valid_weights(wr):return f'AND(COUNT({wr})=9,SUM({wr})>0,MIN({wr})>=0)'
candidate=[headers]
for rn,d in enumerate(data,2):
    row=[d[h] for h in headers];dr=f'{start}{rn}:{end}{rn}';wr='Rubric!$B$2:$J$2'
    sf=f'IFERROR(IF(AND({valid_scores(dr)},{valid_weights(wr)}),ROUND(25*(SUMPRODUCT({dr},{wr})/SUM({wr})-1),10),"INVALID_INPUT"),"INVALID_INPUT")'
    ef=f'IF(AND({ix["Ethics"]}{rn}="PASS",{ix["Disposition"]}{rn}="CANONICAL"),1,0)'
    sr=f'${scol}$2:${scol}$97';er=f'${ecol}$2:${ecol}$97';lr=f'${ix["learner"]}$2:${ix["learner"]}$97';fr=f'${ix["feasibility"]}$2:${ix["feasibility"]}$97'
    rf=f'IF(AND({ecol}{rn}=1,ISNUMBER({scol}{rn})),1+COUNTIFS({er},1,{sr},">"&{scol}{rn})+COUNTIFS({er},1,{sr},{scol}{rn},{lr},">"&{ix["learner"]}{rn})+COUNTIFS({er},1,{sr},{scol}{rn},{lr},{ix["learner"]}{rn},{fr},">"&{ix["feasibility"]}{rn})+COUNTIFS({er},1,{sr},{scol}{rn},{lr},{ix["learner"]}{rn},{fr},{ix["feasibility"]}{rn},$A$2:$A$97,"<"&A{rn}),"")'
    row[headers.index('Score100')]=form(sf,score(d,weights[0]));row[headers.index('Eligible')]=form(ef,int(eligible(d)));row[headers.index('Rank')]=form(rf,ranks.get(d['ID'],''));candidate.append(row)
rubric=[['Scenario']+keys+['WeightSum','Valid']]
for rn,(name,w) in enumerate(zip(scenario_names,weights),2):rubric.append([name]+w+[form(f'SUM(B{rn}:J{rn})',100),form(f'IFERROR(IF({valid_weights(f"B{rn}:J{rn}")},"VALID","INVALID"),"INVALID")','VALID')])
rubric += [['Perturbation',0.2],['Scores','1-5 integers, higher better; formula guard rejects fractional/text inputs'],['Ethics','Hard PASS + CANONICAL eligibility; not a compensable score'],['Evidence','Ordinal editorial hypotheses, not measured effects'],['Source debt','Tax, child safety, runtime and vendor terms unverified']]
scenarios=[(name,w,i+2,None,0) for i,(name,w) in enumerate(zip(scenario_names,weights))]
for k in range(9):
    for sign in [-1,1]:
        w=weights[0].copy();w[k]*=1+sign*.2;scenarios.append((keys[k]+(' -20%' if sign<0 else ' +20%'),w,2,k,sign))
sensitivity=[['Scenario','ID','Score100','Eligible','Rank','Top25','ProposedPortfolio','Learner','Feasibility']]
summary=[['Scenario','Top25OverlapWithBaseline','ProposedPortfolioInTop25','WeightBasis']]
baseline_top={k for k in ranks if ranks[k]<=25}
for name,w,wr,changed,sign in scenarios:
    rr={d['ID']:i for i,d in enumerate(sorted(filter(eligible,data),key=lambda d:(-score(d,w),-d['learner'],-d['feasibility'],d['ID'])),1)}
    top={k for k,v in rr.items() if v<=25};lo=len(sensitivity)+1;hi=lo+95
    summary.append([name,form(f'SUMPRODUCT(Sensitivity!$F${lo}:$F${hi},Sensitivity!$F$2:$F$97)',len(top&baseline_top)),form(f'SUMPRODUCT(Sensitivity!$F${lo}:$F${hi},Sensitivity!$G${lo}:$G${hi})',sum(d['Shortlist'] for d in data if d['ID'] in top)),'preset' if changed is None else 'one baseline weight varied; denominator renormalizes'])
    for n,d in enumerate(data,2):
        rn=len(sensitivity)+1;dr=f'Candidates!{start}{n}:{end}{n}';wrange=f'Rubric!$B${wr}:$J${wr}'
        extra='TRUE'
        if changed is None:body=f'25*(SUMPRODUCT({dr},{wrange})/SUM({wrange})-1)'
        else:
            wc=col(changed+2);sc=ix[keys[changed]];delta=f'{sign}*Rubric!$B$6*Rubric!${wc}$2'
            body=f'25*((SUMPRODUCT({dr},Rubric!$B$2:$J$2)+({delta})*Candidates!{sc}{n})/(SUM(Rubric!$B$2:$J$2)+({delta}))-1)'
            extra='AND(ISNUMBER(Rubric!$B$6),Rubric!$B$6>=0,Rubric!$B$6<1)'
        sf=f'IFERROR(IF(AND({valid_scores(dr)},{valid_weights(wrange)},{extra}),ROUND({body},10),"INVALID_INPUT"),"INVALID_INPUT")'
        rf=f'IF(AND(D{rn}=1,ISNUMBER(C{rn})),1+COUNTIFS($D${lo}:$D${hi},1,$C${lo}:$C${hi},">"&C{rn})+COUNTIFS($D${lo}:$D${hi},1,$C${lo}:$C${hi},C{rn},$H${lo}:$H${hi},">"&H{rn})+COUNTIFS($D${lo}:$D${hi},1,$C${lo}:$C${hi},C{rn},$H${lo}:$H${hi},H{rn},$I${lo}:$I${hi},">"&I{rn})+COUNTIFS($D${lo}:$D${hi},1,$C${lo}:$C${hi},C{rn},$H${lo}:$H${hi},H{rn},$I${lo}:$I${hi},I{rn},$B${lo}:$B${hi},"<"&B{rn}),"")'
        rankvalue=rr.get(d['ID'],'');sensitivity.append([name,d['ID'],form(sf,score(d,w)),form(f'Candidates!{ecol}{n}',int(eligible(d))),form(rf,rankvalue),form(f'IF(ISNUMBER(E{rn}),IF(E{rn}<=25,1,0),0)',int(bool(rankvalue and rankvalue<=25))),form(f'Candidates!{ix["Shortlist"]}{n}',d['Shortlist']),form(f'Candidates!{ix["learner"]}{n}',d['learner']),form(f'Candidates!{ix["feasibility"]}{n}',d['feasibility'])])
short=[['ID','WorkingTitle','ProposedWave','Score100','BaselineRank','Top25Across22Scenarios','FullCard','Wow']]
for n,d in enumerate(data,2):
    if d['Shortlist']:
        member=sum(1 for name,w,*_ in scenarios if d['ID'] in {z['ID'] for z in sorted(filter(eligible,data),key=lambda z:(-score(z,w),-z['learner'],-z['feasibility'],z['ID']))[:25]})
        short.append([d['ID'],d['Title'],d['Wave'],form(f'Candidates!{scol}{n}',score(d,weights[0])),form(f'Candidates!{rankcol}{n}',ranks[d['ID']]),form(f'SUMIF(Sensitivity!$B$2:$B$2113,A{len(short)+1},Sensitivity!$F$2:$F$2113)',member),d['FullCard'],d['Wow']])
seedrows=[['Seed','StartingPoint','Disposition','CandidateRefs','Reason']]
for line in (base/'feature-ideas.md').read_text(encoding='utf-8').splitlines():
    if re.match(r'^\| [A-H]\d{2} \|',line):seedrows.append([x.strip().replace('\\|','|') for x in line.strip('|').split(' | ')])
assert len(seedrows)==87
checks=[['Check','Expected','ObservedScope'],['Raw candidates',96,'CSV/record count'],['Canonical concepts',sum(d['Disposition']=='CANONICAL' for d in data),'after semantic merges/foundations'],['Portfolio',25,'proposed, not final'],['Full cards',14,'written separately'],['Wow',5,'proposed'],['Seed coverage',86,'no PENDING'],['Scenario weights',100,'all four presets'],['Perfect scores',100,'Python numeric expectation'],['All minimum scores',0,'Python numeric expectation'],['REJECT high score','EXCLUDED','uncompensated filter'],['REVIEW default','EXCLUDED','safe slice requires explicit re-evaluation'],['Office recalculation','UNVERIFIED','not an engine-tested workbook'],['Application readiness','UNVERIFIED','no app tests or execution']]
readme=[['Feature Lab scorecard','PROPOSED - not implementation approval'],['Edit','Rubric B2:J5 and Candidates dimension scores; formulas recalculate in office software'],['Priority','Weighted score separate from PASS/CANONICAL ethics eligibility'],['Portfolio','Curated 25 covers jobs/roles and avoids duplication, not automatically top 25'],['Sensitivity','22 scenarios; +/-20% single-weight sweeps use denominator normalization'],['Evidence','Qualitative concentrated reports; scores are hypotheses'],['Money','Sessions 15%; subscription 20% separately; no new flow approved'],['Scope','No macros, external links or text-derived formulas'],['Verification','ZIP/XML/formula/numeric expectations only; office-engine recalculation unverified']]
sheets={'Readme':readme,'Rubric':rubric,'Candidates':candidate,'Sensitivity':sensitivity,'Sensitivity summary':summary,'Shortlist':short,'Seed map':seedrows,'Checks':checks}
style=f'''<styleSheet xmlns="{NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" fillId="0" borderId="0" xfId="0"><alignment wrapText="1" vertical="top"/></xf><xf fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment wrapText="1"/></xf></cellXfs></styleSheet>'''
wb=ET.Element('workbook',xmlns=NS);sv=ET.SubElement(wb,'sheets')
rels=ET.Element('Relationships',xmlns='http://schemas.openxmlformats.org/package/2006/relationships')
ct=ET.Element('Types',xmlns='http://schemas.openxmlformats.org/package/2006/content-types')
ET.SubElement(ct,'Default',Extension='rels',ContentType='application/vnd.openxmlformats-package.relationships+xml');ET.SubElement(ct,'Default',Extension='xml',ContentType='application/xml')
ET.SubElement(ct,'Override',PartName='/xl/workbook.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml');ET.SubElement(ct,'Override',PartName='/xl/styles.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml')
for i,name in enumerate(sheets,1):
    se=ET.SubElement(sv,'sheet',name=name,sheetId=str(i));se.set('{'+REL+'}id','rId'+str(i));ET.SubElement(rels,'Relationship',Id='rId'+str(i),Type=REL+'/worksheet',Target=f'worksheets/sheet{i}.xml');ET.SubElement(ct,'Override',PartName=f'/xl/worksheets/sheet{i}.xml',ContentType='application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml')
ET.SubElement(rels,'Relationship',Id='styles',Type=REL+'/styles',Target='styles.xml');ET.SubElement(wb,'calcPr',calcId='191029',calcMode='auto',fullCalcOnLoad='1',forceFullCalc='1')
rr=ET.Element('Relationships',xmlns='http://schemas.openxmlformats.org/package/2006/relationships');ET.SubElement(rr,'Relationship',Id='workbook',Type=REL+'/officeDocument',Target='xl/workbook.xml')
xp=model/'feature-lab-scorecard.xlsx'
with zipfile.ZipFile(xp,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml',ET.tostring(ct));z.writestr('_rels/.rels',ET.tostring(rr));z.writestr('xl/workbook.xml',ET.tostring(wb));z.writestr('xl/_rels/workbook.xml.rels',ET.tostring(rels));z.writestr('xl/styles.xml',style)
    for i,(name,rs) in enumerate(sheets.items(),1):z.writestr(f'xl/worksheets/sheet{i}.xml',sheet(rs))
with zipfile.ZipFile(xp) as z:
    assert z.testzip() is None
    for name in z.namelist():ET.fromstring(z.read(name))
assert abs(score(dict(data[0],**{k:5 for k in keys}),weights[0])-100)<1e-9
assert abs(score(dict(data[0],**{k:1 for k in keys}),weights[0]))<1e-9
assert len(sensitivity)-1==22*96
assert all(eligible(d) for d in data if d['Shortlist'])
assert sum(d['Wow'] for d in data)==5
assert [sum(d['Shortlist'] and d['Wave']==n for d in data) for n in [1,2,3]]==[11,10,4]
register_output(xp,'Editable Feature Lab scorecard and live sensitivity','eight sheets; 22 scenarios; ZIP CRC/XML and numeric expectations PASS')
print(json.dumps({'csvBytes':cp.stat().st_size,'workbookBytes':xp.stat().st_size,'raw':96,'canonical':sum(d['Disposition']=='CANONICAL' for d in data),'eligible':sum(eligible(d) for d in data),'proposedShortlist':25,'cards':14,'wow':5,'seedRows':86,'scenarios':22,'sheets':list(sheets),'sheetRows':{n:len(v) for n,v in sheets.items()},'zipXmlAndNumericChecks':'PASS','officeEngine':'UNVERIFIED','shortlist':[(d['ID'],d['Title'],round(score(d,weights[0]),2),ranks[d['ID']]) for d in data if d['Shortlist']]},indent=2))
```

The resulting model is an evidence/priority artifact. A PASS design flag is not legal clearance, current implementation authority or approval of minor access. Feature Cards carry concrete safe slices; all names, selections, scope and monetary/safety decisions go to CP-C2. Do not rerun failed agents to regenerate this dataset.
