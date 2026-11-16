// Training modules, assessments, phishing exercise and graph reference data (ported verbatim from SYNAPSE.html).

export const MODULES = {
  'TM-PHISH': {title:'Recognizing Phishing Emails', mins:15, desc:'Spot the signals of a phishing message and know how to report it.', sections:[
    {h:'What phishing looks like', p:'Phishing messages imitate people or services you trust to get you to click a link, open an attachment or share credentials. They often arrive at busy moments and look routine.', pts:['Messages that pressure you to act immediately','Requests for passwords, codes or payment changes','Unexpected invoices, delivery notices or shared documents']},
    {h:'Check the sender and the links', p:'Display names are easy to fake. Look at the full sender address and hover over links before clicking to see where they really go.', pts:['Lookalike domains such as meridian-ledger-support.com','Links whose visible text differs from the real destination','Replies routed to an outside address']},
    {h:'Attachments and urgency', p:'Unexpected attachments — especially archives, macros or HTML files — are a common delivery method. Urgent or emotional language is used to stop you checking.', pts:['“Your account will be closed in 2 hours”','Archives or documents asking you to enable content','Requests to keep a matter confidential from colleagues']},
    {h:'What to do', p:'If something feels wrong, do not click or reply. Report the message with the Report button or forward it to the security team, then delete it.', pts:['Verify requests through a known phone number or channel','Never share your password or one-time codes','Reporting a false alarm is always welcome']}
  ], qs:[
    {q:'An email from “IT Helpdesk” at it-helpdesk@meridianledger-support.net asks you to re-enter your password. What is the strongest warning sign?', o:['It was sent on a weekday','The sender domain does not match the company domain','It contains the company logo','It has a short subject line'], a:1},
    {q:'A link reads “portal.meridianledger.example” but hovering shows a different address. What should you do?', o:['Click it quickly before it expires','Forward it to colleagues to check','Do not click; report the message','Reply and ask if it is genuine'], a:2},
    {q:'Which action is correct for a suspicious message?', o:['Delete it without telling anyone','Report it to the security team','Open the attachment in a private window','Reply to unsubscribe'], a:1}
  ]},
  'TM-USB': {title:'Safe USB and Removable-Media Usage', mins:12, desc:'Use approved removable devices safely and handle data on them responsibly.', sections:[
    {h:'Why removable media is risky', p:'USB drives are easy to lose and can carry malware between machines. Copies on removable media also leave company control.', pts:['Lost devices can expose sensitive files','Unknown devices may contain malicious software','Copies are hard to track and remove later']},
    {h:'Use approved devices only', p:'Only encrypted devices registered on the approved list should be connected to corporate endpoints. Ask the IT service desk to register a new device.', pts:['Check that the device is encrypted','Never plug in a device you found','Personal phones are not storage devices for work files']},
    {h:'Handle files responsibly', p:'Copy only what you need for the task, keep copies for the shortest time possible and use approved shares where you can.', pts:['Prefer approved network shares or cloud links','Delete copies once the task is complete','Avoid copying restricted data unless approved']},
    {h:'Lost or found devices', p:'Report a lost device straight away so access can be reviewed. Hand found devices to IT instead of connecting them.', pts:['Report loss to the service desk immediately','Do not test a found device on your laptop','Note what data may have been on the device']}
  ], qs:[
    {q:'You find a USB drive in the car park labelled “Salaries 2026”. What should you do?', o:['Plug it in to find the owner','Hand it to IT without connecting it','Take it home to check','Leave it where it is'], a:1},
    {q:'Which device may you connect to your corporate laptop?', o:['Any USB drive with enough space','A personal phone for charging and file transfer','An encrypted device on the approved list','A drive from a client meeting'], a:2},
    {q:'After copying files for a presentation, what is good practice?', o:['Keep the copies in case they are needed later','Remove the copies once the task is finished','Share the drive with your team','Rename the files'], a:1}
  ]}
};
export const ASSESS = {
  'AS-01': {title:'Security Awareness Baseline', desc:'General awareness of everyday security practices.', qs:[
    {q:'How should you create a strong password?', o:['Use your birthday with a symbol','Use a long passphrase unique to each account','Reuse your best password everywhere','Write it on a sticky note'], a:1},
    {q:'A colleague asks for your password to finish urgent work. You should:', o:['Share it if they are your manager','Refuse and point them to IT for access','Share it and change it later','Email it to them'], a:1},
    {q:'What should you do when leaving your desk?', o:['Leave the screen on for convenience','Lock your screen','Turn the monitor off only','Nothing if the office is quiet'], a:1},
    {q:'Which is the safest way to share a confidential file internally?', o:['Personal email','Approved company share with restricted access','Public file-sharing link','Removable drive'], a:1},
    {q:'You clicked a suspicious link by mistake. What next?', o:['Ignore it','Report it to the security team immediately','Restart and hope for the best','Tell a colleague later'], a:1},
    {q:'Public Wi-Fi at a café should be used for work only:', o:['Never under any circumstances','Through the company VPN','When the network has a password','For email only'], a:1}
  ]},
  'AS-02': {title:'Password & Authentication Hygiene', desc:'Authentication habits, MFA prompts and account protection.', qs:[
    {q:'You receive an MFA prompt you did not request. You should:', o:['Approve it to stop the prompts','Deny it and report it','Ignore it','Approve it once'], a:1},
    {q:'How often should you reuse a password across services?', o:['For low-risk sites only','Never','For up to three services','When it is very strong'], a:1},
    {q:'Several failed logons appear on your account that were not you. What should you do?', o:['Nothing','Report it and change your password','Create a new account','Wait a week'], a:1},
    {q:'Which is a good use of a password manager?', o:['Storing unique, generated passwords','Sharing passwords with friends','Storing one password for everything','None — avoid them'], a:0},
    {q:'Signing in on a shared kiosk computer, you should:', o:['Save the password in the browser','Sign out and close the browser when done','Leave the session open for the next shift','Use it for payroll tasks'], a:1}
  ]}
};
export const PHISH = [
  {from:'Meridian IT Service Desk <servicedesk@meridianledger-support.net>', subject:'Action required: mailbox will be disabled in 2 hours', body:'Your mailbox has exceeded its quota. Re-validate your account now to avoid suspension: http://meridianledger-support.net/validate', phish:true, ind:['Suspicious sender domain (meridianledger-support.net)','Urgent language and a short deadline','Request to re-enter credentials via a link']},
  {from:'Payroll Team <payroll@meridianledger.example>', subject:'November payslip now available in the HR portal', body:'Your payslip for November is available. Sign in to the HR portal from the intranet home page as usual. Payroll will never ask for your password by email.', phish:false, ind:['Sender matches the company domain','No link or attachment; directs you to the usual portal','Explicitly says credentials are never requested']},
  {from:'DocuSign Notification <notify@docu-sign-secure.co>', subject:'Contract_Final_Signed.html — review needed', body:'A document has been shared with you. Open the attached HTML file to view and sign.', phish:true, ind:['Lookalike vendor domain','Unexpected HTML attachment','Generic greeting without your name']},
  {from:'Ahmed Khan (CEO) <ahmed.khan.ceo@gmail.com>', subject:'Quick favour — confidential', body:'I need you to buy gift cards for a client today. Keep this between us and send me the codes when done.', phish:true, ind:['Executive impersonation from a personal address','Secrecy and urgency','Request for gift-card codes']},
  {from:'Facilities <facilities@meridianledger.example>', subject:'Lahore office lift maintenance on Saturday', body:'Lift 2 will be out of service on Saturday 21 November from 08:00 to 12:00. Please use Lift 1 or the stairs.', phish:false, ind:['Internal sender domain','Informational, no action requested','No links or attachments']},
  {from:'Microsoft 365 <no-reply@micros0ft-365.com>', subject:'Unusual sign-in activity detected', body:'We detected a sign-in from a new device. If this was not you, verify your identity here: https://micros0ft-365.com/secure', phish:true, ind:['Misspelled domain (micros0ft with a zero)','Misleading security-alert framing','Link to an external verification page']}
];

