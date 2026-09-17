export interface PdpAssessmentGuidance {
  verify: string[];
  possibleEvidence: string[];
}

// Assessment guidance only. These entries are not evidence and do not imply
// implementation, compliance, or an assessment result.
export const pdpAssessmentGuidance: Record<string, PdpAssessmentGuidance> = {
  "PDP-DG-01": { verify:["Whether personal-data processing assets are inventoried","Whether the inventory is maintained","Whether responsible parties can identify relevant processing assets"], possibleEvidence:["Approved data inventory","Processing register","Data asset register"] },
  "PDP-DG-02": { verify:["Categories of personal data processed are identified","Classification is documented and maintained"], possibleEvidence:["Data classification register","Processing inventory","Approved data catalogue"] },
  "PDP-DG-03": { verify:["Accountability for relevant data or processes is assigned","Ownership and responsibility are documented"], possibleEvidence:["RACI","Data ownership register","Approved responsibility matrix"] },
  "PDP-DG-04": { verify:["Purpose of processing is documented","Processing is aligned with the recorded purpose"], possibleEvidence:["Processing register","Privacy notice","Consent or processing documentation"] },
  "PDP-DG-05": { verify:["Relevant personal-data flows are documented","Source, destination, and sharing or transfer paths can be identified"], possibleEvidence:["Data-flow diagram","Architecture diagram","Processing register"] },
  "PDP-DG-06": { verify:["Retention requirements are defined","Retention is reviewed","Expired data has an applicable disposal or deletion process"], possibleEvidence:["Retention schedule","Retention policy","Deletion procedure"] },
  "PDP-DG-07": { verify:["Processing and storage locations can be identified","Cross-border processing or transfer can be identified where applicable"], possibleEvidence:["Infrastructure inventory","Processing register","Hosting or cloud records"] },

  "PDP-SC-01": { verify:["Access to systems and data is authorized","Access follows defined roles and need","Unauthorized-access prevention exists","Access can be reviewed and revoked"], possibleEvidence:["IAM configuration","Access-control policy","Access review","Account or role records"] },
  "PDP-SC-02": { verify:["Protection appropriate to risk exists for relevant data in transit and/or at rest","Key and certificate management is controlled where applicable"], possibleEvidence:["TLS configuration","Encryption configuration","Security architecture","Key-management procedure"] },
  "PDP-SC-03": { verify:["Relevant access and security activity is logged","Logs contain sufficient information for accountability and investigation","Log retention and access are controlled"], possibleEvidence:["SIEM configuration","Wazuh log sources","Audit logs","Logging policy"] },
  "PDP-SC-04": { verify:["Relevant security activity is actively monitored","Alerts and detections exist","Security events have a review and escalation process"], possibleEvidence:["Wazuh or SIEM dashboard","Detection rules","SOC procedures","Alert or incident records"] },
  "PDP-SC-05": { verify:["Relevant systems and data have defined backup and recovery controls","Backup execution and recovery capability are verified where applicable"], possibleEvidence:["Backup policy","Backup job records","Restore-test results","Disaster-recovery procedure"] },
  "PDP-SC-06": { verify:["Documented incident-response procedures exist","Responsibilities and escalation are defined","Personal-data incidents can be identified and handled"], possibleEvidence:["Incident response plan","SOC SOP or playbook","Incident tickets or cases","Escalation procedure"] },

  "PDP-PC-01": { verify:["An approved personal-data or privacy governance policy exists","Responsibilities and expected handling are documented","The policy is reviewed and communicated as applicable"], possibleEvidence:["Approved privacy or PDP policy","Policy approval record","Awareness material"] },
  "PDP-PC-02": { verify:["Lawful processing basis is identified","Consent is managed where consent is the applicable basis","Required information and proof are maintained"], possibleEvidence:["Processing register","Consent records","Privacy notice","Lawful-basis assessment"] },
  "PDP-PC-03": { verify:["A process exists for applicable data-subject requests","Requests can be tracked and fulfilled","Responsible parties are defined"], possibleEvidence:["Rights-request procedure","Request register or ticket","Response template","SOP"] },
  "PDP-PC-04": { verify:["Retention and deletion requirements exist","Deletion and destruction can be executed and recorded"], possibleEvidence:["Retention schedule","Deletion records","Destruction procedure"] },
  "PDP-PC-05": { verify:["Personal-data sharing is identified and governed","Recipient, purpose, and basis are documented where applicable"], possibleEvidence:["Sharing register","Agreement","Processing register","Transfer documentation"] },
  "PDP-PC-06": { verify:["Third parties processing personal data are identified","Responsibilities and security or privacy obligations are governed","Assessment and review occur where applicable"], possibleEvidence:["Vendor register","DPA or agreement","Vendor assessment","Third-party risk review"] },

  "PDP-PB-01": { verify:["Confirmed personal-data breaches can have their timeline reconstructed","Relevant timestamps and events are recorded"], possibleEvidence:["Breach record","Incident timeline","Forensic or SOC record"] },
  "PDP-PB-02": { verify:["Impact of confirmed personal-data breaches can be assessed and documented"], possibleEvidence:["Impact assessment","Incident report","Breach analysis"] },
  "PDP-PB-03": { verify:["Affected personal-data categories can be identified and documented"], possibleEvidence:["Breach record","Forensic analysis","Affected-data inventory"] },
  "PDP-PB-04": { verify:["Affected data-subject population or scope can be identified where applicable"], possibleEvidence:["Breach analysis","Affected-subject register","Investigation report"] },
  "PDP-PB-05": { verify:["Handling and recovery actions for a confirmed breach can be tracked"], possibleEvidence:["Incident response record","Remediation or action log","Case or ticket status"] },
  "PDP-PB-06": { verify:["Applicable notification obligations can be tracked","Notification date, status, and recipient can be recorded"], possibleEvidence:["Notification record","Communication record","Breach register"] },
};
