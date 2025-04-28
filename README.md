Pour setup le projet il faut rentrer dans un terminal à la racine du projet :
```
npm i
```

Puis dupliquer le fichier .env.example en .env et remplacer les valeurs correspondant à redis selon votre configuration de redis :
```
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

Enfin, lancer la commande suivante pour démarrer l'api : 
```
npm run dev
```

Si vous voulez démarrer l'api sur un port particulier, il faut modifier la valeur correspondante dans le .env : 
```
PORT=3333
```

Les routes sont à appeler dans l'ordre où elles sont écrite via un outils comme postman.