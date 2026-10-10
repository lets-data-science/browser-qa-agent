import { existsSync } from 'node:fs';
export function chromePath() {
  const choices=[process.env.CHROME_PATH,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium',`${process.env.PROGRAMFILES}/Google/Chrome/Application/chrome.exe`,`${process.env['PROGRAMFILES(X86)']}/Google/Chrome/Application/chrome.exe`];
  const found=choices.find(p => p && existsSync(p));
  if(!found) throw new Error('Install Google Chrome 149 or newer, or set CHROME_PATH in .env.local.');
  return found;
}
