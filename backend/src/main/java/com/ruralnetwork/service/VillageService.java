package com.ruralnetwork.service;

import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.RouteDTO;
import com.ruralnetwork.dto.VillageDTO;
import com.ruralnetwork.entite.Village;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VillageService {

    private final VillageDepot villageDepot;
    private final RouteService routeService;

    public VillageService(VillageDepot villageDepot, RouteService routeService) {
        this.villageDepot = villageDepot;
        this.routeService = routeService;
    }

    public VillageDTO ajouterVillage(VillageDTO dto, Long utilisateurId) {
        Village village = new Village();
        village.setNom(dto.getNom());
        village.setLatitude(dto.getLatitude());
        village.setLongitude(dto.getLongitude());
        village.setVolumeProduction(dto.getVolumeProduction());
        village.setUtilisateurId(utilisateurId);

        Village saved = villageDepot.save(village);

        // Créer automatiquement des routes vers tous les villages existants
        List<Village> villagesExistants = villageDepot.findByUtilisateurIdOrderByNomAsc(utilisateurId);
        for (Village existant : villagesExistants) {
            if (!existant.getId().equals(saved.getId())) {
                try {
                    RouteDTO routeDTO = new RouteDTO();
                    routeDTO.setVillageDepart_id(saved.getId());
                    routeDTO.setVillage_arrivee_id(existant.getId());
                    routeDTO.setQualiteRoute("MOYENNE");
                    routeDTO.setEstBloquee(false);
                    routeService.ajouterRoute(routeDTO, utilisateurId);
                } catch (Exception e) {
                    // Ignorer les doublons ou erreurs de création de route
                    // La route peut déjà exister ou OSRM peut être indisponible
                }
            }
        }

        return convertToDTO(saved);
    }

    public List<VillageDTO> obtenirTousLesVillages(Long utilisateurId) {
        return villageDepot.findByUtilisateurIdOrderByNomAsc(utilisateurId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public VillageDTO obtenirVillageParId(String id, Long utilisateurId) {
        return villageDepot.findByIdAndUtilisateurId(id, utilisateurId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public void supprimerVillage(String id, Long utilisateurId) {
        villageDepot.findByIdAndUtilisateurId(id, utilisateurId)
                .ifPresent(village -> villageDepot.deleteById(id));
    }

    public VillageDTO modifierVillage(String id, VillageDTO dto, Long utilisateurId) {
        return villageDepot.findByIdAndUtilisateurId(id, utilisateurId)
                .map(village -> {
                    village.setNom(dto.getNom());
                    village.setLatitude(dto.getLatitude());
                    village.setLongitude(dto.getLongitude());
                    village.setVolumeProduction(dto.getVolumeProduction());
                    return convertToDTO(villageDepot.save(village));
                })
                .orElse(null);
    }

    private VillageDTO convertToDTO(Village village) {
        VillageDTO dto = new VillageDTO();
        dto.setId(village.getId());
        dto.setNom(village.getNom());
        dto.setLatitude(village.getLatitude());
        dto.setLongitude(village.getLongitude());
        dto.setVolumeProduction(village.getVolumeProduction());
        return dto;
    }
}
