// Seeded demonstration database (ported verbatim from SYNAPSE.html).
import { rnd } from '../lib/utils.js';
import { EMP_SEED } from './employees.js';

export function seed(){
  const users = [
    {id:'U1', name:'Nadia Karim', email:'admin@synapse.demo', pw:'Admin#2026', role:'admin', title:'System Administrator', status:'Active'},
    {id:'U2', name:'Bilal Ahmed', email:'analyst@synapse.demo', pw:'Analyst#2026', role:'analyst', title:'Security Analyst', status:'Active'},
    {id:'U3', name:'Sara Haider', email:'sara.haider@synapse.demo', pw:'Analyst#2026', role:'analyst', title:'Senior Security Analyst', status:'Active'}
  ];
  const employees = EMP_SEED.map(e=>({id:e.id, name:e.name, dept:e.dept, role:e.role, email:e.email, hired:e.hired, site:e.site, status:'Active', ext:'', prefName:''}));
  const departments = ['Finance','Engineering','Research & Development','IT Operations','Human Resources','Sales','Legal'].map((n,i)=>({id:'D'+(i+1), name:n}));
  const roles = [
    ['Financial Analyst','Finance'],['Payroll Specialist','Finance'],['Senior Software Engineer','Engineering'],['DevOps Engineer','Engineering'],
    ['Data Scientist','Research & Development'],['Research Engineer','Research & Development'],['Systems Administrator','IT Operations'],
    ['HR Business Partner','Human Resources'],['Account Executive','Sales'],['Contracts Counsel','Legal']
  ].map((r,i)=>({id:'R'+(i+1), name:r[0], dept:r[1]}));
  const tele = ['Login/logout','USB connections','File activity','Process execution','DNS queries','Network metadata'];
  const endpoints = [
    ['EP-1001','MLG-FIN-LT021','E1001','Windows 11 Enterprise 23H2','Connected','2026-11-14 08:40'],
    ['EP-1002','MLG-ENG-LT017','E1002','Windows 11 Enterprise 23H2','Connected','2026-11-14 08:38'],
    ['EP-1003','MLG-RND-WS004','E1003','Windows 11 Enterprise 23H2','Connected','2026-11-14 08:41'],
    ['EP-1004','MLG-ITO-LT002','E1004','Windows 11 Enterprise 23H2','Connected','2026-11-14 08:35'],
    ['EP-1005','MLG-HR-LT009','E1005','Windows 10 Enterprise 22H2','Connected','2026-11-14 08:30'],
    ['EP-1006','MLG-SAL-LT033','E1006','Windows 11 Enterprise 23H2','Connected','2026-11-14 08:12'],
    ['EP-1007','MLG-LEG-LT006','E1007','Windows 10 Enterprise 22H2','Stale','2026-11-12 17:55'],
    ['EP-1008','MLG-ENG-LT024','E1008','Windows 11 Enterprise 23H2','Connected','2026-11-14 08:44'],
    ['EP-1009','MLG-FIN-LT028','E1009','Windows 11 Enterprise 23H2','Connected','2026-11-14 08:26'],
    ['EP-1010','MLG-RND-LT041','E1010','Windows 11 Enterprise 23H2','Offline','2026-11-06 11:02'],
    ['EP-1011','MLG-SHR-PC09','','Windows 10 Enterprise 22H2 (shared kiosk)','Connected','2026-11-14 08:15']
  ].map(r=>({id:r[0], name:r[1], emp:r[2], os:r[3], ver:'0.3.0-proto', status:r[4], lastSync:r[5], collecting: r[4]==='Connected', extra:0,
    telemetry: r[0]==='EP-1011'? tele.slice(0,3) : tele.slice(0, r[4]==='Offline'?2:6),
    ingest:[{ts:r[5], events: 120+Math.round(rnd(r[0])*300), result: r[4]==='Offline'?'No data':'Simulated batch accepted'},{ts:'2026-11-13 18:00', events: 400+Math.round(rnd(r[0]+'b')*500), result:'Simulated batch accepted'}]}));
  const removables = [
    {id:'RM-01', label:'Kingston IronKey D300 (encrypted)', serial:'KIK-88213', emp:'E1006', approved:true, added:'2026-03-02'},
    {id:'RM-02', label:'SanDisk Extreme Pro SSD', serial:'SDX-50021', emp:'E1002', approved:true, added:'2025-11-18'},
    {id:'RM-03', label:'Samsung T7 Shield', serial:'ST7-31877', emp:'E1008', approved:true, added:'2026-01-09'},
    {id:'RM-04', label:'Generic USB 3.0 32GB', serial:'UNK-0F3A', emp:'E1006', approved:false, added:'2026-11-13'}
  ];
  const A = (o)=>Object.assign({classification:'Unclassified', closed:false, notes:[], history:[], events:[], context:[], policies:[], analyst:''}, o);
  const alerts = [
    A({id:'AL-2030', emp:'E1007', ts:'2026-10-21 18:52', cat:'email', score:36, model:'Hybrid (Isolation Forest + rules)', reason:'Outbound email volume above personal baseline', status:'Resolved', analyst:'U3', classification:'False positive',
      history:[{ts:'2026-10-21 18:55',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-10-22 09:30',user:'Sara Haider',action:'Marked false positive — contract renewal cycle'},{ts:'2026-10-22 09:31',user:'Sara Haider',action:'Status → Resolved'}]}),
    A({id:'AL-2031', emp:'E1006', ts:'2026-10-24 19:30', cat:'device', score:57, model:'HGB-personalized (simulated interface)', reason:'Removable-media connections outside usual pattern', status:'Resolved', analyst:'U2', classification:'Undetermined', policies:['POL-04'],
      notes:[{ts:'2026-10-26 10:12', user:'Bilal Ahmed', text:'Employee explained transfer of client presentation files. Assigned removable-media training (INT-402).'}],
      history:[{ts:'2026-10-24 19:33',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-10-25 09:02',user:'Bilal Ahmed',action:'Training assigned: Safe USB and Removable-Media Usage'},{ts:'2026-10-26 10:15',user:'Bilal Ahmed',action:'Status → Resolved (Undetermined)'}]}),
    A({id:'AL-2032', emp:'E1009', ts:'2026-10-28 08:05', cat:'logon', score:33, model:'Policy rule engine (illustrative)', reason:'Logon count above personal baseline', status:'Resolved', analyst:'U3', classification:'False positive',
      history:[{ts:'2026-10-28 08:07',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-10-28 11:40',user:'Sara Haider',action:'Marked false positive — password reset after expiry'},{ts:'2026-10-28 11:41',user:'Sara Haider',action:'Status → Resolved'}]}),
    A({id:'AL-2033', emp:'E1004', ts:'2026-10-30 23:10', cat:'logon', score:52, model:'HGB-personalized (simulated interface)', reason:'Off-hours logons above personal baseline', status:'Resolved', analyst:'U2', classification:'False positive',
      history:[{ts:'2026-10-30 23:12',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-10-31 10:05',user:'Bilal Ahmed',action:'Marked false positive — scheduled patch window CHG-5512'},{ts:'2026-10-31 10:06',user:'Bilal Ahmed',action:'Status → Resolved'}]}),
    A({id:'AL-2034', emp:'E1001', ts:'2026-10-31 20:40', cat:'file', score:54, model:'HGB-personalized (simulated interface)', reason:'File activity above baseline during off-hours', status:'Resolved', analyst:'U2', classification:'False positive',
      history:[{ts:'2026-10-31 20:42',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-02 09:15',user:'Bilal Ahmed',action:'Marked false positive — month-end close'},{ts:'2026-11-02 09:16',user:'Bilal Ahmed',action:'Status → Resolved'}]}),
    A({id:'AL-2035', emp:'E1008', ts:'2026-11-04 10:15', cat:'device', score:39, model:'HGB-personalized (simulated interface)', reason:'Removable-media connect on an atypical day', status:'Resolved', analyst:'U3', classification:'False positive',
      history:[{ts:'2026-11-04 10:17',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-04 14:20',user:'Sara Haider',action:'Marked false positive — approved device RM-03'},{ts:'2026-11-04 14:21',user:'Sara Haider',action:'Status → Resolved'}]}),
    A({id:'AL-2036', emp:'E1004', ts:'2026-11-08 02:14', cat:'logon', score:55, model:'Hybrid (Isolation Forest + rules)', reason:'Weekend off-hours logons', status:'Resolved', analyst:'U3', classification:'False positive', policies:['POL-03'],
      notes:[{ts:'2026-11-09 09:20', user:'Sara Haider', text:'Maintenance window confirmed against IT change record CHG-5590.'}],
      history:[{ts:'2026-11-08 02:16',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-09 09:20',user:'Sara Haider',action:'Marked false positive'},{ts:'2026-11-09 09:21',user:'Sara Haider',action:'Status → Resolved'}]}),
    A({id:'AL-2037', emp:'E1005', ts:'2026-11-09 17:20', cat:'http', score:34, model:'HGB-personalized (simulated interface)', reason:'Web activity above personal baseline', status:'Resolved', analyst:'U2', classification:'False positive',
      history:[{ts:'2026-11-09 17:22',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-10 09:05',user:'Bilal Ahmed',action:'Marked false positive — benefits open enrolment portal'},{ts:'2026-11-10 09:06',user:'Bilal Ahmed',action:'Status → Resolved'}]}),
    A({id:'AL-2038', emp:'E1007', ts:'2026-11-09 21:05', cat:'email', score:41, model:'HGB-personalized (simulated interface)', reason:'Email volume and off-hours email above personal baseline', status:'Under Review', analyst:'U3', policies:['POL-02','POL-03'],
      events:[{t:'2026-11-09 19:40',src:'email',detail:'34 outbound messages to 3 external domains (metadata only)'},{t:'2026-11-09 20:55',src:'email',detail:'Largest message 18.4 MB with 2 attachments'},{t:'2026-11-09 21:03',src:'logon',detail:'Logoff MLG-LEG-LT006'}],
      history:[{ts:'2026-11-09 21:07',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-10 08:50',user:'Sara Haider',action:'Investigation started'}]}),
    A({id:'AL-2039', emp:'E1001', ts:'2026-11-10 22:37', cat:'file', score:58, model:'HGB-personalized (simulated interface)', reason:'Off-hours file and logon activity above personal baseline', status:'Under Review', analyst:'U2', policies:['POL-02','POL-03'],
      context:['Finance quarter-end close calendar lists 10–11 Nov as extended working days','Accessed resource is within the employee\u2019s normal Finance share'],
      notes:[{ts:'2026-11-11 09:10', user:'Bilal Ahmed', text:'Finance close calendar shows team working late on 10–11 Nov. Checking with line manager before classification.'}],
      events:[{t:'2026-11-10 18:42',src:'logon',detail:'Logon MLG-FIN-LT021 (usual device)'},{t:'2026-11-10 19:05',src:'file',detail:'52 file opens on \\\\fs01\\finance\\close\\Q4'},{t:'2026-11-10 21:58',src:'email',detail:'11 internal emails to Finance distribution list'},{t:'2026-11-10 22:31',src:'file',detail:'Reconciliation workbook saved (14 versions)'},{t:'2026-11-10 22:40',src:'logon',detail:'Logoff MLG-FIN-LT021'}],
      history:[{ts:'2026-11-10 22:39',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-11 08:55',user:'Bilal Ahmed',action:'Investigation started'}]}),
    A({id:'AL-2040', emp:'E1002', ts:'2026-11-11 19:12', cat:'device', score:63, model:'HGB-personalized (simulated interface)', reason:'Removable-media connections and file copies above personal baseline', status:'Awaiting Verification', analyst:'U2', policies:['POL-01','POL-04'],
      context:['Device RM-02 (SanDisk Extreme Pro SSD) is on the approved removable-device list'],
      events:[{t:'2026-11-11 18:20',src:'device',detail:'USB connect RM-02 SanDisk Extreme Pro SSD (approved)'},{t:'2026-11-11 18:24',src:'file',detail:'Copy of 61 files from C:\\dev\\builds to removable drive'},{t:'2026-11-11 19:02',src:'device',detail:'USB disconnect / reconnect cycle (4×)'},{t:'2026-11-11 19:12',src:'file',detail:'Copy of 24 files from C:\\dev\\release-notes'}],
      notes:[{ts:'2026-11-12 09:40', user:'Bilal Ahmed', text:'Device is approved. Requested employee verification before classification.'}],
      history:[{ts:'2026-11-11 19:14',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-12 09:30',user:'Bilal Ahmed',action:'Investigation started'},{ts:'2026-11-12 09:41',user:'Bilal Ahmed',action:'Verification requested (VR-118)'},{ts:'2026-11-12 09:41',user:'Bilal Ahmed',action:'Status → Awaiting Verification'}]}),
    A({id:'AL-2041', emp:'E1009', ts:'2026-11-12 08:47', cat:'logon', score:77, model:'Policy rule engine (illustrative) + HGB-personalized', reason:'Repeated failed logons and logon from an unfamiliar computer', status:'Under Review', analyst:'U2', policies:['POL-05'],
      context:['Logon to MLG-SHR-PC09 (shared kiosk) — first use by this employee in the observed window','6 failed authentication attempts between 08:31 and 08:46 (simulated)'],
      events:[{t:'2026-11-12 08:31',src:'logon',detail:'Failed logon MLG-FIN-LT028 (1 of 6)'},{t:'2026-11-12 08:46',src:'logon',detail:'Failed logon MLG-FIN-LT028 (6 of 6)'},{t:'2026-11-12 08:47',src:'logon',detail:'Successful logon MLG-SHR-PC09 (unfamiliar computer)'},{t:'2026-11-12 08:58',src:'http',detail:'Payroll portal session from MLG-SHR-PC09'}],
      history:[{ts:'2026-11-12 08:49',user:'SYNAPSE (simulated)',action:'Alert created'},{ts:'2026-11-12 09:05',user:'Bilal Ahmed',action:'Investigation started'},{ts:'2026-11-12 09:20',user:'Bilal Ahmed',action:'Verification requested (VR-115)'}]}),
    A({id:'AL-2042', emp:'E1010', ts:'2026-11-12 16:30', cat:'http', score:38, model:'Population-baseline fallback (limited history)', reason:'Web activity above population baseline — personal baseline unavailable', status:'New', policies:[],
      context:['Employee joined on 2 Nov 2026 — fewer than 10 baseline days; population fallback applied'],
      events:[{t:'2026-11-12 13:10',src:'http',detail:'Burst of requests to documentation and package-registry domains'},{t:'2026-11-12 16:28',src:'http',detail:'540 web requests across the day (population mean ~150)'}],
      history:[{ts:'2026-11-12 16:32',user:'SYNAPSE (simulated)',action:'Alert created'}]}),
    A({id:'AL-2043', emp:'E1006', ts:'2026-11-13 21:47', cat:'device', score:86, model:'HGB-personalized (simulated interface)', reason:'Removable-media and off-hours file activity far above personal baseline', status:'New', policies:['POL-01','POL-04','POL-03'],
      context:['USB device RM-04 "Generic USB 3.0 32GB" is not on the approved removable-device list','Prior alert AL-2031 (24 Oct) involved removable media; removable-media training was completed on 2 Nov'],
      events:[{t:'2026-11-13 20:58',src:'logon',detail:'Logon MLG-SAL-LT033 via VPN (remote)'},{t:'2026-11-13 21:06',src:'device',detail:'USB connect RM-04 Generic USB 3.0 32GB (not approved)'},{t:'2026-11-13 21:15',src:'file',detail:'Copy of 120 files from CRM export folder to removable drive'},{t:'2026-11-13 21:31',src:'http',detail:'Uploads to external cloud-storage category (metadata only)'},{t:'2026-11-13 21:44',src:'device',detail:'USB disconnect RM-04'}],
      history:[{ts:'2026-11-13 21:49',user:'SYNAPSE (simulated)',action:'Alert created'}]}),
    A({id:'AL-2044', emp:'E1008', ts:'2026-11-14 07:22', cat:'device', score:61, model:'Hybrid (Isolation Forest + rules)', reason:'Early-morning weekend removable-media activity above personal baseline', status:'New', policies:['POL-03','POL-04'],
      context:['Device RM-03 (Samsung T7 Shield) is on the approved removable-device list'],
      events:[{t:'2026-11-14 06:58',src:'logon',detail:'Logon MLG-ENG-LT024 (Saturday)'},{t:'2026-11-14 07:04',src:'device',detail:'USB connect RM-03 Samsung T7 Shield (approved)'},{t:'2026-11-14 07:15',src:'file',detail:'Copy of 30 files from deployment scripts folder'}],
      history:[{ts:'2026-11-14 07:24',user:'SYNAPSE (simulated)',action:'Alert created'}]})
  ];
  const interventions = [
    {id:'INT-401', emp:'E1002', type:'Training', ref:'TM-PHISH', reason:'Annual security-awareness cycle', assigned:'2026-11-03', due:'2026-11-21', status:'In progress', progress:40, step:2, completed:'', followUp:'', alert:'', by:'Sara Haider'},
    {id:'INT-402', emp:'E1006', type:'Training', ref:'TM-USB', reason:'Follow-up to AL-2031 removable-media alert', assigned:'2026-10-25', due:'2026-11-08', status:'Completed', progress:100, step:5, completed:'2026-11-02', followUp:'New removable-media alert AL-2043 on 13 Nov. Completion does not by itself indicate changed risk.', alert:'AL-2031', by:'Bilal Ahmed'},
    {id:'INT-403', emp:'E1002', type:'Verification', ref:'VR-118', reason:'Confirm removable-media activity on 11 Nov', assigned:'2026-11-12', due:'2026-11-16', status:'Pending', progress:0, step:0, completed:'', followUp:'', alert:'AL-2040', by:'Bilal Ahmed'},
    {id:'INT-404', emp:'E1009', type:'Verification', ref:'VR-115', reason:'Confirm failed logons and kiosk logon on 12 Nov', assigned:'2026-11-12', due:'2026-11-15', status:'Pending', progress:0, step:0, completed:'', followUp:'', alert:'AL-2041', by:'Bilal Ahmed'},
    {id:'INT-405', emp:'E1002', type:'Policy acknowledgment', ref:'POL-04', reason:'Removable-media policy refresh', assigned:'2026-11-12', due:'2026-11-19', status:'Assigned', progress:0, step:0, completed:'', followUp:'', alert:'AL-2040', by:'Bilal Ahmed'},
    {id:'INT-406', emp:'E1001', type:'Phishing exercise', ref:'PH-01', reason:'Quarterly phishing-awareness exercise', assigned:'2026-11-01', due:'2026-11-15', status:'Completed', progress:100, step:0, completed:'2026-11-06', followUp:'Score 5/6.', alert:'', by:'Sara Haider'},
    {id:'INT-407', emp:'E1002', type:'Assessment', ref:'AS-01', reason:'Annual security-awareness cycle', assigned:'2026-11-03', due:'2026-11-28', status:'Assigned', progress:0, step:0, completed:'', followUp:'', alert:'', by:'Sara Haider'},
    {id:'INT-408', emp:'E1002', type:'Phishing exercise', ref:'PH-01', reason:'Quarterly phishing-awareness exercise', assigned:'2026-11-03', due:'2026-11-30', status:'Assigned', progress:0, step:0, completed:'', followUp:'', alert:'', by:'Sara Haider'},
    {id:'INT-409', emp:'E1009', type:'Assessment', ref:'AS-02', reason:'Authentication hygiene refresher', assigned:'2026-11-12', due:'2026-11-26', status:'Assigned', progress:0, step:0, completed:'', followUp:'', alert:'AL-2041', by:'Bilal Ahmed'}
  ];
  const verifications = [
    {id:'VR-118', emp:'E1002', alert:'AL-2040', reason:'Removable-media activity on 11 Nov 2026 between 18:20 and 19:12 on MLG-ENG-LT017 was well above your usual pattern.', instructions:'Please confirm whether you performed this activity and briefly describe its business purpose. This is a simulated confirmation inside the prototype, not multi-factor authentication.', created:'2026-11-12 09:41', status:'Pending', response:'', comment:'', respondedAt:'', reviewed:false},
    {id:'VR-115', emp:'E1009', alert:'AL-2041', reason:'Six failed logons on your laptop followed by a logon from shared kiosk MLG-SHR-PC09 on 12 Nov 2026 at 08:47.', instructions:'Please confirm whether these logon attempts were yours. This is a simulated confirmation inside the prototype, not multi-factor authentication.', created:'2026-11-12 09:20', status:'Pending', response:'', comment:'', respondedAt:'', reviewed:false}
  ];
  const policies = [
    {id:'POL-01', name:'Approved Device Usage', cat:'Approved device usage', depts:['All departments'], roles:['All roles'], devices:'Corporate-managed endpoints and approved removable devices', enabled:true, ack:true, updated:'2026-09-01',
      body:'Only corporate-managed endpoints and removable devices on the approved list may be used to access or store company data. Personal devices must not be connected to corporate endpoints. Requests for new devices go through the IT service desk.'},
    {id:'POL-02', name:'Restricted Resource Access', cat:'Restricted resources', depts:['Finance','Legal','Human Resources'], roles:['All roles'], devices:'All endpoints', enabled:true, ack:false, updated:'2026-08-14',
      body:'Finance, legal and HR repositories are restricted to staff whose role requires access. Access is reviewed quarterly. Accessing a restricted resource outside your role is a security indicator that may be reviewed.'},
    {id:'POL-03', name:'Off-Hours Activity Monitoring', cat:'Off-hours activity monitoring', depts:['All departments'], roles:['All roles'], devices:'All endpoints', enabled:true, ack:false, updated:'2026-09-20',
      body:'Activity before 08:00 or from 18:00, and at weekends, is noted as context for behavioral analysis. Working late is not prohibited and is not by itself a violation; it is one indicator reviewed together with your usual pattern.'},
    {id:'POL-04', name:'Removable Media Restrictions', cat:'USB/removable-media restrictions', depts:['All departments'], roles:['All roles'], devices:'All endpoints', enabled:true, ack:true, updated:'2026-11-10',
      body:'Use only encrypted removable devices from the approved list. Copy only the files you need, remove them when no longer required, and report lost devices immediately. Unapproved devices may be blocked by IT in production deployments.'},
    {id:'POL-05', name:'Least-Privilege Access Permissions', cat:'Access permissions', depts:['IT Operations','Engineering','Finance'], roles:['All roles'], devices:'All endpoints and shared kiosks', enabled:true, ack:false, updated:'2026-07-30',
      body:'Accounts receive only the permissions needed for the role. Shared kiosks must not be used for privileged or payroll tasks. Repeated failed logons are reviewed and may trigger a verification request.'},
    {id:'POL-06', name:'Annual Security Awareness Requirement', cat:'Security awareness requirements', depts:['All departments'], roles:['All roles'], devices:'—', enabled:true, ack:true, updated:'2026-08-01',
      body:'All staff complete the annual awareness training, one assessment and quarterly phishing-awareness exercises. Completion is recorded for compliance; it is not used as a measure of an individual\u2019s threat level.'}
  ];
  const acks = [{policy:'POL-01', emp:'E1002', at:'2026-09-02 10:14'},{policy:'POL-06', emp:'E1002', at:'2026-09-02 10:16'},{policy:'POL-01', emp:'E1001', at:'2026-09-03 09:01'},{policy:'POL-04', emp:'E1006', at:'2026-11-02 15:30'}];
  const integrations = [
    {id:'INTG-AD', name:'Active Directory / authentication logs', desc:'Domain logon, logoff and failed-authentication events.', status:'Configured (simulated)', last:'2026-11-14 08:00', cats:['Logon','Failed auth','Account changes'], endpoint:'ldaps://dc01.meridianledger.example'},
    {id:'INTG-VPN', name:'VPN', desc:'Remote-access session start, end and source metadata.', status:'Configured (simulated)', last:'2026-11-14 07:55', cats:['VPN sessions','Source network'], endpoint:'syslog://vpn-gw01:514'},
    {id:'INTG-MAIL', name:'Email metadata', desc:'Sender, recipient counts and sizes. No message content.', status:'Not configured', last:'', cats:['Email metadata'], endpoint:''},
    {id:'INTG-WEB', name:'Web proxy / browser extension', desc:'Visited domains and categories for HTTP activity.', status:'Not configured', last:'', cats:['HTTP domains','Categories'], endpoint:''},
    {id:'INTG-CLOUD', name:'Cloud security', desc:'Cloud storage and SaaS audit events.', status:'Not configured', last:'', cats:['Cloud file events','SaaS logons'], endpoint:''},
    {id:'INTG-SIEM', name:'SIEM', desc:'Forward normalized events and alerts to an existing SIEM.', status:'Test failed (simulated)', last:'2026-11-10 14:22', cats:['Alert forwarding','Event export'], endpoint:'https://siem.meridianledger.example/api'},
    {id:'INTG-DNS', name:'DNS / network infrastructure', desc:'DNS queries and network flow metadata.', status:'Not configured', last:'', cats:['DNS','Flows'], endpoint:''}
  ];
  const imports = [
    {id:'IMP-07', file:'cert_r52_sample_logon_200rows.csv', source:'CERT r5.2 research sample', rows:200, status:'Validated — staged (not scored)', at:'2026-11-05 14:10', by:'Nadia Karim'},
    {id:'IMP-06', file:'endpoint_export_nov01.json', source:'Simulated endpoint export', rows:86, status:'Rejected — missing date column', at:'2026-11-01 11:42', by:'Nadia Karim'}
  ];
  const assessSubs = [{id:'SUB-31', emp:'E1001', assess:'AS-01', score:6, total:6, at:'2026-10-29 10:20'}];
  const phishRuns = [{id:'PR-12', emp:'E1001', score:5, total:6, at:'2026-11-06 15:02'}];
  const audit = [
    {id:'AU-0108', ts:'2026-11-13 21:49', user:'SYNAPSE (simulated)', action:'Alert created', target:'AL-2043', outcome:'Success'},
    {id:'AU-0107', ts:'2026-11-12 09:41', user:'Bilal Ahmed', action:'Verification requested', target:'VR-118 → Daniel Okafor', outcome:'Success'},
    {id:'AU-0106', ts:'2026-11-12 09:20', user:'Bilal Ahmed', action:'Verification requested', target:'VR-115 → Priya Nair', outcome:'Success'},
    {id:'AU-0105', ts:'2026-11-12 09:05', user:'Bilal Ahmed', action:'Investigation started', target:'AL-2041', outcome:'Success'},
    {id:'AU-0104', ts:'2026-11-10 16:02', user:'Nadia Karim', action:'Policy updated', target:'POL-04 Removable Media Restrictions', outcome:'Success'},
    {id:'AU-0103', ts:'2026-11-09 09:21', user:'Sara Haider', action:'Investigation decision', target:'AL-2036 → False positive', outcome:'Success'},
    {id:'AU-0102', ts:'2026-11-06 15:02', user:'Aisha Rahman', action:'Phishing exercise completed', target:'INT-406', outcome:'Success'},
    {id:'AU-0101', ts:'2026-11-05 14:10', user:'Nadia Karim', action:'Dataset import', target:'IMP-07 cert_r52_sample_logon_200rows.csv', outcome:'Validated'},
    {id:'AU-0100', ts:'2026-11-02 15:30', user:'Lukas Brandt', action:'Training completed', target:'INT-402 Safe USB and Removable-Media Usage', outcome:'Success'},
    {id:'AU-0099', ts:'2026-11-02 08:30', user:'Nadia Karim', action:'Employee created', target:'E1010 Ethan Walsh', outcome:'Success'},
    {id:'AU-0098', ts:'2026-11-01 11:42', user:'Nadia Karim', action:'Dataset import', target:'IMP-06 endpoint_export_nov01.json', outcome:'Rejected'}
  ];
  const settings = {org:{name:'Meridian Ledger Group (fictional)', timezone:'Asia/Karachi (UTC+05:00)', retention:'180 days', offStart:'18:00', offEnd:'08:00'},
    notify:{critical:true, verification:true, training:true, weekly:false}, empNotify:{E1002:{email:true, reminders:true, digest:false}}};
  return {v:1, users, employees, departments, roles, endpoints, removables, alerts, interventions, verifications, policies, acks, integrations, imports, assessSubs, phishRuns, audit, settings, seq:{alert:2045, int:410, vr:119, au:109, imp:8, sub:32, pr:13, pol:7, rm:5, ep:1012, emp:1011, user:4, dept:8, role:11}};
}
