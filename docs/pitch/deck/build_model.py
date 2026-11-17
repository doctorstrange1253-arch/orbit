from pathlib import Path
import sys,json,math
sys.path.insert(0,str(Path(__file__).parent/'tooling/python'))
from openpyxl import Workbook,load_workbook
from openpyxl.styles import Font,PatternFill,Alignment
from openpyxl.workbook.properties import CalcProperties
root=Path(__file__).parent
d=json.loads((root/'deck-data.json').read_text(encoding='utf-8'))
e=d['economics']
wb=Workbook()
ws=wb.active
ws.title='Assumptions'
ws.append(['Input','Scenario value','Status/source'])
inputs=[('Core price',e['core_price'],'PROPOSED, notlive'),('Higher price',e['higher_price'],'PROPOSED, notlive'),('Platform share',.2,'Founderintent'),('Mentor pool',.8,'Founderintent'),('Session fee',.15,'Separatefounderintent'),('GST hypothesis',e['gst_scenario'],'ESTIMATEtaxscenario;confirmprofessional'),('Gateway rate',.02,'PublishedRazorpaybaseline;termsmaydiffer'),('Gateway fee GST',.18,'Publishedbaseline'),('INR per USD',85,'ESTIMATE, notFXquote'),('Video delivery USD/1000min',1,'Cloudflarepublished'),('Storage USD/1000min',5,'Cloudflarepublished,wholeblocks'),('Stored minutes',500,'ESTIMATE'),('Allocation students',50,'ESTIMATEcostallocation'),('Core watch min',120,'ESTIMATE'),('Higher watch min',240,'ESTIMATE'),('Core AI/student',10,'ESTIMATEactualbillFILL'),('Higher AI/student',20,'ESTIMATEactualbillFILL'),('Core support/student',8,'ESTIMATE'),('Higher support/student',12,'ESTIMATE'),('Fixed monthly costs',15000,'ESTIMATEactualbillFILL'),('Opening cash',0,'SCENARIOONLY;actualFILL'),('Core mix',.8,'ESTIMATE'),('Session price',1000,'ESTIMATEmentorprice'),('RTC/session',10,'ESTIMATE'),('Support/session',15,'ESTIMATE')]
refs={}
for i,(label,value,status) in enumerate(inputs,2):ws.append([label,value,status]);refs[label]=f"Assumptions!B{i}"
unit=wb.create_sheet('Unit economics')
unit.append(['Item','Core','Higher','Session','Meaning'])
rows=[['Customer price',f"={refs['Core price']}",f"={refs['Higher price']}",f"={refs['Session price']}",'Illustrativetaxinclusiveprice'],['Net base', '=B2/(1+Assumptions!B7)','=C2/(1+Assumptions!B7)','=D2/(1+Assumptions!B7)','GSThypothesisnotlegalclearance'],['GST component','=B2-B3','=C2-C3','=D2-D3','SeparatefromgatewayGST'],['Platform revenue','=B3*Assumptions!B4','=C3*Assumptions!B4','=D3*Assumptions!B6','Subscription20%,session15%'],['Mentor pool/take-home beforeotherdeductions','=B3-B5','=C3-C5','=D3-D5','Notactualbankpayout'],['Gateway expense','=B2*Assumptions!B8*(1+Assumptions!B9)','=C2*Assumptions!B8*(1+Assumptions!B9)','=D2*Assumptions!B8*(1+Assumptions!B9)','Grossfeeassumption'],['Video delivery','=Assumptions!B15/1000*Assumptions!B11*Assumptions!B10','=Assumptions!B16/1000*Assumptions!B11*Assumptions!B10',0,'Usageassumption'],['Video storage share','=ROUNDUP(Assumptions!B13/1000,0)*Assumptions!B12*Assumptions!B10/Assumptions!B14','=B9',0,'Whole1000mincapacityblocks'],['AI / RTC','=Assumptions!B17','=Assumptions!B18','=Assumptions!B25','ActualcostFILL'],['Support','=Assumptions!B19','=Assumptions!B20','=Assumptions!B26','ActualcostFILL'],['Contribution','=B5-SUM(B7:B11)','=C5-SUM(C7:C11)','=D5-SUM(D7:D11)','Notprofit;fixedcostexcluded']]
for row in rows:unit.append(row)
summary=wb.create_sheet('Break-even')
summary.append(['Metric','Formula/value','Qualification'])
summary.append(['Weightedmonthlycontribution',"='Unit economics'!B12*Assumptions!B23+'Unit economics'!C12*(1-Assumptions!B23)",'Scenario'])
summary.append(['Break-evenpayingstudents','=IF(B2>0,ROUNDUP(Assumptions!B21/B2,0),"No break-even")','Fixedcost / weightedCM'])
summary.append(['Runway nofunding','=IF(Assumptions!B21>0,Assumptions!B22/Assumptions!B21,0)','Openingcashscenario0,actualFILL'])
summary.append(['Allcash200000runway','=200000/Assumptions!B21','Hypotheticalundesignatedcash,notitemizedbudgetrunway'])
summary.append(['Allcash150000runway','=150000/Assumptions!B21','Do notdoublecountplannedspend'])
summary.append(['Allcash100000runway','=100000/Assumptions!B21','Do notdoublecountplannedspend'])
for scenario,counts in [('Base',e['base_paying_students']),('Conservative',e['conservative_paying_students'])]:
 w=wb.create_sheet(scenario)
 w.append(['Month','Payingstudents[TARGET]','Contribution','Fixedcost','Operatingresult','Cumulativecashnofunding','Cumulativecash200k'])
 for i,n in enumerate(counts,2):
  w.append([i-1,n,f"=B{i}*'Break-even'!B2",'=Assumptions!B21',f'=C{i}-D{i}',f'=Assumptions!B22+E{i}' if i==2 else f'=F{i-1}+E{i}',f'=F{i}+200000'])
