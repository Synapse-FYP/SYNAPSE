import { fTs } from '../../lib/utils.js';
import { memoByState } from '../common.js';

export const DS_TABS = [['imports', 'Dataset imports'], ['provenance', 'Data provenance']];
export const IMPORT_FIELDS = [['user', 'Employee / user ID', true], ['date', 'Date / timestamp', true], ['activity', 'Activity type', true], ['pc', 'Computer / host', false]];

export const buildDataSources = memoByState((store) => {
  const { db, ui: u } = store.state;
  const V = {};
  V.dsTabs = DS_TABS.map((t) => ({ k: t[0], label: t[1], cls: 'tab' + (u.dsTab === t[0] ? ' on' : ''), sel: u.dsTab === t[0] ? 'true' : 'false', go: () => store.ui({ dsTab: t[0] }) }));
  V.dst = { imports: u.dsTab === 'imports', provenance: u.dsTab === 'provenance' };
  V.imp = u.imp ? { name: u.imp.name, cols: u.imp.cols, rows: u.imp.rows.slice(0, 5), total: u.imp.total, has: true } : { has: false };
  V.impErr = u.impErr; V.hasImpErr = !!u.impErr; V.impBusy = u.impBusy;
  V.impFields = IMPORT_FIELDS.map((f) => ({
    k: f[0], label: f[1], req: f[2] ? 'Required' : 'Optional', val: u.impMap[f[0]] || '',
    set: (e) => { const v = e.target.value; store.ui((x) => ({ impMap: Object.assign({}, x.impMap, { [f[0]]: v }), impErr: '' })); },
  }));
  V.impColOpts = u.imp ? u.imp.cols : [];
  V.imph = {
    file: (e) => store.onFile(e), sample: () => store.sampleImport(), source: (e) => store.ui({ impSource: e.target.value }),
    confirm: () => store.confirmImport(), cancel: () => store.ui({ imp: null, impErr: '', impMap: {} }),
  };
  V.imports = db.imports.map((i) => ({ id: i.id, file: i.file, source: i.source, rows: i.rows, status: i.status, at: fTs(i.at), by: i.by, cls: 'pill ' + (i.status.indexOf('Rejected') >= 0 ? 'pill-bad' : 'pill-ok') }));
  return V;
});
