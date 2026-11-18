# AD Niangon Maroc

Application de suivi des âmes et d'accompagnement de l'assemblée.

## Projet Firebase

- Projet Firebase utilisé par l'application et les déploiements : `admaroc-nouvelle-ame`
- Base Firestore : `(default)`
- Hébergement : <https://admaroc-nouvelle-ame.web.app>
- Le projet `famille-nehemie-ad-maroc` n'est pas utilisé par l'application et ne doit pas être sélectionné comme cible.

La configuration Web de `firebase-applet-config.json` doit rester celle de `admaroc-nouvelle-ame`. Utilisez explicitement ce projet pour les commandes Firebase :

```powershell
firebase.cmd deploy --only firestore:rules --project admaroc-nouvelle-ame
firebase.cmd deploy --only hosting --project admaroc-nouvelle-ame
```

## Données Firestore

Le nom canonique du champ de suivi est `discipolat`, dans les documents `newSouls`. Le code, les règles Firestore et le blueprint utilisent ce nom.

La migration vers `admaroc-nouvelle-ame` est terminée. Les collections applicatives actives sont `hosts`, `teams`, `newSouls` et `followUps`. Un compte hôte a été transféré; aucune équipe, fiche d'âme ou donnée de suivi n'était présente dans la source. Les trois fiches de démonstration déjà présentes dans la destination ont été conservées. Aucune fiche de destination ne contenait l'ancienne clé `discipulat`.

Les données de la source ont été laissées intactes comme sauvegarde. L'application et l'hébergement utilisent désormais `admaroc-nouvelle-ame`.

## Développement

Dans PowerShell, utilisez `npm.cmd` pour éviter le blocage de la stratégie d'exécution des scripts :

```powershell
npm.cmd install
npm.cmd run dev
```

Vérifications et build :

```powershell
npm.cmd run lint
npm.cmd run build
```
