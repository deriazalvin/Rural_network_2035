package com.ruralnetwork.controleur;

import com.ruralnetwork.service.AssistantIAService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ia")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class AssistantIAControleur {

    private final AssistantIAService assistantIAService;

    public AssistantIAControleur(AssistantIAService assistantIAService) {
        this.assistantIAService = assistantIAService;
    }

    @PostMapping("/analyser")
    public ResponseEntity<Map<String, String>> analyser(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        if (question == null || question.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String reponse = assistantIAService.obtenirRecommandation(question);
        Map<String, String> resultat = new HashMap<>();
        resultat.put("reponse", reponse);

        return ResponseEntity.ok(resultat);
    }
}
