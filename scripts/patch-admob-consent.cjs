'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'../node_modules/@capacitor-community/admob/ios/Sources/AdMobPlugin');
const file=path.join(base,'AdMobPlugin.swift'),marker='        // PatiLife: UMP forms need their presenter before MobileAds initialization.\n        self.consentExecutor.plugin = self\n';
let source=fs.readFileSync(file,'utf8');
for(const method of ['requestConsentInfo','showPrivacyOptionsForm']){const needle='    @objc func '+method+'(_ call: CAPPluginCall) {\n';if(!source.includes(needle))throw Error('AdMob consent patch needs review for this SDK version.');if(!source.includes(needle+marker))source=source.replace(needle,needle+marker);}fs.writeFileSync(file,source);
console.log('AdMob iOS consent presenter patch ready.');
const consentFile=path.join(base,'Consent/ConsentExecutor.swift');
let consent=fs.readFileSync(consentFile,'utf8');
const detailMarker='// PatiLife: preserve the SDK error and honor only the SDK cached consent decision.';
if(!consent.includes(detailMarker)){
 const needle='                if error != nil {\n                    call.reject("Request consent info failed")\n                } else {';
 const replacement=`                ${detailMarker}
                if let error = error {
                    let nativeError = error as NSError
                    NSLog("[PatiLife][UMP] Consent update failed (%@:%ld): %@", nativeError.domain, nativeError.code, nativeError.localizedDescription)
                    if ConsentInformation.shared.canRequestAds {
                        call.resolve([
                            "status": self.getConsentStatusString(ConsentInformation.shared.consentStatus),
                            "isConsentFormAvailable": ConsentInformation.shared.formStatus == FormStatus.available,
                            "canRequestAds": true,
                            "privacyOptionsRequirementStatus": self.getPrivacyOptionsRequirementStatus(ConsentInformation.shared.privacyOptionsRequirementStatus)
                        ])
                    } else {
                        call.reject("Consent update failed: " + nativeError.localizedDescription, String(nativeError.code), error)
                    }
                } else {`;
 if(!consent.includes(needle))throw Error('AdMob UMP error patch needs review for this SDK version.');
 consent=consent.replace(needle,replacement);fs.writeFileSync(consentFile,consent);
}
