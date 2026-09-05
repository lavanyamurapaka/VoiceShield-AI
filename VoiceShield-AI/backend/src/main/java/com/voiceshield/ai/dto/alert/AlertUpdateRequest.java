package com.voiceshield.ai.dto.alert;

public class AlertUpdateRequest {
    private String status; // NEW, UNDER_INVESTIGATION, RESOLVED, FALSE_POSITIVE
    private String investigationNotes;
    private String actionTaken;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getInvestigationNotes() { return investigationNotes; }
    public void setInvestigationNotes(String investigationNotes) { this.investigationNotes = investigationNotes; }
    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }
}
