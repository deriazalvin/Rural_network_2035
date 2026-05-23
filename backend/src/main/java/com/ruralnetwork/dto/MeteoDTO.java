package com.ruralnetwork.dto;

public class MeteoDTO {
    private double temperature;
    private double ressenti;
    private int humidite;
    private String description;
    private String icone;
    private double ventVitesse;
    private String ville;
    private double latitude;
    private double longitude;

    public MeteoDTO() {}

    public MeteoDTO(double temperature, double ressenti, int humidite, String description, String icone, double ventVitesse, String ville, double latitude, double longitude) {
        this.temperature = temperature;
        this.ressenti = ressenti;
        this.humidite = humidite;
        this.description = description;
        this.icone = icone;
        this.ventVitesse = ventVitesse;
        this.ville = ville;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }
    public double getRessenti() { return ressenti; }
    public void setRessenti(double ressenti) { this.ressenti = ressenti; }
    public int getHumidite() { return humidite; }
    public void setHumidite(int humidite) { this.humidite = humidite; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }
    public double getVentVitesse() { return ventVitesse; }
    public void setVentVitesse(double ventVitesse) { this.ventVitesse = ventVitesse; }
    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
}
