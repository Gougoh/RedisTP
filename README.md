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

Exemple d'appel de la route pour set le token : 
```
/set-token?&value=user55
```

Exemple de body pour créer la session (/create-session) :
```
{
    "username": "user42",
    "email": "user42@email.com",
    "role": "user"
}
```

Exemple de route pour récupérer la ttl de la session : 
```
/session-ttl?user=user42
```

Exemple de body pour la insérer les info du user (/store-user-info) :
```
{
  "user": "user42",
  "infos": {
    "name": "Alice",
    "email": "alice@example.com",
    "city": "Paris"
  }
}
```

Exemple de body pour la création du panier (/create-cart):
```
{
  "user": "user42",
  "items": {
    "item1": "produit1",
    "item2": "produit2"
  }
}
```

Exemple de route pour supprimer le dernier item du panier : 
```
/del-last-item?user=user42
```

Exemple de body pour set un stock (/set-stock):
```
{
    "product": "1003",
    "stockVal": 25
}
```

Exemple de body pour retirer un item du stock (/remove-from-stock):
```
{
    "product": "1003"
}
```

Exemple de body pour la transaction (/transaction-ex):
```
{
    "stock1Name": "1001",
    "stock2Name": "1002",
    "user": "user42"
}
```

Exemple de body pour la set un timer au panier (/set-cart-timer):
```
{
    "user": "user42"
}
```

Exemple de body pour la déconnexion (/disconnect):
```
{
    "auth": 12345,
    "session": "user42"
}
```