export const GRAPH_RES = [
  {id:'R-FIN', label:'Finance share', sub:'\\\\fs01\\finance', kind:'resource'},
  {id:'R-GIT', label:'Source repository', sub:'git.internal', kind:'resource'},
  {id:'R-HR', label:'HR records system', sub:'hr.internal', kind:'resource'},
  {id:'R-CRM', label:'CRM', sub:'sales.internal', kind:'resource'},
  {id:'R-LEG', label:'Contract vault', sub:'legal.internal', kind:'resource'},
  {id:'N-VPN', label:'VPN gateway', sub:'vpn-gw01', kind:'network'},
  {id:'N-CLOUD', label:'External cloud storage', sub:'category', kind:'network'},
  {id:'N-PKG', label:'Package registries', sub:'category', kind:'network'}
];
export const GRAPH_ACCESS = {E1001:['R-FIN'],E1002:['R-GIT','N-PKG'],E1003:['R-GIT'],E1004:['R-GIT','R-HR','R-FIN'],E1005:['R-HR'],E1006:['R-CRM','N-VPN'],E1007:['R-LEG'],E1008:['R-GIT','N-PKG'],E1009:['R-FIN','R-HR'],E1010:['N-PKG']};
export const GRAPH_COMM = [['EP-1009','EP-1011'],['EP-1004','EP-1008'],['EP-1006','N-CLOUD'],['EP-1006','N-VPN'],['EP-1008','N-CLOUD']];