fund=wb.create_sheet('Use of funds')
fund.append(['Use','Fullamount[ESTIMATE]','Share','When','Whatitbuys','Milestone','Quote/status'])
for i,f in enumerate(d['funding'],2):fund.append([f['category'],f['amount'],f'=B{i}/SUM(B2:B8)',f['month'],f['buys'],f['milestone'],f['status']])
fund.append(['Total','=SUM(B2:B8)',1,'1-3','Pilotallocation','Awardnotguaranteed','Quotesmustconfirm'])
ladder=wb.create_sheet('Funding ladder')
ladder.append(['Amount','Unlock','Infrastructure','Mentors','Campus','Equipment','Legal','Testing','Contingency','Totalcheck','Recurringreserve','Oneoffplanned','Recurringburn/month','Conservativerunway'])
for i,v in enumerate(d['funding_ladder'],2):
 a=v['allocation'];vals=list(a.values());rec=a['Infrastructure + AI']+a['Campus activation']+a['Testing + security']
 ladder.append([v['amount'],v['unlock'],*vals,f'=SUM(C{i}:I{i})',f'=C{i}+E{i}+H{i}',f'=D{i}+F{i}+G{i}',f'=K{i}/3',f'=IF(M{i}>0,K{i}/M{i},0)'])
market=wb.create_sheet('Bottom-up market')
market.append(['Relevantcampuscount','Reachshare[ESTIMATE]','Needshare[ESTIMATE]','Serviceable','12monthpayingtarget','Status'])
market.append([None,.2,.2,'=IF(ISNUMBER(A2),ROUNDDOWN(A2*B2*C2,0),"FILL official count")',100,'FILLpopulation;sharesandtargetESTIMATE'])
sources=wb.create_sheet('Sources')
sources.append(['ID','Type','Source','URL','Year','Qualification'])
for s in d['sources']:sources.append([s['id'],s['type'],s['source'],s.get('url',''),s['year'],s.get('qualification','')])
wb.calculation=CalcProperties(calcId=191029,fullCalcOnLoad=True)
for w in wb:
 w.freeze_panes='A2'
 w.auto_filter.ref=w.dimensions
 for cell in w[1]:cell.font=Font(name='Arial',bold=True,color='FFFFFF');cell.fill=PatternFill('solid',fgColor='182C35')
 for row in w.iter_rows(min_row=2):
  for cell in row:cell.font=Font(name='Arial',size=11);cell.alignment=Alignment(vertical='top',wrap_text=True)
 for col in w.columns:w.column_dimensions[col[0].column_letter].width=26
 w.column_dimensions['A'].width=38
out=root.parent/'models';out.mkdir(exist_ok=True)
wb.save(out/'pitch-model.xlsx')
fw=Workbook();fw.remove(fw.active)
for name in ('Use of funds','Funding ladder'):
 w=fw.create_sheet(name)
 for row in wb[name].iter_rows():w.append([c.value for c in row])
fw.save(out/'use-of-funds.xlsx')
net=e['core_price']/(1+e['gst_scenario']);cm=net*.2-e['core_price']*.02*1.18-e['core_watch_minutes']/1000*85-math.ceil(e['stored_minutes']/1000)*5*85/50-e['core_ai']-e['core_support']
hnet=e['higher_price']/1.18;hcm=hnet*.2-e['higher_price']*.02*1.18-e['higher_watch_minutes']/1000*85-8.5-e['higher_ai']-e['higher_support']
weighted=cm*.8+hcm*.2
res={'status':'ESTIMATE scenario;notactualbills','coreCM':round(cm,2),'higherCM':round(hcm,2),'weightedCM':round(weighted,2),'breakEvenStudents':math.ceil(15000/weighted),'baseFirstPositiveMonth':next((i+1 for i,n in enumerate(e['base_paying_students']) if n*weighted>=15000),None),'conservativeFirstPositiveMonth':next((i+1 for i,n in enumerate(e['conservative_paying_students']) if n*weighted>=15000),None),'fundingTotal':sum(f['amount'] for f in d['funding']),'workbookRows':sum(w.max_row for w in wb),'formulaCount':sum(c.data_type=='f' for w in wb for row in w for c in row),'officeRecalculation':'NOT_RUN'}
assert res['fundingTotal']==200000
assert all(sum(x['allocation'].values())==x['amount'] for x in d['funding_ladder'])
(root/'model-results.json').write_text(json.dumps(res,indent=2))
print(json.dumps(res))
