"""Build deterministic source-only local preview archives. Never walk private folders."""
from pathlib import Path
import hashlib,json,re,zipfile
SOURCE=Path(__file__).resolve().parents[1]
DEST=SOURCE.parent/'bundles'/'browser-qa-agent'
FILES=('.github/workflows/check.yml','CONTRIBUTORS.md','package.json','package-lock.json','README.md','NOTICE','LICENSE','.gitignore','.env.example','server.mjs',
'ui/index.html','ui/app.js','ui/style.css','ui/lds-logo.svg','ui/practice.html','ui/practice.js','ui/practice.css',
'lib/security.mjs','lib/chrome.mjs','lib/runner.mjs','lib/planner.mjs','lib/run-lifecycle.mjs',
'learner/journey.mjs','learner/assertions.mjs','learner/report.mjs',
'checkpoints/journey.mjs','checkpoints/assertions.mjs','checkpoints/report.mjs',
'starter/journey.mjs','starter/assertions.mjs','starter/report.mjs',
'scripts/setup.mjs','scripts/restore.mjs','scripts/starter.mjs','scripts/integration.mjs','scripts/build-bundles.py',
'docs/BUILD.md','docs/DESIGN.md','docs/WALKTHROUGH-SCRIPT.md','docs/VERIFICATION.md',
'test/journey.test.mjs','test/assertions.test.mjs','test/report.test.mjs','test/security.test.mjs','test/run-lifecycle.test.mjs')
def content(name):
 p=SOURCE/name
 if p.is_symlink() or not p.is_file():raise ValueError(f'Unsafe or missing file: {name}')
 return p.read_bytes()
version=json.loads(content('package.json'))['version']
if not re.fullmatch(r'\d+\.\d+\.\d+',version):raise ValueError('Version must be stable semver')
DEST.mkdir(parents=True,exist_ok=True)
variants={}
for variant in ('starter','reference'):
 files={name:content(name) for name in FILES}
 if variant=='starter':
  for module in ('journey','assertions','report'):files[f'learner/{module}.mjs']=content(f'starter/{module}.mjs')
  files['starter.json']=b'{"project":"browser-qa-agent","modules":["journey","assertions","report"]}\n'
 filename=f'browser-qa-agent-{variant}-{version}.zip';target=DEST/filename
 with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED)as archive:
  for name,data in files.items():
   if re.search(rb'(?:AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9]{24,}|sk_[A-Za-z0-9]{32,})',data):raise ValueError(f'Credential-like content in {name}')
   info=zipfile.ZipInfo(f'browser-qa-agent/{name}',(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;archive.writestr(info,data)
 payload=target.read_bytes();variants[variant]={'filename':filename,'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest(),'files':list(files)}
 print(f'{variant}: {len(files)} files, {len(payload)} bytes')
(DEST/'manifest.json').write_text(json.dumps({'project':'browser-qa-agent','version':version,**variants['reference'],'variants':variants},indent=2)+'\n')
