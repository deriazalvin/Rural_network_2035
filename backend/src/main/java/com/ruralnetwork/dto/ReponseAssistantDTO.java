package com.ruralnetwork.dto;

public class ReponseAssistantDTO {
    private String reponse;
    private boolean succes;

    public ReponseAssistantDTO() {}

    public ReponseAssistantDTO(String reponse, boolean succes) {
        this.reponse = reponse;
        this.succes = succes;
    }

    public String getReponse() { return reponse; }
    public void setReponse(String reponse) { this.reponse = reponse; }
    public boolean isSucces() { return succes; }
    public void setSucces(boolean succes) { this.succes = succes; }
}
