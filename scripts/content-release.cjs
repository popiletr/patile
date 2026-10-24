#!/usr/bin/env node
/* Offline signing tool. Private key is never copied to web/native packages. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),keyDir=path.join(root,'.content-signing'),privateFile=path.join(keyDir,'private.pem');
const command=process.argv[2];
if(command==='init'){
 if(fs.existsSync(privateFile))throw Error('Signing key already exists; preserved.');
 fs.mkdirSync(keyDir,{recursive:true,mode:0o700});
 const pair=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 fs.writeFileSync(privateFile,pair.privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600,flag:'wx'});
 const config={endpoint:'https://nazmi.tr/oyun/content/live.json',publicKey:pair.publicKey.export({format:'jwk'})};
 fs.writeFileSync(path.join(root,'sprite_preview/patilife_v2/content-config.js'),'/* Public verification key; only signed data is accepted. */\nwindow.PatiLifeContentConfig=Object.freeze('+JSON.stringify(config,null,2)+');\n');
 console.log('Local signing key created; public verification configuration written.');
}else if(command==='sign'){
 const input=process.argv[3],output=process.argv[4];if(!input||!output)throw Error('Usage: node scripts/content-release.cjs sign input.json output.json');
 const p=JSON.parse(fs.readFileSync(input,'utf8'));
 require('../sprite_preview/patilife_v2/remote-content.js').validate(p);
 const payload=Buffer.from(JSON.stringify(p)),signature=crypto.sign('sha256',payload,{key:fs.readFileSync(privateFile),dsaEncoding:'ieee-p1363'});
 fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});
 fs.writeFileSync(output,JSON.stringify({payload:payload.toString('base64'),signature:signature.toString('base64')}));
 console.log('Signed data-only content written: '+output);
}else throw Error('Usage: node scripts/content-release.cjs init | sign input.json output.json');
