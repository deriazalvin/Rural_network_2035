package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.ReponseAssistantDTO;
import com.ruralnetwork.dto.RequeteAssistantDTO;
import com.ruralnetwork.service.assistant.ServiceAssistant;
import com.ruralnetwork.util.TokenUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/assistant")
public class AssistantControleur {

    private final ServiceAssistant serviceAssistant;
    private final TokenUtil tokenUtil;

    public AssistantControleur(ServiceAssistant serviceAssistant, TokenUtil tokenUtil) {
        this.serviceAssistant = serviceAssistant;
        this.tokenUtil = tokenUtil;
    }

    @PostMapping("/poser")
    public ResponseEntity<ReponseAssistantDTO> poserQuestion(
            @RequestHeader("Authorization") String auth,
            @RequestBody RequeteAssistantDTO requete) {
        Long userId = tokenUtil.getUserIdFromAuthHeader(auth);
        String reponse = serviceAssistant.poserQuestion(userId, requete.getQuestion());
        return ResponseEntity.ok(new ReponseAssistantDTO(reponse, true));
    }
}
