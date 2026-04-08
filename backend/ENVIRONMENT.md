Configuration des clés d'API et variables d'environnement

But: ne stockez pas de clés secrètes dans le dépôt.

Clés utilisées par l'application

- `GEMINI_API_KEY` : clé API pour Google Gemini / Generative Language. L'application lit d'abord la variable d'environnement `GEMINI_API_KEY`. Si elle n'est pas définie, Spring tentera de lire `gemini.api.key` dans `application.yml`.

Exemples (Linux/macOS) :

```bash
# définir la clé Gemini en variable d'environnement (recommandé)
export GEMINI_API_KEY="votre_cle_gemini_ici"

# lancer l'application depuis le dossier projet
mvn -f backend/pom.xml spring-boot:run
```

Notes

- L'application utilisera uniquement Gemini quand la variable `GEMINI_API_KEY` est définie. Sinon, elle tombera en backoff vers la génération locale (aucun appel externe).
- Pour la sécurité en production, utilisez un gestionnaire de secrets ou variables d'environnement fournies par votre plateforme (Docker secrets, Kubernetes secrets, etc.).
- Ne poussez jamais de clé privée ou API dans un dépôt public.
