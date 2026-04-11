Configuration des clés d'API et variables d'environnement

But: ne stockez pas de clés secrètes dans le dépôt.

Clés utilisées par l'application

Actuellement l'application n'utilise pas de service IA externe. Ne stockez pas de clés secrètes dans le dépôt.

Exemples (Linux/macOS) :

```bash
# lancer l'application depuis le dossier projet
mvn -f backend/pom.xml spring-boot:run
```

Notes

- Pour la sécurité en production, utilisez un gestionnaire de secrets ou variables d'environnement fournies par votre plateforme (Docker secrets, Kubernetes secrets, etc.).
- Ne poussez jamais de clé privée ou API dans un dépôt public.
